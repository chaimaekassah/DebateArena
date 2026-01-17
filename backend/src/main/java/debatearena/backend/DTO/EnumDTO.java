package debatearena.backend.DTO;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(
        description = "Objet représentant une valeur d'énumération avec son libellé formaté"
)
public class EnumDTO {

    @Schema(
            description = """
            Valeur technique de l'énumération en majuscules.
            Utiliser cette valeur pour les opérations techniques et le stockage.
            """,
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String value;

    @Schema(
            description = """
            Libellé formaté pour l'affichage.
            Inclut les accents et la capitalisation appropriée.
            """,
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    private String label;

    // Constructeur par défaut requis pour la désérialisation JSON
    public EnumDTO() {}

    // Constructeur principal
    public EnumDTO(String value, String label) {
        this.value = value;
        this.label = label;
    }

    // Getters et setters
    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }
}