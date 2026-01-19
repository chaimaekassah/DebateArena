package debatearena.backend.Repository;

import debatearena.backend.Entity.Sujet;
import debatearena.backend.Entity.categorie_sujet_enum;
import debatearena.backend.Entity.niveau_enum;
import org.springframework.data.jpa.repository.JpaRepository;


import java.util.List;
public interface SujetRepository extends JpaRepository<Sujet, Long> {

    List<Sujet> findByCategorie(categorie_sujet_enum categorie);
    List<Sujet> findByDifficulte(niveau_enum difficulte);
    List<Sujet> findByCategorieAndDifficulte(
            categorie_sujet_enum categorie,
            niveau_enum difficulte
    );
    List<Sujet> findByTitreContainingIgnoreCase(String titre);

}