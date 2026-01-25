package debatearena.backend.Repository;

import debatearena.backend.Entity.Debat;
import debatearena.backend.Entity.Sujet;
import debatearena.backend.Entity.Utilisateur;
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
// Configuration forcée pour utiliser H2 et le dialecte custom
@ContextConfiguration(initializers = DebatRepositoryTest.TestDbInitializer.class)
class DebatRepositoryTest {

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
    private DebatRepository debatRepository;

    @Autowired
    private TestEntityManager entityManager;

    // --- Méthode utilitaire pour créer un utilisateur valide ---
    private Utilisateur creerUtilisateurValide(String email) {
        Utilisateur user = new Utilisateur();
        user.setEmail(email);
        user.setNom("NomTest");
        user.setPrenom("PrenomTest");
        user.setPassword("password123");
        user.setRole(role_enum.UTILISATEUR);
        user.setScore(0);
        return user;
    }

    // --- Méthode utilitaire pour créer un sujet valide ---
    private Sujet creerSujetValide() {
        Sujet sujet = new Sujet();
        sujet.setTitre("Sujet Test");
        sujet.setCategorie(categorie_sujet_enum.INFORMATIQUE);
        sujet.setDifficulte(niveau_enum.DEBUTANT);
        return sujet;
    }

    @Test
    void findDebatsEnCoursByUtilisateur_ShouldReturnOnlyOngoingDebates() {
        // ARRANGE
        Utilisateur user = creerUtilisateurValide("test1@test.com");
        entityManager.persist(user);

        Sujet sujet = creerSujetValide();
        entityManager.persist(sujet);

        // 2. Débat EN COURS (duree est null)
        Debat debatEnCours = new Debat();
        debatEnCours.setUtilisateur(user);
        debatEnCours.setSujet(sujet);
        debatEnCours.setDateDebut(LocalDateTime.now());
        debatEnCours.setChoixUtilisateur("POUR");
        debatEnCours.setDuree(null); // Important pour le test
        entityManager.persist(debatEnCours);

        // 3. Débat TERMINÉ (duree n'est pas null)
        Debat debatTermine = new Debat();
        debatTermine.setUtilisateur(user);
        debatTermine.setSujet(sujet);
        debatTermine.setDateDebut(LocalDateTime.now().minusDays(1));
        debatTermine.setChoixUtilisateur("CONTRE");
        debatTermine.setDuree(500); // Important pour le test
        entityManager.persist(debatTermine);

        entityManager.flush();

        // ACT
        List<Debat> result = debatRepository.findDebatsEnCoursByUtilisateur(user);

        // ASSERT
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getDuree()).isNull();
        assertThat(result.get(0)).isEqualTo(debatEnCours);
    }

    @Test
    void hasDebatEnCoursSurSujet_ShouldReturnTrue_WhenExists() {
        // ARRANGE
        Utilisateur user = creerUtilisateurValide("test2@test.com");
        entityManager.persist(user);

        Sujet sujet = creerSujetValide();
        entityManager.persist(sujet);

        Debat debat = new Debat();
        debat.setUtilisateur(user);
        debat.setSujet(sujet);
        debat.setDateDebut(LocalDateTime.now());
        debat.setChoixUtilisateur("POUR");
        debat.setDuree(null); // En cours
        entityManager.persist(debat);

        entityManager.flush();

        // ACT
        boolean exists = debatRepository.hasDebatEnCoursSurSujet(user, sujet.getId());

        // ASSERT
        assertThat(exists).isTrue();
    }

    @Test
    void findByIdAndUtilisateur_ShouldReturnDebat_WhenBelongsToUser() {
        // ARRANGE
        Utilisateur user = creerUtilisateurValide("test3@test.com");
        entityManager.persist(user);

        Sujet sujet = creerSujetValide();
        entityManager.persist(sujet);

        Debat debat = new Debat();
        debat.setUtilisateur(user);
        debat.setSujet(sujet);
        debat.setDateDebut(LocalDateTime.now());
        debat.setChoixUtilisateur("POUR");
        debat.setDuree(null);
        entityManager.persist(debat);
        entityManager.flush();

        // ACT
        Optional<Debat> found = debatRepository.findByIdAndUtilisateur(debat.getId(), user);

        // ASSERT
        assertThat(found).isPresent();
        assertThat(found.get().getId()).isEqualTo(debat.getId());
    }
}