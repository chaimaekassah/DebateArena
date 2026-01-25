package debatearena.backend.Controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import debatearena.backend.DTO.*;
import debatearena.backend.Service.AdminService;
import debatearena.backend.Service.CustomUtilisateurService;
import debatearena.backend.Security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.context.TestConfiguration; // <--- IMPORT AJOUTÉ
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import; // <--- IMPORT AJOUTÉ
import org.springframework.http.MediaType;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity; // <--- IMPORT AJOUTÉ
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(AdminController.class)
@Import(AdminControllerTest.TestSecurityConfig.class) // <--- ON IMPORTE LA CONFIG ICI
public class AdminControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AdminService adminService;

    @MockBean
    private CustomUtilisateurService customUtilisateurService;

    @MockBean
    private JwtUtil jwtUtil;

    @Autowired
    private ObjectMapper objectMapper;

    // --- C'EST ICI QUE LA MAGIE OPÈRE ---
    // Cette petite config force l'activation de @PreAuthorize pour ce test
    @TestConfiguration
    @EnableMethodSecurity(prePostEnabled = true)
    static class TestSecurityConfig {
    }
    // ------------------------------------

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void getAdminProfile_ShouldReturnProfile_WhenAuthorized() throws Exception {
        AdminProfileResponse mockResponse = new AdminProfileResponse();
        when(adminService.getAdminProfile()).thenReturn(mockResponse);

        mockMvc.perform(get("/api/admin/profile"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void getDashboard_ShouldReturnStats() throws Exception {
        DashboardAdminResponse mockResponse = new DashboardAdminResponse();
        when(adminService.getDashboardStats()).thenReturn(mockResponse);

        mockMvc.perform(get("/api/admin/dashboard"))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "user", roles = {"USER"})
    void getDashboard_ShouldReturnForbidden_WhenNotAdmin() throws Exception {
        // Maintenant que @EnableMethodSecurity est actif, ceci va renvoyer 403 comme prévu
        mockMvc.perform(get("/api/admin/dashboard"))
                .andExpect(status().isForbidden());
    }

    // ... Le reste de tes tests (creerSujet, etc.) reste identique ...
    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void creerSujet_ShouldReturnCreatedSujet() throws Exception {
        CreateSujetRequest request = new CreateSujetRequest();
        SujetResponse response = new SujetResponse();
        when(adminService.creerSujet(any(CreateSujetRequest.class))).thenReturn(response);

        mockMvc.perform(post("/api/admin/sujets")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void updateSujet_ShouldReturnUpdatedSujet() throws Exception {
        Long sujetId = 1L;
        UpdateSujetRequest request = new UpdateSujetRequest();
        SujetResponse response = new SujetResponse();
        when(adminService.updateSujet(eq(sujetId), any(UpdateSujetRequest.class))).thenReturn(response);

        mockMvc.perform(put("/api/admin/sujets/{sujetId}", sujetId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void deleteSujet_ShouldReturnNoContent() throws Exception {
        Long sujetId = 1L;
        doNothing().when(adminService).deleteSujet(sujetId);

        mockMvc.perform(delete("/api/admin/sujets/{sujetId}", sujetId)
                        .with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void getAllSignalements_ShouldReturnList() throws Exception {
        SignalementResponse s1 = new SignalementResponse();
        SignalementResponse s2 = new SignalementResponse();
        List<SignalementResponse> mockList = Arrays.asList(s1, s2);
        when(adminService.getAllSignalements(null, null)).thenReturn(mockList);

        mockMvc.perform(get("/api/admin/signalements"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void getAllSignalements_WithFilters_ShouldReturnFilteredList() throws Exception {
        String statut = "EN_ATTENTE";
        when(adminService.getAllSignalements(eq(statut), any())).thenReturn(Collections.emptyList());

        mockMvc.perform(get("/api/admin/signalements")
                        .param("statut", statut))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    @WithMockUser(username = "admin", roles = {"ADMIN"})
    void traiterSignalement_ShouldReturnUpdatedSignalement() throws Exception {
        Long signalementId = 10L;
        TraiterSignalementRequest request = new TraiterSignalementRequest();
        SignalementResponse response = new SignalementResponse();
        when(adminService.traiterSignalement(eq(signalementId), any(TraiterSignalementRequest.class)))
                .thenReturn(response);

        mockMvc.perform(put("/api/admin/signalements/{signalementId}", signalementId)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }
}