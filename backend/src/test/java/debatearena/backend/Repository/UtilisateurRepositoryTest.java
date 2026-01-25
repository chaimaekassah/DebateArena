package debatearena.backend.Repository;

import debatearena.backend.Entity.Utilisateur;
import debatearena.backend.Entity.role_enum;
import debatearena.backend.Integration.CustomH2Dialect; // Assurez-vous que l'import est correct
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.util.TestPropertyValues;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.test.context.ContextConfiguration;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
// Configuration forcée pour utiliser H2 et le dialecte custom
@ContextConfiguration(initializers = UtilisateurRepositoryTest.TestDbInitializer.class)
class UtilisateurRepositoryTest {

    // --- INITIALIZER ---
    public static class TestDbInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {
        @Override
        public void initialize(ConfigurableApplicationContext applicationContext) {
            TestPropertyValues.of(
                    "spring.datasource.url=jdbc:h2:mem:debatearena_test_db;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=false",
                    "spring.datasource.driverClassName=org.h2.Driver",
                    "spring.datasource.username=sa",
                    "spring.datasource.password=",
                    // Utilisation de la classe externe CustomH2Dialect pour gérer les ENUMS
                    "spring.jpa.database-platform=" + CustomH2Dialect.class.getName(),
                    "spring.jpa.hibernate.ddl-auto=create-drop",
                    "spring.flyway.enabled=false",
                    "spring.liquibase.enabled=false"
            ).applyTo(applicationContext.getEnvironment());
        }
    }

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Test
    void testFindByEmail() {
        // GIVEN
        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setNom("El Amrani");
        utilisateur.setPrenom("Chaimae");
        utilisateur.setEmail("chaimae@test.com");
        utilisateur.setPassword("password123");
        utilisateur.setRole(role_enum.UTILISATEUR);
        utilisateur.setScore(0); // Champ obligatoire (not null)

        utilisateurRepository.save(utilisateur);

        // WHEN
        Optional<Utilisateur> result = utilisateurRepository.findByEmail("chaimae@test.com");

        // THEN
        assertThat(result).isPresent();
        assertThat(result.get().getEmail()).isEqualTo("chaimae@test.com");
        assertThat(result.get().getNom()).isEqualTo("El Amrani");
    }

    @Test
    void testExistsByEmail() {
        // GIVEN
        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setNom("Test");
        utilisateur.setPrenom("User");
        utilisateur.setEmail("test@test.com");
        utilisateur.setPassword("password");
        utilisateur.setRole(role_enum.UTILISATEUR);
        utilisateur.setScore(0); // Champ obligatoire

        utilisateurRepository.save(utilisateur);

        // WHEN
        boolean exists = utilisateurRepository.existsByEmail("test@test.com");

        // THEN
        assertThat(exists).isTrue();
    }

    @Test
    void testExistsByEmailFalse() {
        // WHEN
        boolean exists = utilisateurRepository.existsByEmail("notfound@test.com");

        // THEN
        assertThat(exists).isFalse();
    }
}