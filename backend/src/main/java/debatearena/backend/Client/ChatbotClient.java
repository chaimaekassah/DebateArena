package debatearena.backend.Client;

import debatearena.backend.DTO.ChatbotRequest;
import debatearena.backend.DTO.ChatbotResponse;
import debatearena.backend.DTO.ChatbotHealthResponse;
import debatearena.backend.Exceptions.ChatbotServiceException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;
import org.springframework.boot.web.client.RestTemplateBuilder;
import java.time.Duration;

@Component
public class ChatbotClient {

    private final RestTemplate restTemplate;
    private final String baseUrl;

    public ChatbotClient(RestTemplateBuilder restTemplateBuilder,
                         @Value("${app.chatbot.base-url:http://chatbot:5005}") String baseUrl) {
        this.baseUrl = baseUrl;
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofSeconds(5))
                .setReadTimeout(Duration.ofSeconds(30))
                .build();
    }

    public boolean isHealthy() {
        try {
            String url = baseUrl + "/health";
            ResponseEntity<ChatbotHealthResponse> response = restTemplate.getForEntity(
                    url,
                    ChatbotHealthResponse.class
            );

            if (response.getBody() != null) {
                return "healthy".equals(response.getBody().getStatus());
            }
            return false;

        } catch (Exception e) {
            return false;
        }
    }

    public ChatbotResponse sendMessage(String message, String sessionId) {
        try {
            String url = baseUrl + "/chat";

            ChatbotRequest request = new ChatbotRequest();
            request.setMessage(message);
            request.setSession_id(sessionId);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<ChatbotRequest> entity = new HttpEntity<>(request, headers);

            ResponseEntity<ChatbotResponse> response = restTemplate.postForEntity(
                    url,
                    entity,
                    ChatbotResponse.class
            );

            if (response.getBody() == null) {
                throw new ChatbotServiceException("Réponse vide du chatbot");
            }

            return response.getBody();

        } catch (Exception e) {
            throw new ChatbotServiceException("Erreur lors de l'appel au chatbot: " + e.getMessage());
        }
    }

    public void clearSession(String sessionId) {
        try {
            String url = baseUrl + "/chat/" + sessionId;
            restTemplate.delete(url);
        } catch (Exception e) {
            // Ignorer les erreurs de nettoyage
        }
    }
}