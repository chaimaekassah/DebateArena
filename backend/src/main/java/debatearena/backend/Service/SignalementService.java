package debatearena.backend.Service;

import debatearena.backend.DTO.CreateSignalementRequest;
import debatearena.backend.DTO.SignalementResponse;
import debatearena.backend.Entity.Debat;
import debatearena.backend.Entity.Signalement;
import debatearena.backend.Entity.TypeProblemeEnum;
import debatearena.backend.Entity.Utilisateur;
import debatearena.backend.Exceptions.BadRequestException;
import debatearena.backend.Exceptions.NotFoundException;
import debatearena.backend.Repository.DebatRepository;
import debatearena.backend.Repository.SignalementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class SignalementService {

    private final SignalementRepository signalementRepository;
    private final DebatRepository debatRepository;
    private final UtilisateurService utilisateurService;

    public SignalementService(SignalementRepository signalementRepository,
                              DebatRepository debatRepository,
                              UtilisateurService utilisateurService) {
        this.signalementRepository = signalementRepository;
        this.debatRepository = debatRepository;
        this.utilisateurService = utilisateurService;
    }

    // ========== CRÉER UN SIGNALEMENT ==========

    public SignalementResponse creerSignalement(CreateSignalementRequest request) {
        if (!request.isValid()) {
            throw new BadRequestException("Données invalides");
        }

        Utilisateur utilisateur = utilisateurService.getCurrentUser();

        Signalement signalement = new Signalement();
        signalement.setUtilisateur(utilisateur);
        signalement.setTitre(request.getTitre());
        signalement.setDescription(request.getDescription());

        try {
            // CORRIGÉ : Utiliser TypeProblemeEnum (séparé)
            signalement.setTypeProbleme(TypeProblemeEnum.valueOf(request.getTypeProbleme()));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Type de problème invalide");
        }

        // Débat optionnel
        if (request.getDebatId() != null) {
            Debat debat = debatRepository.findByIdAndUtilisateur(request.getDebatId(), utilisateur)
                    .orElseThrow(() -> new NotFoundException("Débat non trouvé"));
            signalement.setDebat(debat);
        }

        Signalement saved = signalementRepository.save(signalement);
        return convertirEnResponse(saved);
    }

    // ========== MES SIGNALEMENTS ==========

    public List<SignalementResponse> getMesSignalements() {
        Utilisateur utilisateur = utilisateurService.getCurrentUser();

        return signalementRepository.findByUtilisateurIdOrderByDateCreationDesc(utilisateur.getId())
                .stream()
                .map(this::convertirEnResponse)
                .collect(Collectors.toList());
    }

    // ========== DÉTAIL D'UN SIGNALEMENT ==========

    public SignalementResponse getSignalement(Long signalementId) {
        Utilisateur utilisateur = utilisateurService.getCurrentUser();

        Signalement signalement = signalementRepository.findById(signalementId)
                .orElseThrow(() -> new NotFoundException("Signalement non trouvé"));

        // Vérifier que c'est bien le signalement de l'utilisateur
        if (signalement.getUtilisateur().getId() != utilisateur.getId()) {
            throw new BadRequestException("Accès non autorisé");
        }

        return convertirEnResponse(signalement);
    }

    // ========== CONVERSION ==========

    private SignalementResponse convertirEnResponse(Signalement signalement) {
        return new SignalementResponse(
                signalement.getId(),
                signalement.getTitre(),
                signalement.getDescription(),
                signalement.getTypeProbleme().name(),
                signalement.getStatut().name(),
                signalement.getDateCreation(),
                signalement.getDateResolution(),
                signalement.getCommentaireAdmin(),
                signalement.getUtilisateur().getId(),
                signalement.getUtilisateur().getNom() + " " + signalement.getUtilisateur().getPrenom(),
                signalement.getUtilisateur().getEmail(),
                signalement.getDebat() != null ? signalement.getDebat().getId() : null,
                signalement.getDebat() != null ? signalement.getDebat().getSujet().getTitre() : null,
                signalement.getAdminTraitement() != null ? signalement.getAdminTraitement().getId() : null,
                signalement.getAdminTraitement() != null ?
                        signalement.getAdminTraitement().getNom() + " " + signalement.getAdminTraitement().getPrenom() : null
        );
    }
}