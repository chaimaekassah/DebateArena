package debatearena.backend.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Requête pour envoyer un message dans un débat")
public class MessageRequest {

    @Schema(
            description = "Contenu du message",
            example = "Je pense que l'IA présente des opportunités importantes pour la médecine.",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotBlank(message = "Le contenu du message ne peut pas être vide")
    private String contenu;

    public MessageRequest() {
    }

    public MessageRequest(String contenu) {
        this.contenu = contenu;
    }

    // Getters et Setters
    public String getContenu() { return contenu; }
    public void setContenu(String contenu) { this.contenu = contenu; }
}