package debatearena.backend.Controller;

import debatearena.backend.DTO.AuthResponse;
import debatearena.backend.DTO.SignInRequest;
import debatearena.backend.DTO.SignUpRequest;
import debatearena.backend.DTO.SignUpResponse;
import debatearena.backend.Entity.role_enum;
import debatearena.backend.Entity.Utilisateur;
import debatearena.backend.Repository.UtilisateurRepository;
import debatearena.backend.Security.JwtUtil;
import debatearena.backend.Service.BadgeService;
import debatearena.backend.Service.UtilisateurService;
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

    private final UtilisateurService utilisateurService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final BadgeService badgeService;

    @PostMapping("/signup")
    public ResponseEntity<?> signup(@RequestBody SignUpRequest signUpRequest ) {
        if (utilisateurService.findUtilisateurByEmail(signUpRequest.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Cet utilisateur existe déja!");
        }

        SignUpResponse response = utilisateurService.signup(signUpRequest);
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

                AuthResponse authResponse = utilisateurService.signin(signInRequest);
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
