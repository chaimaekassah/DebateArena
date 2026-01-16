package debatearena.backend.Repository;

import debatearena.backend.Entity.Debat;
import debatearena.backend.Entity.Sujet;
import debatearena.backend.Entity.Utilisateur;
// Importez vos Enums (adaptez le package si besoin)
import debatearena.backend.Entity.role_enum;
import debatearena.backend.Entity.niveau_enum;
import debatearena.backend.Entity.categorie_sujet_enum;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class DebatRepositoryTest {

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
        user.setPassword("password123"); // Obligatoire !
        user.setRole(role_enum.UTILISATEUR);  // Obligatoire ! (Adaptez selon votre Enum)
        user.setScore(0);                // Obligatoire !
        return user;
    }

    // --- Méthode utilitaire pour créer un sujet valide ---
    private Sujet creerSujetValide() {
        Sujet sujet = new Sujet();
        sujet.setTitre("Sujet Test");
        sujet.setCategorie(categorie_sujet_enum.INFORMATIQUE); // Adaptez selon votre Enum
        sujet.setDifficulte(niveau_enum.DEBUTANT);            // Adaptez selon votre Enum
        return sujet;
    }

    @Test
    void findDebatsEnCoursByUtilisateur_ShouldReturnOnlyOngoingDebates() {
        // ARRANGE
        // 1. Créer un utilisateur complet
        Utilisateur user = creerUtilisateurValide("test1@test.com");
        entityManager.persist(user);

        // Il faut aussi un sujet pour créer un débat (car id_sujet est NOT NULL)
        Sujet sujet = creerSujetValide();
        entityManager.persist(sujet);

        // 2. Débat EN COURS
        Debat debatEnCours = new Debat();
        debatEnCours.setUtilisateur(user);
        debatEnCours.setSujet(sujet); // Obligatoire
        debatEnCours.setDateDebut(LocalDateTime.now());
        debatEnCours.setChoixUtilisateur("POUR"); // Probablement obligatoire
        debatEnCours.setDuree(null);
        entityManager.persist(debatEnCours);

        // 3. Débat TERMINÉ
        Debat debatTermine = new Debat();
        debatTermine.setUtilisateur(user);
        debatTermine.setSujet(sujet);
        debatTermine.setDateDebut(LocalDateTime.now().minusDays(1));
        debatTermine.setChoixUtilisateur("CONTRE");
        debatTermine.setDuree(500);
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