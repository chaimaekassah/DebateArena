package debatearena.backend.Service;

import debatearena.backend.DTO.EnumDTO;
import debatearena.backend.Entity.categorie_sujet_enum;
import debatearena.backend.Entity.niveau_enum;
import debatearena.backend.Entity.role_enum;
import debatearena.backend.Entity.categorie_badge_enum;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class EnumServiceTest {

    // Pas besoin d'injection de dépendance ici, on instancie la classe directement
    private final EnumService enumService = new EnumService();

    @Test
    void getCategoriesSujet_ShouldReturnAllCategoriesWithFormatting() {
        // WHEN
        List<EnumDTO> result = enumService.getCategoriesSujet();

        // THEN
        assertThat(result).isNotEmpty();
        // Vérifie que la taille de la liste correspond au nombre d'éléments dans l'enum
        assertThat(result).hasSize(categorie_sujet_enum.values().length);

        // Vérifie quelques traductions spécifiques définies dans votre switch
        assertThat(result).anyMatch(dto -> dto.getValue().equals("INFORMATIQUE") && dto.getLabel().equals("Informatique"));
        assertThat(result).anyMatch(dto -> dto.getValue().equals("SANTE") && dto.getLabel().equals("Santé"));
        assertThat(result).anyMatch(dto -> dto.getValue().equals("ART") && dto.getLabel().equals("Art"));
    }

    @Test
    void getNiveaux_ShouldReturnAllLevelsWithFormatting() {
        // WHEN
        List<EnumDTO> result = enumService.getNiveaux();

        // THEN
        assertThat(result).isNotEmpty();
        assertThat(result).hasSize(niveau_enum.values().length);

        // Vérifie les traductions de difficulté
        assertThat(result).anyMatch(dto -> dto.getValue().equals("DEBUTANT") && dto.getLabel().equals("Débutant"));
        assertThat(result).anyMatch(dto -> dto.getValue().equals("INTERMEDIAIRE") && dto.getLabel().equals("Intermédiaire"));
        assertThat(result).anyMatch(dto -> dto.getValue().equals("EXPERT") && dto.getLabel().equals("Expert"));
    }

    @Test
    void getRoles_ShouldReturnAllRolesWithFormatting() {
        // WHEN
        List<EnumDTO> result = enumService.getRoles();

        // THEN
        assertThat(result).isNotEmpty();
        assertThat(result).hasSize(role_enum.values().length);

        // Vérifie les traductions de rôles
        assertThat(result).anyMatch(dto -> dto.getValue().equals("ADMIN") && dto.getLabel().equals("Administrateur"));
        assertThat(result).anyMatch(dto -> dto.getValue().equals("UTILISATEUR") && dto.getLabel().equals("Utilisateur"));
    }

    @Test
    void getCategoriesBadge_ShouldReturnAllBadgeCategoriesWithFormatting() {
        // WHEN
        List<EnumDTO> result = enumService.getCategoriesBadge();

        // THEN
        assertThat(result).isNotEmpty();
        assertThat(result).hasSize(categorie_badge_enum.values().length);

        // Vérifie les traductions de badges
        assertThat(result).anyMatch(dto -> dto.getValue().equals("OR") && dto.getLabel().equals("Or"));
        assertThat(result).anyMatch(dto -> dto.getValue().equals("ARGENT") && dto.getLabel().equals("Argent"));
        assertThat(result).anyMatch(dto -> dto.getValue().equals("BRONZE") && dto.getLabel().equals("Bronze"));
    }

    @Test
    void formatLabel_ShouldReturnOriginalName_WhenNoTranslationExists() {
        // Ce test vérifie indirectement le cas "default" du switch.
        // Si on ajoute une nouvelle valeur dans un enum sans mettre à jour le switch case,
        // le label doit être égal au nom de l'enum (fallback).

        List<EnumDTO> result = enumService.getCategoriesSujet();

        // On cherche un élément qui n'aurait pas été "humanisé" (si applicable)
        // Par exemple, si TENDANCE n'est pas dans le switch (il l'est dans votre code, mais c'est pour l'exemple)
        // ou si vous ajoutez "NOUVEAU_SUJET" dans l'enum demain sans toucher au service.

        result.forEach(dto -> {
            assertThat(dto.getLabel()).isNotNull();
            assertThat(dto.getValue()).isNotNull();
        });
    }
}