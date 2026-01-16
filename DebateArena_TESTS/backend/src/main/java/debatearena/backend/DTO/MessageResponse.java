package debatearena.backend.DTO;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Réponse d'un message dans un débat")
public class MessageResponse {

    @Schema(description = "ID du message", example = "456")
    private Long id;

    @Schema(
            description = "Contenu du message",
            example = "L'intelligence artificielle présente à la fois des opportunités et des défis."
    )
    private String contenu;

    @Schema(
            description = "Auteur du message",
            example = "CHATBOT",
            allowableValues = {"UTILISATEUR", "CHATBOT"}
    )
    private String auteur;

    @Schema(description = "Date et heure d'envoi", example = "2024-01-15T14:30:15")
    private LocalDateTime timestamp;

    public MessageResponse() {
    }

    public MessageResponse(Long id, String contenu, String auteur, LocalDateTime timestamp) {
        this.id = id;
        this.contenu = contenu;
        this.auteur = auteur;
        this.timestamp = timestamp;
    }

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getContenu() { return contenu; }
    public void setContenu(String contenu) { this.contenu = contenu; }

    public String getAuteur() { return auteur; }
    public void setAuteur(String auteur) { this.auteur = auteur; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
}