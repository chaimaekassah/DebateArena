package debatearena.backend.DTO;

import debatearena.backend.Entity.Badge;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Data;

import java.util.List;

@Data
@Schema(description = "Tableau de bord complet de l'utilisateur avec statistiques et progression")
public class Dashboard {

    @Schema(
            description = "Niveau actuel de l'utilisateur",
            example = "INTERMEDIAIRE",
            allowableValues = {"DEBUTANT", "INTERMEDIAIRE", "AVANCE", "EXPERT"}
    )
    private String niveau;

    @Schema(description = "Pourcentage de progression vers le niveau suivant", example = "65.5")
    private Double progressionPourcentage;

    @Schema(description = "Score total de l'utilisateur", example = "350")
    private Integer score;

    @Schema(description = "Points nécessaires pour atteindre le niveau suivant", example = "150")
    private Integer pointsPourNiveauSuivant;

    @Schema(description = "Badge actuel de l'utilisateur")
    private Badge badgeActuel;

    @Schema(description = "Nombre total de débats effectués", example = "25")
    private Integer totalDebats;

    @Schema(description = "Nombre de débats gagnés", example = "18")
    private Integer debatsGagnes;

    @Schema(description = "Taux de réussite en pourcentage", example = "72.0")
    private Double tauxReussite;

    @Schema(description = "Moyenne des notes sur 20", example = "15")
    private Integer moyenneNotes;

    @Schema(description = "Meilleure note obtenue sur 20", example = "19")
    private Integer meilleureNote;

    @Schema(description = "Liste des 5 derniers débats")
    private List<DebatRecap> debatsRecents;

    public Dashboard() {
    }

    public Dashboard(String niveau, Double progressionPourcentage, Integer score,
                     Integer pointsPourNiveauSuivant, Badge badgeActuel,
                     Integer totalDebats, Integer debatsGagnes, Double tauxReussite,
                     Integer moyenneNotes, Integer meilleureNote, List<DebatRecap> debatsRecents) {
        this.niveau = niveau;
        this.progressionPourcentage = progressionPourcentage;
        this.score = score;
        this.pointsPourNiveauSuivant = pointsPourNiveauSuivant;
        this.badgeActuel = badgeActuel;
        this.totalDebats = totalDebats;
        this.debatsGagnes = debatsGagnes;
        this.tauxReussite = tauxReussite;
        this.moyenneNotes = moyenneNotes;
        this.meilleureNote = meilleureNote;
        this.debatsRecents = debatsRecents;
    }
}