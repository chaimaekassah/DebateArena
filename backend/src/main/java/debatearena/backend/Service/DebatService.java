package debatearena.backend.Service;

import debatearena.backend.DTO.*;
import debatearena.backend.Entity.*;
import debatearena.backend.Exceptions.BadRequestException;
import debatearena.backend.Exceptions.NotFoundException;
import debatearena.backend.Exceptions.UnauthorizedException;
import debatearena.backend.Repository.DebatRepository;
import debatearena.backend.Repository.MessageRepository;
import debatearena.backend.Repository.SujetRepository;
import debatearena.backend.Repository.TestRepository;
import debatearena.backend.Service.UtilisateurService;
import debatearena.backend.Client.ChatbotClient;
import debatearena.backend.Exceptions.ChatbotServiceException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@Transactional
public class DebatService {

    private final DebatRepository debatRepository;
    private final MessageRepository messageRepository;
    private final TestRepository testRepository;
    private final SujetRepository sujetRepository;
    private final UtilisateurService utilisateurService;
    private final ChatbotClient chatbotClient;

    private final Map<Long, String> debatSessions = new ConcurrentHashMap<>();

    public DebatService(DebatRepository debatRepository,
                        MessageRepository messageRepository,
                        TestRepository testRepository,
                        SujetRepository sujetRepository,
                        UtilisateurService utilisateurService,
                        ChatbotClient chatbotClient) {
        this.debatRepository = debatRepository;
        this.messageRepository = messageRepository;
        this.testRepository = testRepository;
        this.sujetRepository = sujetRepository;
        this.utilisateurService = utilisateurService;
        this.chatbotClient = chatbotClient;
    }

    // ========== CRÉATION DE DÉBAT ==========

    public DebatResponse creerDebat(CreerDebatRequest request) {
        // Validation
        if (!request.isValid()) {
            throw new BadRequestException("Données invalides");
        }

        Utilisateur utilisateur = utilisateurService.getCurrentUser();

        // Récupérer le sujet
        Sujet sujet = sujetRepository.findById(request.getSujetId())
                .orElseThrow(() -> new NotFoundException("Sujet non trouvé"));

        // Vérifier l'accès au sujet (utilise la logique de niveau)
        if (!utilisateurService.peutAccederAuSujet(utilisateur, sujet.getDifficulte().name())) {
            throw new UnauthorizedException("Votre niveau est insuffisant pour ce sujet");
        }

        // Vérifier s'il n'y a pas déjà un débat en cours sur ce sujet
        if (debatRepository.hasDebatEnCoursSurSujet(utilisateur, sujet.getId())) {
            throw new BadRequestException("Vous avez déjà un débat en cours sur ce sujet");
        }

        // Créer et sauvegarder le débat
        Debat debat = new Debat();
        debat.setDateDebut(LocalDateTime.now());
        debat.setSujet(sujet);
        debat.setUtilisateur(utilisateur);
        debat.setChoixUtilisateur(request.getChoix());
        debat.setDuree(null);

        Debat savedDebat = debatRepository.save(debat);

        // Si c'est un TEST, créer l'entrée dans Test
        if ("TEST".equals(request.getType())) {
            Test test = new Test();
            test.setDebat(savedDebat);
            test.setNote(null); // Pas encore de note
            testRepository.save(test);
        }

        // Premier message du chatbot
        Utilisateur chatbot = utilisateurService.getChatbotUser();
        String messageIntro = genererMessageIntroduction(sujet, request.getChoix(), request.getType());
        Message premierMessage = new Message(messageIntro, savedDebat, chatbot);
        messageRepository.save(premierMessage);

        return convertirDebatEnResponse(savedDebat, request.getType());
    }

    // ========== ENVOYER MESSAGE ==========

