package debatearena.backend.Service;

import debatearena.backend.Client.ChatbotClient;
import debatearena.backend.DTO.*;
import debatearena.backend.Entity.*;
import debatearena.backend.Exceptions.BadRequestException;
import debatearena.backend.Exceptions.NotFoundException;
import debatearena.backend.Exceptions.UnauthorizedException;
import debatearena.backend.Repository.DebatRepository;
import debatearena.backend.Repository.MessageRepository;
import debatearena.backend.Repository.SujetRepository;
import debatearena.backend.Repository.TestRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class DebatServiceTest {

    @Mock private DebatRepository debatRepository;
    @Mock private MessageRepository messageRepository;
    @Mock private TestRepository testRepository;
    @Mock private SujetRepository sujetRepository;
    @Mock private UtilisateurService utilisateurService;
    @Mock private ChatbotClient chatbotClient;

    @InjectMocks
    private DebatService debatService;

    private Utilisateur utilisateur;
    private Utilisateur chatbotUser;
    private Sujet sujet;
    private Debat debatEnCours;

    @BeforeEach
    void setUp() {
        // --- 1. Utilisateur Standard ---
        utilisateur = new Utilisateur();
        utilisateur.setId(1L);
        utilisateur.setEmail("user@test.com");
        utilisateur.setRole(role_enum.UTILISATEUR);
        utilisateur.setScore(100);

        // --- 2. Utilisateur Chatbot ---
        chatbotUser = new Utilisateur();
        chatbotUser.setId(999L);
        chatbotUser.setRole(role_enum.CHATBOT);
        chatbotUser.setNom("Chatbot");

        // --- 3. Sujet ---
        sujet = new Sujet();
        sujet.setId(10L);
        sujet.setTitre("Java vs Python");
        sujet.setDifficulte(niveau_enum.DEBUTANT);
        sujet.setCategorie(categorie_sujet_enum.INFORMATIQUE);

        // --- 4. Débat en cours ---
        debatEnCours = new Debat();
        debatEnCours.setId(100L);
        debatEnCours.setUtilisateur(utilisateur);
        debatEnCours.setSujet(sujet);
        debatEnCours.setChoixUtilisateur("POUR");
        debatEnCours.setDateDebut(LocalDateTime.now().minusMinutes(10));
        debatEnCours.setDuree(null); // Null = En cours
    }

    // ==========================================
    // TESTS : Créer Débat
    // ==========================================

    @Test
    void creerDebat_ShouldCreateDebat_WhenValidRequest() {
        // ARRANGE
        CreerDebatRequest request = new CreerDebatRequest(10L, "ENTRAINEMENT", "POUR");

        when(utilisateurService.getCurrentUser()).thenReturn(utilisateur);
        when(sujetRepository.findById(10L)).thenReturn(Optional.of(sujet));
        when(utilisateurService.peutAccederAuSujet(any(), any())).thenReturn(true);
        when(debatRepository.hasDebatEnCoursSurSujet(any(), any())).thenReturn(false);
        when(utilisateurService.getChatbotUser()).thenReturn(chatbotUser);

        // Simulation de la sauvegarde
        when(debatRepository.save(any(Debat.class))).thenAnswer(invocation -> {
            Debat d = invocation.getArgument(0);
            d.setId(100L); // On simule l'ID généré
            return d;
        });

        // ACT
        DebatResponse response = debatService.creerDebat(request);

        // ASSERT
        assertThat(response.getId()).isEqualTo(100L);
        assertThat(response.getStatus()).isEqualTo("EN_COURS");
        assertThat(response.getType()).isEqualTo("ENTRAINEMENT");

        // Vérifie qu'on a bien sauvegardé le débat et le premier message
        verify(debatRepository).save(any(Debat.class));
        verify(messageRepository).save(any(Message.class));
    }

    @Test
    void creerDebat_ShouldThrowUnauthorized_WhenLevelTooLow() {
        // ARRANGE
        CreerDebatRequest request = new CreerDebatRequest(10L, "ENTRAINEMENT", "POUR");

        when(utilisateurService.getCurrentUser()).thenReturn(utilisateur);
        when(sujetRepository.findById(10L)).thenReturn(Optional.of(sujet));
        // L'utilisateur n'a pas le niveau
        when(utilisateurService.peutAccederAuSujet(any(), any())).thenReturn(false);

        // ACT & ASSERT
        assertThrows(UnauthorizedException.class, () -> debatService.creerDebat(request));
        verify(debatRepository, never()).save(any());
    }

    @Test
    void creerDebat_ShouldThrowBadRequest_WhenDebatAlreadyExists() {
        // ARRANGE
        CreerDebatRequest request = new CreerDebatRequest(10L, "ENTRAINEMENT", "POUR");

        when(utilisateurService.getCurrentUser()).thenReturn(utilisateur);
        when(sujetRepository.findById(10L)).thenReturn(Optional.of(sujet));
        when(utilisateurService.peutAccederAuSujet(any(), any())).thenReturn(true);
        // Débat déjà en cours
        when(debatRepository.hasDebatEnCoursSurSujet(any(), any())).thenReturn(true);

        // ACT & ASSERT
        assertThrows(BadRequestException.class, () -> debatService.creerDebat(request));
    }

    // ==========================================
    // TESTS : Envoyer Message
    // ==========================================

    @Test
    void envoyerMessage_ShouldSaveUserAndChatbotMessages() {
        // ARRANGE
        MessageRequest request = new MessageRequest("Mon argument");

        // Mock du chatbot
        ChatbotResponse botResponse = new ChatbotResponse();
        botResponse.setResponse("Ma contre-attaque");
        botResponse.setSession_id("session-123");

        when(utilisateurService.getCurrentUser()).thenReturn(utilisateur);
        when(debatRepository.findByIdAndUtilisateur(100L, utilisateur)).thenReturn(Optional.of(debatEnCours));
        when(chatbotClient.isHealthy()).thenReturn(true);
        when(chatbotClient.sendMessage(anyString(), any())).thenReturn(botResponse);
        when(utilisateurService.getChatbotUser()).thenReturn(chatbotUser);

        // ACT
        MessageResponse response = debatService.envoyerMessage(100L, request);

        // ASSERT
        assertThat(response.getContenu()).isEqualTo("Ma contre-attaque");
        assertThat(response.getAuteur()).isEqualTo("CHATBOT");

        // Vérifie qu'on a sauvegardé 2 messages (1 user, 1 bot)
        verify(messageRepository, times(2)).save(any(Message.class));
    }

    @Test
    void envoyerMessage_ShouldReturnFallback_WhenChatbotDown() {
        // ARRANGE
        MessageRequest request = new MessageRequest("Mon argument");

        when(utilisateurService.getCurrentUser()).thenReturn(utilisateur);
        when(debatRepository.findByIdAndUtilisateur(100L, utilisateur)).thenReturn(Optional.of(debatEnCours));
        // Chatbot indisponible
        when(chatbotClient.isHealthy()).thenReturn(false);
        when(utilisateurService.getChatbotUser()).thenReturn(chatbotUser);

        // ACT
        MessageResponse response = debatService.envoyerMessage(100L, request);

        // ASSERT
        assertThat(response.getContenu()).contains("Je suis actuellement indisponible");
        verify(chatbotClient, never()).sendMessage(any(), any());
    }

    @Test
    void envoyerMessage_ShouldThrowException_WhenDebatFinished() {
        // ARRANGE
        debatEnCours.setDuree(500); // Débat terminé

        when(utilisateurService.getCurrentUser()).thenReturn(utilisateur);
        when(debatRepository.findByIdAndUtilisateur(100L, utilisateur)).thenReturn(Optional.of(debatEnCours));

        // ACT & ASSERT
        assertThrows(BadRequestException.class, () ->
                debatService.envoyerMessage(100L, new MessageRequest("Test"))
        );
    }

    // ==========================================
    // TESTS : Terminer Débat
    // ==========================================

    @Test
    void terminerDebat_ShouldCalculateDurationAndClose() {
        // ARRANGE
        when(utilisateurService.getCurrentUser()).thenReturn(utilisateur);
        when(debatRepository.findByIdAndUtilisateur(100L, utilisateur)).thenReturn(Optional.of(debatEnCours));
        when(testRepository.existsByDebat(debatEnCours)).thenReturn(false); // Entrainement

        // ACT
        DebatResponse response = debatService.terminerDebat(100L);

        // ASSERT
        assertThat(response.getStatus()).isEqualTo("TERMINE");
        assertThat(response.getDuree()).isNotNull();
        verify(debatRepository).save(debatEnCours);
    }

    @Test
    void terminerDebat_ShouldCreateEvaluationMessage_IfTest() {
        // ARRANGE
        when(utilisateurService.getCurrentUser()).thenReturn(utilisateur);
        when(debatRepository.findByIdAndUtilisateur(100L, utilisateur)).thenReturn(Optional.of(debatEnCours));
        when(testRepository.existsByDebat(debatEnCours)).thenReturn(true); // C'est un TEST
        when(utilisateurService.getChatbotUser()).thenReturn(chatbotUser);

        // ACT
        debatService.terminerDebat(100L);

        // ASSERT
        // Vérifie qu'un message système "Débat terminé..." est créé
        verify(messageRepository).save(any(Message.class));
    }

    // ==========================================
    // TESTS : Annuler Débat
    // ==========================================

    @Test
    void annulerDebat_ShouldDeleteEverything() {
        // ARRANGE
        when(utilisateurService.getCurrentUser()).thenReturn(utilisateur);
        when(debatRepository.findByIdAndUtilisateur(100L, utilisateur)).thenReturn(Optional.of(debatEnCours));

        // ACT
        debatService.annulerDebat(100L);

        // ASSERT
        verify(messageRepository).deleteByDebat(debatEnCours);
        verify(debatRepository).delete(debatEnCours);
    }

    @Test
    void annulerDebat_ShouldThrowException_IfAlreadyFinished() {
        // ARRANGE
        debatEnCours.setDuree(500); // Terminé
        when(utilisateurService.getCurrentUser()).thenReturn(utilisateur);
        when(debatRepository.findByIdAndUtilisateur(100L, utilisateur)).thenReturn(Optional.of(debatEnCours));

        // ACT & ASSERT
        assertThrows(BadRequestException.class, () -> debatService.annulerDebat(100L));
        verify(debatRepository, never()).delete(any());
    }
}