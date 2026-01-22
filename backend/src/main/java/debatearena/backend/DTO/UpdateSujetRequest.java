package debatearena.backend.DTO;


public class UpdateSujetRequest {
    private String titre;
    private String categorie;
    private String difficulte;

    public UpdateSujetRequest(String titre,
                              String categorie,
                              String difficulte) {
        this.titre = titre;
        this.categorie = categorie;
        this.difficulte = difficulte;
    }

    public UpdateSujetRequest() {
    }

    public String getTitre() {
        return titre;
    }

    public void setTitre(String titre) {
        this.titre = titre;
    }

    public String getCategorie() {
        return categorie;
    }

    public void setCategorie(String categorie) {
        this.categorie = categorie;
    }

    public String getDifficulte() {
        return difficulte;
    }

    public void setDifficulte(String difficulte) {
        this.difficulte = difficulte;
    }
}