    public MessageResponse envoyerMessage(Long debatId, MessageRequest request) {
        try {
            // Validation
            if (request.getContenu() == null || request.getContenu().trim().isEmpty()) {
                throw new BadRequestException("Message vide");
            }

            Utilisateur utilisateur = utilisateurService.getCurrentUser();

            // Récupérer le débat
            Debat debat = debatRepository.findByIdAndUtilisateur(debatId, utilisateur)
                    .orElseThrow(() -> new NotFoundException("Débat non trouvé"));

            if (debat.getDuree() != null) {
                throw new BadRequestException("Débat déjà terminé");
            }

            // 1. Sauvegarder message utilisateur
            Message messageUtilisateur = new Message(request.getContenu(), debat, utilisateur);
            messageRepository.save(messageUtilisateur);

            // 2. Appeler le chatbot
            String reponseChatbot;
            try {
                reponseChatbot = appelerChatbotApi(request.getContenu(), debat);
            } catch (Exception e) {
                // Réponse de secours si le chatbot échoue
                reponseChatbot = "Je ne peux pas répondre pour le moment. Veuillez continuer votre argumentation.";
            }

            // 3. Sauvegarder réponse chatbot
            Utilisateur chatbot = utilisateurService.getChatbotUser();
            Message messageChatbot = new Message(reponseChatbot, debat, chatbot);
            Message savedMessage = messageRepository.save(messageChatbot);

            // 4. Forcer le flush et refresh pour s'assurer que l'ID est généré
            messageRepository.flush();

            // 5. Convertir et retourner
            return convertirMessageEnResponse(savedMessage);

        } catch (Exception e) {
            // Log l'erreur complète
            System.err.println("ERREUR envoyerMessage: " + e.getMessage());
            e.printStackTrace();
            throw new BadRequestException("Erreur lors de l'envoi du message: " + e.getMessage());
        }
    }

    // ========== NOUVELLE MÉTHODE appelerChatbotApi ==========

    private String appelerChatbotApi(String messageUtilisateur, Debat debat) {
        try {
            // Vérifier si le chatbot est disponible
            if (!chatbotClient.isHealthy()) {
                return "Je suis actuellement indisponible. Veuillez réessayer plus tard.";
            }

            // Déterminer le mode selon le type de débat
            String mode = testRepository.existsByDebat(debat) ? "score" : "train";

            // Construire le contexte approprié
            String messageAvecContexte = construireMessageAvecContexte(
                    messageUtilisateur,
                    debat,
                    mode
            );

            // Récupérer la session
            String sessionId = debatSessions.get(debat.getId());

            // Appeler le chatbot avec le bon mode
            ChatbotResponse chatbotResponse = chatbotClient.sendMessage(
                    messageAvecContexte,
                    sessionId,
                    mode
            );

            // Vérifier si la réponse n'est pas null
            if (chatbotResponse == null) {
                throw new ChatbotServiceException("Réponse null du chatbot");
            }

            // Stocker la nouvelle session ID
            if (chatbotResponse.getSession_id() != null) {
                debatSessions.put(debat.getId(), chatbotResponse.getSession_id());
            }

            // Vérifier le contenu de la réponse
            String response = chatbotResponse.getResponse();
            if (response == null || response.trim().isEmpty()) {
                return "Je n'ai pas pu générer de réponse. Veuillez reformuler votre message.";
            }

            return response;

        } catch (ChatbotServiceException e) {
            // Gestion spécifique des erreurs du chatbot
            return "Erreur technique avec le chatbot : " + e.getMessage();
        } catch (Exception e) {
            // Gestion des autres exceptions
            return "Une erreur inattendue est survenue.";
        }
    }

    private String construireMessageAvecContexte(String messageUtilisateur, Debat debat, String mode) {
        StringBuilder contexte = new StringBuilder();
        contexte.append("Contexte du débat:\n");
        contexte.append("- Sujet: ").append(debat.getSujet().getTitre()).append("\n");
        contexte.append("- Position utilisateur: ").append(debat.getChoixUtilisateur()).append("\n");
        contexte.append("- Ma position: ");
        contexte.append(debat.getChoixUtilisateur().equals("POUR") ? "CONTRE" : "POUR").append("\n");
        contexte.append("- Mode: ").append(mode).append("\n");

        if ("score".equals(mode)) {
            contexte.append("\n⚠️ Mode ÉVALUATION activé. Je vais analyser tes arguments.\n");
            contexte.append("Pour terminer l'évaluation, envoie 'fin du débat'.\n\n");
        } else {
            contexte.append("\n🎯 Mode ENTRAÎNEMENT. Débattons !\n\n");
        }

        contexte.append("Message à analyser: ").append(messageUtilisateur);

        return contexte.toString();
    }

    // ========== TERMINER DÉBAT ==========

