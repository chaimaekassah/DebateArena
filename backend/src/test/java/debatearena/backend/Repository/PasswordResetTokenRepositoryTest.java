package debatearena.backend.Repository;

import debatearena.backend.Entity.PasswordResetToken;
import debatearena.backend.Entity.Utilisateur;
import debatearena.backend.Entity.role_enum; // Adaptez l'import si nécessaire

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;
import org.springframework.boot.test.autoconfigure.orm.jpa.TestEntityManager;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class PasswordResetTokenRepositoryTest {

    @Autowired
    private PasswordResetTokenRepository tokenRepository;

    @Autowired
    private TestEntityManager entityManager;

    // --- HELPER : Créer un utilisateur valide pour éviter les erreurs de contraintes ---
    private Utilisateur creerUtilisateur() {
        Utilisateur user = new Utilisateur();
        user.setEmail("reset@test.com");
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
        // 1. On doit d'abord avoir un utilisateur en base
        Utilisateur user = creerUtilisateur();

        // 2. On crée le token lié à l'utilisateur
        PasswordResetToken token = new PasswordResetToken();
        token.setToken("mon-super-token-secret");
        token.setUtilisateur(user);
        token.setExpiration(LocalDateTime.now().plusHours(1)); // Date future

        entityManager.persist(token);
        entityManager.flush();

        // ACT
        Optional<PasswordResetToken> found = tokenRepository.findByToken("mon-super-token-secret");

        // ASSERT
        assertThat(found).isPresent();
        assertThat(found.get().getUtilisateur()).isEqualTo(user);
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