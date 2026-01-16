package debatearena.backend.Controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import debatearena.backend.DTO.*;
import debatearena.backend.Service.CustomUtilisateurService;
import debatearena.backend.Service.DebatService;
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

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(DebatController.class)
@AutoConfigureMockMvc(addFilters = false)
class DebatControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private DebatService debatService;

    // Mocks de sécurité obligatoires pour éviter l'erreur ApplicationContext
    @MockBean
    private CustomUtilisateurService customUtilisateurService;
    @MockBean
    private JwtUtil jwtUtil;

    private DebatResponse debatResponse;
    private MessageResponse messageResponse;

    @BeforeEach
    void setUp() {
        // 1. Création de l'objet SujetResponse (requis par DebatResponse)
        // Adaptez les arguments selon votre constructeur SujetResponse existant
        SujetResponse sujet = new SujetResponse(
                100L,
                "Java vs Python",
                "Informatique",
                "Facile",
                true
        );

        // 2. Création de DebatResponse
        debatResponse = new DebatResponse();
        debatResponse.setId(1L);

        // CORRECTION 1 : setSujet prend un objet SujetResponse, pas un String
        debatResponse.setSujet(sujet);

        // CORRECTION 2 : La méthode dans votre DTO est setStatus (avec 's')
        debatResponse.setStatus("EN_COURS");

        messageResponse = new MessageResponse();
        messageResponse.setId(10L);
        messageResponse.setContenu("Ceci est un argument.");
    }

    // --- TEST 1 : Créer un débat (POST) ---
    @Test
    void creerDebat_ShouldReturn200() throws Exception {
        // ARRANGE
        CreerDebatRequest request = new CreerDebatRequest();

        // CORRECTION 3 : Dans votre DTO, c'est sujetId (Long)
        request.setSujetId(100L);

        // Ajout des champs obligatoires pour respecter votre backend
        request.setType("ENTRAINEMENT");
        request.setChoix("POUR");

        when(debatService.creerDebat(any(CreerDebatRequest.class))).thenReturn(debatResponse);

        // ACT & ASSERT
        mockMvc.perform(post("/api/debats")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(1L))
                // On vérifie le titre à l'intérieur de l'objet sujet
                .andExpect(jsonPath("$.sujet.titre").value("Java vs Python"))
                // On vérifie le status (nom du champ dans votre DTO JSON)
                .andExpect(jsonPath("$.status").value("EN_COURS"));
    }

    // --- TEST 2 : Récupérer un débat (GET) ---
    @Test
    void getDebat_ShouldReturnDebat() throws Exception {
        when(debatService.getDebat(1L)).thenReturn(debatResponse);

        mockMvc.perform(get("/api/debats/{debatId}", 1L))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.sujet.titre").value("Java vs Python"));
    }

    // --- TEST 3 : Envoyer un message ---
    @Test
    void envoyerMessage_ShouldReturnMessage() throws Exception {
        MessageRequest request = new MessageRequest();
        request.setContenu("Ceci est un argument.");

        when(debatService.envoyerMessage(eq(1L), any(MessageRequest.class))).thenReturn(messageResponse);

        mockMvc.perform(post("/api/debats/{debatId}/messages", 1L)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.contenu").value("Ceci est un argument."));
    }

    // --- TEST 4 : Récupérer une liste de débats ---
    @Test
    void getDebatsEnCours_ShouldReturnList() throws Exception {
        List<DebatResponse> liste = Arrays.asList(debatResponse);
        when(debatService.getDebatsEnCours()).thenReturn(liste);

        mockMvc.perform(get("/api/debats/en-cours"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].sujet.titre").value("Java vs Python"))
                .andExpect(jsonPath("$.length()").value(1));
    }

    // --- TEST 5 : Annuler un débat ---
    @Test
    void annulerDebat_ShouldReturnNoContent() throws Exception {
        doNothing().when(debatService).annulerDebat(1L);

        mockMvc.perform(delete("/api/debats/{debatId}", 1L))
                .andExpect(status().isNoContent());
    }
}