package debatearena.backend.Controller;

import debatearena.backend.DTO.AuthResponse;
import debatearena.backend.DTO.SignInRequest;
import debatearena.backend.DTO.SignUpRequest;
import debatearena.backend.DTO.SignUpResponse;
import debatearena.backend.Entity.Role;
import debatearena.backend.Entity.Utilisateur;
import debatearena.backend.Repository.UtilisateurRepository;
import debatearena.backend.Security.JwtUtil;
import debatearena.backend.Service.BadgeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth/")
@RequiredArgsConstructor
public class AuthController {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final BadgeService badgeService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignUpRequest signUpRequest ) {
        if (utilisateurRepository.findByEmail(signUpRequest.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Cet utilisateur existe déja!");
        }

        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setNom(signUpRequest.getNom());
        utilisateur.setPrenom(signUpRequest.getPrenom());
        utilisateur.setEmail(signUpRequest.getEmail());
        utilisateur.setPassword(passwordEncoder.encode(signUpRequest.getPassword()));
        utilisateur.setRole(Role.UTILISATEUR);
        utilisateur.setScore(0);
        utilisateur.setBadge(badgeService.getDefaultBadge());

        Utilisateur savedUtilisateur = utilisateurRepository.save(utilisateur);

        SignUpResponse response = new SignUpResponse(
                savedUtilisateur.getId(),
                savedUtilisateur.getNom(),
                savedUtilisateur.getPrenom(),
                savedUtilisateur.getEmail(),
                savedUtilisateur.getScore(),
                savedUtilisateur.getBadge() != null ? savedUtilisateur.getBadge().getNom() : "Aucun",
                savedUtilisateur.getBadge() !=null ? savedUtilisateur.getBadge().getCategorie().name() : "AUCUNE"
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/signin")
    public ResponseEntity<?> signin(@RequestBody SignInRequest signInRequest ) {
        try{
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            signInRequest.getEmail(),
                            signInRequest.getPassword()
                    )
            );
            if(authentication.isAuthenticated()) {
                Utilisateur utilisateur = utilisateurRepository.findByEmail(signInRequest.getEmail())
                        .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

                String token = jwtUtil.generateToken(
                        signInRequest.getEmail(),
                        utilisateur.getRole().name()
                );

                AuthResponse authResponse = new AuthResponse();
                authResponse.setToken(token);
                authResponse.setRole(utilisateur.getRole().name());

                return ResponseEntity.ok(authResponse);
            }
            else {
                return ResponseEntity.status(401).body("Echec de l'authentification");
            }
        }catch(Exception e) {
            return  ResponseEntity.status(401).body("Email ou mot de passe incorrect");
        }
    }

}
