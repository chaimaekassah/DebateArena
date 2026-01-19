package debatearena.backend.Service;

import debatearena.backend.DTO.AuthResponse;
import debatearena.backend.DTO.SignInRequest;
import debatearena.backend.DTO.SignUpRequest;
import debatearena.backend.DTO.SignUpResponse;
import debatearena.backend.Entity.Badge;
import debatearena.backend.Entity.Utilisateur;
import debatearena.backend.Entity.role_enum;
import debatearena.backend.Entity.categorie_badge_enum;
import debatearena.backend.Exceptions.BadRequestException;
import debatearena.backend.Exceptions.UnauthorizedException;
import debatearena.backend.Security.JwtUtil;
import debatearena.backend.Utils.ImageStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock private UtilisateurService utilisateurService;
    @Mock private PasswordEncoder passwordEncoder;
    @Mock private JwtUtil jwtUtil;
    @Mock private BadgeService badgeService;
    @Mock private ImageStorageService imageStorageService;

    @InjectMocks
    private AuthService authService;

    private SignUpRequest validSignUpRequest;
    private Utilisateur utilisateur;
    private Badge badgeDefault;

    @BeforeEach
    void setUp() {
        validSignUpRequest = new SignUpRequest();
        validSignUpRequest.setNom("Doe");
        validSignUpRequest.setPrenom("John");
        validSignUpRequest.setEmail("john@test.com");
        validSignUpRequest.setPassword("password123");

        badgeDefault = new Badge();
        badgeDefault.setNom("Nouveau");
        badgeDefault.setCategorie(categorie_badge_enum.BRONZE);

        utilisateur = new Utilisateur();
        utilisateur.setId(1L);
        utilisateur.setEmail("john@test.com");
        utilisateur.setPassword("encodedPassword");
        utilisateur.setRole(role_enum.UTILISATEUR);
        utilisateur.setBadge(badgeDefault);
        utilisateur.setImagePath("uploads/avatars/default.png");
    }

    // --- TESTS SIGNUP ---

    @Test
    void signup_ShouldRegisterUser_WhenDataIsValid_NoImage() {
        when(utilisateurService.existsByEmail(validSignUpRequest.getEmail())).thenReturn(false);
        when(passwordEncoder.encode(any())).thenReturn("encodedPassword");
        when(badgeService.getDefaultBadge()).thenReturn(badgeDefault);
        when(utilisateurService.save(any(Utilisateur.class))).thenReturn(utilisateur);

        SignUpResponse response = authService.signup(validSignUpRequest);

        assertThat(response.getEmail()).isEqualTo("john@test.com");
        assertThat(response.getImageUrl()).contains("default.png");
        verify(utilisateurService).save(any(Utilisateur.class));
    }

    @Test
    void signup_ShouldRegisterUser_WithImage() throws IOException {
        MockMultipartFile image = new MockMultipartFile("image", "avatar.jpg", "image/jpeg", "content".getBytes());
        validSignUpRequest.setImage(image);

        Utilisateur userWithImage = new Utilisateur();
        // --- CORRECTION : AJOUT DE L'ID ICI ---
        userWithImage.setId(1L);
        // --------------------------------------
        userWithImage.setImagePath("uploads/avatars/avatar.jpg");
        userWithImage.setBadge(badgeDefault);

        when(utilisateurService.existsByEmail(any())).thenReturn(false);
        when(badgeService.getDefaultBadge()).thenReturn(badgeDefault);
        when(imageStorageService.saveImage(any(MultipartFile.class))).thenReturn("uploads/avatars/avatar.jpg");
        when(utilisateurService.save(any(Utilisateur.class))).thenReturn(userWithImage);

        SignUpResponse response = authService.signup(validSignUpRequest);

        assertThat(response.getImageUrl()).isEqualTo("uploads/avatars/avatar.jpg");
        verify(imageStorageService).saveImage(any(MultipartFile.class));
    }

    @Test
    void signup_ShouldThrowException_WhenEmailExists() {
        when(utilisateurService.existsByEmail(validSignUpRequest.getEmail())).thenReturn(true);

        BadRequestException exception = assertThrows(BadRequestException.class, () -> {
            authService.signup(validSignUpRequest);
        });

        assertThat(exception.getMessage()).isEqualTo("Email déjà existant");
        verify(utilisateurService, never()).save(any());
    }

    @Test
    void signup_ShouldThrowException_WhenValidationFails() {
        validSignUpRequest.setNom("");
        assertThrows(BadRequestException.class, () -> authService.signup(validSignUpRequest));

        validSignUpRequest.setNom("Doe");
        validSignUpRequest.setEmail(null);
        assertThrows(BadRequestException.class, () -> authService.signup(validSignUpRequest));
    }

    // --- TESTS SIGNIN ---

    @Test
    void signin_ShouldReturnToken_WhenCredentialsAreCorrect() {
        SignInRequest loginRequest = new SignInRequest();
        loginRequest.setEmail("john@test.com");
        loginRequest.setPassword("password123");

        when(utilisateurService.findUtilisateurByEmail(loginRequest.getEmail())).thenReturn(Optional.of(utilisateur));
        when(passwordEncoder.matches(loginRequest.getPassword(), utilisateur.getPassword())).thenReturn(true);
        when(jwtUtil.generateToken(utilisateur.getEmail(), "UTILISATEUR")).thenReturn("fake-jwt-token");

        AuthResponse response = authService.signin(loginRequest);

        assertThat(response.getToken()).isEqualTo("fake-jwt-token");
        assertThat(response.getRole()).isEqualTo("UTILISATEUR");
    }

    @Test
    void signin_ShouldThrowException_WhenUserNotFound() {
        SignInRequest loginRequest = new SignInRequest();
        loginRequest.setEmail("unknown@test.com");
        loginRequest.setPassword("pass");

        when(utilisateurService.findUtilisateurByEmail(any())).thenReturn(Optional.empty());

        UnauthorizedException ex = assertThrows(UnauthorizedException.class, () -> authService.signin(loginRequest));
        assertThat(ex.getMessage()).isEqualTo("Email ou mot de passe incorrect");
    }

    @Test
    void signin_ShouldThrowException_WhenPasswordIsWrong() {
        SignInRequest loginRequest = new SignInRequest();
        loginRequest.setEmail("john@test.com");
        loginRequest.setPassword("wrongPassword");

        when(utilisateurService.findUtilisateurByEmail(loginRequest.getEmail())).thenReturn(Optional.of(utilisateur));
        when(passwordEncoder.matches("wrongPassword", utilisateur.getPassword())).thenReturn(false);

        UnauthorizedException ex = assertThrows(UnauthorizedException.class, () -> authService.signin(loginRequest));
        assertThat(ex.getMessage()).isEqualTo("Email ou mot de passe incorrect");
    }
}