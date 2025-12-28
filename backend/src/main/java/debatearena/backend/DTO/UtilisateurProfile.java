package debatearena.backend.DTO;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Profil personnel de l'utilisateur")
public class UtilisateurProfile {

    @Schema(description = "ID unique de l'utilisateur", example = "123")
    private Long id;

    @Schema(description = "Nom de famille", example = "Martin")
    private String nom;

    @Schema(description = "Prénom", example = "Jean")
    private String prenom;

    @Schema(description = "Adresse email", example = "jean.martin@example.com")
    private String email;

    @Schema(
            description = "Rôle de l'utilisateur",
            example = "UTILISATEUR",
            allowableValues = {"UTILISATEUR", "ADMIN", "MODERATEUR", "CHATBOT"}
    )
    private String role;

    @Schema(
            description = "URL de l'image de profil",
            example = "http://localhost:8080/uploads/avatars/user123.jpg"
    )
    private String imagePath;

    public UtilisateurProfile() {
    }

    public UtilisateurProfile(Long id, String nom, String prenom,
                              String email, String role, String imagePath) {
        this.id = id;
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.role = role;
        this.imagePath = imagePath;
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

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getImagePath() { return imagePath; }
    public void setImagePath(String imagePath) { this.imagePath = imagePath; }
}