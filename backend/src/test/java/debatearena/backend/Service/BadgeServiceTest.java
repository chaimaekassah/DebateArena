package debatearena.backend.Service;

import debatearena.backend.Entity.Badge;
import debatearena.backend.Entity.categorie_badge_enum;
import debatearena.backend.Repository.BadgeRepository;
import debatearena.backend.Service.BadgeService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import static org.junit.jupiter.api.Assertions.*;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import static org.mockito.Mockito.*;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BadgeServiceTest {

    @Mock
    private BadgeRepository badgeRepository;

    @InjectMocks
    private BadgeService badgeService;

    @Test
    void shouldReturnExistingDefaultBadge() {
        // Arrange
        Badge badge = new Badge();
        badge.setNom("Nouveau Débatteur");

        when(badgeRepository.findBadgeByNom("Nouveau Débatteur"))
                .thenReturn(Optional.of(badge));

        // Act
        Badge result = badgeService.getDefaultBadge();

        // Assert
        assertNotNull(result);
        assertEquals("Nouveau Débatteur", result.getNom());

        verify(badgeRepository, never()).save(any());
    }

    @Test
    void shouldCreateAndReturnDefaultBadgeWhenNotExists() {
        // Arrange
        when(badgeRepository.findBadgeByNom("Nouveau Débatteur"))
                .thenReturn(Optional.empty());

        when(badgeRepository.save(any(Badge.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        // Act
        Badge result = badgeService.getDefaultBadge();

        // Assert
        assertNotNull(result);
        assertEquals("Nouveau Débatteur", result.getNom());
        assertEquals(categorie_badge_enum.BRONZE, result.getCategorie());

        verify(badgeRepository, times(1)).save(any(Badge.class));
    }
}
