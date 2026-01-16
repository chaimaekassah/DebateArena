package debatearena.backend.Repository;

import debatearena.backend.Entity.Debat;
import debatearena.backend.Entity.Test;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface TestRepository extends JpaRepository<Test, Long> {

    Optional<Test> findByDebat(Debat debat);

    boolean existsByDebat(Debat debat);

    // Compter les débats gagnés (note >= 12)
    @Query("SELECT COUNT(t) FROM Test t WHERE t.debat.utilisateur.id = :userId AND t.note >= 12")
    Integer countDebatsGagnesByUserId(@Param("userId") Long userId);

    // Moyenne des notes
    @Query("SELECT AVG(t.note) FROM Test t WHERE t.debat.utilisateur.id = :userId")
    Integer getMoyenneNotesByUserId(@Param("userId") Long userId);

    // Meilleure note
    @Query("SELECT MAX(t.note) FROM Test t WHERE t.debat.utilisateur.id = :userId")
    Integer getMeilleureNoteByUserId(@Param("userId") Long userId);

    // Tests d'un utilisateur
    @Query("SELECT t FROM Test t WHERE t.debat.utilisateur.id = :userId")
    List<Test> findByUtilisateurId(@Param("userId") Long userId);
}