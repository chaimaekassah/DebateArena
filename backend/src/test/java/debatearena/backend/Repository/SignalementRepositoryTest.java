package debatearena.backend.Repository;

import debatearena.backend.Entity.Signalement;
import debatearena.backend.Entity.StatutSignalementEnum;
import debatearena.backend.Entity.TypeProblemeEnum;
import debatearena.backend.Entity.Utilisateur;
import debatearena.backend.Entity.role_enum;
import debatearena.backend.Integration.CustomH2Dialect; // Assurez-vous que cet import est correct
import org.junit.jupiter.api.BeforeEach;
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

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
@ContextConfiguration(initializers = SignalementRepositoryTest.TestDbInitializer.class)
public class SignalementRepositoryTest {

    // --- INITIALIZER ---
    public static class TestDbInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {
        @Override
        public void initialize(ConfigurableApplicationContext applicationContext) {
            TestPropertyValues.of(
                    "spring.datasource.url=jdbc:h2:mem:debatearena_test_db;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=false",
                    "spring.datasource.driverClassName=org.h2.Driver",
                    "spring.datasource.username=sa",
                    "spring.datasource.password=",
                    "spring.jpa.database-platform=" + CustomH2Dialect.class.getName(),
                    "spring.jpa.hibernate.ddl-auto=create-drop",
                    "spring.flyway.enabled=false",
                    "spring.liquibase.enabled=false"
            ).applyTo(applicationContext.getEnvironment());
        }
    }

    @Autowired
    private SignalementRepository signalementRepository;

    @Autowired
    private TestEntityManager entityManager;

    private Utilisateur utilisateurTest;

    @BeforeEach
    void setUp() {
        utilisateurTest = new Utilisateur();
        utilisateurTest.setNom("Test User");
        utilisateurTest.setPrenom("Prenom");
        utilisateurTest.setEmail("test" + System.currentTimeMillis() + "@example.com");
        utilisateurTest.setPassword("password123");
        utilisateurTest.setRole(role_enum.UTILISATEUR);
        utilisateurTest.setScore(0);

        utilisateurTest = entityManager.persist(utilisateurTest);
        entityManager.flush();
    }

    @Test
    void findByStatutOrderByDateCreationDesc_ShouldReturnOrderedList() {
        createAndPersistSignalement(StatutSignalementEnum.EN_ATTENTE, LocalDateTime.now().minusHours(5));
        createAndPersistSignalement(StatutSignalementEnum.EN_ATTENTE, LocalDateTime.now().minusHours(1));
        createAndPersistSignalement(StatutSignalementEnum.RESOLU, LocalDateTime.now());

        List<Signalement> result = signalementRepository.findByStatutOrderByDateCreationDesc(StatutSignalementEnum.EN_ATTENTE);

        assertThat(result).hasSize(2);
        assertThat(result.get(0).getDateCreation()).isAfter(result.get(1).getDateCreation());
    }

