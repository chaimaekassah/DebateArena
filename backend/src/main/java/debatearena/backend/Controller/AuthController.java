package debatearena.backend.Controller;

import debatearena.backend.DTO.AuthResponse;
import debatearena.backend.DTO.SignInRequest;
import debatearena.backend.DTO.SignUpRequest;
import debatearena.backend.DTO.SignUpResponse;
import debatearena.backend.Service.AuthService;
import debatearena.backend.Service.PasswordResetService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@Tag(name = "Authentification", description = "API d'authentification et gestion des comptes utilisateurs")
public class AuthController {

    private final AuthService authService;
    private final PasswordResetService passwordResetService;

    public AuthController(AuthService authService, PasswordResetService passwordResetService) {
        this.authService = authService;
        this.passwordResetService = passwordResetService;
    }

    @Operation(
            summary = "Inscription d'un nouvel utilisateur",
            description = "Crée un nouveau compte utilisateur avec nom, prénom, email, mot de passe et image de profil optionnelle"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Inscription réussie",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = SignUpResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Données invalides ou email déjà utilisé",
                    content = @Content(schema = @Schema(type = "string", example = "Email déjà existant"))
            )
    })
    @PostMapping(value = "/signup", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<?> signup(
            @Parameter(
                    description = "Données d'inscription avec fichier image optionnel",
                    required = true
            )
            @ModelAttribute SignUpRequest signUpRequest
    ) {
        try {
            SignUpResponse response = authService.signup(signUpRequest);
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @Operation(
            summary = "Connexion utilisateur",
            description = "Authentifie un utilisateur avec email et mot de passe. Retourne un token JWT pour les requêtes suivantes"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Connexion réussie",
                    content = @Content(mediaType = "application/json",
                            schema = @Schema(implementation = AuthResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Email ou mot de passe incorrect",
                    content = @Content(schema = @Schema(type = "string", example = "Email ou mot de passe incorrect"))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Erreur interne du serveur"
            )
    })
    @PostMapping("/signin")
    public ResponseEntity<?> signin(
            @Parameter(
                    description = "Identifiants de connexion",
                    required = true
            )
            @RequestBody SignInRequest signInRequest
    ) {
        try {
            AuthResponse response = authService.signin(signInRequest);
            return ResponseEntity.ok(response);
        } catch (BadCredentialsException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Email ou mot de passe incorrect");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Erreur interne");
        }
    }

    @Operation(
            summary = "Demande de réinitialisation de mot de passe",
            description = "Envoie un email avec un lien de réinitialisation. Pour des raisons de sécurité, le message est toujours le même"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Email envoyé (message identique que l'utilisateur existe ou non)",
                    content = @Content(schema = @Schema(type = "string", example = "Email envoyé si l'utilisateur existe"))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Email invalide"
            )
    })
    @PostMapping("/forgot-password")
    public ResponseEntity<String> forgotPassword(
            @Parameter(
                    description = "Email de l'utilisateur",
                    required = true,
                    example = "utilisateur@example.com"
            )
            @RequestParam String email
    ) {
        try {
            passwordResetService.createPasswordResetToken(email);
            return ResponseEntity.ok("Email envoyé si l'utilisateur existe");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }

    @Operation(
            summary = "Réinitialisation du mot de passe",
            description = "Met à jour le mot de passe avec le token reçu par email"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Mot de passe mis à jour avec succès",
                    content = @Content(schema = @Schema(type = "string", example = "Mot de passe mis à jour"))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Token invalide ou expiré"
            )
    })
    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(
            @Parameter(
                    description = "Token de réinitialisation reçu par email",
                    required = true,
                    example = "abc123def456ghi789"
            )
            @RequestParam String token,
            @Parameter(
                    description = "Nouveau mot de passe",
                    required = true,
                    example = "NouveauMotDePasse123!"
            )
            @RequestParam String newPassword
    ) {
        try {
            passwordResetService.resetPassword(token, newPassword);
            return ResponseEntity.ok("Mot de passe mis à jour");
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(e.getMessage());
        }
    }
}