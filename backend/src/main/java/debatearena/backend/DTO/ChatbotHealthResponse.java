package debatearena.backend.DTO;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Réponse d'état de santé du chatbot")
public class ChatbotHealthResponse {

    @Schema(
            description = "Statut du service chatbot",
            example = "UP",
            allowableValues = {"UP", "DOWN", "UNKNOWN"}
    )
    private String status;

    @Schema(
            description = "Nom du service chatbot",
            example = "DebateArena Chatbot Service"
    )
    private String service;

    @Schema(
            description = "Détails supplémentaires sur l'état",
            example = "Service opérationnel, prêt à recevoir des requêtes"
    )
    private String details;

    public ChatbotHealthResponse() {
    }

    public ChatbotHealthResponse(String status, String service) {
        this.status = status;
        this.service = service;
    }

    public ChatbotHealthResponse(String status, String service, String details) {
        this.status = status;
        this.service = service;
        this.details = details;
    }

    // Getters et Setters
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getService() { return service; }
    public void setService(String service) { this.service = service; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
}