package debatearena.backend.Repository;

import debatearena.backend.Entity.Badge;
import debatearena.backend.Entity.categorie_badge_enum;
import debatearena.backend.Integration.CustomH2Dialect; // IMPORTANT : Import du dialecte externe
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.util.TestPropertyValues;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.test.context.ContextConfiguration;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;

@DataJpaTest
// On ne met PAS @AutoConfigureTestDatabase ici car on configure la DB manuellement dans l'initializer
@ContextConfiguration(initializers = BadgeRepositoryTest.TestDbInitializer.class)
class BadgeRepositoryTest {

    // --- INITIALIZER : LA SOLUTION AUX ERREURS DE TABLE ---
    public static class TestDbInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {
        @Override
        public void initialize(ConfigurableApplicationContext applicationContext) {
            TestPropertyValues.of(
                    "spring.datasource.url=jdbc:h2:mem:debatearena_test_db;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=false",
                    "spring.datasource.driverClassName=org.h2.Driver",
                    "spring.datasource.username=sa",
                    "spring.datasource.password=",
                    // C'est cette ligne qui corrige l'erreur 6001 NAMED_ENUM
                    "spring.jpa.database-platform=" + CustomH2Dialect.class.getName(),
                    "spring.jpa.hibernate.ddl-auto=create-drop",
                    "spring.flyway.enabled=false",
                    "spring.liquibase.enabled=false"
            ).applyTo(applicationContext.getEnvironment());
        }
    }

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