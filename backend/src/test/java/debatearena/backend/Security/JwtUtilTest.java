package debatearena.backend.Security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.lang.reflect.Field;
import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;

    @BeforeEach
    void setUp() throws Exception {
        jwtUtil = new JwtUtil();

        // Injection de secretKey via reflection
        Field secretField = JwtUtil.class.getDeclaredField("secretKey");
        secretField.setAccessible(true);
        secretField.set(jwtUtil, "mysecretkeymysecretkeymysecretkeymysecretkey");

        // Injection de expirationTimeMs via reflection
        Field expField = JwtUtil.class.getDeclaredField("expirationTimeMs");
        expField.setAccessible(true);
        expField.set(jwtUtil, 1000 * 60 * 60L); // 1 heure
    }

    @Test
    void generateToken_and_validateToken_shouldWork() {
        String email = "user@test.com";
        String role = "UTILISATEUR";

        // 1️⃣ Génération du token
        String token = jwtUtil.generateToken(email, role);
        assertNotNull(token, "Le token ne doit pas être nul");

        // 2️⃣ Extraction du username
        String username = jwtUtil.extractUsername(token);
        assertEquals(email, username, "Le username extrait doit correspondre à l'email");

        // 3️⃣ Extraction du rôle
        String extractedRole = jwtUtil.extractRole(token);
        assertEquals(role, extractedRole, "Le rôle extrait doit correspondre");

        // 4️⃣ Validation du token
        UserDetails userDetails = new User(email, "password", Collections.emptyList());
        assertTrue(jwtUtil.validateToken(token, userDetails), "Le token doit être valide");
    }

    @Test
    void expiredToken_shouldFailValidation() throws Exception {
        // ⛔ expiration négative → token déjà expiré
        Field expField = JwtUtil.class.getDeclaredField("expirationTimeMs");
        expField.setAccessible(true);
        expField.set(jwtUtil, -1000L); // expiré dans le passé

        String token = jwtUtil.generateToken("user@test.com", "UTILISATEUR");

        UserDetails userDetails =
                new User("user@test.com", "password", Collections.emptyList());

        assertFalse(jwtUtil.validateToken(token, userDetails),
                "Le token doit être expiré");
    }
}
