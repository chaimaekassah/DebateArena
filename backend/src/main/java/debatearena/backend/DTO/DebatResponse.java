package debatearena.backend.DTO;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(description = "Réponse détaillée d'un débat")
public class DebatResponse {

    @Schema(description = "ID du débat", example = "123")
    private Long id;

    @Schema(description = "Sujet du débat")
    private SujetResponse sujet;

    @Schema(
            description = "Type de débat",
            example = "TEST",
            allowableValues = {"ENTRAINEMENT", "TEST"}
    )
    private String type;

    @Schema(
            description = "Statut du débat",
            example = "EN_COURS",
            allowableValues = {"EN_COURS", "TERMINE"}
    )
    private String status;

    @Schema(
            description = "Choix de position de l'utilisateur",
            example = "POUR",
            allowableValues = {"POUR", "CONTRE"}
    )
    private String choixUtilisateur;

    @Schema(description = "Date et heure de début", example = "2024-01-15T14:30:00")
    private LocalDateTime dateDebut;

    @Schema(description = "Durée en secondes", example = "750")
    private Integer duree;

    @Schema(description = "Note sur 20 (uniquement pour les tests)", example = "16")
    private Integer note;

    public DebatResponse() {
    }

    public DebatResponse(Long id, SujetResponse sujet, String type, String status,
                         String choixUtilisateur, LocalDateTime dateDebut,
                         Integer duree, Integer note) {
        this.id = id;
        this.sujet = sujet;
        this.type = type;
        this.status = status;
        this.choixUtilisateur = choixUtilisateur;
        this.dateDebut = dateDebut;
        this.duree = duree;
        this.note = note;
    }

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public SujetResponse getSujet() { return sujet; }
    public void setSujet(SujetResponse sujet) { this.sujet = sujet; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getChoixUtilisateur() { return choixUtilisateur; }
    public void setChoixUtilisateur(String choixUtilisateur) { this.choixUtilisateur = choixUtilisateur; }

    public LocalDateTime getDateDebut() { return dateDebut; }
    public void setDateDebut(LocalDateTime dateDebut) { this.dateDebut = dateDebut; }

    public Integer getDuree() { return duree; }
    public void setDuree(Integer duree) { this.duree = duree; }

    public Integer getNote() { return note; }
    public void setNote(Integer note) { this.note = note; }
}