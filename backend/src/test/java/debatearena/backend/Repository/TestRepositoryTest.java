package debatearena.backend.Repository;

// Importez votre dialecte externe (Vérifiez le package !)
import debatearena.backend.Integration.CustomH2Dialect;

// On utilise le chemin complet pour l'Entité pour éviter la confusion avec l'annotation @Test
import debatearena.backend.Entity.Debat;
import debatearena.backend.Entity.Sujet;
import debatearena.backend.Entity.Utilisateur;
import debatearena.backend.Entity.role_enum;
import debatearena.backend.Entity.categorie_sujet_enum;
import debatearena.backend.Entity.niveau_enum;

import org.junit.jupiter.api.BeforeEach;
// On garde l'import simple pour l'annotation de test
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
// Configuration forcée pour H2 + Dialecte Custom
@ContextConfiguration(initializers = TestRepositoryTest.TestDbInitializer.class)
class TestRepositoryTest {

    // --- INITIALIZER ---
    public static class TestDbInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {
        @Override
        public void initialize(ConfigurableApplicationContext applicationContext) {
            TestPropertyValues.of(
                    "spring.datasource.url=jdbc:h2:mem:debatearena_test_db;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=false",
                    "spring.datasource.driverClassName=org.h2.Driver",
                    "spring.datasource.username=sa",
                    "spring.datasource.password=",
                    // Utilisation de la classe externe CustomH2Dialect
                    "spring.jpa.database-platform=" + CustomH2Dialect.class.getName(),
                    "spring.jpa.hibernate.ddl-auto=create-drop",
                    "spring.flyway.enabled=false",
                    "spring.liquibase.enabled=false"
            ).applyTo(applicationContext.getEnvironment());
        }
    }

    @Autowired
    private TestRepository testRepository;

    @Autowired
    private TestEntityManager entityManager;

    // --- HELPER 1 : Créer Utilisateur ---
    private Utilisateur creerUtilisateur(String email) {
        Utilisateur user = new Utilisateur();
        user.setEmail(email);
        user.setNom("Nom");
        user.setPrenom("Prenom");
        user.setPassword("pass");
        user.setRole(role_enum.UTILISATEUR);
        user.setScore(0);
        entityManager.persist(user);
        return user;
    }

    // --- HELPER 2 : Créer Sujet ---
    private Sujet creerSujet() {
        Sujet sujet = new Sujet();
        sujet.setTitre("Sujet Test");
        sujet.setCategorie(categorie_sujet_enum.INFORMATIQUE);
        sujet.setDifficulte(niveau_enum.DEBUTANT);
        entityManager.persist(sujet);
        return sujet;
    }

    // --- HELPER 3 : Créer Débat ---
    private Debat creerDebat(Utilisateur user, Sujet sujet) {
        Debat debat = new Debat();
        debat.setUtilisateur(user);
        debat.setSujet(sujet);
        debat.setDateDebut(LocalDateTime.now());
        debat.setChoixUtilisateur("POUR");
        debat.setDuree(600);
        entityManager.persist(debat);
        return debat;
    }

    // --- HELPER 4 : Créer l'entité "Test" ---
    // On utilise le chemin complet pour l'entité ici
    private debatearena.backend.Entity.Test creerTestEntity(Debat debat, int note) {
        debatearena.backend.Entity.Test testEntity = new debatearena.backend.Entity.Test();
        testEntity.setDebat(debat);
        testEntity.setNote(note);
        entityManager.persist(testEntity);
        return testEntity;
    }

    @Test
    void findByDebat_ShouldReturnTest() {
        // ARRANGE
        Utilisateur user = creerUtilisateur("u1@test.com");
        Sujet sujet = creerSujet();
        Debat debat = creerDebat(user, sujet);
        debatearena.backend.Entity.Test testEntity = creerTestEntity(debat, 15);

        entityManager.flush();

        // ACT
        Optional<debatearena.backend.Entity.Test> found = testRepository.findByDebat(debat);

        // ASSERT
        assertThat(found).isPresent();
        assertThat(found.get().getNote()).isEqualTo(15);
    }

    @Test
    void existsByDebat_ShouldReturnTrue() {
        // ARRANGE
        Utilisateur user = creerUtilisateur("u2@test.com");
        Sujet sujet = creerSujet();
        Debat debat = creerDebat(user, sujet);
        creerTestEntity(debat, 10);

        entityManager.flush();

        // ACT
        boolean exists = testRepository.existsByDebat(debat);

        // ASSERT
        assertThat(exists).isTrue();
    }

    @Test
    void countDebatsGagnesByUserId_ShouldCountNotesAbove12() {
        // ARRANGE
        Utilisateur user = creerUtilisateur("winner@test.com");
        Sujet sujet = creerSujet();

        Debat d1 = creerDebat(user, sujet);
        creerTestEntity(d1, 15); // Gagné

        Debat d2 = creerDebat(user, sujet);
        creerTestEntity(d2, 10); // Perdu

        Debat d3 = creerDebat(user, sujet);
        creerTestEntity(d3, 12); // Gagné

        entityManager.flush();

        // ACT
        Integer gagnes = testRepository.countDebatsGagnesByUserId(user.getId());

        // ASSERT
        assertThat(gagnes).isEqualTo(2);
    }

    @Test
    void getMoyenneNotesByUserId_ShouldReturnAverage() {
        // ARRANGE
        Utilisateur user = creerUtilisateur("avg@test.com");
        Sujet sujet = creerSujet();

        creerTestEntity(creerDebat(user, sujet), 10);
        creerTestEntity(creerDebat(user, sujet), 20);

        entityManager.flush();

        // ACT
        Integer moyenne = testRepository.getMoyenneNotesByUserId(user.getId());

        // ASSERT
        assertThat(moyenne).isEqualTo(15);
    }

    @Test
    void getMeilleureNoteByUserId_ShouldReturnMax() {
        // ARRANGE
        Utilisateur user = creerUtilisateur("max@test.com");
        Sujet sujet = creerSujet();

        creerTestEntity(creerDebat(user, sujet), 5);
        creerTestEntity(creerDebat(user, sujet), 18);
        creerTestEntity(creerDebat(user, sujet), 14);

        entityManager.flush();

        // ACT
        Integer max = testRepository.getMeilleureNoteByUserId(user.getId());

        // ASSERT
        assertThat(max).isEqualTo(18);
    }

    @Test
    void findByUtilisateurId_ShouldReturnUserTestsOnly() {
        // ARRANGE
        Utilisateur user1 = creerUtilisateur("user1@test.com");
        Utilisateur user2 = creerUtilisateur("user2@test.com");
        Sujet sujet = creerSujet();

        creerTestEntity(creerDebat(user1, sujet), 10);
        creerTestEntity(creerDebat(user1, sujet), 15);

        // Test d'un autre user
        creerTestEntity(creerDebat(user2, sujet), 20);

        entityManager.flush();

        // ACT
        List<debatearena.backend.Entity.Test> results = testRepository.findByUtilisateurId(user1.getId());

        // ASSERT
        assertThat(results).hasSize(2);
        assertThat(results).extracting(debatearena.backend.Entity.Test::getNote).containsExactlyInAnyOrder(10, 15);
    }
}