    public DebatResponse terminerDebat(Long debatId) {
        Utilisateur utilisateur = utilisateurService.getCurrentUser();

        Debat debat = debatRepository.findByIdAndUtilisateur(debatId, utilisateur)
                .orElseThrow(() -> new NotFoundException("Débat non trouvé"));

        if (debat.getDuree() != null) {
            throw new BadRequestException("Débat déjà terminé");
        }

        // Calculer durée
        long dureeSeconds = Duration.between(debat.getDateDebut(), LocalDateTime.now()).getSeconds();
        debat.setDuree((int) dureeSeconds);
        debatRepository.save(debat);

        // Nettoyer la session chatbot
        nettoyerSessionDebat(debatId);

        // Si c'est un TEST, message d'attente
        if (testRepository.existsByDebat(debat)) {
            Utilisateur chatbot = utilisateurService.getChatbotUser();
            Message message = new Message(
                    "Débat terminé. Évaluation en cours...",
                    debat,
                    chatbot
            );
            messageRepository.save(message);
        }

        String type = testRepository.existsByDebat(debat) ? "TEST" : "ENTRAINEMENT";
        return convertirDebatEnResponse(debat, type);
    }

    // ========== ÉVALUER TEST ==========

    // Dans DebatService.java
    public MessageResponse evaluerTest(Long debatId) {
        Utilisateur utilisateur = utilisateurService.getCurrentUser();

        Debat debat = debatRepository.findByIdAndUtilisateur(debatId, utilisateur)
                .orElseThrow(() -> new NotFoundException("Débat non trouvé"));

        if (!testRepository.existsByDebat(debat)) {
            throw new BadRequestException("Ce débat n'est pas un TEST");
        }

        // Envoyer le message spécial pour obtenir le score
        String sessionId = debatSessions.get(debatId);
        String messageEvaluation = "fin du débat";

        try {
            ChatbotResponse response = chatbotClient.sendMessage(messageEvaluation, sessionId, "score");

            // Sauvegarder la réponse du chatbot
            Utilisateur chatbot = utilisateurService.getChatbotUser();
            Message message = new Message(response.getResponse(), debat, chatbot);
            messageRepository.save(message);

            // Extraire et sauvegarder la note si possible
            extraireEtSauvegarderNote(response.getResponse(), debat);

            return convertirMessageEnResponse(message);

        } catch (Exception e) {
            // Fallback en cas d'erreur
            Utilisateur chatbot = utilisateurService.getChatbotUser();
            Message message = new Message(
                    "L'évaluation automatique a échoué. Notre équipe analysera manuellement votre débat.",
                    debat,
                    chatbot
            );
            messageRepository.save(message);
            return convertirMessageEnResponse(message);
        }
    }

    private void extraireEtSauvegarderNote(String reponseChatbot, Debat debat) {
        try {
            // Extraire le score de la réponse (ex: "Score final du débat : 85/100")
            Pattern pattern = Pattern.compile("Score final du débat : (\\d+\\.?\\d*)/100");
            Matcher matcher = pattern.matcher(reponseChatbot);

            if (matcher.find()) {
                Double score = Double.parseDouble(matcher.group(1));

                // Mettre à jour le test
                Optional<Test> testOpt = testRepository.findByDebat(debat);
                if (testOpt.isPresent()) {
                    Test test = testOpt.get();
                    test.setNote(score.intValue()); // ou garder Double si vous voulez
                    testRepository.save(test);
                }
            }
        } catch (Exception e) {
            System.err.println("Impossible d'extraire la note: " + e.getMessage());
        }
    }

    // ========== RÉCUPÉRER MESSAGES ==========

    public List<MessageResponse> getMessagesDebat(Long debatId) {
        Utilisateur utilisateur = utilisateurService.getCurrentUser();

        Debat debat = debatRepository.findByIdAndUtilisateur(debatId, utilisateur)
                .orElseThrow(() -> new NotFoundException("Débat non trouvé"));

        return messageRepository.findByDebatOrderByTimestampAsc(debat)
                .stream()
                .map(this::convertirMessageEnResponse)
                .collect(Collectors.toList());
    }

    // ========== RÉCUPÉRER DÉBAT ==========

    public DebatResponse getDebat(Long debatId) {
        Utilisateur utilisateur = utilisateurService.getCurrentUser();

        Debat debat = debatRepository.findByIdAndUtilisateur(debatId, utilisateur)
                .orElseThrow(() -> new NotFoundException("Débat non trouvé"));

        String type = testRepository.existsByDebat(debat) ? "TEST" : "ENTRAINEMENT";
        return convertirDebatEnResponse(debat, type);
    }

    // ========== MES DÉBATS ==========

