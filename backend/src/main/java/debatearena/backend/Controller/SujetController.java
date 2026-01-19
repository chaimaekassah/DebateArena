package debatearena.backend.Controller;

import debatearena.backend.DTO.SujetResponse;
import debatearena.backend.Service.SujetService;
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
@RequestMapping("/api/sujets")
@Tag(name = "Sujets", description = "API de gestion des sujets de débat")
public class SujetController {

    private final SujetService sujetService;

    public SujetController(SujetService sujetService) {
        this.sujetService = sujetService;
    }

    @Operation(
            summary = "Récupérer tous les sujets",
            description = "Retourne tous les sujets disponibles avec indication d'accessibilité selon le niveau de l'utilisateur"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Liste des sujets",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = SujetResponse.class)))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Non authentifié"
            )
    })
    @GetMapping
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<SujetResponse>> getAllSujets() {
        List<SujetResponse> sujets = sujetService.getAllSujets();
        return ResponseEntity.ok(sujets);
    }

    @Operation(
            summary = "Récupérer un sujet par ID",
            description = "Retourne les détails d'un sujet spécifique avec son accessibilité"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Sujet trouvé",
                    content = @Content(schema = @Schema(implementation = SujetResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Non authentifié"
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Sujet non trouvé"
            )
    })
    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<SujetResponse> getSujetById(
            @Parameter(description = "ID du sujet", example = "1")
            @PathVariable Long id
    ) {
        SujetResponse sujet = sujetService.getSujetById(id);
        return ResponseEntity.ok(sujet);
    }

    @Operation(
            summary = "Filtrer les sujets",
            description = "Filtre les sujets par catégorie et/ou difficulté"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Sujets filtrés",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = SujetResponse.class)))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Paramètres de filtre invalides"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Non authentifié"
            )
    })
    @GetMapping("/filtrer")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<SujetResponse>> filtrerSujets(
            @Parameter(description = "Catégorie du sujet", example = "SCIENCE")
            @RequestParam(required = false) String categorie,
            @Parameter(description = "Difficulté du sujet", example = "INTERMEDIAIRE")
            @RequestParam(required = false) String difficulte
    ) {
        List<SujetResponse> sujets = sujetService.getSujetsFiltres(categorie, difficulte);
        return ResponseEntity.ok(sujets);
    }

    @Operation(
            summary = "Rechercher des sujets",
            description = "Recherche des sujets par titre (insensible à la casse)"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Résultats de recherche",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = SujetResponse.class)))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Requête de recherche vide"
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Non authentifié"
            )
    })
    @GetMapping("/rechercher")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<SujetResponse>> rechercherSujets(
            @Parameter(description = "Terme de recherche", example = "intelligence artificielle", required = true)
            @RequestParam String q
    ) {
        List<SujetResponse> sujets = sujetService.searchSujets(q);
        return ResponseEntity.ok(sujets);
    }

    @Operation(
            summary = "Sujets recommandés",
            description = "Retourne les sujets recommandés selon le niveau de l'utilisateur"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Sujets recommandés",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = SujetResponse.class)))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Non authentifié"
            )
    })
    @GetMapping("/recommandes")
    @PreAuthorize("isAuthenticated()")
    @SecurityRequirement(name = "bearerAuth")
    public ResponseEntity<List<SujetResponse>> getSujetsRecommandes() {
        List<SujetResponse> sujets = sujetService.getSujetsRecommandes();
        return ResponseEntity.ok(sujets);
    }

    @Operation(
            summary = "Liste des catégories",
            description = "Retourne toutes les catégories de sujets disponibles (endpoint public)"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Liste des catégories",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = String.class)))
            )
    })
    @GetMapping("/categories")
    public ResponseEntity<List<String>> getAllCategories() {
        List<String> categories = sujetService.getAllCategories();
        return ResponseEntity.ok(categories);
    }

    @Operation(
            summary = "Liste des difficultés",
            description = "Retourne tous les niveaux de difficulté disponibles (endpoint public)"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Liste des difficultés",
                    content = @Content(array = @ArraySchema(schema = @Schema(implementation = String.class)))
            )
    })
    @GetMapping("/difficultes")
    public ResponseEntity<List<String>> getAllDifficultes() {
        List<String> difficultes = sujetService.getAllDifficultes();
        return ResponseEntity.ok(difficultes);
    }
}