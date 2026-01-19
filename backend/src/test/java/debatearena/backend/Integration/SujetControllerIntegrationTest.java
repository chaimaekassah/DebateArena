package debatearena.backend.Integration;

import debatearena.backend.Entity.Sujet;
import debatearena.backend.Entity.Utilisateur;
import debatearena.backend.Entity.categorie_sujet_enum;
import debatearena.backend.Entity.niveau_enum;
import debatearena.backend.Entity.role_enum;
import debatearena.backend.Repository.SujetRepository;
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

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SujetControllerIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private SujetRepository sujetRepository;

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @BeforeEach
    void setUp() {
        // 1. Nettoyage
        sujetRepository.deleteAll();
        utilisateurRepository.deleteAll();

        // 2. Création d'un utilisateur "Débutant" (Score 100)
        Utilisateur user = new Utilisateur();
        user.setEmail("user@test.com");
        user.setNom("User");
        user.setPrenom("Test");
        user.setPassword("pass");
        user.setRole(role_enum.UTILISATEUR);
        user.setScore(100);
        utilisateurRepository.save(user);

        // 3. Création des sujets de test

        // Sujet 1 : Informatique / Débutant
        Sujet s1 = new Sujet();
        s1.setTitre("Java vs Python");
        s1.setCategorie(categorie_sujet_enum.INFORMATIQUE);
        s1.setDifficulte(niveau_enum.DEBUTANT);
        sujetRepository.save(s1);

        // Sujet 2 : Art / Débutant
        Sujet s2 = new Sujet();
        s2.setTitre("L'Art Abstrait");
        s2.setCategorie(categorie_sujet_enum.ART);
        s2.setDifficulte(niveau_enum.DEBUTANT);
        sujetRepository.save(s2);

        // Sujet 3 : Politique / Expert
        Sujet s3 = new Sujet();
        s3.setTitre("Géopolitique Avancée");
        s3.setCategorie(categorie_sujet_enum.POLITIQUE);
        s3.setDifficulte(niveau_enum.EXPERT);
        sujetRepository.save(s3);
    }

    @Test
    @WithMockUser(username = "user@test.com", roles = "UTILISATEUR")
    void getAllSujets_ShouldReturnAllWithAccessibilityFlag() throws Exception {
        // ACT & ASSERT
        mockMvc.perform(get("/api/sujets")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                // CORRECTION 1 : On attend 3 sujets (tout le monde), pas 2.
                .andExpect(jsonPath("$", hasSize(3)))

                // Vérification du contenu
                .andExpect(jsonPath("$[0].titre", is("Java vs Python")))
                .andExpect(jsonPath("$[0].accessible", is(true))) // Accessible

                // Vérification que le sujet Expert est présent mais marqué inaccessible
                .andExpect(jsonPath("$[2].titre", is("Géopolitique Avancée")))
                .andExpect(jsonPath("$[2].accessible", is(false))); // Non accessible
    }

    @Test
    @WithMockUser(username = "user@test.com", roles = "UTILISATEUR")
    void filtrerSujets_ShouldReturnOnlyInformatique() throws Exception {
        // Test de l'endpoint /api/sujets/filtrer
        mockMvc.perform(get("/api/sujets/filtrer")
                        .param("categorie", "INFORMATIQUE")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].categorie", is("INFORMATIQUE")));
    }

    @Test
    @WithMockUser(username = "user@test.com", roles = "UTILISATEUR")
    void rechercherSujets_ShouldFindByName() throws Exception {
        // Test de l'endpoint /api/sujets/rechercher
        mockMvc.perform(get("/api/sujets/rechercher")
                        .param("q", "Abstrait")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].titre", is("L'Art Abstrait")));
    }

    @Test
    @WithMockUser(username = "user@test.com", roles = "UTILISATEUR")
    void getCategories_ShouldWorkWithAuth() throws Exception {
        // CORRECTION 2 : Ajout de @WithMockUser car SecurityConfig bloque tout par défaut
        mockMvc.perform(get("/api/sujets/categories")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    @Test
    void getProtectedEndpoints_ShouldFailWithoutAuth() throws Exception {
        // Vérifie qu'on ne peut pas accéder sans token
        mockMvc.perform(get("/api/sujets")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isForbidden()); // 403 Forbidden
    }
}