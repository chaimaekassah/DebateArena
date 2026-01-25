package debatearena.backend.Repository;

import debatearena.backend.Entity.PasswordResetToken;
import debatearena.backend.Entity.Utilisateur;
import debatearena.backend.Entity.role_enum;
import debatearena.backend.Integration.CustomH2Dialect; // IMPORTANT : Import du dialecte externe
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;
import org.springframework.boot.test.util.TestPropertyValues;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.test.context.ContextConfiguration;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
// Configuration forcée pour utiliser H2 et le dialecte custom
@ContextConfiguration(initializers = PasswordResetTokenRepositoryTest.TestDbInitializer.class)
class PasswordResetTokenRepositoryTest {

    // --- INITIALIZER ---
    public static class TestDbInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {
        @Override
        public void initialize(ConfigurableApplicationContext applicationContext) {
            TestPropertyValues.of(
                    "spring.datasource.url=jdbc:h2:mem:debatearena_test_db;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=false",
                    "spring.datasource.driverClassName=org.h2.Driver",
                    "spring.datasource.username=sa",
                    "spring.datasource.password=",
                    // Utilisation de la classe externe CustomH2Dialect
                    "spring.jpa.database-platform=" + CustomH2Dialect.class.getName(),
                    "spring.jpa.hibernate.ddl-auto=create-drop",
                    "spring.flyway.enabled=false",
                    "spring.liquibase.enabled=false"
            ).applyTo(applicationContext.getEnvironment());
        }
    }

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private TestEntityManager entityManager;

    // --- HELPER : Créer un utilisateur valide ---
    private Utilisateur creerUtilisateur() {
        Utilisateur user = new Utilisateur();
        user.setEmail("reset" + System.currentTimeMillis() + "@test.com"); // Email unique
        user.setNom("Test");
        user.setPrenom("User");
        user.setPassword("password123");
        user.setRole(role_enum.UTILISATEUR);
        user.setScore(0);
        entityManager.persist(user);
        return user;
    }

    @Test
    void findByToken_ShouldReturnToken_WhenExists() {
        // ARRANGE
        Utilisateur user = creerUtilisateur();

        PasswordResetToken token = new PasswordResetToken();
        token.setToken("mon-super-token-secret");
        token.setUtilisateur(user);
        token.setExpiration(LocalDateTime.now().plusHours(1));

        entityManager.persist(token);
        entityManager.flush();

        // ACT
        Optional<PasswordResetToken> found = tokenRepository.findByToken("mon-super-token-secret");

        // ASSERT
        assertThat(found).isPresent();
        assertThat(found.get().getUtilisateur().getId()).isEqualTo(user.getId()); // Comparer les ID est plus sûr
        assertThat(found.get().getToken()).isEqualTo("mon-super-token-secret");
    }

    @Test
    void findByToken_ShouldReturnEmpty_WhenNotExists() {
        // ACT
        Optional<PasswordResetToken> found = tokenRepository.findByToken("token-inexistant");

        // ASSERT
        assertThat(found).isEmpty();
    }
}