package debatearena.backend.Exceptions;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import static org.assertj.core.api.Assertions.assertThat;

class NotFoundExceptionTest {

    @Test
    void shouldContainCorrectMessage() {
        // ARRANGE
        String errorMessage = "Ressource introuvable";

        // ACT
        NotFoundException exception = new NotFoundException(errorMessage);

        // ASSERT
        assertThat(exception).isInstanceOf(RuntimeException.class);
        assertThat(exception.getMessage()).isEqualTo(errorMessage);
    }

    @Test
    void shouldHaveNotFoundStatusAnnotation() {
        // Vérification que Spring renverra bien une 404

        // ACT
        ResponseStatus annotation = NotFoundException.class.getAnnotation(ResponseStatus.class);

        // ASSERT
        assertThat(annotation).isNotNull();
        assertThat(annotation.value()).isEqualTo(HttpStatus.NOT_FOUND);
    }
}