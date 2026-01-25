package debatearena.backend.Service;

import debatearena.backend.DTO.*;
import debatearena.backend.Entity.*;
import debatearena.backend.Exceptions.BadRequestException;
import debatearena.backend.Exceptions.UnauthorizedException;
import debatearena.backend.Repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceTest {

    // On mocke (simule) tous les repositories et services externes
    @Mock private UtilisateurRepository utilisateurRepository;
    @Mock private DebatRepository debatRepository;
    @Mock private MessageRepository messageRepository;
    @Mock private TestRepository testRepository;
    @Mock private SujetRepository sujetRepository;
    @Mock private SignalementRepository signalementRepository;
    @Mock private UtilisateurService utilisateurService;

    // On injecte ces mocks dans le service à tester
    @InjectMocks
    private AdminService adminService;

    private Utilisateur adminUser;
    private Utilisateur simpleUser;

    @BeforeEach
    void setUp() {
        // Configuration d'un utilisateur ADMIN pour les tests réussis
        adminUser = new Utilisateur();
        adminUser.setId(1L);
        adminUser.setNom("Admin");
        adminUser.setRole(role_enum.ADMIN);

        // Configuration d'un utilisateur LAMBDA pour les tests d'échec
        simpleUser = new Utilisateur();
        simpleUser.setId(2L);
        simpleUser.setNom("User");
        simpleUser.setRole(role_enum.UTILISATEUR); // Assurez-vous que cet enum existe
    }

    // =================================================================
    // TESTS : SÉCURITÉ ET ACCÈS
    // =================================================================

    @Test
    void getDashboardStats_ShouldThrowException_WhenUserIsNotAdmin() {
        // GIVEN
        when(utilisateurService.getCurrentUser()).thenReturn(simpleUser);

        // WHEN & THEN
        assertThrows(UnauthorizedException.class, () -> {
            adminService.getDashboardStats();
        });
    }

    // =================================================================
    // TESTS : DASHBOARD (Lecture seule)
    // =================================================================

    @Test
    void getDashboardStats_ShouldReturnData_WhenUserIsAdmin() {
        // GIVEN
        when(utilisateurService.getCurrentUser()).thenReturn(adminUser);

        // Mock des retours des repositories
        when(utilisateurRepository.countTotalUtilisateurs()).thenReturn(100);
        when(debatRepository.count()).thenReturn(50L);
        when(signalementRepository.countByStatut(any())).thenReturn(5);
        // ... on pourrait mocker le reste, mais ceci suffit pour vérifier que la méthode s'exécute

        // WHEN
        DashboardAdminResponse response = adminService.getDashboardStats();

        // THEN
        assertNotNull(response);
        assertEquals(100, response.getTotalUtilisateurs());
        assertEquals(50, response.getTotalDebats());
    }

    // =================================================================
    // TESTS : GESTION DES SUJETS
    // =================================================================

    @Test
    void creerSujet_ShouldSaveSujet_WhenDataIsValid() {
        // GIVEN
        when(utilisateurService.getCurrentUser()).thenReturn(adminUser);

        // --- CORRECTION ICI : On récupère une valeur réelle de l'Enum ---
        // Remplacez 'SCIENCES' par une valeur qui existe vraiment dans votre fichier categorie_sujet_enum
        String categorieValide = categorie_sujet_enum.values()[0].name();
        // Remplacez 'MOYEN' par une valeur qui existe vraiment dans votre fichier niveau_enum
        String difficulteValide = niveau_enum.values()[0].name();

        CreateSujetRequest request = new CreateSujetRequest();
        request.setTitre("Nouveau Sujet");
        request.setCategorie(categorieValide);
        request.setDifficulte(difficulteValide);

        // On prépare l'objet que le repository est censé renvoyer
        Sujet sujetSauvegarde = new Sujet();
        sujetSauvegarde.setId(10L);
        sujetSauvegarde.setTitre("Nouveau Sujet");
        sujetSauvegarde.setCategorie(categorie_sujet_enum.valueOf(categorieValide));
        sujetSauvegarde.setDifficulte(niveau_enum.valueOf(difficulteValide));

        when(sujetRepository.save(any(Sujet.class))).thenReturn(sujetSauvegarde);

        // WHEN
        SujetResponse response = adminService.creerSujet(request);

        // THEN
        assertNotNull(response);
        assertEquals("Nouveau Sujet", response.getTitre());
        // Vérification que le save a bien été appelé
        verify(sujetRepository).save(any(Sujet.class));
    }

    @Test
    void deleteSujet_ShouldThrowException_WhenDebatsExist() {
        // GIVEN
        when(utilisateurService.getCurrentUser()).thenReturn(adminUser);
        Long sujetId = 1L;

        Sujet sujet = new Sujet();
        sujet.setId(sujetId);

        when(sujetRepository.findById(sujetId)).thenReturn(Optional.of(sujet));

        // Simulation : Il y a des débats liés (idSujet=1, count=5)
        List<Object[]> statsDebats = new ArrayList<>();
        statsDebats.add(new Object[]{1L, 5L});
        when(debatRepository.countDebatsBySujet()).thenReturn(statsDebats);

        // WHEN & THEN
        assertThrows(BadRequestException.class, () -> {
            adminService.deleteSujet(sujetId);
        });

        // Vérifier qu'on n'a JAMAIS appelé delete
        verify(sujetRepository, never()).delete(any());
    }

    // =================================================================
    // TESTS : TRAITEMENT DES SIGNALEMENTS (Focus sur votre problème)
    // =================================================================

    @Test
    void traiterSignalement_ShouldUpdateStatusAndResolutionDate_WhenResolved() {
        // GIVEN
        when(utilisateurService.getCurrentUser()).thenReturn(adminUser);
        Long signalementId = 5L;

        // Requête envoyée par le front (ex: validation)
        TraiterSignalementRequest request = new TraiterSignalementRequest();
        request.setStatut("RESOLU"); // Doit correspondre à StatutSignalementEnum.RESOLU
        request.setCommentaireAdmin("Fait.");

        // Signalement existant en base
        Signalement signalementExistant = new Signalement();
        signalementExistant.setId(signalementId);
        signalementExistant.setStatut(StatutSignalementEnum.EN_ATTENTE);
        signalementExistant.setTypeProbleme(TypeProblemeEnum.CONTENU_INAPPROPRIE);

        // Mock des relations pour éviter les NullPointer lors de la conversion DTO
        Utilisateur auteur = new Utilisateur();
        auteur.setId(99L); auteur.setNom("Jean"); auteur.setPrenom("Bon");
        signalementExistant.setUtilisateur(auteur);

        when(signalementRepository.findById(signalementId)).thenReturn(Optional.of(signalementExistant));

        // Mock du save pour retourner l'objet modifié
        when(signalementRepository.save(any(Signalement.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // WHEN
        SignalementResponse response = adminService.traiterSignalement(signalementId, request);

        // THEN
        assertEquals("RESOLU", response.getStatut());
        assertEquals("Fait.", response.getCommentaireAdmin());
        assertNotNull(response.getDateResolution(), "La date de résolution doit être définie automatiquement");

        // Vérifier que l'admin qui a traité est bien enregistré
        verify(signalementRepository).save(argThat(s ->
                s.getAdminTraitement().equals(adminUser) &&
                        s.getStatut() == StatutSignalementEnum.RESOLU
        ));
    }

    @Test
    void traiterSignalement_ShouldThrowException_WhenStatusIsInvalid() {
        // GIVEN
        when(utilisateurService.getCurrentUser()).thenReturn(adminUser);

        TraiterSignalementRequest request = new TraiterSignalementRequest();
        request.setStatut("STATUS_INEXISTANT_XYZ"); // Erreur volontaire
        request.setCommentaireAdmin("Test");

        when(signalementRepository.findById(1L)).thenReturn(Optional.of(new Signalement()));

        // WHEN & THEN
        assertThrows(BadRequestException.class, () -> {
            adminService.traiterSignalement(1L, request);
        });
    }
}