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
@Table(name = "badge")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "nom", nullable = false, length = 100)
    private String nom;

    @Column(name = "description")
    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, name = "categorie")
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private categorie_badge_enum categorie;
    public String getNom() {
        return nom;
    }

    public void setNom(String nom) {
        this.nom = nom;
    }
    public void getBadge(Badge badge) {
        badge.setNom(nom);
        badge.setDescription(description);
    }

    // Getter et Setter pour description
    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    // Getter et Setter pour categorie
    public categorie_badge_enum getCategorie() {
        return categorie;
    }

    public void setCategorie(categorie_badge_enum categorie) {
        this.categorie = categorie;
    }
}