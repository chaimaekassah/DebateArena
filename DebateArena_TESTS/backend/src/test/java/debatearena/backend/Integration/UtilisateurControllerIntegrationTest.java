package debatearena.backend.Integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import debatearena.backend.Entity.Debat;
import debatearena.backend.Entity.Sujet;
import debatearena.backend.Entity.Utilisateur;
import debatearena.backend.Entity.categorie_sujet_enum;
import debatearena.backend.Entity.niveau_enum;
import debatearena.backend.Entity.role_enum;
import debatearena.backend.Repository.DebatRepository;
import debatearena.backend.Repository.SujetRepository;
import debatearena.backend.Repository.UtilisateurRepository;
import debatearena.backend.Utils.ImageStorageService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpMethod;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class UtilisateurControllerIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;

    @Autowired private UtilisateurRepository utilisateurRepository;
    @Autowired private DebatRepository debatRepository;
    @Autowired private SujetRepository sujetRepository;

    @MockBean private ImageStorageService imageStorageService;

    private Utilisateur currentUser;

    @BeforeEach
    void setUp() {
        debatRepository.deleteAll();
        sujetRepository.deleteAll();
        utilisateurRepository.deleteAll();

        // 1. Création de l'utilisateur
        currentUser = new Utilisateur();
        currentUser.setEmail("user@test.com");
        currentUser.setNom("Doe");
        currentUser.setPrenom("John");
        currentUser.setPassword("pass");
        currentUser.setRole(role_enum.UTILISATEUR);
        currentUser.setScore(250); // Niveau INTERMEDIAIRE
        currentUser = utilisateurRepository.save(currentUser);

        // 2. Sujet
        Sujet sujet = new Sujet();
        sujet.setTitre("Sujet Test");
        sujet.setCategorie(categorie_sujet_enum.INFORMATIQUE);
        sujet.setDifficulte(niveau_enum.DEBUTANT);
        sujetRepository.save(sujet);

        // 3. Débat pour le Dashboard
        Debat debat = new Debat();
        debat.setUtilisateur(currentUser);
        debat.setSujet(sujet);
        debat.setChoixUtilisateur("POUR");
        debat.setDateDebut(LocalDateTime.now());
        debatRepository.save(debat);
    }

    @Test
    @WithMockUser(username = "user@test.com", roles = "UTILISATEUR")
    void getDashboard_ShouldReturnCorrectStats() throws Exception {
        // CORRECTION URL : /api/dashboard
        mockMvc.perform(get("/api/dashboard")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.score", is(250)))
                .andExpect(jsonPath("$.niveau", is("INTERMEDIAIRE")))
                .andExpect(jsonPath("$.totalDebats", is(1)));
    }

    @Test
    @WithMockUser(username = "user@test.com", roles = "UTILISATEUR")
    void getMyProfile_ShouldReturnUserInfo() throws Exception {
        // CORRECTION URL : /api/me
        mockMvc.perform(get("/api/me")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email", is("user@test.com")))
                .andExpect(jsonPath("$.nom", is("Doe")));
    }

    @Test
    @WithMockUser(username = "user@test.com", roles = "UTILISATEUR")
    void updateProfile_ShouldUpdateName() throws Exception {
        // ATTENTION TECHNIQUE :
        // Votre contrôleur utilise @ModelAttribute, donc il ne comprend pas le JSON.
        // Il attend des paramètres de formulaire (form-data).
        // De plus, pour simuler un PUT avec des fichiers/params, il faut une astuce avec MockMvc.

        MockMultipartFile emptyFile = new MockMultipartFile("image", new byte[0]);

        mockMvc.perform(multipart("/api/me")
                        .file(emptyFile) // Nécessaire si le DTO attend un MultipartFile, même vide
                        .param("nom", "Smith") // Envoi comme paramètre de formulaire
                        .param("prenom", "Agent")
                        .with(request -> {
                            request.setMethod("PUT"); // On force la méthode PUT (car multipart est POST par défaut)
                            return request;
                        }))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nom", is("Smith")))
                .andExpect(jsonPath("$.prenom", is("Agent")));
    }

    @Test
    void getDashboard_ShouldFail_WhenNotAuthenticated() throws Exception {
        mockMvc.perform(get("/api/dashboard")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }
}