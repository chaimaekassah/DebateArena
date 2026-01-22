package debatearena.backend.DTO;

public class SujetStatsResponse {
    private Long sujetId;
    private String titre;
    private String categorie;
    private String difficulte;

    // Statistiques
    private Integer nombreDebats;
    private Integer debatsEnCours;
    private Integer debatsTermines;
    private Double noteMoyenne;
    private Integer nombreVues;

    // Tendance (basée sur l'activité récente)
    private Integer debats7derniersjours;
    private Integer debats30derniersjours;
    private Double tauxCroissance;
    private Boolean estTendance;

    public SujetStatsResponse(Long sujetId,
                              String titre,
                              String categorie,
                              String difficulte,
                              Integer nombreDebats,
                              Integer debatsEnCours,
                              Integer debatsTermines,
                              Double noteMoyenne,
                              Integer nombreVues,
                              Integer debats7derniersjours,
                              Integer debats30derniersjours,
                              Double tauxCroissance,
                              Boolean estTendance) {
        this.sujetId = sujetId;
        this.titre = titre;
        this.categorie = categorie;
        this.difficulte = difficulte;
        this.nombreDebats = nombreDebats;
        this.debatsEnCours = debatsEnCours;
        this.debatsTermines = debatsTermines;
        this.noteMoyenne = noteMoyenne;
        this.nombreVues = nombreVues;
        this.debats7derniersjours = debats7derniersjours;
        this.debats30derniersjours = debats30derniersjours;
        this.tauxCroissance = tauxCroissance;
        this.estTendance = estTendance;
    }

    public SujetStatsResponse() {
    }

    public Long getSujetId() {
        return sujetId;
    }

    public void setSujetId(Long sujetId) {
        this.sujetId = sujetId;
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

    public Integer getNombreDebats() {
        return nombreDebats;
    }

    public void setNombreDebats(Integer nombreDebats) {
        this.nombreDebats = nombreDebats;
    }

    public Integer getDebatsEnCours() {
        return debatsEnCours;
    }

    public void setDebatsEnCours(Integer debatsEnCours) {
        this.debatsEnCours = debatsEnCours;
    }

    public Integer getDebatsTermines() {
        return debatsTermines;
    }

    public void setDebatsTermines(Integer debatsTermines) {
        this.debatsTermines = debatsTermines;
    }

    public Double getNoteMoyenne() {
        return noteMoyenne;
    }

    public void setNoteMoyenne(Double noteMoyenne) {
        this.noteMoyenne = noteMoyenne;
    }

    public Integer getNombreVues() {
        return nombreVues;
    }

    public void setNombreVues(Integer nombreVues) {
        this.nombreVues = nombreVues;
    }

    public Integer getDebats7derniersjours() {
        return debats7derniersjours;
    }

    public void setDebats7derniersjours(Integer debats7derniersjours) {
        this.debats7derniersjours = debats7derniersjours;
    }

    public Integer getDebats30derniersjours() {
        return debats30derniersjours;
    }

    public void setDebats30derniersjours(Integer debats30derniersjours) {
        this.debats30derniersjours = debats30derniersjours;
    }

    public Double getTauxCroissance() {
        return tauxCroissance;
    }

    public void setTauxCroissance(Double tauxCroissance) {
        this.tauxCroissance = tauxCroissance;
    }

    public Boolean getEstTendance() {
        return estTendance;
    }

    public void setEstTendance(Boolean estTendance) {
        this.estTendance = estTendance;
    }
}