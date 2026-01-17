package debatearena.backend.Controller;

import debatearena.backend.DTO.EnumDTO;
import debatearena.backend.Service.EnumService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.ArraySchema;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/enums")
@CrossOrigin(origins = "*")
@Tag(name = "Énumérations",
        description = "API de récupération des valeurs d'énumérations utilisées dans l'application")
public class EnumController {

    private final EnumService enumService;

    public EnumController(EnumService enumService) {
        this.enumService = enumService;
    }

    @Operation(
            summary = "Récupérer toutes les catégories de sujet",
            description = "Retourne la liste complète des catégories disponibles pour les sujets de débat"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Liste des catégories récupérée avec succès",
                    content = @Content(
                            mediaType = "application/json",
                            array = @ArraySchema(schema = @Schema(implementation = EnumDTO.class))
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Erreur interne du serveur",
                    content = @Content(schema = @Schema(type = "string", example = "Erreur interne"))
            )
    })
    @GetMapping("/categories-sujet")
    public ResponseEntity<List<EnumDTO>> getCategoriesSujet() {
        return ResponseEntity.ok(enumService.getCategoriesSujet());
    }

    @Operation(
            summary = "Récupérer tous les niveaux de difficulté",
            description = "Retourne la liste complète des niveaux de difficulté disponibles pour les sujets"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Liste des niveaux récupérée avec succès",
                    content = @Content(
                            mediaType = "application/json",
                            array = @ArraySchema(schema = @Schema(implementation = EnumDTO.class))
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Erreur interne du serveur"
            )
    })
    @GetMapping("/niveaux")
    public ResponseEntity<List<EnumDTO>> getNiveaux() {
        return ResponseEntity.ok(enumService.getNiveaux());
    }

    @Operation(
            summary = "Récupérer tous les rôles utilisateur",
            description = "Retourne la liste complète des rôles disponibles pour les utilisateurs"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Liste des rôles récupérée avec succès",
                    content = @Content(
                            mediaType = "application/json",
                            array = @ArraySchema(schema = @Schema(implementation = EnumDTO.class))
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Erreur interne du serveur"
            )
    })
    @GetMapping("/roles")
    public ResponseEntity<List<EnumDTO>> getRoles() {
        return ResponseEntity.ok(enumService.getRoles());
    }

    @Operation(
            summary = "Récupérer toutes les catégories de badge",
            description = "Retourne la liste complète des catégories disponibles pour les badges"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Liste des catégories de badge récupérée avec succès",
                    content = @Content(
                            mediaType = "application/json",
                            array = @ArraySchema(schema = @Schema(implementation = EnumDTO.class))
                    )
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "Erreur interne du serveur"
            )
    })
    @GetMapping("/categories-badge")
    public ResponseEntity<List<EnumDTO>> getCategoriesBadge() {
        return ResponseEntity.ok(enumService.getCategoriesBadge());
    }

    @Operation(
            summary = "Vérifier l'état du service des énumérations",
            description = "Endpoint de santé pour vérifier que le service des énumérations est opérationnel"
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Service opérationnel",
                    content = @Content(schema = @Schema(type = "string", example = "Service des énumérations actif"))
            )
    })
    @GetMapping("/health")
    public ResponseEntity<String> healthCheck() {
        return ResponseEntity.ok("Service des énumérations actif");
    }
}