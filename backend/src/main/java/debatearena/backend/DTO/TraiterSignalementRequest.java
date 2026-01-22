package debatearena.backend.DTO;

public class TraiterSignalementRequest {
    private String statut; // EN_COURS, RESOLU, REJETE
    private String commentaireAdmin;

    public TraiterSignalementRequest(String statut,
                                     String commentaireAdmin) {
        this.statut = statut;
        this.commentaireAdmin = commentaireAdmin;
    }

    public TraiterSignalementRequest() {
    }

    public String getStatut() {
        return statut;
    }

    public void setStatut(String statut) {
        this.statut = statut;
    }

    public String getCommentaireAdmin() {
        return commentaireAdmin;
    }

    public void setCommentaireAdmin(String commentaireAdmin) {
        this.commentaireAdmin = commentaireAdmin;
    }

    public boolean isValid() {
        return statut != null && !statut.trim().isEmpty();
    }
}