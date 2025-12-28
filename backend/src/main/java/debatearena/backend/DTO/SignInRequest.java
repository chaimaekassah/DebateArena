package debatearena.backend.DTO;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(description = "Requête de connexion utilisateur")
public class SignInRequest {

    @Schema(
            description = "Adresse email de l'utilisateur",
            example = "jean.dupont@example.com",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotBlank(message = "L'email est obligatoire")
    @Email(message = "Email invalide")
    private String email;

    @Schema(
            description = "Mot de passe de l'utilisateur",
            example = "MotDePasse123",
            requiredMode = Schema.RequiredMode.REQUIRED
    )
    @NotBlank(message = "Le mot de passe est obligatoire")
    private String password;

    public SignInRequest() {
    }

    public SignInRequest(String email, String password) {
        this.email = email;
        this.password = password;
    }

    // Getters et Setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
}