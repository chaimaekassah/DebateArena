package debatearena.backend.Exceptions;

import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;

class ChatbotServiceExceptionTest {

    @Test
    void shouldCreateExceptionWithMessage() {
        // ARRANGE
        String message = "Le chatbot ne répond pas";

        // ACT
        ChatbotServiceException exception = new ChatbotServiceException(message);

        // ASSERT
        assertThat(exception).isInstanceOf(RuntimeException.class);
        assertThat(exception.getMessage()).isEqualTo(message);
        assertThat(exception.getCause()).isNull();
    }

    @Test
    void shouldCreateExceptionWithMessageAndCause() {
        // ARRANGE
        String message = "Erreur de connexion";
        Throwable cause = new RuntimeException("Timeout réseau");

        // ACT
        ChatbotServiceException exception = new ChatbotServiceException(message, cause);

        // ASSERT
        assertThat(exception.getMessage()).isEqualTo(message);
        assertThat(exception.getCause()).isEqualTo(cause);
    }
}