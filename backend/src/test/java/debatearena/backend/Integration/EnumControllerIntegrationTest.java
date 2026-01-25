package debatearena.backend.Controller;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
// Si vous avez un profil de test, activez-le, sinon ce n'est pas grave pour ce test spécifique qui n'utilise pas la BDD
@ActiveProfiles("test")
public class EnumControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @WithMockUser // <--- AJOUTEZ CECI : Simule un utilisateur connecté quelconque
    void getCategoriesSujet_ShouldReturnList() throws Exception {
        mockMvc.perform(get("/api/enums/categories-sujet")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].value").exists())
                .andExpect(jsonPath("$[0].label").exists());
    }

    @Test
    @WithMockUser // <--- AJOUTEZ CECI AUSSI
    void getNiveaux_ShouldReturnList() throws Exception {
        mockMvc.perform(get("/api/enums/niveaux")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}