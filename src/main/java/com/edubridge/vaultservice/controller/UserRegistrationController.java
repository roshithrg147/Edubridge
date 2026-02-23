package com.edubridge.vaultservice.controller;

import com.edubridge.vaultservice.dto.UserRegistrationRequest;
import com.edubridge.vaultservice.model.UserRegistration;
import com.edubridge.vaultservice.repository.UserRegistrationRepository;
import com.edubridge.vaultservice.service.RegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/registrations")
@RequiredArgsConstructor
@Slf4j
public class UserRegistrationController {

    private final RegistrationService registrationService;
    private final com.edubridge.vaultservice.service.S3Service s3Service;
    private final UserRegistrationRepository userRegistrationRepository;

    @GetMapping("/me")
    public ResponseEntity<com.edubridge.vaultservice.dto.UserProfileResponse> getMyProfile(
            @AuthenticationPrincipal Jwt jwt) {
        String userId = jwt.getSubject();

        return userRegistrationRepository.findById(userId)
                .map(user -> {
                    com.edubridge.vaultservice.dto.UserProfileResponse response = com.edubridge.vaultservice.dto.UserProfileResponse
                            .builder()
                            .fullName(user.getFullName())
                            .email(user.getEmail())
                            .collegeName(user.getCollegeName())
                            .dob(user.getDob())
                            .phoneNumber(user.getPhoneNumber())
                            .admissionYear(user.getAdmissionYear())
                            .verificationStatus(user.getVerificationStatus().name())
                            .provisionedEmail(user.getProvisionedEmail())
                            .photoUrl(s3Service.generatePresignedUrl(user.getPhotoKey()))
                            .feeReceiptUrl(s3Service.generatePresignedUrl(user.getFeeReceiptKey()))
                            .collegeIdUrl(s3Service.generatePresignedUrl(user.getCollegeIdKey()))
                            .kycUrl(s3Service.generatePresignedUrl(user.getKycKey()))
                            .build();
                    return ResponseEntity.ok(response);
                })
                .orElse(ResponseEntity.ok(null));
    }

    @PostMapping(value = "/register", consumes = "multipart/form-data")
    public ResponseEntity<UserRegistration> registerUser(
            @AuthenticationPrincipal Jwt jwt,
            @RequestPart("data") @Valid UserRegistrationRequest request,
            @RequestPart(value = "photo", required = false) MultipartFile photo,
            @RequestPart(value = "receipt", required = false) MultipartFile receipt,
            @RequestPart(value = "id", required = false) MultipartFile id,
            @RequestPart(value = "kyc", required = false) MultipartFile kyc) {

        String userId = jwt.getSubject();

        if (userRegistrationRepository.existsById(userId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "User profile already exists");
        }

        UserRegistration user = UserRegistration.builder()
                .userId(userId)
                .username(request.getUsername())
                .fullName(request.getFullName())
                .dob(request.getDob())
                .collegeName(request.getCollegeName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .admissionYear(request.getAdmissionYear())
                .build();

        try {
            UserRegistration savedUser = registrationService.processSignup(user, photo, receipt, id, kyc);
            return ResponseEntity.status(HttpStatus.CREATED).body(savedUser);
        } catch (java.io.IOException e) {
            log.error("Error during registration upload", e);
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Failed to upload documents");
        }
    }
}
