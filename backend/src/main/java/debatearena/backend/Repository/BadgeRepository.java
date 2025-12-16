package debatearena.backend.Repository;

import debatearena.backend.Entity.Badge;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BadgeRepository extends JpaRepository<Badge, Long> {
    Optional<Badge> findBadgeByNom(String nom);
}
