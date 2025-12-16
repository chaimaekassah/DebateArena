package debatearena.backend.Service;

import debatearena.backend.DTO.AuthResponse;
import debatearena.backend.DTO.SignInRequest;
import debatearena.backend.DTO.SignUpRequest;
import debatearena.backend.DTO.SignUpResponse;
import debatearena.backend.Entity.role_enum;
import debatearena.backend.Entity.Utilisateur;
import debatearena.backend.Repository.UtilisateurRepository;
import debatearena.backend.Security.JwtUtil;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Optional;
@Data
@RequiredArgsConstructor
@Service
public class UtilisateurService {
    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final BadgeService badgeService;
    private final JwtUtil jwtUtil;

    public Optional<Utilisateur> findUtilisateurByEmail(String email) {
        return utilisateurRepository.findByEmail(email);
    }

    Utilisateur createUtilisateur(Utilisateur utilisateur) {
        return utilisateurRepository.save(utilisateur);
    }

    public SignUpResponse signup(SignUpRequest signUpRequest) {

        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setNom(signUpRequest.getNom());
        utilisateur.setPrenom(signUpRequest.getPrenom());
        utilisateur.setEmail(signUpRequest.getEmail());
        utilisateur.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        utilisateur.setRole(role_enum.UTILISATEUR);
        utilisateur.setScore(0);
        utilisateur.setBadge(badgeService.getDefaultBadge());

        Utilisateur savedUtilisateur = this.createUtilisateur(utilisateur);

        SignUpResponse response = new SignUpResponse(
                savedUtilisateur.getId(),
                savedUtilisateur.getNom(),
                savedUtilisateur.getPrenom(),
                savedUtilisateur.getEmail(),
                savedUtilisateur.getScore(),
                savedUtilisateur.getBadge() != null ? savedUtilisateur.getBadge().getNom() : "Aucun",
                savedUtilisateur.getBadge() !=null ? savedUtilisateur.getBadge().getCategorie().name() : "AUCUNE"
        );
        return response;
    }

    public AuthResponse signin(SignInRequest signInRequest){
        Utilisateur utilisateur = this.findUtilisateurByEmail(signInRequest.getEmail())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        String token = jwtUtil.generateToken(
                signInRequest.getEmail(),
                utilisateur.getRole().name()
        );

        AuthResponse authResponse = new AuthResponse();
        authResponse.setToken(token);
        authResponse.setRole(utilisateur.getRole().name());

        return authResponse;
    }

}
