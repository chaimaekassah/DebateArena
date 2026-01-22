package debatearena.backend.Entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "signalement")
public class Signalement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_utilisateur", nullable = false)
    private Utilisateur utilisateur;

    @Column(name = "titre", nullable = false, length = 200)
    private String titre;

    @Column(name = "description", nullable = false, length = 2000)
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(name = "type_probleme", nullable = false)
    private TypeProblemeEnum typeProbleme;

    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false)
    private StatutSignalementEnum statut = StatutSignalementEnum.EN_ATTENTE;

    @Column(name = "date_creation", nullable = false)
    private LocalDateTime dateCreation = LocalDateTime.now();

    @Column(name = "date_resolution")
    private LocalDateTime dateResolution;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_admin_traitement")
    private Utilisateur adminTraitement;

    @Column(name = "commentaire_admin", length = 1000)
    private String commentaireAdmin;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_debat")
    private Debat debat;

    // Constructeurs
    public Signalement() {}

    public Signalement(Long id,
                       Utilisateur utilisateur,
                       String titre,
                       String description,
                       TypeProblemeEnum typeProbleme,
                       StatutSignalementEnum statut,
                       LocalDateTime dateCreation,
                       LocalDateTime dateResolution,
                       Utilisateur adminTraitement,
                       String commentaireAdmin,
                       Debat debat) {
        this.id = id;
        this.utilisateur = utilisateur;
        this.titre = titre;
        this.description = description;
        this.typeProbleme = typeProbleme;
        this.statut = statut;
        this.dateCreation = dateCreation;
        this.dateResolution = dateResolution;
        this.adminTraitement = adminTraitement;
        this.commentaireAdmin = commentaireAdmin;
        this.debat = debat;
    }

    // Getters et Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Utilisateur getUtilisateur() { return utilisateur; }
    public void setUtilisateur(Utilisateur utilisateur) { this.utilisateur = utilisateur; }

    public String getTitre() { return titre; }
    public void setTitre(String titre) { this.titre = titre; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public TypeProblemeEnum getTypeProbleme() { return typeProbleme; }
    public void setTypeProbleme(TypeProblemeEnum typeProbleme) { this.typeProbleme = typeProbleme; }

    public StatutSignalementEnum getStatut() { return statut; }
    public void setStatut(StatutSignalementEnum statut) { this.statut = statut; }

    public LocalDateTime getDateCreation() { return dateCreation; }
    public void setDateCreation(LocalDateTime dateCreation) { this.dateCreation = dateCreation; }

    public LocalDateTime getDateResolution() { return dateResolution; }
    public void setDateResolution(LocalDateTime dateResolution) { this.dateResolution = dateResolution; }

    public Utilisateur getAdminTraitement() { return adminTraitement; }
    public void setAdminTraitement(Utilisateur adminTraitement) { this.adminTraitement = adminTraitement; }

    public String getCommentaireAdmin() { return commentaireAdmin; }
    public void setCommentaireAdmin(String commentaireAdmin) { this.commentaireAdmin = commentaireAdmin; }

    public Debat getDebat() { return debat; }
    public void setDebat(Debat debat) { this.debat = debat; }
}