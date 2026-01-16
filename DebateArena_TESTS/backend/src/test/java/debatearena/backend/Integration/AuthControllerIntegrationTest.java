package debatearena.backend.Integration;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType; // Import nécessaire
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

// IMPORTANT : On change 'post' par 'multipart'
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void signup_shouldWork_withFullSpringContext() throws Exception {
        // CORRECTION : Utilisation de .param() au lieu de JSON string
        mockMvc.perform(multipart("/api/auth/signup")
                        .param("nom", "Integration")
                        .param("prenom", "Test")
                        .param("email", "integration@test.com")
                        .param("password", "123456")
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk());
    }
}