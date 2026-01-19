package debatearena.backend.Controller;

import debatearena.backend.DTO.*;
import debatearena.backend.Service.UtilisateurService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
@Tag(name = "Utilisateur", description = "API de gestion du profil utilisateur et tableau de bord")
@SecurityRequirement(name = "bearerAuth")
public class UtilisateurController {

    private final UtilisateurService utilisateurService;

    @Operation(
            summary = "Récupérer mon profil",
            description = "Retourne les informations personnelles de l'utilisateur authentifié"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Profil récupéré",
                    content = @Content(schema = @Schema(implementation = UtilisateurProfile.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Non authentifié"
            )
    })
    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UtilisateurProfile> getMyProfile() {
        UtilisateurProfile profile = utilisateurService.getMyProfile();
        return ResponseEntity.ok(profile);
    }

    @Operation(
            summary = "Mettre à jour mon profil",
            description = "Met à jour les informations personnelles (nom, prénom, image optionnelle)"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Profil mis à jour",
                    content = @Content(schema = @Schema(implementation = UtilisateurProfile.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Données invalides"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Non authentifié"
            )
    })
    @PutMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UtilisateurProfile> updateMyProfile(
            @Parameter(
                    description = "Données de mise à jour du profil",
                    required = true
            )
            @ModelAttribute UpdateProfileRequest request
    ) throws IOException {
        UtilisateurProfile updatedProfile = utilisateurService.updateMyProfile(request);
        return ResponseEntity.ok(updatedProfile);
    }

    @Operation(
            summary = "Changer mon image de profil",
            description = "Met à jour uniquement l'image de profil"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Image mise à jour",
                    content = @Content(schema = @Schema(implementation = UtilisateurProfile.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Image invalide"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Non authentifié"
            )
    })
    @PutMapping(value = "/me/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UtilisateurProfile> updateMyProfileImage(
            @Parameter(
                    description = "Nouvelle image de profil",
                    required = true,
                    content = @Content(mediaType = MediaType.MULTIPART_FORM_DATA_VALUE)
            )
            @RequestParam("image") MultipartFile image
    ) throws IOException {
        UtilisateurProfile updatedProfile = utilisateurService.updateProfileImage(image);
        return ResponseEntity.ok(updatedProfile);
    }

    @Operation(
            summary = "Récupérer mon tableau de bord",
            description = "Retourne toutes les statistiques, progression et historique de l'utilisateur"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Tableau de bord récupéré",
                    content = @Content(schema = @Schema(implementation = Dashboard.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Non authentifié"
            )
    })
    @GetMapping("/dashboard")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Dashboard> getDashboard() {
        Dashboard dashboard = utilisateurService.getDashboard();
        return ResponseEntity.ok(dashboard);
    }
}