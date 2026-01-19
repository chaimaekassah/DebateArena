package debatearena.backend.Service;
import debatearena.backend.DTO.AuthResponse;
import debatearena.backend.DTO.SignInRequest;
import debatearena.backend.DTO.SignUpRequest;
import debatearena.backend.DTO.SignUpResponse;
import debatearena.backend.Entity.role_enum;
import debatearena.backend.Entity.Utilisateur;
import debatearena.backend.Exceptions.BadRequestException;
import debatearena.backend.Exceptions.UnauthorizedException;
import debatearena.backend.Security.JwtUtil;
import debatearena.backend.Utils.ImageStorageService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.Optional;

@Service
public class AuthService {

    private final UtilisateurService utilisateurService;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final BadgeService badgeService;
    private final ImageStorageService imageStorageService;

    private static final String UPLOAD_DIR = "uploads/avatars/";
    private static final String DEFAULT_AVATAR = UPLOAD_DIR + "default.png";

    public AuthService(UtilisateurService utilisateurService,
                       PasswordEncoder passwordEncoder,
                       JwtUtil jwtUtil,
                       BadgeService badgeService,
                       ImageStorageService imageStorageService) {
        this.utilisateurService = utilisateurService;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.badgeService = badgeService;
        this.imageStorageService = imageStorageService;
    }

    private void validateSignupRequest(SignUpRequest request) {

        if (request.getNom() == null || request.getNom().trim().isEmpty()) {
            throw new BadRequestException("Le nom est obligatoire");
        }

        if (request.getPrenom() == null || request.getPrenom().trim().isEmpty()) {
            throw new BadRequestException("Le prénom est obligatoire");
        }

        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            throw new BadRequestException("L'email est obligatoire");
        }

        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            throw new BadRequestException("Le mot de passe est obligatoire");
        }
    }

    public SignUpResponse signup(SignUpRequest request) {

        validateSignupRequest(request);

        if (utilisateurService.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email déjà existant");
        }

        Utilisateur user = new Utilisateur();
        user.setNom(request.getNom());
        user.setPrenom(request.getPrenom());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(role_enum.UTILISATEUR);
        user.setScore(0);
        user.setBadge(badgeService.getDefaultBadge());

        if (request.getImage() != null && !request.getImage().isEmpty()) {
            try {
                user.setImagePath(imageStorageService.saveImage(request.getImage()));
            } catch (IOException e) {
                throw new BadRequestException("Erreur lors de l'enregistrement de l'image");
            }
        } else {
            user.setImagePath(DEFAULT_AVATAR);
        }

        Utilisateur saved = utilisateurService.save(user);

        return new SignUpResponse(
                saved.getId(),
                saved.getNom(),
                saved.getPrenom(),
                saved.getEmail(),
                saved.getScore(),
                saved.getBadge() != null ? saved.getBadge().getNom() : "Aucun",
                saved.getBadge() != null ? saved.getBadge().getCategorie().name() : "AUCUNE",
                saved.getImagePath()
        );
    }

    public AuthResponse signin(SignInRequest request) {

        // 1. Chercher l'utilisateur
        Optional<Utilisateur> userOpt = utilisateurService.findUtilisateurByEmail(request.getEmail());

        // 2. Vérifier si l'utilisateur existe
        if (userOpt.isEmpty()) {
            throw new UnauthorizedException("Email ou mot de passe incorrect");
        }

        Utilisateur user = userOpt.get();

        // 3. Vérifier le mot de passe
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new UnauthorizedException("Email ou mot de passe incorrect");
        }

        // 4. Générer le token
        String token = jwtUtil.generateToken(
                user.getEmail(),
                user.getRole().name()
        );

        return new AuthResponse(token, user.getRole().name());
    }
}