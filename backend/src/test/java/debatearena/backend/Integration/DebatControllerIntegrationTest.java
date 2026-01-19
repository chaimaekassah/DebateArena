package debatearena.backend.Integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import debatearena.backend.Client.ChatbotClient;
import debatearena.backend.DTO.CreerDebatRequest;
import debatearena.backend.Entity.Sujet;
import debatearena.backend.Entity.Utilisateur;
import debatearena.backend.Entity.categorie_sujet_enum;
import debatearena.backend.Entity.niveau_enum;
import debatearena.backend.Entity.role_enum;
import debatearena.backend.Repository.DebatRepository;
import debatearena.backend.Repository.SujetRepository;
import debatearena.backend.Repository.UtilisateurRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class DebatControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @Autowired private UtilisateurRepository utilisateurRepository;
    @Autowired private SujetRepository sujetRepository;
    @Autowired private DebatRepository debatRepository;

    // On mocke le client Chatbot pour éviter les appels externes
    @MockBean private ChatbotClient chatbotClient;

    private Sujet sujetTest;

    @BeforeEach
    void setUp() {
        // 1. Nettoyage de la base (Ordre important pour les clés étrangères)
        debatRepository.deleteAll();
        sujetRepository.deleteAll();
        utilisateurRepository.deleteAll();

        // 2. Création de l'utilisateur standard (Pour @WithMockUser)
        Utilisateur user = new Utilisateur();
        user.setEmail("user@test.com");
        user.setNom("User");
        user.setPrenom("Test");
        user.setPassword("pass");
        user.setRole(role_enum.UTILISATEUR);
        user.setScore(100);
        utilisateurRepository.save(user);

        // 3. Création de l'utilisateur CHATBOT (Obligatoire pour que le Service fonctionne)
        Utilisateur bot = new Utilisateur();
        bot.setEmail("chatbot@system");
        bot.setRole(role_enum.CHATBOT);
        bot.setNom("Chatbot");
        bot.setPrenom("IA"); // IMPORTANT : Prénom non null
        bot.setPassword("x");
        utilisateurRepository.save(bot);

        // 4. Création d'un sujet de débat
        sujetTest = new Sujet();
        sujetTest.setTitre("Sujet Integration");
        sujetTest.setCategorie(categorie_sujet_enum.INFORMATIQUE);
        sujetTest.setDifficulte(niveau_enum.DEBUTANT);
        sujetTest = sujetRepository.save(sujetTest);
    }

    @Test
    @WithMockUser(username = "user@test.com", roles = "UTILISATEUR")
    void creerDebat_ShouldWork_WhenAuthenticated() throws Exception {
        // ARRANGE
        CreerDebatRequest request = new CreerDebatRequest(sujetTest.getId(), "ENTRAINEMENT", "POUR");

        // ACT & ASSERT
        // CORRECTION MAJEURE ICI : URL "/api/debats" au lieu de "/api/debats/creer"
        mockMvc.perform(post("/api/debats")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.type", is("ENTRAINEMENT")))
                .andExpect(jsonPath("$.status", is("EN_COURS")));
    }

    @Test
    void creerDebat_ShouldFail_WhenNotAuthenticated() throws Exception {
        // ARRANGE
        CreerDebatRequest request = new CreerDebatRequest(sujetTest.getId(), "ENTRAINEMENT", "POUR");

        // ACT & ASSERT
        // CORRECTION ICI AUSSI : URL "/api/debats"
        mockMvc.perform(post("/api/debats")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isForbidden()); // 403 Forbidden (ou 401 selon config)
    }
}