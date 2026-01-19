package debatearena.backend.DTO;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Réponse après inscription réussie d'un utilisateur")
public class SignUpResponse {

    @Schema(description = "ID unique de l'utilisateur", example = "1")
    private Long id;

    @Schema(description = "Nom de famille", example = "Dupont")
    private String nom;

    @Schema(description = "Prénom", example = "Jean")
    private String prenom;

    @Schema(description = "Adresse email", example = "jean.dupont@example.com")
    private String email;

    @Schema(description = "Score initial de l'utilisateur", example = "0")
    private Integer score;

    @Schema(description = "Nom du badge attribué", example = "Nouveau membre")
    private String badgeNom;

    @Schema(
            description = "Catégorie du badge",
            example = "PARTICIPATION",
            allowableValues = {"PARTICIPATION", "REUSSITE", "SPECIAL"}
    )
    private String badgeCategorie;

    @Schema(
            description = "URL de l'image de profil",
            example = "http://localhost:8080/uploads/avatars/default.png"
    )
    private String imageUrl;

    public SignUpResponse() {
    }

    public SignUpResponse(Long id, String nom, String prenom, String email,
                          Integer score, String badgeNom, String badgeCategorie,
                          String imageUrl) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.score = score;
        this.badgeNom = badgeNom;
        this.badgeCategorie = badgeCategorie;
        this.imageUrl = imageUrl;
    }

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Integer getScore() { return score; }
    public void setScore(Integer score) { this.score = score; }

    public String getBadgeNom() { return badgeNom; }
    public void setBadgeNom(String badgeNom) { this.badgeNom = badgeNom; }

    public String getBadgeCategorie() { return badgeCategorie; }
    public void setBadgeCategorie(String badgeCategorie) { this.badgeCategorie = badgeCategorie; }

    public String getImageUrl() { return imageUrl; }
    public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
    public void setMessage(String created) {
        // Aucun attribut message dans la classe
    }
}