package debatearena.backend.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class SignUpResponse {
    private Long id;
    private String nom;
    private String prenom;
    private String email;
    private Integer score;
    private String badgeNom;
    private String badgeCategorie;
}