package debatearena.backend.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import org.springframework.web.multipart.MultipartFile;

@Schema(description = "Requête d'inscription d'un nouvel utilisateur")
public class SignUpRequest {

    @Schema(
            description = "Nom de famille de l'utilisateur",
            example = "Dupont",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotBlank(message = "Le nom est obligatoire")
    private String nom;

    @Schema(
            description = "Prénom de l'utilisateur",
            example = "Jean",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotBlank(message = "Le prénom est obligatoire")
    private String prenom;

    @Schema(
            description = "Adresse email de l'utilisateur",
            example = "jean.dupont@example.com",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Email invalide")
    private String email;

    @Schema(
            description = "Mot de passe de l'utilisateur (minimum 6 caractères)",
            example = "MotDePasse123",
            requiredMode = Schema.RequiredMode.REQUIRED,
            minLength = 6
    )
    @NotBlank(message = "Le mot de passe est obligatoire")
    @Size(min = 6, message = "Le mot de passe doit contenir au moins 6 caractères")
    private String password;

    @Schema(
            description = "Image de profil de l'utilisateur (optionnelle)",
            type = "string",
            format = "binary"
    )
    private MultipartFile image;

    public SignUpRequest() {
    }

    public SignUpRequest(String nom, String prenom, String email, String password, MultipartFile image) {
        this.nom = nom;
        this.prenom = prenom;
        this.email = email;
        this.password = password;
        this.image = image;
    }

    // Getters et Setters
    public String getNom() { return nom; }
    public void setNom(String nom) { this.nom = nom; }

    public String getPrenom() { return prenom; }
    public void setPrenom(String prenom) { this.prenom = prenom; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }

    public MultipartFile getImage() { return image; }
    public void setImage(MultipartFile image) { this.image = image; }
}