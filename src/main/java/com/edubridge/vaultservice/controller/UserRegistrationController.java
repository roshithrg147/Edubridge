package com.edubridge.vaultservice.controller;

import com.edubridge.vaultservice.dto.UserRegistrationRequest;
import com.edubridge.vaultservice.model.UserRegistration;
import com.edubridge.vaultservice.repository.UserRegistrationRepository;
import com.edubridge.vaultservice.service.RegistrationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import java.security.Principal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/registrations")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "User Registration", description = "Endpoints for user signups, profile fetching, and vault services")
public class UserRegistrationController {

    private final RegistrationService registrationService;
    private final com.edubridge.vaultservice.service.S3Service s3Service;
    private final UserRegistrationRepository userRegistrationRepository;
    private final com.edubridge.vaultservice.mapper.UserMapper userMapper;

    @Operation(summary = "Get User Profile", description = "Retrieves the currently authenticated user's profile details")
    @ApiResponse(responseCode = "200", description = "Profile retrieved successfully")
    @ApiResponse(responseCode = "204", description = "No profile found for current user")
    @GetMapping("/me")
    public ResponseEntity<com.edubridge.vaultservice.dto.UserProfileResponse> getMyProfile(
            @Parameter(hidden = true) Principal principal) {
        String userId = principal.getName();

        return userRegistrationRepository.findById(userId)
                .map(user -> ResponseEntity.ok(userMapper.toResponse(user, s3Service)))
                .orElse(ResponseEntity.ok(null));
    }

    @Operation(summary = "Register User", description = "Registers a user with associated documents in S3 and initiates provisioning")
    @ApiResponse(responseCode = "201", description = "Registration successful", content = @Content(mediaType = "application/json", schema = @Schema(implementation = UserRegistration.class)))
    @ApiResponse(responseCode = "400", description = "Invalid request or file format")
    @ApiResponse(responseCode = "409", description = "User profile already exists")
    @ApiResponse(responseCode = "500", description = "AWS or internal error")
    @PostMapping(value = "/register", consumes = "multipart/form-data")
    public ResponseEntity<UserRegistration> registerUser(
            @Parameter(hidden = true) Principal principal,
            @Parameter(description = "JSON profile data") @RequestPart("data") @Valid UserRegistrationRequest request,
            @Parameter(description = "Profile Photo") @RequestPart(value = "photo", required = false) MultipartFile photo,
            @Parameter(description = "Fee Receipt Document") @RequestPart(value = "receipt", required = false) MultipartFile receipt,
            @Parameter(description = "College ID Photo") @RequestPart(value = "id", required = false) MultipartFile id,
            @Parameter(description = "KYC Document") @RequestPart(value = "kyc", required = false) MultipartFile kyc) {

        String userId = principal.getName();

        if (userRegistrationRepository.existsById(userId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User profile already exists");
        }
        if (userRegistrationRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Email is already registered. Please use another.");
        }
        if (userRegistrationRepository.existsByUsername(request.getUsername())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Username is already taken.");
        }

        UserRegistration user = userMapper.toEntity(request);
        user.setUserId(userId);

        try {
            UserRegistration savedUser = registrationService.processSignup(user, photo, receipt, id, kyc);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
        } catch (java.io.IOException e) {
            log.error("Error during registration upload", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload documents");
        } catch (Exception e) {
            log.error("Unexpected error during registration", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                    "An unexpected error occurred: " + e.getMessage());
        }
    }
}
