package debatearena.backend.Exceptions;

import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

import static org.assertj.core.api.Assertions.assertThat;

class UnauthorizedExceptionTest {

    @Test
    void shouldContainCorrectMessage() {
        // ARRANGE
        String errorMessage = "Accès refusé : connectez-vous";

        // ACT
        UnauthorizedException exception = new UnauthorizedException(errorMessage);

        // ASSERT
        assertThat(exception).isInstanceOf(RuntimeException.class);
        assertThat(exception.getMessage()).isEqualTo(errorMessage);
    }

    @Test
    void shouldHaveUnauthorizedStatusAnnotation() {
        // Vérification que Spring renverra bien une 401

        // ACT
        ResponseStatus annotation = UnauthorizedException.class.getAnnotation(ResponseStatus.class);

        // ASSERT
        assertThat(annotation).isNotNull();
        assertThat(annotation.value()).isEqualTo(HttpStatus.UNAUTHORIZED);
    }
}