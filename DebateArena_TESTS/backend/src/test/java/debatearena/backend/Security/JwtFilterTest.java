package debatearena.backend.Security;

import debatearena.backend.Service.CustomUtilisateurService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class JwtFilterTest {

    private JwtFilter jwtFilter;

    @Mock
    private CustomUtilisateurService customUtilisateurService;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private HttpServletRequest request;

    @Mock
    private HttpServletResponse response;

    @Mock
    private FilterChain filterChain;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
        jwtFilter = new JwtFilter(customUtilisateurService, jwtUtil);
        SecurityContextHolder.clearContext();

        // --- CORRECTION ICI ---
        // On simule un chemin d'URL pour éviter le NullPointerException.
        // On met une URL neutre qui doit être filtrée (pas /auth/signin par exemple).
        when(request.getServletPath()).thenReturn("/api/test");
        // Par sécurité, si votre filtre utilise getRequestURI au lieu de getServletPath :
        when(request.getRequestURI()).thenReturn("/api/test");
    }

    @Test
    void shouldDoNothing_WhenNoAuthorizationHeader() throws Exception {
        // Le mock de request renvoie déjà null pour getHeader() par défaut,
        // mais c'est bien de l'expliciter.
        when(request.getHeader("Authorization")).thenReturn(null);

        jwtFilter.doFilter(request, response, filterChain);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNull(auth);
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void shouldAuthenticateUser_WhenJwtIsValid() throws Exception {
        String token = "valid-token";
        String username = "user@test.com";

        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
        when(jwtUtil.extractUsername(token)).thenReturn(username);

        UserDetails userDetails = User.withUsername(username)
                .password("password")
                .authorities("ROLE_UTILISATEUR")
                .build();

        when(customUtilisateurService.loadUserByUsername(username)).thenReturn(userDetails);
        when(jwtUtil.validateToken(token, userDetails)).thenReturn(true);

        jwtFilter.doFilter(request, response, filterChain);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertNotNull(auth);
        assertEquals(username, auth.getName());
        verify(filterChain).doFilter(request, response);
    }

    @Test
    void shouldNotAuthenticate_WhenJwtIsInvalid() throws Exception {
        String token = "invalid-token";
        String username = "user@test.com";

        when(request.getHeader("Authorization")).thenReturn("Bearer " + token);
        when(jwtUtil.extractUsername(token)).thenReturn(username);

        UserDetails userDetails = mock(UserDetails.class);
        when(customUtilisateurService.loadUserByUsername(username)).thenReturn(userDetails);
        when(jwtUtil.validateToken(token, userDetails)).thenReturn(false);

        jwtFilter.doFilter(request, response, filterChain);

        assertNull(SecurityContextHolder.getContext().getAuthentication());
        verify(filterChain).doFilter(request, response);
    }
}