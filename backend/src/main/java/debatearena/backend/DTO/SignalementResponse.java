package debatearena.backend.DTO;

import java.time.LocalDateTime;


public class SignalementResponse {
    private Long id;
    private String titre;
    private String description;
    private String typeProbleme;
    private String statut;
    private LocalDateTime dateCreation;
    private LocalDateTime dateResolution;
    private String commentaireAdmin;

    // Informations utilisateur
    private Long utilisateurId;
    private String utilisateurNom;
    private String utilisateurEmail;

    // Informations débat (si applicable)
    private Long debatId;
    private String debatSujetTitre;

    // Admin qui a traité
    private Long adminId;
    private String adminNom;

    public SignalementResponse(Long id,
                               String titre,
                               String description,
                               String typeProbleme,
                               String statut,
                               LocalDateTime dateCreation,
                               LocalDateTime dateResolution,
                               String commentaireAdmin,
                               Long utilisateurId,
                               String utilisateurNom,
                               String utilisateurEmail,
                               Long debatId,
                               String debatSujetTitre,
                               Long adminId,
                               String adminNom) {
        this.id = id;
        this.titre = titre;
        this.description = description;
        this.typeProbleme = typeProbleme;
        this.statut = statut;
        this.dateCreation = dateCreation;
        this.dateResolution = dateResolution;
        this.commentaireAdmin = commentaireAdmin;
        this.utilisateurId = utilisateurId;
        this.utilisateurNom = utilisateurNom;
        this.utilisateurEmail = utilisateurEmail;
        this.debatId = debatId;
        this.debatSujetTitre = debatSujetTitre;
        this.adminId = adminId;
        this.adminNom = adminNom;
    }

    public SignalementResponse() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public LocalDateTime getDateCreation() {
        return dateCreation;
    }

    public void setDateCreation(LocalDateTime dateCreation) {
        this.dateCreation = dateCreation;
    }

    public LocalDateTime getDateResolution() {
        return dateResolution;
    }

    public void setDateResolution(LocalDateTime dateResolution) {
        this.dateResolution = dateResolution;
    }

    public String getCommentaireAdmin() {
        return commentaireAdmin;
    }

    public void setCommentaireAdmin(String commentaireAdmin) {
        this.commentaireAdmin = commentaireAdmin;
    }

    public Long getUtilisateurId() {
        return utilisateurId;
    }

    public void setUtilisateurId(Long utilisateurId) {
        this.utilisateurId = utilisateurId;
    }

    public String getUtilisateurNom() {
        return utilisateurNom;
    }

    public void setUtilisateurNom(String utilisateurNom) {
        this.utilisateurNom = utilisateurNom;
    }

    public String getUtilisateurEmail() {
        return utilisateurEmail;
    }

    public void setUtilisateurEmail(String utilisateurEmail) {
        this.utilisateurEmail = utilisateurEmail;
    }

    public Long getDebatId() {
        return debatId;
    }

    public void setDebatId(Long debatId) {
        this.debatId = debatId;
    }

    public String getDebatSujetTitre() {
        return debatSujetTitre;
    }

    public void setDebatSujetTitre(String debatSujetTitre) {
        this.debatSujetTitre = debatSujetTitre;
    }

    public Long getAdminId() {
        return adminId;
    }

    public void setAdminId(Long adminId) {
        this.adminId = adminId;
    }

    public String getAdminNom() {
        return adminNom;
    }

    public void setAdminNom(String adminNom) {
        this.adminNom = adminNom;
    }
}