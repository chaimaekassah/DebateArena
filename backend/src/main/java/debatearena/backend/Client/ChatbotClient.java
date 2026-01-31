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
import java.util.HashMap;
import java.util.Map;

@Component
public class ChatbotClient {
    private final RestTemplate restTemplate;
    private final String baseUrl;

    public ChatbotClient(RestTemplateBuilder restTemplateBuilder,
                         @Value("${app.chatbot.base-url:http://chatbot:8000}") String baseUrl) {
        this.baseUrl = baseUrl;
        this.restTemplate = restTemplateBuilder
                .setConnectTimeout(Duration.ofSeconds(5))
                .setReadTimeout(Duration.ofSeconds(30))
                .build();
    }

    public boolean isHealthy() {
        try {
            String url = baseUrl + "/";
            ResponseEntity<String> response = restTemplate.getForEntity(url, String.class);
            return response.getStatusCode().is2xxSuccessful();
        } catch (Exception e) {
            return false;
        }
    }

    public ChatbotResponse sendMessage(String message, String sessionId, String mode) {
        try {
            String url = baseUrl + "/chat";

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("message", message);
            requestBody.put("mode", mode); // Ajout du mode
            if (sessionId != null) {
                requestBody.put("session_id", sessionId);
            }

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<Map> response = restTemplate.postForEntity(url, entity, Map.class);

            if (response.getBody() == null) {
                throw new ChatbotServiceException("Réponse vide du chatbot");
            }

            Map<String, Object> responseBody = response.getBody();
            ChatbotResponse chatbotResponse = new ChatbotResponse();
            chatbotResponse.setResponse((String) responseBody.get("text")); // Note: "text" pas "response"
            chatbotResponse.setSession_id((String) responseBody.get("session_id"));

            return chatbotResponse;

        } catch (Exception e) {
            throw new ChatbotServiceException("Erreur lors de l'appel au chatbot: " + e.getMessage());
        }
    }

    public void clearSession(String sessionId) {
        try {
            String url = baseUrl + "/session/" + sessionId;
            restTemplate.delete(url);
        } catch (Exception e) {
            // Ignorer les erreurs de nettoyage
            System.err.println("Erreur lors du nettoyage de session: " + e.getMessage());
        }
    }
}