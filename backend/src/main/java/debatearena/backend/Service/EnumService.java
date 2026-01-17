package debatearena.backend.Service;

import debatearena.backend.DTO.EnumDTO;
import debatearena.backend.Entity.categorie_sujet_enum;
import debatearena.backend.Entity.niveau_enum;
import debatearena.backend.Entity.role_enum;
import debatearena.backend.Entity.categorie_badge_enum;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class EnumService {

    public List<EnumDTO> getCategoriesSujet() {
        return Arrays.stream(categorie_sujet_enum.values())
                .map(enumValue -> new EnumDTO(
                        enumValue.name(),
                        formatLabel(enumValue.name())
                ))
                .collect(Collectors.toList());
    }

    public List<EnumDTO> getNiveaux() {
        return Arrays.stream(niveau_enum.values())
                .map(enumValue -> new EnumDTO(
                        enumValue.name(),
                        formatLabel(enumValue.name())
                ))
                .collect(Collectors.toList());
    }

    public List<EnumDTO> getRoles() {
        return Arrays.stream(role_enum.values())
                .map(enumValue -> new EnumDTO(
                        enumValue.name(),
                        formatLabel(enumValue.name())
                ))
                .collect(Collectors.toList());
    }

    public List<EnumDTO> getCategoriesBadge() {
        return Arrays.stream(categorie_badge_enum.values())
                .map(enumValue -> new EnumDTO(
                        enumValue.name(),
                        formatLabel(enumValue.name())
                ))
                .collect(Collectors.toList());
    }

    private String formatLabel(String enumName) {
        // Dictionnaire simple de traduction
        switch (enumName) {
            case "ART": return "Art";
            case "POLITIQUE": return "Politique";
            case "CULTURE": return "Culture";
            case "INFORMATIQUE": return "Informatique";
            case "TENDANCE": return "Tendance";
            case "INDUSTRIE": return "Industrie";
            case "PHILOSOPHIE": return "Philosophie";
            case "SANTE": return "Santé";
            case "HISTOIRE": return "Histoire";
            case "MUSIQUE": return "Musique";
            case "DEBUTANT": return "Débutant";
            case "INTERMEDIAIRE": return "Intermédiaire";
            case "AVANCE": return "Avancé";
            case "EXPERT": return "Expert";
            case "UTILISATEUR": return "Utilisateur";
            case "ADMIN": return "Administrateur";
            case "CHATBOT": return "Chatbot";
            case "OR": return "Or";
            case "ARGENT": return "Argent";
            case "BRONZE": return "Bronze";
            default: return enumName;
        }
    }
}