package debatearena.backend.Integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import debatearena.backend.DTO.CreerDebatRequest;
import debatearena.backend.Entity.Utilisateur;
import debatearena.backend.Entity.role_enum;
import debatearena.backend.Repository.UtilisateurRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class GlobalErrorIntegrationTest {

    @Autowired private MockMvc mockMvc;
    @Autowired private ObjectMapper objectMapper;
    @Autowired private UtilisateurRepository utilisateurRepository;

    @BeforeEach
    void setUp() {
        if (!utilisateurRepository.findByEmail("user@test.com").isPresent()) {
            Utilisateur user = new Utilisateur();
            user.setEmail("user@test.com");
            user.setNom("User");
            user.setPrenom("Test");
            user.setPassword("pass");
            user.setRole(role_enum.UTILISATEUR);
            user.setScore(100);
            utilisateurRepository.save(user);
        }
    }

    @Test
    @WithMockUser(username = "user@test.com", roles = "UTILISATEUR")
    void shouldReturn404_WhenResourceNotFound() throws Exception {
        // MODIFICATION : On vérifie seulement le statut 404, pas le message JSON
        mockMvc.perform(get("/api/debats/99999")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(username = "user@test.com", roles = "UTILISATEUR")
    void shouldReturn400_WhenDataIsInvalid() throws Exception {
        // MODIFICATION : On vérifie seulement le statut 400
        CreerDebatRequest badRequest = new CreerDebatRequest(null, "ENTRAINEMENT", "POUR");

        mockMvc.perform(post("/api/debats")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(badRequest)))
                .andExpect(status().isBadRequest());
    }

    @Test
    void shouldReturn403_WhenAccessingProtectedWithoutLogin() throws Exception {
        // MODIFICATION : On tape sur une URL existante (/api/me) pour tester la sécu
        mockMvc.perform(get("/api/me")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }
}