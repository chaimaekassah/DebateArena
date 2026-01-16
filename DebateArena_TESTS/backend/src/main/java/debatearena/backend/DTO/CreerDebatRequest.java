package debatearena.backend.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(description = "Requête pour créer un nouveau débat")
public class CreerDebatRequest {

    @Schema(
            description = "ID du sujet de débat",
            example = "1",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotNull(message = "L'ID du sujet est requis")
    private Long sujetId;

    @Schema(
            description = "Type de débat",
            example = "ENTRAINEMENT",
            allowableValues = {"ENTRAINEMENT", "TEST"},
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotNull(message = "Le type est requis")
    private String type;

    @Schema(
            description = "Choix de position de l'utilisateur",
            example = "POUR",
            allowableValues = {"POUR", "CONTRE"},
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotNull(message = "Le choix est requis")
    private String choix;

    public CreerDebatRequest() {
    }

    public CreerDebatRequest(Long sujetId, String type, String choix) {
        this.sujetId = sujetId;
        this.type = type;
        this.choix = choix;
    }

    // Getters et Setters
    public Long getSujetId() { return sujetId; }
    public void setSujetId(Long sujetId) { this.sujetId = sujetId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getChoix() { return choix; }
    public void setChoix(String choix) { this.choix = choix; }

    // Ajoutez cette méthode
    @Schema(hidden = true)
    public boolean isValid() {
        return sujetId != null && sujetId > 0 &&
                type != null && (type.equals("ENTRAINEMENT") || type.equals("TEST")) &&
                choix != null && (choix.equals("POUR") || choix.equals("CONTRE"));
    }
}