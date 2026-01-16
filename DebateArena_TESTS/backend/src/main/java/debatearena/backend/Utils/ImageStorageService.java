package debatearena.backend.Utils;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class ImageStorageService {

    private static final String UPLOAD_DIR = "uploads/avatars/";
    private static final String DEFAULT_AVATAR = "uploads/avatars/default.png";

    public ImageStorageService() {
    }

    public String saveImage(MultipartFile image) throws IOException {
        Files.createDirectories(Paths.get(UPLOAD_DIR));

        String fileName = UUID.randomUUID() + "_" +
                (image.getOriginalFilename() != null ? image.getOriginalFilename() : "avatar");
        String fullPath = UPLOAD_DIR + fileName;

        Files.write(Paths.get(fullPath), image.getBytes());

        return fullPath;
    }

    public String getDefaultAvatar() {
        return DEFAULT_AVATAR;
    }

    public void deleteImage(String imagePath) throws IOException {
        if (imagePath != null &&
                !imagePath.equals(DEFAULT_AVATAR) &&
                Files.exists(Paths.get(imagePath))) {
            Files.delete(Paths.get(imagePath));
        }
    }
}