package debatearena.backend.Controller;

import debatearena.backend.DTO.Dashboard;
import debatearena.backend.DTO.UpdateProfileRequest;
import debatearena.backend.DTO.UtilisateurProfile;
import debatearena.backend.Service.CustomUtilisateurService;
import debatearena.backend.Service.UtilisateurService;
import debatearena.backend.Security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpMethod;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.web.servlet.MockMvc;

import java.util.ArrayList;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(UtilisateurController.class)
@AutoConfigureMockMvc(addFilters = false) // Désactivation de la sécurité pour le test
class UtilisateurControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private UtilisateurService utilisateurService;

    // --- Mocks de sécurité (INDISPENSABLES pour éviter le crash du contexte) ---
    @MockBean private CustomUtilisateurService customUtilisateurService;
    @MockBean private JwtUtil jwtUtil;
    // --------------------------------------------------------------------------

    private UtilisateurProfile profile;
    private Dashboard dashboard;

    @BeforeEach
    void setUp() {
        // CORRECTION 1 : Inversion des deux derniers paramètres (Role et Image)
        profile = new UtilisateurProfile(
                1L,
                "Doe",
                "John",
                "john@test.com",
                "UTILISATEUR",  // Le Rôle vient AVANT l'image apparemment
                "profile.jpg"   // L'image est en dernier
        );

        // CORRECTION 2 : Réorganisation pour le Dashboard
        // D'après votre JSON, l'ordre semble être :
        // Niveau, Progression, Score, PointsSuivant, Badge, Total, Gagnés, Taux, Moyenne, Meilleure, Récents
        dashboard = new Dashboard(
                "Debutant",       // Niveau
                10.0,             // Progression (j'ai mis 10 pour ne pas confondre)
                100,              // Score (C'est lui qu'on veut tester à 100 !)
                2,                // Points pour niveau suivant (était 'perdus' avant, attention !)
                null,             // Badge
                7,                // Total
                5,                // Gagnés
                71.0,             // Taux reussite
                1,                // Moyenne notes (était 'streak')
                5,                // Meilleure note (était 'best streak')
                new ArrayList<>() // Liste vide
        );
    }

    // --- TEST 1 : Récupérer mon profil (GET /api/me) ---
    @Test
    void getMyProfile_ShouldReturnProfile() throws Exception {
        when(utilisateurService.getMyProfile()).thenReturn(profile);

        mockMvc.perform(get("/api/me"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("john@test.com"))
                .andExpect(jsonPath("$.nom").value("Doe"));
    }

    // --- TEST 2 : Mettre à jour mon profil (PUT /api/me) ---
    @Test
    void updateMyProfile_ShouldReturnUpdatedProfile() throws Exception {
        // On simule que le service renvoie le profil mis à jour
        when(utilisateurService.updateMyProfile(any(UpdateProfileRequest.class)))
                .thenReturn(profile);

        // ASTUCE : @ModelAttribute attend des paramètres de formulaire, pas du JSON brut.
        // De plus, pour simuler un PUT avec des données "multipart/form-data" (si UpdateProfileRequest contient des fichiers),
        // on utilise 'multipart()' qui par défaut fait un POST, et on force la méthode PUT.

        mockMvc.perform(multipart("/api/me")
                        .param("nom", "Doe Updated")
                        .param("prenom", "John Updated")
                        .with(request -> {
                            request.setMethod("PUT"); // Force la méthode HTTP PUT
                            return request;
                        }))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.nom").value("Doe"));
    }

    // --- TEST 3 : Changer l'image de profil (PUT /api/me/image) ---
    @Test
    void updateMyProfileImage_ShouldReturnProfile() throws Exception {
        // Création du faux fichier image
        MockMultipartFile imageFile = new MockMultipartFile(
                "image",           // nom du paramètre @RequestParam
                "avatar.png",      // nom du fichier
                "image/png",       // type mime
                "fake-image-content".getBytes()
        );

        when(utilisateurService.updateProfileImage(any())).thenReturn(profile);

        // Simulation de l'upload
        mockMvc.perform(multipart("/api/me/image")
                        .file(imageFile)
                        .with(request -> {
                            request.setMethod("PUT"); // Force le PUT car l'endpoint est @PutMapping
                            return request;
                        }))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.imagePath").value("profile.jpg"));
    }

    // --- TEST 4 : Récupérer le tableau de bord (GET /api/dashboard) ---
    @Test
    void getDashboard_ShouldReturnDashboard() throws Exception {
        when(utilisateurService.getDashboard()).thenReturn(dashboard);

        mockMvc.perform(get("/api/dashboard"))
                .andExpect(status().isOk())
                // Vérification des valeurs définies dans le setUp()
                .andExpect(jsonPath("$.score").value(100.0))
                .andExpect(jsonPath("$.debatsGagnes").value(5))
                .andExpect(jsonPath("$.niveau").value("Debutant"));
    }
}