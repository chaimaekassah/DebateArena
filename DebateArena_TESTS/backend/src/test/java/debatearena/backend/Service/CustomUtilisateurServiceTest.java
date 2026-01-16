package debatearena.backend.Service;

import debatearena.backend.Entity.role_enum;
import debatearena.backend.Entity.Utilisateur;
import debatearena.backend.Repository.UtilisateurRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class CustomUtilisateurServiceTest {

    @Mock
    private UtilisateurRepository utilisateurRepository;

    @InjectMocks
    private CustomUtilisateurService customUtilisateurService;

    private Utilisateur utilisateur;

    @BeforeEach
    void setUp() {
        utilisateur = new Utilisateur();
        utilisateur.setEmail("test@example.com");
        utilisateur.setPassword("password123");
        utilisateur.setRole(role_enum.UTILISATEUR); // ici c'est correct
    }


    @Test
    void shouldLoadUserByUsername_WhenUserExists() {
        // Mock du repository
        when(utilisateurRepository.findByEmail("test@example.com")).thenReturn(Optional.of(utilisateur));

        // Appel de la méthode
        UserDetails userDetails = customUtilisateurService.loadUserByUsername("test@example.com");

        // Vérifications
        assertEquals(utilisateur.getEmail(), userDetails.getUsername());
        assertEquals(utilisateur.getPassword(), userDetails.getPassword());
        assertTrue(userDetails.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("UTILISATEUR")));
    }

    @Test
    void shouldThrowException_WhenUserDoesNotExist() {
        // Mock du repository
        when(utilisateurRepository.findByEmail("unknown@example.com")).thenReturn(Optional.empty());

        // Vérification que l’exception est levée
        assertThrows(UsernameNotFoundException.class, () -> {
            customUtilisateurService.loadUserByUsername("unknown@example.com");
        });
    }
}
