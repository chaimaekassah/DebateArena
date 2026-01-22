package debatearena.backend.Service;

import debatearena.backend.DTO.*;
import debatearena.backend.Entity.*;
import debatearena.backend.Exceptions.BadRequestException;
import debatearena.backend.Exceptions.NotFoundException;
import debatearena.backend.Exceptions.UnauthorizedException;
import debatearena.backend.Repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminService {

    private final UtilisateurRepository utilisateurRepository;
    private final DebatRepository debatRepository;
    private final MessageRepository messageRepository;
    private final TestRepository testRepository;
    private final SujetRepository sujetRepository;
    private final SignalementRepository signalementRepository;
    private final UtilisateurService utilisateurService;

    public AdminService(UtilisateurRepository utilisateurRepository,
                        DebatRepository debatRepository,
                        MessageRepository messageRepository,
                        TestRepository testRepository,
                        SujetRepository sujetRepository,
                        SignalementRepository signalementRepository,
                        UtilisateurService utilisateurService) {
        this.utilisateurRepository = utilisateurRepository;
        this.debatRepository = debatRepository;
        this.messageRepository = messageRepository;
        this.testRepository = testRepository;
        this.sujetRepository = sujetRepository;
        this.signalementRepository = signalementRepository;
        this.utilisateurService = utilisateurService;
    }

    // ========== PROFIL ADMIN ==========

    public AdminProfileResponse getAdminProfile() {
        Utilisateur admin = utilisateurService.getCurrentUser();

        if (admin.getRole() != role_enum.ADMIN) {
            throw new UnauthorizedException("Accès réservé aux administrateurs");
        }

        return new AdminProfileResponse(
                admin.getId(),
                admin.getNom(),
                admin.getPrenom(),
                admin.getEmail(),
                admin.getRole().name(),
                admin.getImagePath(),
                null
        );
    }

    // ========== DASHBOARD ADMIN ==========

    public DashboardAdminResponse getDashboardStats() {
        verifierAdminAccess();

        LocalDateTime now = LocalDateTime.now();
        LocalDateTime jour1 = now.minusDays(1);
        LocalDateTime jour7 = now.minusDays(7);
        LocalDateTime jour30 = now.minusDays(30);

        // Statistiques globales
        Integer totalUtilisateurs = utilisateurRepository.countTotalUtilisateurs();
        Integer totalDebats = (int) debatRepository.count();
        Integer debatsEnCours = debatRepository.countDebatsEnCours();
        Integer totalTests = (int) testRepository.count();
        Double noteMoyenneTests = calculerNoteMoyenneGlobale();

        // Signalements - CORRIGÉ
        Integer signalementsEnAttente = signalementRepository.countByStatut(
                StatutSignalementEnum.EN_ATTENTE  // Utiliser l'enum séparé
        );
        Integer signalementsTraites30j = signalementRepository.countTraitesDepuis(jour30);

        // Sujets
        Integer totalSujets = (int) sujetRepository.count();
        Integer sujetsTendance = compterSujetsTendance(jour7);

        // Activité récente (sans nouveaux utilisateurs)
        DashboardAdminResponse.ActivityStats activite24h = calculerActivite(jour1);
        DashboardAdminResponse.ActivityStats activite7j = calculerActivite(jour7);
        DashboardAdminResponse.ActivityStats activite30j = calculerActivite(jour30);

        return new DashboardAdminResponse(
                totalUtilisateurs,
                totalDebats,
                debatsEnCours,
                totalTests,
                noteMoyenneTests,
                signalementsEnAttente,
                signalementsTraites30j,
                totalSujets,
                sujetsTendance,
                activite24h,
                activite7j,
                activite30j
        );
    }

    // ========== GESTION DES SUJETS ==========

    public SujetResponse creerSujet(CreateSujetRequest request) {
        verifierAdminAccess();

        // Validation
        if (request.getTitre() == null || request.getTitre().trim().isEmpty()) {
            throw new BadRequestException("Le titre est obligatoire");
        }

        Sujet sujet = new Sujet();
        sujet.setTitre(request.getTitre());

        try {
            sujet.setCategorie(categorie_sujet_enum.valueOf(request.getCategorie()));
            sujet.setDifficulte(niveau_enum.valueOf(request.getDifficulte()));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Catégorie ou difficulté invalide");
        }

        Sujet saved = sujetRepository.save(sujet);

        return new SujetResponse(
                saved.getId(),
                saved.getTitre(),
                saved.getCategorie().name(),
                saved.getDifficulte().name(),
                true
        );
    }

    public SujetResponse updateSujet(Long sujetId, UpdateSujetRequest request) {
        verifierAdminAccess();

        Sujet sujet = sujetRepository.findById(sujetId)
                .orElseThrow(() -> new NotFoundException("Sujet non trouvé"));

        if (request.getTitre() != null && !request.getTitre().trim().isEmpty()) {
            sujet.setTitre(request.getTitre());
        }

        if (request.getCategorie() != null) {
            try {
                sujet.setCategorie(categorie_sujet_enum.valueOf(request.getCategorie()));
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Catégorie invalide");
            }
        }

        if (request.getDifficulte() != null) {
            try {
                sujet.setDifficulte(niveau_enum.valueOf(request.getDifficulte()));
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Difficulté invalide");
            }
        }

        Sujet updated = sujetRepository.save(sujet);

        return new SujetResponse(
                updated.getId(),
                updated.getTitre(),
                updated.getCategorie().name(),
                updated.getDifficulte().name(),
                true
        );
    }

    public void deleteSujet(Long sujetId) {
        verifierAdminAccess();

        Sujet sujet = sujetRepository.findById(sujetId)
                .orElseThrow(() -> new NotFoundException("Sujet non trouvé"));

        // Vérifier s'il y a des débats liés
        List<Object[]> debats = debatRepository.countDebatsBySujet();
        boolean hasDebats = debats.stream()
                .anyMatch(arr -> ((Number) arr[0]).longValue() == sujetId && ((Number) arr[1]).intValue() > 0);

        if (hasDebats) {
            throw new BadRequestException("Impossible de supprimer un sujet avec des débats associés");
        }

        sujetRepository.delete(sujet);
    }

    public List<SujetStatsResponse> getSujetsWithStats() {
        verifierAdminAccess();

        List<Sujet> sujets = sujetRepository.findAll();
        LocalDateTime jour7 = LocalDateTime.now().minusDays(7);
        LocalDateTime jour30 = LocalDateTime.now().minusDays(30);

        Map<Long, Long> debatsBySujet = debatRepository.countDebatsBySujet()
                .stream()
                .collect(Collectors.toMap(
                        arr -> ((Number) arr[0]).longValue(),
                        arr -> ((Number) arr[1]).longValue()
                ));

        Map<Long, Long> debats7j = debatRepository.countDebatsBySujetDepuis(jour7)
                .stream()
                .collect(Collectors.toMap(
                        arr -> ((Number) arr[0]).longValue(),
                        arr -> ((Number) arr[1]).longValue()
                ));

        Map<Long, Long> debats30j = debatRepository.countDebatsBySujetDepuis(jour30)
                .stream()
                .collect(Collectors.toMap(
                        arr -> ((Number) arr[0]).longValue(),
                        arr -> ((Number) arr[1]).longValue()
                ));

        return sujets.stream().map(sujet -> {
            Long sujetId = sujet.getId();
            int totalDebats = debatsBySujet.getOrDefault(sujetId, 0L).intValue();
            int debats7derniersjours = debats7j.getOrDefault(sujetId, 0L).intValue();
            int debats30derniersjours = debats30j.getOrDefault(sujetId, 0L).intValue();

            // Calculer le taux de croissance
            double tauxCroissance = 0.0;
            int debats23a30j = debats30derniersjours - debats7derniersjours;
            if (debats23a30j > 0) {
                tauxCroissance = ((double) debats7derniersjours / debats23a30j - 1) * 100;
            }

            // Tendance si plus de 5 débats dans les 7 derniers jours
            boolean estTendance = debats7derniersjours >= 5;

            return new SujetStatsResponse(
                    sujetId,
                    sujet.getTitre(),
                    sujet.getCategorie().name(),
                    sujet.getDifficulte().name(),
                    totalDebats,
                    0, // debatsEnCours
                    totalDebats, // debatsTermines
                    calculerNoteMoyenneParSujet(sujetId),
                    0, // nombreVues
                    debats7derniersjours,
                    debats30derniersjours,
                    tauxCroissance,
                    estTendance
            );
        }).collect(Collectors.toList());
    }

    // ========== GESTION DES SIGNALEMENTS ==========

    public List<SignalementResponse> getAllSignalements(String statut, String typeProbleme) {
        verifierAdminAccess();

        // CORRIGÉ : Utiliser StatutSignalementEnum (séparé)
        StatutSignalementEnum statutEnum = null;
        if (statut != null) {
            try {
                statutEnum = StatutSignalementEnum.valueOf(statut);
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Statut invalide");
            }
        }

        // CORRIGÉ : Utiliser TypeProblemeEnum (séparé)
        TypeProblemeEnum typeEnum = null;
        if (typeProbleme != null) {
            try {
                typeEnum = TypeProblemeEnum.valueOf(typeProbleme);
            } catch (IllegalArgumentException e) {
                throw new BadRequestException("Type de problème invalide");
            }
        }

        List<Signalement> signalements = signalementRepository.findWithFilters(statutEnum, typeEnum);

        return signalements.stream()
                .map(this::convertirSignalementEnResponse)
                .collect(Collectors.toList());
    }

    public SignalementResponse traiterSignalement(Long signalementId, TraiterSignalementRequest request) {
        verifierAdminAccess();

        if (!request.isValid()) {
            throw new BadRequestException("Données invalides");
        }

        Signalement signalement = signalementRepository.findById(signalementId)
                .orElseThrow(() -> new NotFoundException("Signalement non trouvé"));

        try {
            // CORRIGÉ : Utiliser StatutSignalementEnum (séparé)
            signalement.setStatut(StatutSignalementEnum.valueOf(request.getStatut()));
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Statut invalide");
        }

        signalement.setCommentaireAdmin(request.getCommentaireAdmin());
        signalement.setAdminTraitement(utilisateurService.getCurrentUser());

        // CORRIGÉ : Utiliser StatutSignalementEnum (séparé)
        if (signalement.getStatut() == StatutSignalementEnum.RESOLU ||
                signalement.getStatut() == StatutSignalementEnum.REJETE) {
            signalement.setDateResolution(LocalDateTime.now());
        }

        Signalement updated = signalementRepository.save(signalement);
        return convertirSignalementEnResponse(updated);
    }

    // ========== MÉTHODES UTILITAIRES ==========

    private void verifierAdminAccess() {
        Utilisateur user = utilisateurService.getCurrentUser();
        if (user.getRole() != role_enum.ADMIN) {
            throw new UnauthorizedException("Accès réservé aux administrateurs");
        }
    }

    private Double calculerNoteMoyenneGlobale() {
        List<Test> tests = testRepository.findAll();
        if (tests.isEmpty()) return 0.0;

        return tests.stream()
                .filter(t -> t.getNote() != null)
                .mapToInt(Test::getNote)
                .average()
                .orElse(0.0);
    }

    private Double calculerNoteMoyenneParSujet(Long sujetId) {
        List<Debat> debats = debatRepository.findAll().stream()
                .filter(d -> d.getSujet().getId().equals(sujetId))
                .collect(Collectors.toList());

        double totalNotes = 0;
        int count = 0;

        for (Debat debat : debats) {
            Test test = testRepository.findByDebat(debat).orElse(null);
            if (test != null && test.getNote() != null) {
                totalNotes += test.getNote();
                count++;
            }
        }

        return count > 0 ? totalNotes / count : 0.0;
    }

    private Integer compterSujetsTendance(LocalDateTime depuis) {
        Map<Long, Long> debatsDepuis = debatRepository.countDebatsBySujetDepuis(depuis)
                .stream()
                .collect(Collectors.toMap(
                        arr -> ((Number) arr[0]).longValue(),
                        arr -> ((Number) arr[1]).longValue()
                ));

        return (int) debatsDepuis.values().stream()
                .filter(count -> count >= 5)
                .count();
    }

    private DashboardAdminResponse.ActivityStats calculerActivite(LocalDateTime depuis) {
        Integer debatsCrees = debatRepository.countDebatsDepuis(depuis);
        Integer messagesEnvoyes = messageRepository.countMessagesDepuis(depuis);

        return new DashboardAdminResponse.ActivityStats(
                0, // nouveauxUtilisateurs retiré
                debatsCrees,
                messagesEnvoyes
        );
    }

    private SignalementResponse convertirSignalementEnResponse(Signalement signalement) {
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