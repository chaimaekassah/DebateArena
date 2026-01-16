package debatearena.backend.Service;

import debatearena.backend.DTO.SujetResponse;
import debatearena.backend.Entity.Sujet;
import debatearena.backend.Entity.Utilisateur;
import debatearena.backend.Entity.categorie_sujet_enum;
import debatearena.backend.Entity.niveau_enum;
import debatearena.backend.Repository.SujetRepository;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class SujetService {

    private final SujetRepository sujetRepository;
    private final UtilisateurService utilisateurService;

    public SujetService(SujetRepository sujetRepository, UtilisateurService utilisateurService) {
        this.sujetRepository = sujetRepository;
        this.utilisateurService = utilisateurService;
    }

    // ========== MÉTHODES PUBLIQUES ==========

    /**
     * Récupère tous les sujets (pour l'endpoint /api/sujets)
     */
    public List<SujetResponse> getAllSujets() {
        Utilisateur user = utilisateurService.getCurrentUser();
        String niveauUser = calculerNiveau(user.getScore());

        return sujetRepository.findAll().stream()
                .map(sujet -> convertirEnResponse(sujet, niveauUser))
                .collect(Collectors.toList());
    }

    /**
     * Récupère un sujet par ID
     */
    public SujetResponse getSujetById(Long id) {
        Sujet sujet = sujetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Sujet non trouvé"));

        Utilisateur user = utilisateurService.getCurrentUser();
        String niveauUser = calculerNiveau(user.getScore());

        return convertirEnResponse(sujet, niveauUser);
    }

    /**
     * Sujets filtrés et accessibles
     */
    public List<SujetResponse> getSujetsFiltres(String categorie, String difficulte) {
        Utilisateur user = utilisateurService.getCurrentUser();
        String niveauUser = calculerNiveau(user.getScore());

        List<Sujet> sujets;

        if (categorie != null && difficulte != null) {
            sujets = sujetRepository.findByCategorieAndDifficulte(
                    categorie_sujet_enum.valueOf(categorie),
                    niveau_enum.valueOf(difficulte)
            );
        } else if (categorie != null) {
            sujets = sujetRepository.findByCategorie(
                    categorie_sujet_enum.valueOf(categorie)
            );
        } else if (difficulte != null) {
            sujets = sujetRepository.findByDifficulte(
                    niveau_enum.valueOf(difficulte)
            );
        } else {
            sujets = sujetRepository.findAll();
        }

        // Filtre l'accessibilité dans le service
        return sujets.stream()
                .filter(sujet -> estAccessible(niveauUser, sujet.getDifficulte().name()))
                .map(sujet -> convertirEnResponse(sujet, niveauUser))
                .collect(Collectors.toList());
    }

    /**
     * Recherche des sujets par titre
     */
    public List<SujetResponse> searchSujets(String query) {
        Utilisateur user = utilisateurService.getCurrentUser();
        String niveauUser = calculerNiveau(user.getScore());

        return sujetRepository.findByTitreContainingIgnoreCase(query).stream()
                .map(sujet -> convertirEnResponse(sujet, niveauUser))
                .collect(Collectors.toList());
    }

    /**
     * Sujets recommandés (accessibles)
     * Logique dans le service, pas dans la requête
     */
    public List<SujetResponse> getSujetsRecommandes() {
        Utilisateur user = utilisateurService.getCurrentUser();
        String niveauUser = calculerNiveau(user.getScore());

        // Récupère tous les sujets
        List<Sujet> tousLesSujets = sujetRepository.findAll();

        // Filtre dans le service
        return tousLesSujets.stream()
                .filter(sujet -> estAccessible(niveauUser, sujet.getDifficulte().name()))
                .map(sujet -> convertirEnResponse(sujet, niveauUser))
                .collect(Collectors.toList());
    }

    /**
     * Liste toutes les catégories
     */
    public List<String> getAllCategories() {
        return Arrays.stream(categorie_sujet_enum.values())
                .map(Enum::name)
                .collect(Collectors.toList());
    }

    /**
     * Liste toutes les difficultés
     */
    public List<String> getAllDifficultes() {
        return Arrays.stream(niveau_enum.values())
                .map(Enum::name)
                .collect(Collectors.toList());
    }

    // ========== MÉTHODES PUBLIQUES POUR DÉBAT ==========

    /**
     * Vérifie si l'utilisateur a accès à un sujet spécifique
     */
    public boolean peutAccederAuSujet(Long sujetId) {
        Utilisateur user = utilisateurService.getCurrentUser();
        String niveauUser = calculerNiveau(user.getScore());

        Sujet sujet = sujetRepository.findById(sujetId)
                .orElseThrow(() -> new RuntimeException("Sujet non trouvé"));

        return estAccessible(niveauUser, sujet.getDifficulte().name());
    }

    // ========== MÉTHODES PRIVÉES ==========

    /**
     * Vérifie si un utilisateur a accès à un sujet
     * Règle: Accès aux sujets de niveau INFÉRIEUR ou ÉGAL
     */
    private boolean estAccessible(String niveauUser, String difficulteSujet) {
        // Si l'utilisateur est EXPERT, il a accès à tout
        if ("EXPERT".equals(niveauUser)) return true;

        // Si l'utilisateur est AVANCÉ, accès à tout sauf EXPERT
        if ("AVANCE".equals(niveauUser)) {
            return !"EXPERT".equals(difficulteSujet);
        }

        // Si l'utilisateur est INTERMÉDIAIRE, accès à DEBUTANT et INTERMEDIAIRE
        if ("INTERMEDIAIRE".equals(niveauUser)) {
            return "DEBUTANT".equals(difficulteSujet) ||
                    "INTERMEDIAIRE".equals(difficulteSujet);
        }

        // Si l'utilisateur est DÉBUTANT, accès seulement à DEBUTANT
        if ("DEBUTANT".equals(niveauUser)) {
            return "DEBUTANT".equals(difficulteSujet);
        }

        return false;
    }

    /**
     * Calcule le niveau de l'utilisateur basé sur son score
     */
    private String calculerNiveau(Integer score) {
        if (score >= 1000) return "EXPERT";
        else if (score >= 500) return "AVANCE";
        else if (score >= 200) return "INTERMEDIAIRE";
        else return "DEBUTANT";
    }

    /**
     * Convertit une entité Sujet en DTO SujetResponse
     */
    private SujetResponse convertirEnResponse(Sujet sujet, String niveauUser) {
        boolean accessible = estAccessible(niveauUser, sujet.getDifficulte().name());

        return new SujetResponse(
                sujet.getId(),
                sujet.getTitre(),
                sujet.getCategorie().name(),
                sujet.getDifficulte().name(),
                accessible
        );
    }
}