    @Test
    void findByUtilisateurId_ShouldReturnUserSignalements() {
        createAndPersistSignalement(StatutSignalementEnum.EN_ATTENTE, LocalDateTime.now());

        Utilisateur autreUser = new Utilisateur();
        autreUser.setNom("Autre");
        autreUser.setPrenom("AutreP");
        autreUser.setEmail("autre" + System.currentTimeMillis() + "@test.com");
        autreUser.setPassword("pass");
        autreUser.setRole(role_enum.UTILISATEUR);
        autreUser.setScore(0);
        entityManager.persist(autreUser);

        Signalement s2 = new Signalement();
        s2.setUtilisateur(autreUser);
        s2.setStatut(StatutSignalementEnum.EN_ATTENTE);
        s2.setDateCreation(LocalDateTime.now());
        s2.setTitre("Autre titre");
        s2.setDescription("Autre desc");
        s2.setTypeProbleme(TypeProblemeEnum.AUTRE);
        entityManager.persist(s2);
        entityManager.flush();

        List<Signalement> result = signalementRepository.findByUtilisateurIdOrderByDateCreationDesc(utilisateurTest.getId());

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getUtilisateur().getId()).isEqualTo(utilisateurTest.getId());
    }

    @Test
    void countByStatut_ShouldReturnCount() {
        createAndPersistSignalement(StatutSignalementEnum.EN_ATTENTE, LocalDateTime.now());
        createAndPersistSignalement(StatutSignalementEnum.EN_ATTENTE, LocalDateTime.now());
        createAndPersistSignalement(StatutSignalementEnum.REJETE, LocalDateTime.now());

        Integer count = signalementRepository.countByStatut(StatutSignalementEnum.EN_ATTENTE);

        assertThat(count).isEqualTo(2);
    }

    @Test
    void findRecentSignalements_ShouldFilterByDate() {
        LocalDateTime now = LocalDateTime.now();
        createAndPersistSignalement(StatutSignalementEnum.EN_ATTENTE, now.minusDays(10));
        Signalement recent = createAndPersistSignalement(StatutSignalementEnum.EN_ATTENTE, now.minusDays(1));

        List<Signalement> result = signalementRepository.findRecentSignalements(now.minusDays(3));

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitre()).isEqualTo(recent.getTitre());
    }

    @Test
    void countTraitesDepuis_ShouldCountOnlyResolvedAndRejected() {
        LocalDateTime dateSeuil = LocalDateTime.now().minusDays(2);

        createAndPersistSignalement(StatutSignalementEnum.EN_ATTENTE, LocalDateTime.now());

        Signalement sVieux = new Signalement();
        sVieux.setTitre("Vieux");
        sVieux.setDescription("Desc");
        sVieux.setUtilisateur(utilisateurTest);
        sVieux.setStatut(StatutSignalementEnum.RESOLU);
        sVieux.setTypeProbleme(TypeProblemeEnum.AUTRE);
        sVieux.setDateCreation(LocalDateTime.now().minusDays(20));
        sVieux.setDateResolution(LocalDateTime.now().minusDays(10));
        entityManager.persist(sVieux);

        Signalement sResolu = new Signalement();
        sResolu.setTitre("Resolu");
        sResolu.setDescription("Desc");
        sResolu.setUtilisateur(utilisateurTest);
        sResolu.setStatut(StatutSignalementEnum.RESOLU);
        sResolu.setTypeProbleme(TypeProblemeEnum.AUTRE);
        sResolu.setDateCreation(LocalDateTime.now().minusDays(5));
        sResolu.setDateResolution(LocalDateTime.now().minusDays(1));
        entityManager.persist(sResolu);

        Signalement sRejete = new Signalement();
        sRejete.setTitre("Rejete");
        sRejete.setDescription("Desc");
        sRejete.setUtilisateur(utilisateurTest);
        sRejete.setStatut(StatutSignalementEnum.REJETE);
        sRejete.setTypeProbleme(TypeProblemeEnum.AUTRE);
        sRejete.setDateCreation(LocalDateTime.now().minusDays(5));
        sRejete.setDateResolution(LocalDateTime.now().minusDays(1));
        entityManager.persist(sRejete);

        entityManager.flush();

        Integer count = signalementRepository.countTraitesDepuis(dateSeuil);

        assertThat(count).isEqualTo(2);
    }

    @Test
    void findWithFilters_ShouldHandleFilters() {
        Signalement s1 = new Signalement();
        s1.setTitre("Bug");
        s1.setDescription("Desc");
        s1.setUtilisateur(utilisateurTest);
        s1.setStatut(StatutSignalementEnum.EN_ATTENTE);
        s1.setTypeProbleme(TypeProblemeEnum.BUG_TECHNIQUE);
        s1.setDateCreation(LocalDateTime.now());
        entityManager.persist(s1);

        Signalement s2 = new Signalement();
        s2.setTitre("Contenu");
        s2.setDescription("Desc");
        s2.setUtilisateur(utilisateurTest);
        s2.setStatut(StatutSignalementEnum.RESOLU);
        s2.setTypeProbleme(TypeProblemeEnum.CONTENU_INAPPROPRIE);
        s2.setDateCreation(LocalDateTime.now());
        entityManager.persist(s2);

        entityManager.flush();

        assertThat(signalementRepository.findWithFilters(null, null)).hasSize(2);
        assertThat(signalementRepository.findWithFilters(StatutSignalementEnum.EN_ATTENTE, null)).hasSize(1);
        assertThat(signalementRepository.findWithFilters(null, TypeProblemeEnum.BUG_TECHNIQUE)).hasSize(1);
    }

    // Méthode utilitaire pour créer des données de test
    private Signalement createAndPersistSignalement(StatutSignalementEnum statut, LocalDateTime dateCreation) {
        Signalement s = new Signalement();
        s.setTitre("Test_" + System.nanoTime());
        s.setDescription("Desc");
        s.setStatut(statut);
        s.setDateCreation(dateCreation);
        s.setUtilisateur(utilisateurTest);
        s.setTypeProbleme(TypeProblemeEnum.BUG_TECHNIQUE);
        s = entityManager.persist(s);
        entityManager.flush();
        return s;
    }

} // FIN DE LA CLASSE ICI