package debatearena.backend.Repository;

import debatearena.backend.Entity.Signalement;
import debatearena.backend.Entity.TypeProblemeEnum;
import debatearena.backend.Entity.StatutSignalementEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SignalementRepository extends JpaRepository<Signalement, Long> {

    // Trouver par statut
    List<Signalement> findByStatutOrderByDateCreationDesc(StatutSignalementEnum statut);

    // Trouver par utilisateur
    List<Signalement> findByUtilisateurIdOrderByDateCreationDesc(Long utilisateurId);

    // Compter par statut
    @Query("SELECT COUNT(s) FROM Signalement s WHERE s.statut = :statut")
    Integer countByStatut(@Param("statut") StatutSignalementEnum statut);

    // Signalements récents
    @Query("SELECT s FROM Signalement s WHERE s.dateCreation >= :dateDebut ORDER BY s.dateCreation DESC")
    List<Signalement> findRecentSignalements(@Param("dateDebut") LocalDateTime dateDebut);

    // Signalements traités dans une période
    @Query("SELECT COUNT(s) FROM Signalement s WHERE s.statut IN ('RESOLU', 'REJETE') AND s.dateResolution >= :dateDebut")
    Integer countTraitesDepuis(@Param("dateDebut") LocalDateTime dateDebut);

    // Tous les signalements avec filtres
    @Query("SELECT s FROM Signalement s WHERE " +
            "(:statut IS NULL OR s.statut = :statut) AND " +
            "(:typeProbleme IS NULL OR s.typeProbleme = :typeProbleme) " +
            "ORDER BY s.dateCreation DESC")
    List<Signalement> findWithFilters(
            @Param("statut") StatutSignalementEnum statut,
            @Param("typeProbleme") TypeProblemeEnum typeProbleme
    );
}