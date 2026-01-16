package debatearena.backend.Service;

import debatearena.backend.DTO.Dashboard;
import debatearena.backend.DTO.UpdateProfileRequest;
import debatearena.backend.DTO.UtilisateurProfile;
import debatearena.backend.Entity.Utilisateur;
import debatearena.backend.Entity.role_enum;
import debatearena.backend.Exceptions.UnauthorizedException;
import debatearena.backend.Repository.DebatRepository;
import debatearena.backend.Repository.TestRepository;
import debatearena.backend.Repository.UtilisateurRepository;
import debatearena.backend.Utils.ImageStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UtilisateurServiceTest {

    @Mock private UtilisateurRepository utilisateurRepository;
    @Mock private ImageStorageService imageStorageService;
    @Mock private DebatRepository debatRepository;
    @Mock private TestRepository testRepository;

    // Mocks pour la sécurité
    @Mock private SecurityContext securityContext;
    @Mock private Authentication authentication;

    @InjectMocks
    private UtilisateurService utilisateurService;

    private Utilisateur currentUser;

    @BeforeEach
    void setUp() {
        // --- 1. Simulation de l'utilisateur connecté ---
        currentUser = new Utilisateur();
        currentUser.setId(1L);
        currentUser.setEmail("test@test.com");
        currentUser.setNom("Doe");
        currentUser.setPrenom("John");
        currentUser.setRole(role_enum.UTILISATEUR);
        currentUser.setScore(0); // Débutant par défaut
        currentUser.setImagePath("default.png");

        // --- 2. Configuration du SecurityContextHolder ---
        // Cela permet à utilisateurService.getCurrentUser() de fonctionner
        lenient().when(securityContext.getAuthentication()).thenReturn(authentication);
        lenient().when(authentication.getName()).thenReturn("test@test.com");
        SecurityContextHolder.setContext(securityContext);
    }

    // ==========================================
    // TESTS : Logique de Niveaux & Accès
    // ==========================================

    @Test
    void calculerNiveau_ShouldReturnCorrectLevel() {
        currentUser.setScore(100);
        assertThat(utilisateurService.calculerNiveau(currentUser)).isEqualTo("DEBUTANT");

        currentUser.setScore(200);
        assertThat(utilisateurService.calculerNiveau(currentUser)).isEqualTo("INTERMEDIAIRE");

        currentUser.setScore(499);
        assertThat(utilisateurService.calculerNiveau(currentUser)).isEqualTo("INTERMEDIAIRE");

        currentUser.setScore(500);
        assertThat(utilisateurService.calculerNiveau(currentUser)).isEqualTo("AVANCE");

        currentUser.setScore(1000);
        assertThat(utilisateurService.calculerNiveau(currentUser)).isEqualTo("EXPERT");
    }

    @Test
    void peutAccederAuSujet_ShouldEnforceRules() {
        // Cas 1: Débutant (Score 100)
        currentUser.setScore(100);
        assertThat(utilisateurService.peutAccederAuSujet(currentUser, "DEBUTANT")).isTrue();
        assertThat(utilisateurService.peutAccederAuSujet(currentUser, "INTERMEDIAIRE")).isFalse();

        // Cas 2: Intermédiaire (Score 300)
        currentUser.setScore(300);
        assertThat(utilisateurService.peutAccederAuSujet(currentUser, "DEBUTANT")).isTrue();
        assertThat(utilisateurService.peutAccederAuSujet(currentUser, "INTERMEDIAIRE")).isTrue();
        assertThat(utilisateurService.peutAccederAuSujet(currentUser, "EXPERT")).isFalse();

        // Cas 3: Expert (Score 1500)
        currentUser.setScore(1500);
        assertThat(utilisateurService.peutAccederAuSujet(currentUser, "EXPERT")).isTrue();
    }

    // ==========================================
    // TESTS : Profil (Get & Update)
    // ==========================================

    @Test
    void getMyProfile_ShouldReturnDto() {
        when(utilisateurRepository.findByEmail("test@test.com")).thenReturn(Optional.of(currentUser));

        UtilisateurProfile profile = utilisateurService.getMyProfile();

        assertThat(profile.getEmail()).isEqualTo("test@test.com");
        assertThat(profile.getNom()).isEqualTo("Doe");
    }

    @Test
    void updateMyProfile_ShouldUpdateFieldsAndImage() throws IOException {
        // ARRANGE
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setNom("NewName");
        // Simulation d'un fichier image
        MockMultipartFile file = new MockMultipartFile("image", "test.jpg", "image/jpeg", "bytes".getBytes());
        request.setImage(file);

        when(utilisateurRepository.findByEmail("test@test.com")).thenReturn(Optional.of(currentUser));
        when(imageStorageService.saveImage(any(MultipartFile.class))).thenReturn("uploads/test.jpg");

        // ACT
        UtilisateurProfile result = utilisateurService.updateMyProfile(request);

        // ASSERT
        assertThat(result.getNom()).isEqualTo("NewName");
        assertThat(currentUser.getImagePath()).isEqualTo("uploads/test.jpg"); // Vérifie que l'entité a changé
        verify(utilisateurRepository).save(currentUser);
    }

    // ==========================================
    // TESTS : Dashboard (Le plus complexe)
    // ==========================================

    @Test
    void getDashboard_ShouldCalculateStatsAndProgression() {
        // ARRANGE
        // Utilisateur avec score 100 (Débutant) -> Progression 50% (car 100/200)
        currentUser.setScore(100);

        when(utilisateurRepository.findByEmail("test@test.com")).thenReturn(Optional.of(currentUser));

        // Mocks des statistiques Repository
        when(debatRepository.countByUtilisateurId(1L)).thenReturn(10); // 10 débats total
        when(testRepository.countDebatsGagnesByUserId(1L)).thenReturn(5); // 5 gagnés
        when(testRepository.getMoyenneNotesByUserId(1L)).thenReturn(12);
        when(testRepository.getMeilleureNoteByUserId(1L)).thenReturn(15);

        // Pour simplifier ce test, on renvoie une liste vide pour l'historique
        // (éviter de mocker toute la chaîne de mapping complexe ici)
        when(debatRepository.findRecentDebatsByUtilisateurId(1L)).thenReturn(Collections.emptyList());

        // ACT
        Dashboard dashboard = utilisateurService.getDashboard();

        // ASSERT
        // 1. Vérification Niveaux
        assertThat(dashboard.getNiveau()).isEqualTo("DEBUTANT");

        assertThat(dashboard.getProgressionPourcentage()).isEqualTo(50.0); // 100/200 = 50%
        assertThat(dashboard.getPointsPourNiveauSuivant()).isEqualTo(100); // 200 - 100 = 100

        // 2. Vérification Stats
        assertThat(dashboard.getTotalDebats()).isEqualTo(10);
        assertThat(dashboard.getDebatsGagnes()).isEqualTo(5);
        assertThat(dashboard.getTauxReussite()).isEqualTo(50.0); // (5/10)*100
        assertThat(dashboard.getMoyenneNotes()).isEqualTo(12);
        assertThat(dashboard.getMeilleureNote()).isEqualTo(15);
    }

    @Test
    void getDashboard_ShouldHandleZeroDebats() {
        // Test division par zéro pour le taux de réussite
        when(utilisateurRepository.findByEmail("test@test.com")).thenReturn(Optional.of(currentUser));

        when(debatRepository.countByUtilisateurId(1L)).thenReturn(0);
        when(testRepository.countDebatsGagnesByUserId(1L)).thenReturn(0);
        // Les repositories renvoient null si pas de données pour AVG/MAX
        when(testRepository.getMoyenneNotesByUserId(1L)).thenReturn(null);
        when(testRepository.getMeilleureNoteByUserId(1L)).thenReturn(null);
        when(debatRepository.findRecentDebatsByUtilisateurId(1L)).thenReturn(Collections.emptyList());

        Dashboard dashboard = utilisateurService.getDashboard();

        assertThat(dashboard.getTauxReussite()).isEqualTo(0.0);
        assertThat(dashboard.getMoyenneNotes()).isEqualTo(0); // Doit gérer le null
    }

    // ==========================================
    // TESTS : Gestion des erreurs
    // ==========================================

    @Test
    void getCurrentUser_ShouldThrowException_WhenUserNotFound() {
        when(utilisateurRepository.findByEmail("test@test.com")).thenReturn(Optional.empty());

        assertThrows(UnauthorizedException.class, () -> utilisateurService.getCurrentUser());
    }
}