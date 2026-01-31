package debatearena.backend.Client;

import debatearena.backend.DTO.ChatbotHealthResponse;
import debatearena.backend.DTO.ChatbotRequest;
import debatearena.backend.DTO.ChatbotResponse;
import debatearena.backend.Exceptions.ChatbotServiceException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.boot.web.client.RestTemplateBuilder;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ChatbotClientTest {

    @Mock
    private RestTemplateBuilder restTemplateBuilder;

    @Mock
    private RestTemplate restTemplate;

    private ChatbotClient chatbotClient;
    private final String BASE_URL = "http://localhost:5005";

    @BeforeEach
    void setUp() {
        // Configuration du Mock du Builder
        // Le constructeur de ChatbotClient chaîne les méthodes (.setTimeout...),
        // il faut donc que le mock se retourne lui-même.
        when(restTemplateBuilder.setConnectTimeout(any(Duration.class))).thenReturn(restTemplateBuilder);
        when(restTemplateBuilder.setReadTimeout(any(Duration.class))).thenReturn(restTemplateBuilder);
        when(restTemplateBuilder.build()).thenReturn(restTemplate);

        // Initialisation manuelle du client avec les mocks
        chatbotClient = new ChatbotClient(restTemplateBuilder, BASE_URL);
    }

    // ==========================================
    // TESTS : isHealthy
    // ==========================================

    @Test
    void isHealthy_ShouldReturnTrue_WhenStatusIsHealthy() {
        // ARRANGE
        ChatbotHealthResponse healthResponse = new ChatbotHealthResponse();
        healthResponse.setStatus("healthy");

        when(restTemplate.getForEntity(eq(BASE_URL + "/health"), eq(ChatbotHealthResponse.class)))
                .thenReturn(ResponseEntity.ok(healthResponse));

        // ACT
        boolean result = chatbotClient.isHealthy();

        // ASSERT
        assertThat(result).isTrue();
    }

    @Test
    void isHealthy_ShouldReturnFalse_WhenStatusIsUnhealthy() {
        // ARRANGE
        ChatbotHealthResponse healthResponse = new ChatbotHealthResponse();
        healthResponse.setStatus("training"); // Pas "healthy"

        when(restTemplate.getForEntity(eq(BASE_URL + "/health"), eq(ChatbotHealthResponse.class)))
                .thenReturn(ResponseEntity.ok(healthResponse));

        // ACT
        boolean result = chatbotClient.isHealthy();

        // ASSERT
        assertThat(result).isFalse();
    }

    @Test
    void isHealthy_ShouldReturnFalse_WhenExceptionOccurs() {
        // ARRANGE - Simulation d'une erreur réseau (ex: serveur éteint)
        when(restTemplate.getForEntity(anyString(), eq(ChatbotHealthResponse.class)))
                .thenThrow(new RestClientException("Connection refused"));

        // ACT
        boolean result = chatbotClient.isHealthy();

        // ASSERT
        assertThat(result).isFalse();
    }

    // ==========================================
    // TESTS : sendMessage
    // ==========================================

    @Test
    void sendMessage_ShouldReturnResponse_WhenSuccess() {
        // ARRANGE
        String message = "Bonjour";
        String sessionId = "12345";

        ChatbotResponse mockResponse = new ChatbotResponse();
        mockResponse.setResponse("Bonjour humain !");
        mockResponse.setSession_id(sessionId);

        // On configure le RestTemplate pour renvoyer une réponse valide
        when(restTemplate.postForEntity(
                eq(BASE_URL + "/chat"),
                any(HttpEntity.class),
                eq(ChatbotResponse.class)
        )).thenReturn(ResponseEntity.ok(mockResponse));

        // ACT
        ChatbotResponse result = chatbotClient.sendMessage(message, sessionId, anyString());

        // ASSERT
        assertThat(result.getResponse()).isEqualTo("Bonjour humain !");

        // Vérification que l'URL et le Body envoyés étaient corrects
        ArgumentCaptor<HttpEntity<ChatbotRequest>> entityCaptor = ArgumentCaptor.forClass(HttpEntity.class);
        verify(restTemplate).postForEntity(anyString(), entityCaptor.capture(), any());

        ChatbotRequest capturedRequest = entityCaptor.getValue().getBody();
        assertThat(capturedRequest.getMessage()).isEqualTo(message);
        assertThat(capturedRequest.getSession_id()).isEqualTo(sessionId);
    }

    @Test
    void sendMessage_ShouldThrowException_WhenApiFails() {
        // ARRANGE
        when(restTemplate.postForEntity(anyString(), any(), any()))
                .thenThrow(new RestClientException("Timeout"));

        // ACT & ASSERT
        ChatbotServiceException ex = assertThrows(ChatbotServiceException.class, () ->
                chatbotClient.sendMessage("Hello", "session", "train")
        );

        assertThat(ex.getMessage()).contains("Erreur lors de l'appel au chatbot");
    }

    @Test
    void sendMessage_ShouldThrowException_WhenResponseBodyIsNull() {
        // ARRANGE
        when(restTemplate.postForEntity(anyString(), any(), any()))
                .thenReturn(ResponseEntity.ok(null)); // Body null

        // ACT & ASSERT
        ChatbotServiceException ex = assertThrows(ChatbotServiceException.class, () ->
                chatbotClient.sendMessage("Hello", "session", "train")
        );

        // CORRECTION ICI : on utilise .contains() au lieu de .isEqualTo()
        // car votre code ajoute le préfixe "Erreur lors de l'appel au chatbot: "
        assertThat(ex.getMessage()).contains("Réponse vide du chatbot");
    }

    // ==========================================
    // TESTS : clearSession
    // ==========================================

    @Test
    void clearSession_ShouldCallDelete() {
        // ACT
        chatbotClient.clearSession("session-123");

        // ASSERT
        verify(restTemplate).delete(BASE_URL + "/chat/session-123");
    }

    @Test
    void clearSession_ShouldSwallowExceptions() {
        // ARRANGE
        doThrow(new RestClientException("Error")).when(restTemplate).delete(anyString());

        // ACT & ASSERT
        // Vérifie simplement que ça ne plante pas le programme
        assertDoesNotThrow(() -> chatbotClient.clearSession("session-123"));
    }
}
