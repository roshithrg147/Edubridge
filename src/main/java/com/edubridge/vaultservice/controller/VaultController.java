package com.edubridge.vaultservice.controller;

import com.edubridge.vaultservice.service.FileValidationService;
import com.edubridge.vaultservice.service.S3Service;
import org.springframework.http.ResponseEntity;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/vault")
public class VaultController {

    private final S3Service s3Service;
    private final FileValidationService fileValidationService;

    public VaultController(S3Service s3Service, FileValidationService fileValidationService) {
        this.s3Service = s3Service;
        this.fileValidationService = fileValidationService;
    }

    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(
            @RequestParam("file") MultipartFile file,
            JwtAuthenticationToken token) {
        try {
            // Validate the file deeply
            fileValidationService.validateFile(file);

            // "sub" is the unique Auth0 user ID
            String userId = token.getTokenAttributes().get("sub").toString();
            String fileKey = s3Service.uploadFile(userId, file);
            return ResponseEntity.ok("Success: " + fileKey);
        } catch (com.edubridge.vaultservice.exception.InvalidFileException e) {
            return ResponseEntity.badRequest().body("Validation Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
}