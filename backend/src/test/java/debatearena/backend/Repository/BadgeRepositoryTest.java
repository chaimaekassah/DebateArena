package debatearena.backend.Repository;

import debatearena.backend.Entity.Badge;
import debatearena.backend.Entity.categorie_badge_enum;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;


@DataJpaTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
class BadgeRepositoryTest {

    @Autowired
    private BadgeRepository badgeRepository;

    @Test
    void shouldFindBadgeByNom_WhenBadgeExists() {
        // GIVEN
        Badge badge = new Badge();
        badge.setNom("Gold");
        badge.setDescription("Badge Gold");
        badge.setCategorie(categorie_badge_enum.OR);

        badgeRepository.save(badge);

        // WHEN
        Optional<Badge> result = badgeRepository.findBadgeByNom("Gold");

        // THEN
        assertTrue(result.isPresent(), "Le badge devrait être trouvé");
        assertEquals("Gold", result.get().getNom());
        assertEquals(categorie_badge_enum.OR, result.get().getCategorie());
    }

    @Test
    void shouldReturnEmpty_WhenBadgeDoesNotExist() {
        // WHEN
        Optional<Badge> result = badgeRepository.findBadgeByNom("Inexistant");

        // THEN
        assertTrue(result.isEmpty(), "Aucun badge ne devrait être trouvé");
    }
}
