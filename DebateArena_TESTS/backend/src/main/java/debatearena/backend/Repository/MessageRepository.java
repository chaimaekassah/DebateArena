package debatearena.backend.Repository;

import debatearena.backend.Entity.Debat;
import debatearena.backend.Entity.Message;
import debatearena.backend.Entity.Utilisateur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    // Trouver tous les messages d'un débat, ordonnés par timestamp (plus ancien d'abord)
    List<Message> findByDebatOrderByTimestampAsc(Debat debat);

    // Trouver tous les messages d'un débat, ordonnés par timestamp (plus récent d'abord)
    List<Message> findByDebatOrderByTimestampDesc(Debat debat);

    // Trouver le dernier message d'un débat
    @Query("SELECT m FROM Message m WHERE m.debat = :debat ORDER BY m.timestamp DESC LIMIT 1")
    Optional<Message> findLastMessageByDebat(@Param("debat") Debat debat);

    // Compter le nombre de messages dans un débat
    @Query("SELECT COUNT(m) FROM Message m WHERE m.debat = :debat")
    Integer countMessagesByDebat(@Param("debat") Debat debat);

    // Trouver les messages d'un utilisateur spécifique dans un débat
    @Query("SELECT m FROM Message m WHERE m.debat = :debat AND m.utilisateur = :utilisateur ORDER BY m.timestamp ASC")
    List<Message> findByDebatAndUtilisateur(
            @Param("debat") Debat debat,
            @Param("utilisateur") Utilisateur utilisateur
    );

    // Trouver tous les messages d'un utilisateur (tous débats confondus)
    List<Message> findByUtilisateurOrderByTimestampDesc(Utilisateur utilisateur);

    // Supprimer tous les messages d'un débat
    void deleteByDebat(Debat debat);

    // Trouver les messages du chatbot dans un débat
    @Query("SELECT m FROM Message m WHERE m.debat = :debat AND m.utilisateur.role = 'CHATBOT' ORDER BY m.timestamp ASC")
    List<Message> findChatbotMessagesByDebat(@Param("debat") Debat debat);

    // Trouver les messages de l'utilisateur (non-chatbot) dans un débat
    @Query("SELECT m FROM Message m WHERE m.debat = :debat AND m.utilisateur.role != 'CHATBOT' ORDER BY m.timestamp ASC")
    List<Message> findUtilisateurMessagesByDebat(@Param("debat") Debat debat);

    // Vérifier si un message appartient à un débat
    @Query("SELECT COUNT(m) > 0 FROM Message m WHERE m.id = :messageId AND m.debat.id = :debatId")
    boolean existsByIdAndDebatId(
            @Param("messageId") Long messageId,
            @Param("debatId") Long debatId
    );
}