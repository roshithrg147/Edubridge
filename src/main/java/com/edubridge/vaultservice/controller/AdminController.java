package com.edubridge.vaultservice.controller;

import com.edubridge.vaultservice.model.VerificationStatus;
import com.edubridge.vaultservice.service.VerificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@Slf4j
public class AdminController {

    private final VerificationService verificationService;

    @PatchMapping("/verify/{userId}")
    @PreAuthorize("hasAuthority('ROLE_verify:users')")
    public ResponseEntity<String> verifyUser(
            @PathVariable String userId,
            @RequestParam VerificationStatus status,
            @RequestParam(required = false) String reason) {

        log.info("Admin verification request for user: {}, status: {}", userId, status);
        verificationService.handleVerification(userId, status, reason);
        return ResponseEntity.ok("User verification status updated successfully.");
    }

    @GetMapping("/registrations/pending")
    @PreAuthorize("hasAuthority('ROLE_verify:users')")
    public ResponseEntity<java.util.List<com.edubridge.vaultservice.model.UserRegistration>> getPendingRegistrations() {
        log.info("Admin request for pending registrations");
        return ResponseEntity.ok(verificationService.getPendingRegistrations());
    }
}
