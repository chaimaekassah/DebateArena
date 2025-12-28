package debatearena.backend.DTO;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Réponse d'authentification avec token JWT")
public class AuthResponse {

    @Schema(
            description = "Token JWT d'authentification",
            example = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqZWFuLmR1cG9udEBleGFtcGxlLmNvbSIsInJvbGUiOiJVVElMSVNBVEVVUiIsImlhdCI6MTYxNjIzOTAyMiwiZXhwIjoxNjE2MjQyNjIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
    )
    private String token;

    @Schema(
            description = "Rôle de l'utilisateur",
            example = "UTILISATEUR",
            allowableValues = {"UTILISATEUR", "ADMIN", "MODERATEUR", "CHATBOT"}
    )
    private String role;

    public AuthResponse() {
    }

    public AuthResponse(String token, String role) {
        this.token = token;
        this.role = role;
    }

    // Getters et Setters
    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}