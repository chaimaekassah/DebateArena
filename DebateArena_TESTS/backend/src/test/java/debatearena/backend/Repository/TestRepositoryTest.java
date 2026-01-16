package debatearena.backend.Repository;

// Attention à bien importer votre entité Test (et pas une classe de JUnit)
import debatearena.backend.Entity.Test;
import debatearena.backend.Entity.Debat;
import debatearena.backend.Entity.Sujet;
import debatearena.backend.Entity.Utilisateur;
import debatearena.backend.Entity.role_enum;
import debatearena.backend.Entity.categorie_sujet_enum;
import debatearena.backend.Entity.niveau_enum;

// Import de l'annotation JUnit (on utilise le chemin complet pour éviter la confusion si besoin,
// mais l'import simple org.junit.jupiter.api.Test fonctionne tant qu'on distingue la classe Test de l'annotation @Test)
import org.junit.jupiter.api.Assertions;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class TestRepositoryTest {

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
        // On met une durée pour dire qu'il est fini (nécessaire pour avoir une note ?)
        debat.setDuree(600);
        entityManager.persist(debat);
        return debat;
    }

    // --- HELPER 4 : Créer Test (L'entité) ---
    private Test creerTestEntity(Debat debat, int note) {
        Test testEntity = new Test();
        testEntity.setDebat(debat);
        testEntity.setNote(note);
        entityManager.persist(testEntity);
        return testEntity;
    }

    @org.junit.jupiter.api.Test
    void findByDebat_ShouldReturnTest() {
        // ARRANGE
        Utilisateur user = creerUtilisateur("u1@test.com");
        Sujet sujet = creerSujet();
        Debat debat = creerDebat(user, sujet);
        Test testEntity = creerTestEntity(debat, 15);

        entityManager.flush();

        // ACT
        Optional<Test> found = testRepository.findByDebat(debat);

        // ASSERT
        assertThat(found).isPresent();
        assertThat(found.get().getNote()).isEqualTo(15);
    }

    @org.junit.jupiter.api.Test
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

    @org.junit.jupiter.api.Test
    void countDebatsGagnesByUserId_ShouldCountNotesAbove12() {
        // ARRANGE
        Utilisateur user = creerUtilisateur("winner@test.com");
        Sujet sujet = creerSujet();

        // Debat 1 : Gagné (15/20)
        Debat d1 = creerDebat(user, sujet);
        creerTestEntity(d1, 15);

        // Debat 2 : Perdu (10/20)
        Debat d2 = creerDebat(user, sujet);
        creerTestEntity(d2, 10);

        // Debat 3 : Gagné limite (12/20)
        Debat d3 = creerDebat(user, sujet);
        creerTestEntity(d3, 12);

        entityManager.flush();

        // ACT
        Integer gagnes = testRepository.countDebatsGagnesByUserId(user.getId());

        // ASSERT
        assertThat(gagnes).isEqualTo(2); // 15 et 12
    }

    @org.junit.jupiter.api.Test
    void getMoyenneNotesByUserId_ShouldReturnAverage() {
        // ARRANGE
        Utilisateur user = creerUtilisateur("avg@test.com");
        Sujet sujet = creerSujet();

        // Notes : 10 et 20. Moyenne attendue : 15.
        creerTestEntity(creerDebat(user, sujet), 10);
        creerTestEntity(creerDebat(user, sujet), 20);

        entityManager.flush();

        // ACT
        Integer moyenne = testRepository.getMoyenneNotesByUserId(user.getId());

        // ASSERT
        // Note : Si AVG renvoie un Double en base, Spring essaiera de le caster en Integer.
        // H2 renvoie souvent des entiers pour AVG si les inputs sont entiers, ou des doubles.
        // Ce test validera si le cast automatique fonctionne.
        assertThat(moyenne).isEqualTo(15);
    }

    @org.junit.jupiter.api.Test
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

    @org.junit.jupiter.api.Test
    void findByUtilisateurId_ShouldReturnUserTestsOnly() {
        // ARRANGE
        Utilisateur user1 = creerUtilisateur("user1@test.com");
        Utilisateur user2 = creerUtilisateur("user2@test.com");
        Sujet sujet = creerSujet();

        Test t1 = creerTestEntity(creerDebat(user1, sujet), 10);
        Test t2 = creerTestEntity(creerDebat(user1, sujet), 15);

        // Test de l'autre utilisateur (ne doit pas être trouvé)
        creerTestEntity(creerDebat(user2, sujet), 20);

        entityManager.flush();

        // ACT
        List<Test> results = testRepository.findByUtilisateurId(user1.getId());

        // ASSERT
        assertThat(results).hasSize(2);
        assertThat(results).extracting(Test::getNote).containsExactlyInAnyOrder(10, 15);
    }
}