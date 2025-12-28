package debatearena.backend.DTO;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Résumé d'un débat pour l'historique")
public class DebatRecap {

    @Schema(description = "ID du débat", example = "45")
    private Long id;

    @Schema(description = "Titre du sujet", example = "L'IA va-t-elle remplacer les humains?")
    private String sujet;

    @Schema(description = "Catégorie du sujet", example = "TECHNOLOGIE")
    private String categorie;

    @Schema(
            description = "Difficulté du sujet",
            example = "INTERMEDIAIRE",
            allowableValues = {"DEBUTANT", "INTERMEDIAIRE", "AVANCE", "EXPERT"}
    )
    private String difficulte;

    @Schema(
            description = "Type de débat",
            example = "TEST",
            allowableValues = {"ENTRAINEMENT", "TEST"}
    )
    private String type;

    @Schema(
            description = "Choix de position de l'utilisateur",
            example = "POUR",
            allowableValues = {"POUR", "CONTRE"}
    )
    private String choixUtilisateur;

    @Schema(description = "Note obtenue sur 20", example = "16")
    private Integer note;

    @Schema(description = "Date et heure du débat", example = "2024-01-15T14:30:00")
    private LocalDateTime date;

    @Schema(description = "Durée du débat formatée", example = "12min 30s")
    private String duree;

    public DebatRecap() {
    }

    public DebatRecap(Long id, String sujet, String categorie, String difficulte,
                      String type, String choixUtilisateur, Integer note,
                      LocalDateTime date, String duree) {
        this.id = id;
        this.sujet = sujet;
        this.categorie = categorie;
        this.difficulte = difficulte;
        this.type = type;
        this.choixUtilisateur = choixUtilisateur;
        this.note = note;
        this.date = date;
        this.duree = duree;
    }

    // Getters
    public Long getId() { return id; }
    public String getSujet() { return sujet; }
    public String getCategorie() { return categorie; }
    public String getDifficulte() { return difficulte; }
    public String getType() { return type; }
    public String getChoixUtilisateur() { return choixUtilisateur; }
    public Integer getNote() { return note; }
    public LocalDateTime getDate() { return date; }
    public String getDuree() { return duree; }
}