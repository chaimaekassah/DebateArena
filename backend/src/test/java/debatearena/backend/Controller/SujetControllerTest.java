package debatearena.backend.Controller;

import debatearena.backend.DTO.SujetResponse;
import debatearena.backend.Service.CustomUtilisateurService;
import debatearena.backend.Service.SujetService;
import debatearena.backend.Security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

// --- CORRECTION 1 : Ajout de l'import Hamcrest pour containsString ---
import static org.hamcrest.Matchers.containsString;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(SujetController.class)
@AutoConfigureMockMvc(addFilters = false)
class SujetControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SujetService sujetService;

    // Mocks de sécurité nécessaires pour éviter l'erreur ApplicationContext
    @MockBean
    private CustomUtilisateurService customUtilisateurService;
    @MockBean
    private JwtUtil jwtUtil;

    private SujetResponse sujetResponse;

    @BeforeEach
    void setUp() {
        sujetResponse = new SujetResponse(
                1L,
                "L'intelligence artificielle est-elle dangereuse ?",
                "TECHNOLOGIE",
                "INTERMEDIAIRE",
                true
        );
    }

    @Test
    void getAllSujets_ShouldReturnList() throws Exception {
        List<SujetResponse> liste = Arrays.asList(sujetResponse);
        when(sujetService.getAllSujets()).thenReturn(liste);

        mockMvc.perform(get("/api/sujets")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].titre").value("L'intelligence artificielle est-elle dangereuse ?"))
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void getSujetById_ShouldReturnSujet() throws Exception {
        when(sujetService.getSujetById(1L)).thenReturn(sujetResponse);

        mockMvc.perform(get("/api/sujets/{id}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                .andExpect(jsonPath("$.categorie").value("TECHNOLOGIE"));
    }

    @Test
    void filtrerSujets_ShouldReturnFilteredList() throws Exception {
        List<SujetResponse> liste = Arrays.asList(sujetResponse);
        when(sujetService.getSujetsFiltres("TECHNOLOGIE", "INTERMEDIAIRE")).thenReturn(liste);

        mockMvc.perform(get("/api/sujets/filtrer")
                        .param("categorie", "TECHNOLOGIE")
                        .param("difficulte", "INTERMEDIAIRE"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].categorie").value("TECHNOLOGIE"));
    }

    @Test
    void rechercherSujets_ShouldReturnMatchingList() throws Exception {
        List<SujetResponse> liste = Arrays.asList(sujetResponse);
        when(sujetService.searchSujets("intelligence")).thenReturn(liste);

        mockMvc.perform(get("/api/sujets/rechercher")
                        .param("q", "intelligence"))
                .andExpect(status().isOk())
                // --- CORRECTION 2 : Utilisation de value(containsString(...)) ---
                .andExpect(jsonPath("$[0].titre").value(containsString("intelligence")));
    }

    @Test
    void getSujetsRecommandes_ShouldReturnList() throws Exception {
        List<SujetResponse> liste = Arrays.asList(sujetResponse);
        when(sujetService.getSujetsRecommandes()).thenReturn(liste);

        mockMvc.perform(get("/api/sujets/recommandes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].accessible").value(true));
    }

    @Test
    void getAllCategories_ShouldReturnStringList() throws Exception {
        List<String> categories = Arrays.asList("TECHNOLOGIE", "SOCIETE", "ART");
        when(sujetService.getAllCategories()).thenReturn(categories);

        mockMvc.perform(get("/api/sujets/categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0]").value("TECHNOLOGIE"))
                .andExpect(jsonPath("$.length()").value(3));
    }

    @Test
    void getAllDifficultes_ShouldReturnStringList() throws Exception {
        List<String> difficultes = Arrays.asList("DEBUTANT", "INTERMEDIAIRE", "AVANCE");
        when(sujetService.getAllDifficultes()).thenReturn(difficultes);

        mockMvc.perform(get("/api/sujets/difficultes"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[1]").value("INTERMEDIAIRE"))
                .andExpect(jsonPath("$.length()").value(3));
    }
}