    public List<DebatResponse> getMesDebats() {
        Utilisateur utilisateur = utilisateurService.getCurrentUser();

        return debatRepository.findByUtilisateurOrderByDateDebutDesc(utilisateur)
                .stream()
                .map(debat -> {
                    String type = testRepository.existsByDebat(debat) ? "TEST" : "ENTRAINEMENT";
                    return convertirDebatEnResponse(debat, type);
                })
                .collect(Collectors.toList());
    }

    // ========== DÉBATS EN COURS ==========

    public List<DebatResponse> getDebatsEnCours() {
        Utilisateur utilisateur = utilisateurService.getCurrentUser();

        return debatRepository.findDebatsEnCoursByUtilisateur(utilisateur)
                .stream()
                .map(debat -> {
                    String type = testRepository.existsByDebat(debat) ? "TEST" : "ENTRAINEMENT";
                    return convertirDebatEnResponse(debat, type);
                })
                .collect(Collectors.toList());
    }

    // ========== DÉBATS TERMINÉS ==========

    public List<DebatResponse> getDebatsTermines() {
        Utilisateur utilisateur = utilisateurService.getCurrentUser();

        return debatRepository.findDebatsTerminesByUtilisateur(utilisateur)
                .stream()
                .map(debat -> {
                    String type = testRepository.existsByDebat(debat) ? "TEST" : "ENTRAINEMENT";
                    return convertirDebatEnResponse(debat, type);
                })
                .collect(Collectors.toList());
    }

    // ========== ANNULER DÉBAT ==========

    public void annulerDebat(Long debatId) {
        Utilisateur utilisateur = utilisateurService.getCurrentUser();

        Debat debat = debatRepository.findByIdAndUtilisateur(debatId, utilisateur)
                .orElseThrow(() -> new NotFoundException("Débat non trouvé"));

        if (debat.getDuree() != null) {
            throw new BadRequestException("Seuls les débats en cours peuvent être annulés");
        }

        // Nettoyer la session chatbot
        nettoyerSessionDebat(debatId);

        // Si c'est un TEST, supprimer l'entrée Test
        if (testRepository.existsByDebat(debat)) {
            testRepository.findByDebat(debat).ifPresent(testRepository::delete);
        }

        messageRepository.deleteByDebat(debat);
        debatRepository.delete(debat);
    }

    private void nettoyerSessionDebat(Long debatId) {
        String sessionId = debatSessions.remove(debatId);
        if (sessionId != null) {
            chatbotClient.clearSession(sessionId);
        }
    }

    // ========== STATISTIQUES ==========

    public Map<String, Object> getStatistiquesUtilisateur() {
        Utilisateur utilisateur = utilisateurService.getCurrentUser();
        Long userId = utilisateur.getId();

        Map<String, Object> stats = new HashMap<>();

        // Statistiques de base
        Integer totalDebats = debatRepository.countByUtilisateurId(userId);
        Integer debatsGagnes = testRepository.countDebatsGagnesByUserId(userId);
        Integer moyenneNotes = testRepository.getMoyenneNotesByUserId(userId);
        Integer meilleureNote = testRepository.getMeilleureNoteByUserId(userId);

        stats.put("totalDebats", totalDebats != null ? totalDebats : 0);
        stats.put("debatsGagnes", debatsGagnes != null ? debatsGagnes : 0);
        stats.put("moyenneNotes", moyenneNotes != null ? moyenneNotes : 0);
        stats.put("meilleureNote", meilleureNote != null ? meilleureNote : 0);
        stats.put("scoreTotal", utilisateur.getScore());
        stats.put("niveau", utilisateurService.calculerNiveau(utilisateur));

        return stats;
    }

    // ========== HISTORIQUE ==========

    public List<DebatRecap> getHistoriqueDebats(int limit) {
        Utilisateur utilisateur = utilisateurService.getCurrentUser();
        Long userId = utilisateur.getId();

        List<Object[]> results = debatRepository.findRecentDebatsByUtilisateurId(userId);

        return results.stream()
                .limit(limit)
                .map(this::mapToDebatRecap)
                .collect(Collectors.toList());
    }

    // ========== CHATBOT STATUS ==========

    public Map<String, Object> getChatbotStatus() {
        Map<String, Object> status = new HashMap<>();
        boolean isHealthy = chatbotClient.isHealthy();

        status.put("status", isHealthy ? "healthy" : "unhealthy");
        status.put("service", "chatbot");
        status.put("active_sessions", debatSessions.size());

        return status;
    }

