package debatearena.backend.Repository;

import debatearena.backend.Entity.*;
import debatearena.backend.Entity.role_enum;
import debatearena.backend.Entity.niveau_enum;
import debatearena.backend.Entity.categorie_sujet_enum;
import debatearena.backend.Integration.CustomH2Dialect; // IMPORTANT : L'import du dialecte externe

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.util.TestPropertyValues;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.test.context.ContextConfiguration;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
// Configuration forcée pour utiliser H2 et le dialecte custom (évite l'erreur 6001)
@ContextConfiguration(initializers = MessageRepositoryTest.TestDbInitializer.class)
class MessageRepositoryTest {

    // --- INITIALIZER ---
    public static class TestDbInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {
        @Override
        public void initialize(ConfigurableApplicationContext applicationContext) {
            TestPropertyValues.of(
                    "spring.datasource.url=jdbc:h2:mem:debatearena_test_db;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=false",
                    "spring.datasource.driverClassName=org.h2.Driver",
                    "spring.datasource.username=sa",
                    "spring.datasource.password=",
                    // Utilisation de la classe externe CustomH2Dialect pour gérer les ENUMS
                    "spring.jpa.database-platform=" + CustomH2Dialect.class.getName(),
                    "spring.jpa.hibernate.ddl-auto=create-drop",
                    "spring.flyway.enabled=false",
                    "spring.liquibase.enabled=false"
            ).applyTo(applicationContext.getEnvironment());
        }
    }

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private TestEntityManager entityManager;

    // --- HELPER 1 : Créer un Utilisateur ---
    private Utilisateur creerUtilisateur(String email, role_enum role) {
        Utilisateur user = new Utilisateur();
        user.setEmail(email);
        user.setNom("Nom");
        user.setPrenom("Prenom");
        user.setPassword("pass");
        user.setRole(role);
        user.setScore(0);
        entityManager.persist(user);
        return user;
    }

    // --- HELPER 2 : Créer un Sujet ---
    private Sujet creerSujet() {
        Sujet sujet = new Sujet();
        sujet.setTitre("Sujet Test");
        sujet.setCategorie(categorie_sujet_enum.INFORMATIQUE);
        sujet.setDifficulte(niveau_enum.DEBUTANT);
        entityManager.persist(sujet);
        return sujet;
    }

    // --- HELPER 3 : Créer un Débat ---
    private Debat creerDebat(Utilisateur user, Sujet sujet) {
        Debat debat = new Debat();
        debat.setUtilisateur(user);
        debat.setSujet(sujet);
        debat.setDateDebut(LocalDateTime.now());
        debat.setChoixUtilisateur("POUR");
        entityManager.persist(debat);
        return debat;
    }

    // --- HELPER 4 : Créer un Message ---
    private Message creerMessage(Debat debat, Utilisateur auteur, String contenu, LocalDateTime time) {
        Message msg = new Message(contenu, debat, auteur);
        msg.setTimestamp(time);
        entityManager.persist(msg);
        return msg;
    }

    @Test
    void findByDebatOrderByTimestampAsc_ShouldReturnMessagesInOrder() {
        // ARRANGE
        Utilisateur user = creerUtilisateur("u1@test.com", role_enum.UTILISATEUR);
        Sujet sujet = creerSujet();
        Debat debat = creerDebat(user, sujet);

        // Message 1 (Vieux)
        Message msg1 = creerMessage(debat, user, "Premier", LocalDateTime.now().minusMinutes(10));
        // Message 2 (Récent)
        Message msg2 = creerMessage(debat, user, "Deuxieme", LocalDateTime.now());

        entityManager.flush();

        // ACT
        List<Message> result = messageRepository.findByDebatOrderByTimestampAsc(debat);

        // ASSERT
        assertThat(result).hasSize(2);
        assertThat(result.get(0)).isEqualTo(msg1);
        assertThat(result.get(1)).isEqualTo(msg2);
    }

    @Test
    void findLastMessageByDebat_ShouldReturnMostRecent() {
        // ARRANGE
        Utilisateur user = creerUtilisateur("u2@test.com", role_enum.UTILISATEUR);
        Sujet sujet = creerSujet();
        Debat debat = creerDebat(user, sujet);

        creerMessage(debat, user, "Vieux", LocalDateTime.now().minusMinutes(10));
        creerMessage(debat, user, "Recent", LocalDateTime.now());

        entityManager.flush();

        // ACT
        Optional<Message> last = messageRepository.findLastMessageByDebat(debat);

        // ASSERT
        assertThat(last).isPresent();
        assertThat(last.get().getContenu()).isEqualTo("Recent");
    }

    @Test
    void countMessagesByDebat_ShouldReturnCorrectCount() {
        // ARRANGE
        Utilisateur user = creerUtilisateur("u3@test.com", role_enum.UTILISATEUR);
        Sujet sujet = creerSujet();
        Debat debat = creerDebat(user, sujet);

        creerMessage(debat, user, "1", LocalDateTime.now());
        creerMessage(debat, user, "2", LocalDateTime.now());
        creerMessage(debat, user, "3", LocalDateTime.now());

        entityManager.flush();

        // ACT
        Integer count = messageRepository.countMessagesByDebat(debat);

        // ASSERT
        assertThat(count).isEqualTo(3);
    }

    @Test
    void findChatbotMessagesByDebat_ShouldFilterChatbotOnly() {
        // ARRANGE
        Utilisateur humain = creerUtilisateur("humain@test.com", role_enum.UTILISATEUR);
        Utilisateur bot = creerUtilisateur("bot@test.com", role_enum.CHATBOT);

        Sujet sujet = creerSujet();
        Debat debat = creerDebat(humain, sujet);

        creerMessage(debat, humain, "Parole humain", LocalDateTime.now());
        creerMessage(debat, bot, "Parole bot", LocalDateTime.now().plusSeconds(1));

        entityManager.flush();

        // ACT
        List<Message> botMessages = messageRepository.findChatbotMessagesByDebat(debat);

        // ASSERT
        assertThat(botMessages).hasSize(1);
        assertThat(botMessages.get(0).getUtilisateur().getRole()).isEqualTo(role_enum.CHATBOT);
        assertThat(botMessages.get(0).getContenu()).isEqualTo("Parole bot");
    }

    @Test
    void findUtilisateurMessagesByDebat_ShouldFilterHumanOnly() {
        // ARRANGE
        Utilisateur humain = creerUtilisateur("humain2@test.com", role_enum.UTILISATEUR);
        Utilisateur bot = creerUtilisateur("bot2@test.com", role_enum.CHATBOT);

        Sujet sujet = creerSujet();
        Debat debat = creerDebat(humain, sujet);

        creerMessage(debat, humain, "Parole humain", LocalDateTime.now());
        creerMessage(debat, bot, "Parole bot", LocalDateTime.now().plusSeconds(1));

        entityManager.flush();

        // ACT
        List<Message> userMessages = messageRepository.findUtilisateurMessagesByDebat(debat);

        // ASSERT
        assertThat(userMessages).hasSize(1);
        assertThat(userMessages.get(0).getUtilisateur().getRole()).isNotEqualTo(role_enum.CHATBOT);
        assertThat(userMessages.get(0).getContenu()).isEqualTo("Parole humain");
    }
}