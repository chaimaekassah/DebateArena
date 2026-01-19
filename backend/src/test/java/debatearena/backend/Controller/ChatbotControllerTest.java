package debatearena.backend.Controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import debatearena.backend.Service.CustomUtilisateurService;
import debatearena.backend.Service.DebatService;
import debatearena.backend.Security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.HashMap;
import java.util.Map;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(ChatbotController.class)
@AutoConfigureMockMvc(addFilters = false) // Désactive la sécurité pour le test
class ChatbotControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private DebatService debatService;

    // --- Mocks de sécurité (Indispensables pour éviter l'erreur ApplicationContext) ---
    @MockBean private CustomUtilisateurService customUtilisateurService;
    @MockBean private JwtUtil jwtUtil;
    // ---------------------------------------------------------------------------------

    // --- TEST 1 : Vérifier l'état de santé (GET /api/chatbot/health) ---
    @Test
    void getChatbotHealth_ShouldReturnStatus() throws Exception {
        // ARRANGE : On prépare une Map simulée renvoyée par le service
        Map<String, Object> mockStatus = new HashMap<>();
        mockStatus.put("status", "healthy");
        mockStatus.put("service", "chatbot");
        mockStatus.put("active_sessions", 5);

        when(debatService.getChatbotStatus()).thenReturn(mockStatus);

        // ACT & ASSERT
        mockMvc.perform(get("/api/chatbot/health"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("healthy"))
                .andExpect(jsonPath("$.active_sessions").value(5));
    }

    // --- TEST 2 : Tester le chatbot (POST /api/chatbot/test) ---
    @Test
    void testChatbot_ShouldReturnResponse() throws Exception {
        // ARRANGE
        // 1. Préparation de la requête (ce qu'on envoie)
        Map<String, String> requestBody = new HashMap<>();
        requestBody.put("message", "Bonjour bot");

        // 2. Préparation de la réponse simulée du service
        String mockServiceResponse = "Bonjour humain, prêt à débattre !";
        when(debatService.testerChatbot("Bonjour bot")).thenReturn(mockServiceResponse);

        // ACT & ASSERT
        mockMvc.perform(post("/api/chatbot/test")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(requestBody)))
                .andExpect(status().isOk())
                // Vérifie que le résultat du test correspond à ce que le service a renvoyé
                .andExpect(jsonPath("$.test_result").value(mockServiceResponse))
                // Vérifie juste que le timestamp existe (impossible de vérifier l'heure exacte)
                .andExpect(jsonPath("$.timestamp").exists());
    }
}