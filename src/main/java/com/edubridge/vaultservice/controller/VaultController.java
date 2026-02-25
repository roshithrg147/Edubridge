package com.edubridge.vaultservice.controller;

import com.edubridge.vaultservice.service.FileValidationService;
import com.edubridge.vaultservice.service.S3Service;
import org.springframework.http.ResponseEntity;
import java.security.Principal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/vault")
@Tag(name = "Vault Management", description = "Secure S3 document upload and retrieval endpoints")
public class VaultController {

    private final S3Service s3Service;
    private final FileValidationService fileValidationService;

    public VaultController(S3Service s3Service, FileValidationService fileValidationService) {
        this.s3Service = s3Service;
        this.fileValidationService = fileValidationService;
    }

    @Operation(summary = "Upload Document", description = "Validates and uploads a document to S3 using the Principal ID")
    @ApiResponse(responseCode = "200", description = "File successfully uploaded")
    @ApiResponse(responseCode = "400", description = "Validation Error (Mime spoofing, size limit)")
    @ApiResponse(responseCode = "401", description = "Unauthorized request")
    @ApiResponse(responseCode = "500", description = "Internal Server Error")
    @PostMapping("/upload")
    public ResponseEntity<String> uploadFile(
            @RequestParam("file") MultipartFile file,
            Principal principal) {
        try {
            // Validate the file deeply
            fileValidationService.validateFile(file);

            // The 'sub' unique Auth0 user ID is now the Subject injected via
            // JwtAuthenticationFilter
            String userId = principal.getName();
            String fileKey = s3Service.uploadFile(userId, file);
            return ResponseEntity.ok("Success: " + fileKey);
        } catch (com.edubridge.vaultservice.exception.InvalidFileException e) {
            return ResponseEntity.badRequest().body("Validation Error: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("Error: " + e.getMessage());
        }
    }
}