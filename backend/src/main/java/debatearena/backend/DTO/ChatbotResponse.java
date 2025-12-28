package debatearena.backend.DTO;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Réponse du chatbot à un message")
public class ChatbotResponse {

    @Schema(
            description = "Réponse textuelle du chatbot",
            example = "L'intelligence artificielle présente à la fois des opportunités et des défis pour notre société..."
    )
    private String response;

    @Schema(
            description = "Identifiant de la session de conversation",
            example = "session-123456789"
    )
    private String session_id;

    public ChatbotResponse() {
    }

    public ChatbotResponse(String response, String session_id) {
        this.response = response;
        this.session_id = session_id;
    }

    // Getters et Setters
    public String getResponse() { return response; }
    public void setResponse(String response) { this.response = response; }

    public String getSession_id() { return session_id; }
    public void setSession_id(String session_id) { this.session_id = session_id; }
}