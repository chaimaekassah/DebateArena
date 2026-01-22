package debatearena.backend.DTO;

public class CreateSignalementRequest {
    private String titre;
    private String description;
    private String typeProbleme;
    private Long debatId; // optionnel

    public CreateSignalementRequest(String titre,
                                    String description,
                                    String typeProbleme,
                                    Long debatId) {
        this.titre = titre;
        this.description = description;
        this.typeProbleme = typeProbleme;
        this.debatId = debatId;
    }

    public CreateSignalementRequest() {
    }

    public String getTitre() {
        return titre;
    }

    public void setTitre(String titre) {
        this.titre = titre;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getTypeProbleme() {
        return typeProbleme;
    }

    public void setTypeProbleme(String typeProbleme) {
        this.typeProbleme = typeProbleme;
    }

    public Long getDebatId() {
        return debatId;
    }

    public void setDebatId(Long debatId) {
        this.debatId = debatId;
    }

    public boolean isValid() {
        return titre != null && !titre.trim().isEmpty()
                && description != null && !description.trim().isEmpty()
                && typeProbleme != null && !typeProbleme.trim().isEmpty();
    }
}