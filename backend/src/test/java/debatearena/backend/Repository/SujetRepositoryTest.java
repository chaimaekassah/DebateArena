package debatearena.backend.Repository;

import debatearena.backend.Entity.Sujet;
import debatearena.backend.Entity.categorie_sujet_enum;
import debatearena.backend.Entity.niveau_enum;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class SujetRepositoryTest {

    @Autowired
    private SujetRepository sujetRepository;

    @Autowired
    private TestEntityManager entityManager;

    // --- HELPER : Créer un sujet rapidement ---
    private Sujet persistSujet(String titre, categorie_sujet_enum cat, niveau_enum dif) {
        Sujet sujet = new Sujet();
        sujet.setTitre(titre);
        sujet.setCategorie(cat);
        sujet.setDifficulte(dif);
        entityManager.persist(sujet);
        return sujet;
    }

    @Test
    void findByCategorie_ShouldReturnMatchingSubjects() {
        // ARRANGE
        persistSujet("Java Basics", categorie_sujet_enum.INFORMATIQUE, niveau_enum.DEBUTANT);
        persistSujet("L'Art Abstrait", categorie_sujet_enum.ART, niveau_enum.DEBUTANT); // Autre catégorie

        entityManager.flush();

        // ACT
        List<Sujet> result = sujetRepository.findByCategorie(categorie_sujet_enum.INFORMATIQUE);

        // ASSERT
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitre()).isEqualTo("Java Basics");
    }

    @Test
    void findByDifficulte_ShouldReturnMatchingSubjects() {
        // ARRANGE
        persistSujet("Expert Java", categorie_sujet_enum.INFORMATIQUE, niveau_enum.EXPERT);
        persistSujet("Debutant Java", categorie_sujet_enum.INFORMATIQUE, niveau_enum.DEBUTANT);

        entityManager.flush();

        // ACT
        List<Sujet> result = sujetRepository.findByDifficulte(niveau_enum.EXPERT);

        // ASSERT
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitre()).isEqualTo("Expert Java");
    }

    @Test
    void findByCategorieAndDifficulte_ShouldReturnSpecificSubjects() {
        // ARRANGE
        // 1. Match parfait
        Sujet target = persistSujet("Cible", categorie_sujet_enum.POLITIQUE, niveau_enum.AVANCE);

        // 2. Bonne catégorie, mauvaise difficulté
        persistSujet("Mauvais Niveau", categorie_sujet_enum.POLITIQUE, niveau_enum.DEBUTANT);

        // 3. Mauvaise catégorie, bon niveau
        persistSujet("Mauvaise Cat", categorie_sujet_enum.SANTE, niveau_enum.AVANCE);

        entityManager.flush();

        // ACT
        List<Sujet> result = sujetRepository.findByCategorieAndDifficulte(
                categorie_sujet_enum.POLITIQUE,
                niveau_enum.AVANCE
        );

        // ASSERT
        assertThat(result).hasSize(1);
        assertThat(result.get(0)).isEqualTo(target);
    }

    @Test
    void findByTitreContainingIgnoreCase_ShouldFindSubjects() {
        // ARRANGE
        // Contient "tech" au début
        persistSujet("Technology trends", categorie_sujet_enum.INFORMATIQUE, niveau_enum.DEBUTANT);
        // Contient "tech" au milieu en majuscule
        persistSujet("La Haute TECHnologie", categorie_sujet_enum.INFORMATIQUE, niveau_enum.DEBUTANT);
        // Ne contient pas "tech"
        persistSujet("Jardinage", categorie_sujet_enum.ART, niveau_enum.DEBUTANT);

        entityManager.flush();

        // ACT
        // On cherche "tech" en minuscule, ça doit trouver les majuscules aussi
        List<Sujet> result = sujetRepository.findByTitreContainingIgnoreCase("tech");

        // ASSERT
        assertThat(result).hasSize(2);
    }
}
