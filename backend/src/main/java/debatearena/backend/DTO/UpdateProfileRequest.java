package debatearena.backend.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import org.springframework.web.multipart.MultipartFile;

@Schema(description = "Requête de mise à jour du profil utilisateur")
public class UpdateProfileRequest {

    @Schema(description = "Nouveau nom de famille", example = "Martin")
    private String nom;

    @Schema(description = "Nouveau prénom", example = "Jean")
    private String prenom;

    @Schema(
            description = "Nouvelle image de profil",
            type = "string",
            format = "binary"
    )
    private MultipartFile image;

    public UpdateProfileRequest() {
    }

    public UpdateProfileRequest(String nom, String prenom, MultipartFile image) {
        this.nom = nom;
        this.prenom = prenom;
        this.image = image;
    }

    // Getters et Setters
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public MultipartFile getImage() { return image; }
    public void setImage(MultipartFile image) { this.image = image; }
}