package debatearena.backend.Repository;

import debatearena.backend.Entity.Utilisateur;
import debatearena.backend.Entity.role_enum;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.orm.jpa.DataJpaTest;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

@DataJpaTest
class UtilisateurRepositoryTest {

    @Autowired
    private UtilisateurRepository utilisateurRepository;

    @Test
    void testFindByEmail() {
        // GIVEN : un utilisateur enregistré en base
        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setNom("El Amrani");
        utilisateur.setPrenom("Chaimae");
        utilisateur.setEmail("chaimae@test.com");
        utilisateur.setPassword("password123");
        utilisateur.setRole(role_enum.UTILISATEUR);

        utilisateurRepository.save(utilisateur);

        // WHEN : on cherche par email
        Optional<Utilisateur> result =
                utilisateurRepository.findByEmail("chaimae@test.com");

        // THEN : l'utilisateur est trouvé
        assertThat(result).isPresent();
        assertThat(result.get().getEmail())
                .isEqualTo("chaimae@test.com");
    }

    @Test
    void testExistsByEmail() {
        // GIVEN
        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setNom("Test");
        utilisateur.setPrenom("User");
        utilisateur.setEmail("test@test.com");
        utilisateur.setPassword("password");
        utilisateur.setRole(role_enum.UTILISATEUR);

        utilisateurRepository.save(utilisateur);

        // WHEN
        boolean exists = utilisateurRepository.existsByEmail("test@test.com");

        // THEN
        assertThat(exists).isTrue();
    }

    @Test
    void testExistsByEmailFalse() {
        // WHEN
        boolean exists = utilisateurRepository.existsByEmail("notfound@test.com");

        // THEN
        assertThat(exists).isFalse();
    }
}
