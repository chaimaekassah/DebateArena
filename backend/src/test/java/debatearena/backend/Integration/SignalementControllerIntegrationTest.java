package debatearena.backend.Integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import debatearena.backend.DTO.CreateSignalementRequest;
import debatearena.backend.Entity.Utilisateur;
import debatearena.backend.Entity.role_enum;
import debatearena.backend.Repository.UtilisateurRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.util.TestPropertyValues;
import org.springframework.context.ApplicationContextInitializer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
// On utilise l'initializer pour forcer la config H2 et le Dialecte AVANT le démarrage d'Hibernate
@ContextConfiguration(initializers = SignalementControllerIntegrationTest.TestDbInitializer.class)
public class SignalementControllerIntegrationTest {

    // --- INITIALIZER DE CONFIGURATION ---
    public static class TestDbInitializer implements ApplicationContextInitializer<ConfigurableApplicationContext> {
        @Override
        public void initialize(ConfigurableApplicationContext applicationContext) {
            TestPropertyValues.of(
                    // Force la base de données en mémoire
                    "spring.datasource.url=jdbc:h2:mem:debatearena_test_db;DB_CLOSE_DELAY=-1;DB_CLOSE_ON_EXIT=false",
                    "spring.datasource.driverClassName=org.h2.Driver",
                    "spring.datasource.username=sa",
                    "spring.datasource.password=",
                    // Configure Hibernate pour utiliser notre dialecte custom
                    "spring.jpa.database-platform=" + CustomH2Dialect.class.getName(),
                    "spring.jpa.hibernate.ddl-auto=create-drop",
                    // Désactive les outils de migration qui pourraient bloquer
                    "spring.flyway.enabled=false",
                    "spring.liquibase.enabled=false"
            ).applyTo(applicationContext.getEnvironment());
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    private Utilisateur testUser;

    @BeforeEach
    void setUp() {
        utilisateurRepository.deleteAll();

        testUser = new Utilisateur();
        testUser.setEmail("user@test.com");
        testUser.setNom("User");
        testUser.setPrenom("Test");
        testUser.setPassword("password");
        testUser.setRole(role_enum.UTILISATEUR);
        testUser.setScore(0); // Assurez-vous que les champs obligatoires sont là

        testUser = utilisateurRepository.save(testUser);
    }

    @Test
    @WithMockUser(username = "user@test.com") // Simule l'utilisateur connecté
    void creerSignalement_ShouldReturnCreated() throws Exception {
        CreateSignalementRequest request = new CreateSignalementRequest();
        request.setTitre("Titre Test");
        request.setDescription("Ceci est un test");
        // Assurez-vous que "BUG_TECHNIQUE" est une valeur valide de votre TypeProblemeEnum
        request.setTypeProbleme("BUG_TECHNIQUE");

        mockMvc.perform(post("/api/signalements")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.titre").value("Titre Test"))
                .andExpect(jsonPath("$.statut").value("EN_ATTENTE"));
    }

    @Test
    @WithMockUser(username = "user@test.com")
    void getMesSignalements_ShouldReturnList() throws Exception {
        mockMvc.perform(get("/api/signalements/mes-signalements")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }
}