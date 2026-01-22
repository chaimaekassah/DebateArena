package debatearena.backend.Controller;

import debatearena.backend.DTO.*;
import debatearena.backend.Service.AdminService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@Tag(name = "Administration", description = "API d'administration de la plateforme")
@SecurityRequirement(name = "bearerAuth")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    // ========== PROFIL ADMIN ==========

    @Operation(
            summary = "Récupérer mon profil admin",
            description = "Retourne les informations du compte administrateur connecté"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Profil récupéré",
                    content = @Content(schema = @Schema(implementation = AdminProfileResponse.class))
            ),
            @ApiResponse(responseCode = "401", description = "Non authentifié"),
            @ApiResponse(responseCode = "403", description = "Accès réservé aux administrateurs")
    })
    @GetMapping("/profile")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AdminProfileResponse> getAdminProfile() {
        return ResponseEntity.ok(adminService.getAdminProfile());
    }

    // ========== DASHBOARD ==========

    @Operation(
            summary = "Récupérer le dashboard administrateur",
            description = "Statistiques globales de la plateforme, activité et tendances"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Dashboard récupéré",
                    content = @Content(schema = @Schema(implementation = DashboardAdminResponse.class))
            ),
            @ApiResponse(responseCode = "401", description = "Non authentifié"),
            @ApiResponse(responseCode = "403", description = "Accès réservé aux administrateurs")
    })
    @GetMapping("/dashboard")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<DashboardAdminResponse> getDashboard() {
        return ResponseEntity.ok(adminService.getDashboardStats());
    }

    // ========== GESTION DES SUJETS ==========

    @Operation(
            summary = "Créer un nouveau sujet",
            description = "Crée un nouveau sujet de débat"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Sujet créé",
                    content = @Content(schema = @Schema(implementation = SujetResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Données invalides"),
            @ApiResponse(responseCode = "401", description = "Non authentifié"),
            @ApiResponse(responseCode = "403", description = "Accès réservé aux administrateurs")
    })
    @PostMapping("/sujets")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SujetResponse> creerSujet(@RequestBody CreateSujetRequest request) {
        return ResponseEntity.ok(adminService.creerSujet(request));
    }

    @Operation(
            summary = "Modifier un sujet",
            description = "Met à jour un sujet existant"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Sujet modifié",
                    content = @Content(schema = @Schema(implementation = SujetResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Données invalides"),
            @ApiResponse(responseCode = "401", description = "Non authentifié"),
            @ApiResponse(responseCode = "403", description = "Accès réservé aux administrateurs"),
            @ApiResponse(responseCode = "404", description = "Sujet non trouvé")
    })
    @PutMapping("/sujets/{sujetId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SujetResponse> updateSujet(
            @PathVariable Long sujetId,
            @RequestBody UpdateSujetRequest request
    ) {
        return ResponseEntity.ok(adminService.updateSujet(sujetId, request));
    }

    @Operation(
            summary = "Supprimer un sujet",
            description = "Supprime un sujet s'il n'a pas de débats associés"
    )
    @ApiResponses(value = {
            @ApiResponse(responseCode = "204", description = "Sujet supprimé"),
            @ApiResponse(responseCode = "400", description = "Sujet avec débats associés"),
            @ApiResponse(responseCode = "401", description = "Non authentifié"),
            @ApiResponse(responseCode = "403", description = "Accès réservé aux administrateurs"),
            @ApiResponse(responseCode = "404", description = "Sujet non trouvé")
    })
    @DeleteMapping("/sujets/{sujetId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSujet(@PathVariable Long sujetId) {
        adminService.deleteSujet(sujetId);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Récupérer tous les sujets avec statistiques",
            description = "Liste tous les sujets avec leurs statistiques de débats et tendances"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Liste des sujets avec stats",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = SujetStatsResponse.class)))
            ),
            @ApiResponse(responseCode = "401", description = "Non authentifié"),
            @ApiResponse(responseCode = "403", description = "Accès réservé aux administrateurs")
    })
    @GetMapping("/sujets/stats")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SujetStatsResponse>> getSujetsWithStats() {
        return ResponseEntity.ok(adminService.getSujetsWithStats());
    }

    // ========== GESTION DES SIGNALEMENTS ==========

    @Operation(
            summary = "Récupérer tous les signalements",
            description = "Liste tous les signalements avec filtres optionnels"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Liste des signalements",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = SignalementResponse.class)))
            ),
            @ApiResponse(responseCode = "401", description = "Non authentifié"),
            @ApiResponse(responseCode = "403", description = "Accès réservé aux administrateurs")
    })
    @GetMapping("/signalements")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<SignalementResponse>> getAllSignalements(
            @Parameter(description = "Filtrer par statut", example = "EN_ATTENTE")
            @RequestParam(required = false) String statut,
            @Parameter(description = "Filtrer par type de problème", example = "BUG_TECHNIQUE")
            @RequestParam(required = false) String typeProbleme
    ) {
        return ResponseEntity.ok(adminService.getAllSignalements(statut, typeProbleme));
    }

    @Operation(
            summary = "Traiter un signalement",
            description = "Met à jour le statut et ajoute un commentaire admin"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Signalement traité",
                    content = @Content(schema = @Schema(implementation = SignalementResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Données invalides"),
            @ApiResponse(responseCode = "401", description = "Non authentifié"),
            @ApiResponse(responseCode = "403", description = "Accès réservé aux administrateurs"),
            @ApiResponse(responseCode = "404", description = "Signalement non trouvé")
    })
    @PutMapping("/signalements/{signalementId}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SignalementResponse> traiterSignalement(
            @PathVariable Long signalementId,
            @RequestBody TraiterSignalementRequest request
    ) {
        return ResponseEntity.ok(adminService.traiterSignalement(signalementId, request));
    }
}