package debatearena.backend.Service;

import debatearena.backend.Entity.Badge;
import debatearena.backend.Entity.CategorieBadge;
import debatearena.backend.Repository.BadgeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BadgeService {

    private final BadgeRepository badgeRepository;

    public Badge getDefaultBadge(){
        String nom_default = "Nouveau Débatteur";
        return badgeRepository.findBadgeByNom(nom_default)
                .orElseGet(this::createDefaultBadge);
    }

    public Badge createDefaultBadge(){
        Badge defaultbadge = new Badge();
        defaultbadge.setNom("Nouveau Débatteur");
        defaultbadge.setDescription("Badge attribué aux nouveaux utilisateurs");
        defaultbadge.setCategorie(CategorieBadge.BRONZE);
        return badgeRepository.save(defaultbadge);
    }
}
