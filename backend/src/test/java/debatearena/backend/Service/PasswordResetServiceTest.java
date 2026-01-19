package debatearena.backend.Service;

import debatearena.backend.Entity.PasswordResetToken;
import debatearena.backend.Entity.Utilisateur;
import debatearena.backend.Exceptions.BadRequestException;
import debatearena.backend.Exceptions.NotFoundException;
import debatearena.backend.Exceptions.UnauthorizedException;
import debatearena.backend.Repository.PasswordResetTokenRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class PasswordResetServiceTest {

    @Mock
    private PasswordResetTokenRepository tokenRepo;

    @Mock
    private UtilisateurService utilisateurService;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private PasswordResetService passwordResetService;

    private Utilisateur user;
    private PasswordResetToken validToken;

    @BeforeEach
    void setUp() {
        // Initialisation d'un utilisateur standard
        user = new Utilisateur();
        user.setId(1L);
        user.setEmail("test@test.com");
        user.setPassword("oldPassword");

        // Initialisation d'un token valide
        validToken = new PasswordResetToken();
        validToken.setId(1L);
        validToken.setToken("uuid-token-123");
        validToken.setUtilisateur(user);
        validToken.setExpiration(LocalDateTime.now().plusHours(1)); // Expire dans le futur
    }

    // --- 1. Tests createPasswordResetToken ---

    @Test
    void createPasswordResetToken_ShouldSaveToken_WhenEmailExists() {
        // ARRANGE
        when(utilisateurService.findUtilisateurByEmail("test@test.com")).thenReturn(Optional.of(user));

        // ACT
        passwordResetService.createPasswordResetToken("test@test.com");

        // ASSERT
        // On capture l'argument passé à save() pour vérifier ses propriétés
        ArgumentCaptor<PasswordResetToken> tokenCaptor = ArgumentCaptor.forClass(PasswordResetToken.class);
        verify(tokenRepo).save(tokenCaptor.capture());

        PasswordResetToken savedToken = tokenCaptor.getValue();
        assertThat(savedToken.getUtilisateur()).isEqualTo(user);
        assertThat(savedToken.getToken()).isNotNull(); // Vérifie qu'un UUID a été généré
        assertThat(savedToken.getExpiration()).isAfter(LocalDateTime.now());
    }

    @Test
    void createPasswordResetToken_ShouldThrowNotFound_WhenEmailUnknown() {
        // ARRANGE
        when(utilisateurService.findUtilisateurByEmail("unknown@test.com")).thenReturn(Optional.empty());

        // ACT & ASSERT
        assertThrows(NotFoundException.class, () ->
                passwordResetService.createPasswordResetToken("unknown@test.com")
        );

        // Vérifier qu'on n'a rien sauvegardé
        verify(tokenRepo, never()).save(any());
    }

    // --- 2. Tests resetPassword ---

    @Test
    void resetPassword_ShouldUpdatePassword_WhenTokenValid() {
        // ARRANGE
        String newToken = "newPassword123";
        String newEncoded = "encodedNewPassword";

        when(tokenRepo.findByToken("uuid-token-123")).thenReturn(Optional.of(validToken));
        when(passwordEncoder.encode(newToken)).thenReturn(newEncoded);

        // ACT
        passwordResetService.resetPassword("uuid-token-123", newToken);

        // ASSERT
        assertThat(user.getPassword()).isEqualTo(newEncoded); // Le mot de passe de l'objet user a changé
        verify(utilisateurService).save(user); // L'utilisateur a été sauvegardé
        verify(tokenRepo).delete(validToken); // Le token a été supprimé
    }

    @Test
    void resetPassword_ShouldThrowBadRequest_WhenTokenInvalid() {
        // Cas Token Null
        assertThrows(BadRequestException.class, () -> passwordResetService.resetPassword(null, "pass"));

        // Cas Token Inexistant en base
        when(tokenRepo.findByToken("fake-token")).thenReturn(Optional.empty());
        assertThrows(BadRequestException.class, () -> passwordResetService.resetPassword("fake-token", "pass123"));
    }

    @Test
    void resetPassword_ShouldThrowBadRequest_WhenPasswordInvalid() {
        // Cas Password Null
        assertThrows(BadRequestException.class, () -> passwordResetService.resetPassword("token", null));

        // Cas Password Trop court
        assertThrows(BadRequestException.class, () -> passwordResetService.resetPassword("token", "12345"));
    }

    @Test
    void resetPassword_ShouldThrowUnauthorized_WhenTokenExpired() {
        // ARRANGE
        PasswordResetToken expiredToken = new PasswordResetToken();
        expiredToken.setToken("expired-token");
        expiredToken.setExpiration(LocalDateTime.now().minusMinutes(1)); // Passé

        when(tokenRepo.findByToken("expired-token")).thenReturn(Optional.of(expiredToken));

        // ACT & ASSERT
        assertThrows(UnauthorizedException.class, () ->
                passwordResetService.resetPassword("expired-token", "newPass123")
        );

        verify(utilisateurService, never()).save(any());
    }

    // --- 3. Tests validateToken ---

    @Test
    void validateToken_ShouldReturnTrue_WhenValid() {
        when(tokenRepo.findByToken("valid")).thenReturn(Optional.of(validToken));

        boolean result = passwordResetService.validateToken("valid");

        assertThat(result).isTrue();
    }

    @Test
    void validateToken_ShouldReturnFalse_WhenExpired() {
        PasswordResetToken expiredToken = new PasswordResetToken();
        expiredToken.setExpiration(LocalDateTime.now().minusMinutes(1));

        when(tokenRepo.findByToken("expired")).thenReturn(Optional.of(expiredToken));

        boolean result = passwordResetService.validateToken("expired");

        assertThat(result).isFalse();
    }

    @Test
    void validateToken_ShouldReturnFalse_WhenNotFoundOrNull() {
        assertThat(passwordResetService.validateToken(null)).isFalse();

        when(tokenRepo.findByToken("unknown")).thenReturn(Optional.empty());
        assertThat(passwordResetService.validateToken("unknown")).isFalse();
    }

    // --- 4. Tests getEmailFromToken ---

    @Test
    void getEmailFromToken_ShouldReturnEmail() {
        when(tokenRepo.findByToken("token")).thenReturn(Optional.of(validToken));

        String email = passwordResetService.getEmailFromToken("token");

        assertThat(email).isEqualTo("test@test.com");
    }

    @Test
    void getEmailFromToken_ShouldThrowException_WhenNotFound() {
        when(tokenRepo.findByToken("token")).thenReturn(Optional.empty());

        assertThrows(BadRequestException.class, () -> passwordResetService.getEmailFromToken("token"));
    }
}