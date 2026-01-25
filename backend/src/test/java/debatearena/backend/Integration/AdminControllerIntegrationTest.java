package debatearena.backend.Integration;

import debatearena.backend.Entity.Utilisateur;
import debatearena.backend.Entity.role_enum;
import debatearena.backend.Repository.UtilisateurRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.context.TestConfiguration;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Primary;
import org.springframework.http.MediaType;
import org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseBuilder;
import org.springframework.jdbc.datasource.embedded.EmbeddedDatabaseType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import javax.sql.DataSource;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@Transactional
@TestPropertySource(properties = {
        // 1. Désactive tout ce qui touche à Postgres/Docker
        "spring.flyway.enabled=false",
        "spring.liquibase.enabled=false",

        // 2. Force H2 de manière simplifiée
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "spring.jpa.hibernate.ddl-auto=create-drop",

        // 3. SOLUTION ULTIME : On dit à Hibernate d'ignorer les définitions d'enums Postgres
        // qui utilisent le type 6001. En H2, il les créera comme des VARCHAR par défaut.
        "spring.jpa.properties.hibernate.unresolved_entity_attribute_logging=true"
})
public class AdminControllerIntegrationTest {

    /**
     * Cette configuration écrase le bean DataSource du backend par un H2 propre.
     */
    @TestConfiguration
    static class TestDatabaseConfig {
        @Bean
        @Primary
        public DataSource dataSource() {
            return new EmbeddedDatabaseBuilder()
                    .generateUniqueName(true)
                    .setType(EmbeddedDatabaseType.H2)
                    .build();
        }
    }

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @BeforeEach
    void setUp() {
        utilisateurRepository.deleteAll();

        Utilisateur admin = new Utilisateur();
        admin.setEmail("admin@test.com");
        admin.setNom("Admin");
        admin.setPrenom("Test");
        admin.setPassword("pass");
        admin.setRole(role_enum.ADMIN);
        admin.setScore(0);
        utilisateurRepository.save(admin);
    }

    @Test
    @WithMockUser(username = "admin@test.com", authorities = {"ROLE_ADMIN", "ADMIN"})
    void getDashboard_ShouldReturn200_WhenAdmin() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    @WithMockUser(username = "user@test.com", authorities = {"ROLE_UTILISATEUR", "UTILISATEUR"})
    void getDashboard_ShouldReturn403_WhenUserIsNotAdmin() throws Exception {
        mockMvc.perform(get("/api/admin/dashboard")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden());
    }
}