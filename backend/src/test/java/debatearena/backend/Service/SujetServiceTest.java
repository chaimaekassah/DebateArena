package debatearena.backend.Service;

import debatearena.backend.DTO.SujetResponse;
import debatearena.backend.Entity.Sujet;
import debatearena.backend.Entity.Utilisateur;
import debatearena.backend.Entity.categorie_sujet_enum;
import debatearena.backend.Entity.niveau_enum;
import debatearena.backend.Repository.SujetRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class SujetServiceTest {

    @Mock
    private SujetRepository sujetRepository;

    @Mock
    private UtilisateurService utilisateurService;

    @InjectMocks
    private SujetService sujetService;

    private Utilisateur utilisateurDebutant;
    private Utilisateur utilisateurExpert;
    private Sujet sujetDebutant;
    private Sujet sujetExpert;

    @BeforeEach
    void setUp() {
        // --- Utilisateur Débutant (Score < 200) ---
        utilisateurDebutant = new Utilisateur();
        utilisateurDebutant.setId(1L);
        utilisateurDebutant.setScore(100); // Niveau DEBUTANT

        // --- Utilisateur Expert (Score >= 1000) ---
        utilisateurExpert = new Utilisateur();
        utilisateurExpert.setId(2L);
        utilisateurExpert.setScore(1200); // Niveau EXPERT

        // --- Sujet Facile ---
        sujetDebutant = new Sujet();
        sujetDebutant.setId(10L);
        sujetDebutant.setTitre("HTML Basics");
        sujetDebutant.setCategorie(categorie_sujet_enum.INFORMATIQUE);
        sujetDebutant.setDifficulte(niveau_enum.DEBUTANT);

        // --- Sujet Difficile ---
        sujetExpert = new Sujet();
        sujetExpert.setId(20L);
        sujetExpert.setTitre("Quantum Physics");
        sujetExpert.setCategorie(categorie_sujet_enum.SANTE);
        sujetExpert.setDifficulte(niveau_enum.EXPERT);
    }

    // ==========================================
    // TESTS : getAllSujets
    // ==========================================

    @Test
    void getAllSujets_ShouldReturnMappedResponses() {
        // ARRANGE
        when(utilisateurService.getCurrentUser()).thenReturn(utilisateurDebutant);
        when(sujetRepository.findAll()).thenReturn(Arrays.asList(sujetDebutant, sujetExpert));

        // ACT
        List<SujetResponse> result = sujetService.getAllSujets();

        // ASSERT
        assertThat(result).hasSize(2);

        // Vérification de l'accessibilité pour un débutant
        // Sujet Débutant -> Accessible
        assertThat(result.stream().filter(s -> s.getId().equals(10L)).findFirst().get().isAccessible()).isTrue();
        // Sujet Expert -> Non Accessible
        assertThat(result.stream().filter(s -> s.getId().equals(20L)).findFirst().get().isAccessible()).isFalse();
    }

    // ==========================================
    // TESTS : getSujetById
    // ==========================================

    @Test
    void getSujetById_ShouldReturnSujet_WhenFound() {
        // ARRANGE
        when(utilisateurService.getCurrentUser()).thenReturn(utilisateurDebutant);
        when(sujetRepository.findById(10L)).thenReturn(Optional.of(sujetDebutant));

        // ACT
        SujetResponse response = sujetService.getSujetById(10L);

        // ASSERT
        assertThat(response.getTitre()).isEqualTo("HTML Basics");
        assertThat(response.isAccessible()).isTrue();
    }

    @Test
    void getSujetById_ShouldThrowException_WhenNotFound() {
        when(sujetRepository.findById(99L)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class, () -> sujetService.getSujetById(99L));
    }

    // ==========================================
    // TESTS : getSujetsFiltres (Logique combinatoire)
    // ==========================================

    @Test
    void getSujetsFiltres_ShouldFilterByCategoryAndDifficulty() {
        // ARRANGE
        when(utilisateurService.getCurrentUser()).thenReturn(utilisateurDebutant);
        when(sujetRepository.findByCategorieAndDifficulte(categorie_sujet_enum.INFORMATIQUE, niveau_enum.DEBUTANT))
                .thenReturn(Collections.singletonList(sujetDebutant));

        // ACT
        List<SujetResponse> result = sujetService.getSujetsFiltres("INFORMATIQUE", "DEBUTANT");

        // ASSERT
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getTitre()).isEqualTo("HTML Basics");
    }

    @Test
    void getSujetsFiltres_ShouldFilterByCategoryOnly() {
        // ARRANGE
        when(utilisateurService.getCurrentUser()).thenReturn(utilisateurDebutant);
        when(sujetRepository.findByCategorie(categorie_sujet_enum.INFORMATIQUE))
                .thenReturn(Collections.singletonList(sujetDebutant));

        // ACT
        List<SujetResponse> result = sujetService.getSujetsFiltres("INFORMATIQUE", null);

        // ASSERT
        assertThat(result).hasSize(1);
    }

    @Test
    void getSujetsFiltres_ShouldReturnAll_WhenNoFilters() {
        // ARRANGE
        // CORRECTION ICI : On utilise un EXPERT pour qu'il puisse tout voir
        // (car votre service filtre les sujets inaccessibles)
        when(utilisateurService.getCurrentUser()).thenReturn(utilisateurExpert);
        when(sujetRepository.findAll()).thenReturn(Arrays.asList(sujetDebutant, sujetExpert));

        // ACT
        List<SujetResponse> result = sujetService.getSujetsFiltres(null, null);

        // ASSERT
        // Maintenant ça doit être 2 car l'expert voit tout
        assertThat(result).hasSize(2);
    }

    // ==========================================
    // TESTS : getSujetsRecommandes
    // ==========================================

    @Test
    void getSujetsRecommandes_ShouldFilterOutInaccessibleSubjects_ForBeginner() {
        // ARRANGE
        // L'utilisateur est DÉBUTANT (score 100)
        when(utilisateurService.getCurrentUser()).thenReturn(utilisateurDebutant);
        // Le repo renvoie TOUT (facile et expert)
        when(sujetRepository.findAll()).thenReturn(Arrays.asList(sujetDebutant, sujetExpert));

        // ACT
        List<SujetResponse> result = sujetService.getSujetsRecommandes();

        // ASSERT
        // Le service ne doit renvoyer QUE le sujet accessible (le débutant)
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getId()).isEqualTo(10L); // HTML Basics
        assertThat(result.get(0).isAccessible()).isTrue();
    }

    @Test
    void getSujetsRecommandes_ShouldReturnAll_ForExpert() {
        // ARRANGE
        // L'utilisateur est EXPERT (score 1200)
        when(utilisateurService.getCurrentUser()).thenReturn(utilisateurExpert);
        when(sujetRepository.findAll()).thenReturn(Arrays.asList(sujetDebutant, sujetExpert));

        // ACT
        List<SujetResponse> result = sujetService.getSujetsRecommandes();

        // ASSERT
        // L'expert voit tout
        assertThat(result).hasSize(2);
    }

    // ==========================================
    // TESTS : peutAccederAuSujet
    // ==========================================

    @Test
    void peutAccederAuSujet_ShouldReturnFalse_WhenBeginnerTriesExpert() {
        when(utilisateurService.getCurrentUser()).thenReturn(utilisateurDebutant);
        when(sujetRepository.findById(20L)).thenReturn(Optional.of(sujetExpert));

        boolean access = sujetService.peutAccederAuSujet(20L);

        assertThat(access).isFalse();
    }

    @Test
    void peutAccederAuSujet_ShouldReturnTrue_WhenExpertTriesBeginner() {
        when(utilisateurService.getCurrentUser()).thenReturn(utilisateurExpert);
        when(sujetRepository.findById(10L)).thenReturn(Optional.of(sujetDebutant));

        boolean access = sujetService.peutAccederAuSujet(10L);

        assertThat(access).isTrue();
    }

    // ==========================================
    // TESTS : Search & Listes
    // ==========================================

    @Test
    void searchSujets_ShouldCallRepo() {
        when(utilisateurService.getCurrentUser()).thenReturn(utilisateurDebutant);
        when(sujetRepository.findByTitreContainingIgnoreCase("HTML"))
                .thenReturn(Collections.singletonList(sujetDebutant));

        List<SujetResponse> result = sujetService.searchSujets("HTML");

        assertThat(result).hasSize(1);
    }

    @Test
    void getAllCategories_ShouldReturnEnums() {
        List<String> cats = sujetService.getAllCategories();
        assertThat(cats).contains("INFORMATIQUE");
    }
}