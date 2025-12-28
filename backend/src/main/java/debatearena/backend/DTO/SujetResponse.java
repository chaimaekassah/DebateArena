package debatearena.backend.DTO;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Réponse d'un sujet de débat")
public class SujetResponse {

    @Schema(description = "ID du sujet", example = "1")
    private Long id;

    @Schema(description = "Titre du sujet", example = "L'IA va-t-elle remplacer les humains?")
    private String titre;

    @Schema(
            description = "Catégorie du sujet",
            example = "SCIENCE",
            allowableValues = {"SCIENCE", "TECHNOLOGIE", "SOCIETE", "POLITIQUE", "ENVIRONNEMENT", "ART", "PHILOSOPHIE"}
    )
    private String categorie;

    @Schema(
            description = "Difficulté du sujet",
            example = "INTERMEDIAIRE",
            allowableValues = {"DEBUTANT", "INTERMEDIAIRE", "AVANCE", "EXPERT"}
    )
    private String difficulte;

    @Schema(
            description = "Accessibilité selon le niveau de l'utilisateur",
            example = "true"
    )
    private boolean accessible;

    public SujetResponse() {
    }

    public SujetResponse(Long id, String titre, String categorie,
                         String difficulte, boolean accessible) {
        this.id = id;
        this.titre = titre;
        this.categorie = categorie;
        this.difficulte = difficulte;
        this.accessible = accessible;
    }

    // Getters
    public Long getId() { return id; }
    public String getTitre() { return titre; }
    public String getCategorie() { return categorie; }
    public String getDifficulte() { return difficulte; }
    public boolean isAccessible() { return accessible; }
}