    // ========== TESTER CHATBOT ==========

    public String testerChatbot(String message) {
        try {
            if (!chatbotClient.isHealthy()) {
                return "❌ Chatbot indisponible";
            }

            ChatbotResponse response = chatbotClient.sendMessage(message, null, "train");

            return "✅ Test réussi!\nSession: " + response.getSession_id() + "\n" +
                    "Réponse: " + response.getResponse();

        } catch (ChatbotServiceException e) {
            return "❌ Erreur: " + e.getMessage();
        }
    }

    // ========== MÉTHODES UTILITAIRES ==========

    private DebatResponse convertirDebatEnResponse(Debat debat, String type) {
        // Récupérer la note si c'est un TEST terminé
        Integer note = null;
        if ("TEST".equals(type) && debat.getDuree() != null) {
            note = testRepository.findByDebat(debat)
                    .map(Test::getNote)
                    .orElse(null);
        }

        // Déterminer le statut
        String statut = (debat.getDuree() == null) ? "EN_COURS" : "TERMINE";

        // Convertir le Sujet (Entity) en SujetResponse (DTO)
        Sujet sujet = debat.getSujet();
        SujetResponse sujetResponse = new SujetResponse(
                sujet.getId(),
                sujet.getTitre(),
                sujet.getCategorie().name(),
                sujet.getDifficulte().name(),
                true  // accessible par défaut
        );

        // Créer et retourner la réponse avec le bon type de sujet
        DebatResponse response = new DebatResponse();
        response.setId(debat.getId());
        response.setSujet(sujetResponse);
        response.setType(type);
        response.setStatus(statut);
        response.setChoixUtilisateur(debat.getChoixUtilisateur());
        response.setDateDebut(debat.getDateDebut());
        response.setDuree(debat.getDuree());
        response.setNote(note);

        return response;
    }

    private MessageResponse convertirMessageEnResponse(Message message) {
        // Déterminer l'auteur
        String auteur;
        if (message.getUtilisateur().getRole() == role_enum.CHATBOT) {
            auteur = "CHATBOT";
        } else {
            auteur = "UTILISATEUR";
        }

        // Créer et retourner la réponse
        MessageResponse response = new MessageResponse();
        response.setId(message.getId());
        response.setContenu(message.getContenu());
        response.setAuteur(auteur);
        response.setTimestamp(message.getTimestamp());

        return response;
    }

    private DebatRecap mapToDebatRecap(Object[] result) {
        // Récupérer l'ID du débat
        Long debatId = ((Number) result[0]).longValue();

        // Récupérer le débat complet
        Debat debat = debatRepository.findById(debatId).orElseThrow(
                () -> new NotFoundException("Débat non trouvé")
        );

        return new DebatRecap(
                debatId,                                    // id
                (String) result[1],                         // titre
                ((Enum<?>) result[2]).name(),               // categorie
                ((Enum<?>) result[3]).name(),               // difficulte
                testRepository.existsByDebat(debat) ? "TEST" : "ENTRAINEMENT", // type
                debat.getChoixUtilisateur(),                // choix utilisateur
                result[4] != null ? ((Number) result[4]).intValue() : null, // note
                (LocalDateTime) result[5],                  // date
                formatDuree(result[6] != null ? ((Number) result[6]).intValue() : null) // duree
        );
    }

    private String formatDuree(Integer dureeSeconds) {
        if (dureeSeconds == null) return "N/A";

        int minutes = dureeSeconds / 60;
        int seconds = dureeSeconds % 60;
        return minutes + "min " + seconds + "s";
    }

    private String genererMessageIntroduction(Sujet sujet, String choixUtilisateur, String type) {
        String choixChatbot = choixUtilisateur.equals("POUR") ? "CONTRE" : "POUR";

        if ("TEST".equals(type)) {
            return String.format(
                    "**DÉBAT TEST**\n\nSujet: %s\nVous: %s\nMoi: %s\n\nÀ vous de jouer !",
                    sujet.getTitre(), choixUtilisateur, choixChatbot
            );
        } else {
            return String.format(
                    "**ENTRAÎNEMENT**\n\nSujet: %s\nVous: %s\nMoi: %s\n\nPrêt à débattre ?",
                    sujet.getTitre(), choixUtilisateur, choixChatbot
            );
        }
    }
}