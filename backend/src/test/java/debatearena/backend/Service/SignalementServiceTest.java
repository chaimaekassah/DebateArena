package debatearena.backend.Service;

import debatearena.backend.DTO.CreateSignalementRequest;
import debatearena.backend.DTO.SignalementResponse;
import debatearena.backend.Entity.*;
import debatearena.backend.Exceptions.BadRequestException;
import debatearena.backend.Exceptions.NotFoundException;
import debatearena.backend.Repository.DebatRepository;
import debatearena.backend.Repository.SignalementRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SignalementServiceTest {

    @Mock
    private SignalementRepository signalementRepository;

    @Mock
    private DebatRepository debatRepository;

    @Mock
    private UtilisateurService utilisateurService;

    @InjectMocks
    private SignalementService signalementService;

    private Utilisateur currentUser;

    @BeforeEach
    void setUp() {
        // Configuration d'un utilisateur standard connecté pour les tests
        currentUser = new Utilisateur();
        currentUser.setId(1L);
        currentUser.setNom("Dupont");
        currentUser.setPrenom("Jean");
        currentUser.setEmail("jean@test.com");
    }

    // =================================================================
    // TESTS : CRÉATION DE SIGNALEMENT
    // =================================================================

    @Test
    void creerSignalement_ShouldSucceed_WhenDataIsValid() {
        // GIVEN
        CreateSignalementRequest request = new CreateSignalementRequest();
        request.setTitre("Problème technique");
        request.setDescription("La page ne charge pas");
        request.setTypeProbleme("BUG_TECHNIQUE"); // Doit correspondre à TypeProblemeEnum
        // On suppose que la méthode isValid() du DTO renvoie true si les champs sont remplis (mock implicite ou objet réel)

        when(utilisateurService.getCurrentUser()).thenReturn(currentUser);

        // Simulation de l'objet sauvegardé renvoyé par le repository
        Signalement savedSignalement = new Signalement();
        savedSignalement.setId(10L);
        savedSignalement.setTitre(request.getTitre());
        savedSignalement.setDescription(request.getDescription());
        savedSignalement.setTypeProbleme(TypeProblemeEnum.BUG_TECHNIQUE);
        savedSignalement.setStatut(StatutSignalementEnum.EN_ATTENTE);
        savedSignalement.setUtilisateur(currentUser);
        savedSignalement.setDateCreation(LocalDateTime.now());

        when(signalementRepository.save(any(Signalement.class))).thenReturn(savedSignalement);

        // WHEN
        SignalementResponse response = signalementService.creerSignalement(request);

        // THEN
        assertNotNull(response);
        assertEquals("Problème technique", response.getTitre());
        assertEquals("BUG_TECHNIQUE", response.getTypeProbleme());
        assertEquals("EN_ATTENTE", response.getStatut());
        verify(signalementRepository).save(any(Signalement.class));
    }

    @Test
    void creerSignalement_ShouldThrowException_WhenTypeProblemeIsInvalid() {
        // GIVEN
        CreateSignalementRequest request = new CreateSignalementRequest();
        request.setTitre("Titre");
        request.setDescription("Desc");
        request.setTypeProbleme("TYPE_INEXISTANT_XYZ"); // Erreur volontaire

        when(utilisateurService.getCurrentUser()).thenReturn(currentUser);

        // WHEN & THEN
        assertThrows(BadRequestException.class, () -> {
            signalementService.creerSignalement(request);
        });
        // Vérifie qu'on n'a rien sauvegardé
        verify(signalementRepository, never()).save(any());
    }

    @Test
    void creerSignalement_ShouldLinkDebat_WhenDebatIdIsProvided() {
        // GIVEN
        CreateSignalementRequest request = new CreateSignalementRequest();
        request.setTitre("Insulte");
        request.setDescription("...");
        request.setTypeProbleme("CONTENU_INAPPROPRIE");
        request.setDebatId(50L); // ID du débat

        Debat debatMock = new Debat();
        debatMock.setId(50L);
        Sujet sujetMock = new Sujet();
        sujetMock.setTitre("Sujet Test");
        debatMock.setSujet(sujetMock);

        when(utilisateurService.getCurrentUser()).thenReturn(currentUser);
        // Le service appelle findByIdAndUtilisateur, on doit mocker exactement cette méthode
        when(debatRepository.findByIdAndUtilisateur(50L, currentUser)).thenReturn(Optional.of(debatMock));

        Signalement savedSignalement = new Signalement();
        savedSignalement.setId(1L);
        savedSignalement.setUtilisateur(currentUser);
        savedSignalement.setTypeProbleme(TypeProblemeEnum.CONTENU_INAPPROPRIE);
        savedSignalement.setStatut(StatutSignalementEnum.EN_ATTENTE);
        savedSignalement.setDebat(debatMock); // Le débat est lié

        when(signalementRepository.save(any(Signalement.class))).thenReturn(savedSignalement);

        // WHEN
        SignalementResponse response = signalementService.creerSignalement(request);

        // THEN
        assertEquals(50L, response.getDebatId());

        // --- CORRECTION ICI ---
        // Avant : assertEquals("Sujet Test", response.getSujetTitre());
        assertEquals("Sujet Test", response.getDebatSujetTitre());
    }

    @Test
    void creerSignalement_ShouldThrowNotFound_WhenDebatIdIsProvidedButNotFound() {
        // GIVEN
        CreateSignalementRequest request = new CreateSignalementRequest();
        request.setTitre("Titre");
        request.setDescription("Desc");
        request.setTypeProbleme("BUG_TECHNIQUE");
        request.setDebatId(999L); // ID inexistant

        when(utilisateurService.getCurrentUser()).thenReturn(currentUser);
        when(debatRepository.findByIdAndUtilisateur(999L, currentUser)).thenReturn(Optional.empty());

        // WHEN & THEN
        assertThrows(NotFoundException.class, () -> {
            signalementService.creerSignalement(request);
        });
    }

    // =================================================================
    // TESTS : RECUPERATION (MES SIGNALEMENTS)
    // =================================================================

    @Test
    void getMesSignalements_ShouldReturnList_WhenUserHasReports() {
        // GIVEN
        when(utilisateurService.getCurrentUser()).thenReturn(currentUser);

        Signalement s1 = new Signalement();
        s1.setId(1L);
        s1.setUtilisateur(currentUser);
        s1.setTypeProbleme(TypeProblemeEnum.BUG_TECHNIQUE);
        s1.setStatut(StatutSignalementEnum.EN_ATTENTE);

        when(signalementRepository.findByUtilisateurIdOrderByDateCreationDesc(currentUser.getId()))
                .thenReturn(List.of(s1));

        // WHEN
        List<SignalementResponse> result = signalementService.getMesSignalements();

        // THEN
        assertFalse(result.isEmpty());
        assertEquals(1, result.size());
        assertEquals(1L, result.get(0).getId());
    }

    @Test
    void getMesSignalements_ShouldReturnEmptyList_WhenNoReports() {
        // GIVEN
        when(utilisateurService.getCurrentUser()).thenReturn(currentUser);
        when(signalementRepository.findByUtilisateurIdOrderByDateCreationDesc(currentUser.getId()))
                .thenReturn(Collections.emptyList());

        // WHEN
        List<SignalementResponse> result = signalementService.getMesSignalements();

        // THEN
        assertTrue(result.isEmpty());
    }

    // =================================================================
    // TESTS : DETAIL SIGNALEMENT
    // =================================================================

    @Test
    void getSignalement_ShouldReturnDetail_WhenUserIsOwner() {
        // GIVEN
        Long signalementId = 1L;
        when(utilisateurService.getCurrentUser()).thenReturn(currentUser);

        Signalement signalement = new Signalement();
        signalement.setId(signalementId);
        signalement.setUtilisateur(currentUser); // Le propriétaire est bien l'utilisateur courant
        signalement.setTypeProbleme(TypeProblemeEnum.AUTRE);
        signalement.setStatut(StatutSignalementEnum.EN_ATTENTE);

        when(signalementRepository.findById(signalementId)).thenReturn(Optional.of(signalement));

        // WHEN
        SignalementResponse response = signalementService.getSignalement(signalementId);

        // THEN
        assertNotNull(response);
        assertEquals(signalementId, response.getId());
    }

    @Test
    void getSignalement_ShouldThrowNotFound_WhenIdDoesNotExits() {
        // GIVEN
        when(utilisateurService.getCurrentUser()).thenReturn(currentUser);
        when(signalementRepository.findById(99L)).thenReturn(Optional.empty());

        // WHEN & THEN
        assertThrows(NotFoundException.class, () -> {
            signalementService.getSignalement(99L);
        });
    }

    @Test
    void getSignalement_ShouldThrowBadRequest_WhenUserIsNotOwner() {
        // GIVEN
        Long signalementId = 1L;
        when(utilisateurService.getCurrentUser()).thenReturn(currentUser); // ID = 1

        Utilisateur autreUtilisateur = new Utilisateur();
        autreUtilisateur.setId(2L); // ID différent

        Signalement signalement = new Signalement();
        signalement.setId(signalementId);
        signalement.setUtilisateur(autreUtilisateur); // Appartient à quelqu'un d'autre

        when(signalementRepository.findById(signalementId)).thenReturn(Optional.of(signalement));

        // WHEN & THEN
        assertThrows(BadRequestException.class, () -> {
            signalementService.getSignalement(signalementId);
        });
    }
}