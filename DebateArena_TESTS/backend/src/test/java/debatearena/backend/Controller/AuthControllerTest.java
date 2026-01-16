package debatearena.backend.Controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import debatearena.backend.DTO.AuthResponse;
import debatearena.backend.DTO.SignInRequest;
import debatearena.backend.DTO.SignUpRequest;
import debatearena.backend.DTO.SignUpResponse;
import debatearena.backend.Service.AuthService;
import debatearena.backend.Service.BadgeService;
import debatearena.backend.Service.CustomUtilisateurService;
import debatearena.backend.Service.PasswordResetService;
import debatearena.backend.Service.UtilisateurService;
import debatearena.backend.Security.JwtUtil;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException; // Import important
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private AuthService authService; // C'est lui qu'on doit manipuler !

    // Les autres mocks sont nécessaires pour charger le contexte, mais on ne les configure pas directement ici
    @MockBean private UtilisateurService utilisateurService;
    @MockBean private AuthenticationManager authenticationManager;
    @MockBean private BadgeService badgeService;
    @MockBean private JwtUtil jwtUtil;
    @MockBean private PasswordEncoder passwordEncoder;
    @MockBean private CustomUtilisateurService customUtilisateurService;
    @MockBean private PasswordResetService passwordResetService;

    // -------- SIGNUP SUCCESS ----------
    @Test
    void signup_ShouldReturn200_WhenUserCreated() throws Exception {
        SignUpResponse response = new SignUpResponse();
        response.setMessage("created");

        when(authService.signup(any(SignUpRequest.class))).thenReturn(response);

        mockMvc.perform(multipart("/api/auth/signup")
                        .param("email", "test@gmail.com")
                        .param("password", "123456")
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isOk());
    }

    // -------- SIGNUP USER ALREADY EXISTS (CORRIGÉ) ----------
    @Test
    void signup_ShouldReturn400_WhenUserAlreadyExists() throws Exception {
        // CORRECTION : On dit directement au service de lancer l'exception
        // (Assurez-vous que votre Controller attrape RuntimeException ou l'exception spécifique que vous lancez)
        when(authService.signup(any(SignUpRequest.class)))
                .thenThrow(new RuntimeException("Error: Email is already in use!"));

        mockMvc.perform(multipart("/api/auth/signup")
                        .param("email", "exist@gmail.com")
                        .param("password", "123456")
                        .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isBadRequest());
    }

    // -------- SIGNIN SUCCESS ----------
    @Test
    void signin_ShouldReturn200_WhenCredentialsValid() throws Exception {
        SignInRequest request = new SignInRequest();
        request.setEmail("test@gmail.com");
        request.setPassword("123456");

        AuthResponse mockResponse = new AuthResponse();
        mockResponse.setToken("token123");
        mockResponse.setRole("USER");

        when(authService.signin(any(SignInRequest.class))).thenReturn(mockResponse);

        mockMvc.perform(post("/api/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().json("{\"token\":\"token123\",\"role\":\"USER\"}"));
    }

    // -------- SIGNIN FAILED (CORRIGÉ) ----------
    @Test
    void signin_ShouldReturn401_WhenBadCredentials() throws Exception {
        SignInRequest request = new SignInRequest();
        request.setEmail("wrong@gmail.com");
        request.setPassword("wrong");

        // CORRECTION : On dit au service de lancer l'exception BadCredentialsException
        when(authService.signin(any(SignInRequest.class)))
                .thenThrow(new BadCredentialsException("Bad credentials"));

        mockMvc.perform(post("/api/auth/signin")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isUnauthorized());
    }
}