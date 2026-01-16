package debatearena.backend.Repository;

import debatearena.backend.Entity.Debat;
import debatearena.backend.Entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DebatRepository extends JpaRepository<Debat, Long> {

    // Débats d'un utilisateur
    List<Debat> findByUtilisateurOrderByDateDebutDesc(Utilisateur utilisateur);

    // Débats en cours (duree = null)
    @Query("SELECT d FROM Debat d WHERE d.utilisateur = :utilisateur AND d.duree IS NULL")
    List<Debat> findDebatsEnCoursByUtilisateur(@Param("utilisateur") Utilisateur utilisateur);

    // Vérifier si un utilisateur a un débat en cours sur un sujet
    @Query("SELECT COUNT(d) > 0 FROM Debat d WHERE d.utilisateur = :utilisateur AND d.duree IS NULL AND d.sujet.id = :sujetId")
    boolean hasDebatEnCoursSurSujet(
            @Param("utilisateur") Utilisateur utilisateur,
            @Param("sujetId") Long sujetId
    );

    // Trouver un débat par ID et utilisateur
    @Query("SELECT d FROM Debat d WHERE d.id = :id AND d.utilisateur = :utilisateur")
    Optional<Debat> findByIdAndUtilisateur(
            @Param("id") Long id,
            @Param("utilisateur") Utilisateur utilisateur
    );

    // Compter les débats d'un utilisateur
    @Query("SELECT COUNT(d) FROM Debat d WHERE d.utilisateur.id = :userId")
    Integer countByUtilisateurId(@Param("userId") Long userId);

    // Débats récents avec les infos nécessaires pour le dashboard
    @Query("SELECT d.id, s.titre, s.categorie, s.difficulte, t.note, d.dateDebut, d.duree " +
            "FROM Debat d " +
            "JOIN d.sujet s " +
            "LEFT JOIN Test t ON t.debat = d " +
            "WHERE d.utilisateur.id = :userId " +
            "ORDER BY d.dateDebut DESC")
    List<Object[]> findRecentDebatsByUtilisateurId(@Param("userId") Long userId);

    // Débats terminés
    @Query("SELECT d FROM Debat d WHERE d.utilisateur = :utilisateur AND d.duree IS NOT NULL")
    List<Debat> findDebatsTerminesByUtilisateur(@Param("utilisateur") Utilisateur utilisateur);
}