package debatearena.backend.Entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "utilisateur")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Utilisateur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nom;

    @Column(nullable = false)
    private String prenom;

    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private role_enum role = role_enum.UTILISATEUR;

    @Column(nullable = false)
    private Integer score = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "id_badge")
    private Badge badge;

    @Column(name = "imagepath")
    private String imagePath;

    public String getImagePath() {
        return imagePath;
    }

    public void setImagePath(String imagePath) {
        this.imagePath = imagePath;
    }

    public String getEmail() {
        return email;
    }

    public String getPassword() {
        return password;
    }

    public role_enum getRole() {
        return role;
    }

    public String getNom() {
        return nom;
    }

    public String getPrenom() {
        return prenom;
    }
    public long getId(){
        return id;
    }
    public void setId(){
        this.id=id;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }



    public void setPrenom(String prenom) {
        this.prenom = prenom;
    }



    public void setEmail(String email) {
        this.email = email;
    }
    public void setScore(Integer score) {
        this.score = score;
    }



    public void setPassword(String password) {
        this.password = password;
    }
    public void setRole(role_enum role) {
        this.role = role;
    }

    public Badge getBadge() {
        return badge;
    }

    // ✅ SETTER (avec paramètre)
    public void setBadge(Badge badge) {
        this.badge = badge;
    }

    public Integer getScore() {
        return score;
    }

    public void setId(Long id) {
        this.id = id;
    }
}