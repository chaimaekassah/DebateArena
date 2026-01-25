package debatearena.backend.Controller;

import debatearena.backend.DTO.EnumDTO;
import debatearena.backend.Service.CustomUtilisateurService;
import debatearena.backend.Service.EnumService;
import debatearena.backend.Security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.List;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(EnumController.class)
public class EnumControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private EnumService enumService;

    // --- DEPENDANCES DE SECURITÉ (OBLIGATOIRES POUR QUE LE CONTEXTE CHARGE) ---
    @MockBean
    private CustomUtilisateurService customUtilisateurService;

    @MockBean
    private JwtUtil jwtUtil;
    // --------------------------------------------------------------------------

    @Test
    @WithMockUser // On simule un utilisateur connecté (n'importe lequel)
    void getCategoriesSujet_ShouldReturnList() throws Exception {
        // Arrange
        // Note: J'assume que EnumDTO a un constructeur ou des setters.
        // Adapte selon ton DTO réel.
        EnumDTO cat1 = new EnumDTO();
        // cat1.setLabel("TECHNOLOGIE");

        List<EnumDTO> mockList = Arrays.asList(cat1);

        when(enumService.getCategoriesSujet()).thenReturn(mockList);

        // Act & Assert
        mockMvc.perform(get("/api/enums/categories-sujet"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser
    void getNiveaux_ShouldReturnList() throws Exception {
        // Arrange
        EnumDTO niv1 = new EnumDTO();
        List<EnumDTO> mockList = Arrays.asList(niv1);

        when(enumService.getNiveaux()).thenReturn(mockList);

        // Act & Assert
        mockMvc.perform(get("/api/enums/niveaux"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser
    void getRoles_ShouldReturnList() throws Exception {
        // Arrange
        EnumDTO role1 = new EnumDTO();
        EnumDTO role2 = new EnumDTO();
        List<EnumDTO> mockList = Arrays.asList(role1, role2);

        when(enumService.getRoles()).thenReturn(mockList);

        // Act & Assert
        mockMvc.perform(get("/api/enums/roles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    @WithMockUser
    void getCategoriesBadge_ShouldReturnList() throws Exception {
        // Arrange
        EnumDTO badgeCat = new EnumDTO();
        List<EnumDTO> mockList = Arrays.asList(badgeCat);

        when(enumService.getCategoriesBadge()).thenReturn(mockList);

        // Act & Assert
        mockMvc.perform(get("/api/enums/categories-badge"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    @WithMockUser
    void healthCheck_ShouldReturnString() throws Exception {
        // Pas besoin de mocker le service ici car le contrôleur renvoie une String statique

        // Act & Assert
        mockMvc.perform(get("/api/enums/health"))
                .andExpect(status().isOk())
                .andExpect(content().string("Service des énumérations actif"));
    }
}