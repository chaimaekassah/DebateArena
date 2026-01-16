package debatearena.backend.Exceptions;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import static org.assertj.core.api.Assertions.assertThat;

class BadRequestExceptionTest {

    @Test
    void shouldContainCorrectMessage() {
        // ARRANGE
        String errorMessage = "Données invalides";

        // ACT
        BadRequestException exception = new BadRequestException(errorMessage);

        // ASSERT
        assertThat(exception).isInstanceOf(RuntimeException.class);
        assertThat(exception.getMessage()).isEqualTo(errorMessage);
    }

    @Test
    void shouldHaveBadRequestStatusAnnotation() {
        // Ce test utilise la réflexion pour vérifier que vous n'avez pas oublié l'annotation
        // C'est utile pour s'assurer que Spring renverra bien une 400 et pas une 500.

        // ACT
        ResponseStatus annotation = BadRequestException.class.getAnnotation(ResponseStatus.class);

        // ASSERT
        assertThat(annotation).isNotNull();
        assertThat(annotation.value()).isEqualTo(HttpStatus.BAD_REQUEST);
    }
}