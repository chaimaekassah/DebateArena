package debatearena.backend.Security;

import debatearena.backend.DTO.SignInRequest;
import debatearena.backend.Repository.DebatRepository; // <--- IMPORT AJOUTÉ
import debatearena.backend.Repository.UtilisateurRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SecurityConfigIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    // --- AJOUT : On a besoin de ce repository pour nettoyer la base ---
    @Autowired
    private DebatRepository debatRepository;

    @BeforeEach
    void setUp() {
        // --- CORRECTION : Ordre de nettoyage inverse ---
        // 1. D'abord on supprime les enfants (Débats) qui pointent vers les utilisateurs
        debatRepository.deleteAll();

        // 2. Ensuite on peut supprimer les parents (Utilisateurs) sans erreur
        utilisateurRepository.deleteAll();
    }

    @Test
    void unauthenticatedUser_cannotAccessProtectedEndpoint() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard"))
                .andExpect(status().isForbidden());
    }

    @Test
    void authenticatedUser_canAccessProtectedEndpoint_withJWT() throws Exception {
        // 1️⃣ Signup
        mockMvc.perform(multipart("/api/auth/signup")
                        .param("nom", "Doe")
                        .param("prenom", "John")
                        .param("email", "admin@test.com")
                        .param("password", "password123")
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk());

        // 2️⃣ Signin
        SignInRequest signin = new SignInRequest();
        signin.setEmail("admin@test.com");
        signin.setPassword("password123");

        String response = mockMvc.perform(post("/api/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(signin)))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();

        // Extraire le token
        String token = objectMapper.readTree(response).get("token").asText();

        // 3️⃣ Test d'accès
        mockMvc.perform(get("/api/admin/dashboard")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isForbidden());
    }
}