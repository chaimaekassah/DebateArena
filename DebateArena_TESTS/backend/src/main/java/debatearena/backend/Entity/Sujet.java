package debatearena.backend.Entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Data
@Entity
@Table(name = "sujet")
public class Sujet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "titre", nullable = false, length = 100)
    private String titre;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private niveau_enum difficulte;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @JdbcTypeCode(SqlTypes.NAMED_ENUM)
    private categorie_sujet_enum categorie;

    public Sujet() {
    }

    public Sujet(Long id,
                 String titre,
                 niveau_enum difficulte,
                 categorie_sujet_enum categorie) {
        this.id = id;
        this.titre = titre;
        this.difficulte = difficulte;
        this.categorie = categorie;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitre() {
        return titre;
    }

    public void setTitre(String titre) {
        this.titre = titre;
    }

    public niveau_enum getDifficulte() {
        return difficulte;
    }

    public void setDifficulte(niveau_enum difficulte) {
        this.difficulte = difficulte;
    }

    public categorie_sujet_enum getCategorie() {
        return categorie;
    }

    public void setCategorie(categorie_sujet_enum categorie) {
        this.categorie = categorie;
    }
}