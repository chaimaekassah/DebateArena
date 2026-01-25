package debatearena.backend.Controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import debatearena.backend.DTO.CreateSignalementRequest;
import debatearena.backend.DTO.SignalementResponse;
import debatearena.backend.Service.CustomUtilisateurService;
import debatearena.backend.Service.SignalementService;
import debatearena.backend.Security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(SignalementController.class)
@Import(SignalementControllerTest.TestSecurityConfig.class) // Import de la config de sécurité locale
public class SignalementControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private SignalementService signalementService;

    // --- MOCKS DE SÉCURITÉ OBLIGATOIRES ---
    @MockBean
    private CustomUtilisateurService customUtilisateurService;

    @MockBean
    private JwtUtil jwtUtil;
    // --------------------------------------

    @Autowired
    private ObjectMapper objectMapper;

    // Configuration pour activer @PreAuthorize dans le test
    @TestConfiguration
    @EnableMethodSecurity(prePostEnabled = true)
    static class TestSecurityConfig {
    }

    @Test
    @WithMockUser // Simule un utilisateur connecté (n'importe lequel)
    void creerSignalement_ShouldReturnCreatedSignalement() throws Exception {
        // Arrange
        CreateSignalementRequest request = new CreateSignalementRequest();
        // request.setMotif("Contenu inapproprié");

        SignalementResponse response = new SignalementResponse();
        // response.setId(1L);

        when(signalementService.creerSignalement(any(CreateSignalementRequest.class)))
                .thenReturn(response);

        // Act & Assert
        mockMvc.perform(post("/api/signalements")
                        .with(csrf()) // Obligatoire pour POST
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
        //.andExpect(jsonPath("$.id").value(1L)); // Décommenter si le DTO a un ID
    }

    @Test
    @WithMockUser
    void getMesSignalements_ShouldReturnList() throws Exception {
        // Arrange
        SignalementResponse sig1 = new SignalementResponse();
        List<SignalementResponse> mockList = Arrays.asList(sig1);

        when(signalementService.getMesSignalements()).thenReturn(mockList);

        // Act & Assert
        mockMvc.perform(get("/api/signalements/mes-signalements"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser
    void getSignalement_ShouldReturnDetail() throws Exception {
        // Arrange
        Long signalementId = 1L;
        SignalementResponse response = new SignalementResponse();
        // response.setId(signalementId);

        when(signalementService.getSignalement(signalementId)).thenReturn(response);

        // Act & Assert
        mockMvc.perform(get("/api/signalements/{signalementId}", signalementId))
                .andExpect(status().isOk());
    }

    @Test
        // Pas de @WithMockUser ici pour tester le cas non authentifié
    void getMesSignalements_ShouldReturnUnauthorized_WhenNotLoggedIn() throws Exception {
        // Act & Assert
        mockMvc.perform(get("/api/signalements/mes-signalements"))
                .andExpect(status().isUnauthorized()); // 401
    }
}