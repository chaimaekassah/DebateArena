package debatearena.backend.Utils;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockMultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertDoesNotThrow;

class ImageStorageServiceTest {

    private ImageStorageService imageStorageService;

    // Liste pour suivre les fichiers créés et les supprimer après le test
    private List<Path> filesToCleanup;

    @BeforeEach
    void setUp() {
        imageStorageService = new ImageStorageService();
        filesToCleanup = new ArrayList<>();
    }

    @AfterEach
    void tearDown() {
        // Nettoyage : On supprime tous les fichiers créés pendant le test
        for (Path path : filesToCleanup) {
            try {
                Files.deleteIfExists(path);
            } catch (IOException e) {
                System.err.println("Impossible de supprimer le fichier de test : " + path);
            }
        }
    }

    @Test
    void saveImage_ShouldSaveFileToDisk() throws IOException {
        // ARRANGE
        MockMultipartFile file = new MockMultipartFile(
                "image",
                "test-image.jpg",
                "image/jpeg",
                "fake-image-content".getBytes()
        );

        // ACT
        String savedPathString = imageStorageService.saveImage(file);
        Path savedPath = Paths.get(savedPathString);

        // On ajoute à la liste de nettoyage
        filesToCleanup.add(savedPath);

        // ASSERT
        // 1. Le chemin n'est pas null
        assertThat(savedPathString).isNotNull();

        // 2. Le chemin commence bien par le dossier configuré
        assertThat(savedPathString).startsWith("uploads/avatars/");

        // 3. Le fichier existe physiquement sur le disque
        assertThat(Files.exists(savedPath)).isTrue();

        // 4. Le nom du fichier contient un UUID (donc est plus long que l'original)
        assertThat(savedPath.getFileName().toString().length()).isGreaterThan("test-image.jpg".length());
    }

    @Test
    void deleteImage_ShouldDeleteExistingFile() throws IOException {
        // ARRANGE
        // 1. On crée d'abord un vrai fichier pour pouvoir le supprimer
        Path tempDir = Paths.get("uploads/avatars/");
        Files.createDirectories(tempDir);

        Path tempFile = tempDir.resolve("to-delete.jpg");
        Files.createFile(tempFile);

        // On s'assure qu'il existe
        assertThat(Files.exists(tempFile)).isTrue();

        // ACT
        imageStorageService.deleteImage(tempFile.toString());

        // ASSERT
        assertThat(Files.exists(tempFile)).isFalse();
    }

    @Test
    void deleteImage_ShouldNotThrowError_WhenFileDoesNotExist() {
        // ACT & ASSERT
        // Cela ne doit pas lancer d'exception
        assertDoesNotThrow(() -> imageStorageService.deleteImage("uploads/avatars/non-existent-file.jpg"));
    }

    @Test
    void deleteImage_ShouldNotDeleteDefaultAvatar() throws IOException {
        // ARRANGE
        String defaultPath = imageStorageService.getDefaultAvatar(); // "uploads/avatars/default.png"

        // Cas extrême : Imaginons que le fichier default.png existe vraiment,
        // on veut s'assurer que le service ne tente PAS de le supprimer.
        // On crée un faux default.png pour le test
        Path defaultFile = Paths.get(defaultPath);
        if (!Files.exists(defaultFile.getParent())) {
            Files.createDirectories(defaultFile.getParent());
        }
        if (!Files.exists(defaultFile)) {
            Files.createFile(defaultFile);
            filesToCleanup.add(defaultFile); // On le nettoiera nous-mêmes
        }

        // ACT
        imageStorageService.deleteImage(defaultPath);

        // ASSERT
        // Le fichier doit toujours exister car la méthode contient une sécurité
        assertThat(Files.exists(defaultFile)).isTrue();
    }

    @Test
    void deleteImage_ShouldHandleNullPath() {
        assertDoesNotThrow(() -> imageStorageService.deleteImage(null));
    }
}