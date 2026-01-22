package debatearena.backend.Controller;

import debatearena.backend.DTO.CreateSignalementRequest;
import debatearena.backend.DTO.SignalementResponse;
import debatearena.backend.Service.SignalementService;
import io.swagger.v3.oas.annotations.Operation;
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
@RequestMapping("/api/signalements")
@Tag(name = "Signalements", description = "API de gestion des signalements utilisateurs")
@SecurityRequirement(name = "bearerAuth")
public class SignalementController {

    private final SignalementService signalementService;

    public SignalementController(SignalementService signalementService) {
        this.signalementService = signalementService;
    }

    @Operation(
            summary = "Créer un signalement",
            description = "Permet à un utilisateur de signaler un problème"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Signalement créé",
                    content = @Content(schema = @Schema(implementation = SignalementResponse.class))
            ),
            @ApiResponse(responseCode = "400", description = "Données invalides"),
            @ApiResponse(responseCode = "401", description = "Non authentifié")
    })
    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SignalementResponse> creerSignalement(
            @RequestBody CreateSignalementRequest request
    ) {
        return ResponseEntity.ok(signalementService.creerSignalement(request));
    }

    @Operation(
            summary = "Récupérer mes signalements",
            description = "Liste tous les signalements de l'utilisateur connecté"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Liste des signalements",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = SignalementResponse.class)))
            ),
            @ApiResponse(responseCode = "401", description = "Non authentifié")
    })
    @GetMapping("/mes-signalements")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<SignalementResponse>> getMesSignalements() {
        return ResponseEntity.ok(signalementService.getMesSignalements());
    }

    @Operation(
            summary = "Détail d'un signalement",
            description = "Récupère les détails d'un signalement spécifique"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Signalement trouvé",
                    content = @Content(schema = @Schema(implementation = SignalementResponse.class))
            ),
            @ApiResponse(responseCode = "401", description = "Non authentifié"),
            @ApiResponse(responseCode = "403", description = "Accès non autorisé"),
            @ApiResponse(responseCode = "404", description = "Signalement non trouvé")
    })
    @GetMapping("/{signalementId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<SignalementResponse> getSignalement(@PathVariable Long signalementId) {
        return ResponseEntity.ok(signalementService.getSignalement(signalementId));
    }
}