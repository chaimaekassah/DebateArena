package debatearena.backend.Entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

@Data
@NoArgsConstructor
@AllArgsConstructor
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
}