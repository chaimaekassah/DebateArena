package debatearena.backend.Repository;

import debatearena.backend.Entity.Utilisateur;
import debatearena.backend.Entity.role_enum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {

    // Trouver par email (pour l'authentification)
    Optional<Utilisateur> findByEmail(String email);

    // Trouver par rôle (pour trouver le chatbot)
    Optional<Utilisateur> findByRole(role_enum role);

    // Vérifier si un email existe déjà
    boolean existsByEmail(String email);

    // Trouver les utilisateurs par score (classement)
    @Query("SELECT u FROM Utilisateur u ORDER BY u.score DESC")
    List<Utilisateur> findAllOrderByScoreDesc();

    // Trouver les utilisateurs avec un badge spécifique
    @Query("SELECT u FROM Utilisateur u WHERE u.badge.id = :badgeId")
    List<Utilisateur> findByBadgeId(@Param("badgeId") Long badgeId);

    // Trouver le classement d'un utilisateur
    @Query(value = "SELECT rank FROM (" +
            "SELECT id, ROW_NUMBER() OVER (ORDER BY score DESC) as rank FROM utilisateur" +
            ") ranked WHERE id = :userId", nativeQuery = true)
    Optional<Integer> findRankByUserId(@Param("userId") Long userId);
}