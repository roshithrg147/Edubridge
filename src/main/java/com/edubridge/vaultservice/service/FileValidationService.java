package com.edubridge.vaultservice.service;

import com.edubridge.vaultservice.exception.InvalidFileException;
import lombok.extern.slf4j.Slf4j;
import org.apache.tika.Tika;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;

@Service
@Slf4j
public class FileValidationService {

    private final Tika tika = new Tika();
    // Only allow specific MIME types
    private static final List<String> ALLOWED_MIME_TYPES = List.of(
            "application/pdf",
            "image/jpeg",
            "image/png");

    public void validateFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new InvalidFileException("File is empty.");
        }

        try {
            // Detect real MIME type based on "Magic Bytes"
            String mimeType = tika.detect(file.getInputStream());
            log.info("Detected MIME type during file upload: {}", mimeType);

            if (!ALLOWED_MIME_TYPES.contains(mimeType)) {
                log.warn("Invalid file MIME type detected: {}", mimeType);
                throw new InvalidFileException("File format not allowed. Detected type: " + mimeType);
            }
        } catch (IOException e) {
            log.error("Failed to read file for validation", e);
            throw new InvalidFileException("Could not read the file correctly. Upload rejected.");
        }
    }
}
