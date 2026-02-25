package com.edubridge.vaultservice.service;

import com.edubridge.vaultservice.exception.UserNotFoundException;
import com.edubridge.vaultservice.model.OutboxEvent;
import com.edubridge.vaultservice.model.UserRegistration;
import com.edubridge.vaultservice.model.VerificationStatus;
import com.edubridge.vaultservice.repository.OutboxEventRepository;
import com.edubridge.vaultservice.repository.UserRegistrationRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class VerificationService {

    private final UserRegistrationRepository repository;
    private final OutboxEventRepository outboxEventRepository;
    private final ObjectMapper objectMapper;

    @Transactional
    public void handleVerification(String userId, VerificationStatus status, String reason) {
        log.info("Handling verification for user: {}, status: {}", userId, status);
        UserRegistration user = repository.findById(userId)
                .orElseThrow(() -> new UserNotFoundException(userId));

        user.setVerificationStatus(status);
        if (status == VerificationStatus.REJECTED) {
            user.setRejectionReason(reason);
        } else {
            user.setRejectionReason(null); // Clear reason if approved/pending
        }
        repository.save(user);

        // Save to Outbox using JSON serialization
        try {
            Map<String, Object> payloadMap = new HashMap<>();
            payloadMap.put("userId", userId);
            payloadMap.put("status", status.name());
            if (user.getAcademicLevel() != null) {
                payloadMap.put("academicLevel", user.getAcademicLevel());
            }
            if (user.getCustomAlias() != null) {
                payloadMap.put("customAlias", user.getCustomAlias());
            }
            if (user.getFullName() != null) {
                payloadMap.put("fullName", user.getFullName());
            }

            if (reason != null && !reason.trim().isEmpty()) {
                payloadMap.put("reason", reason);
            }
            String payloadJson = objectMapper.writeValueAsString(payloadMap);

            OutboxEvent event = OutboxEvent.builder()
                    .aggregateId(userId)
                    .eventType("verification-events")
                    .payload(payloadJson)
                    .status("PENDING")
                    .build();

            outboxEventRepository.save(event);
            log.info("Saved verification OutboxEvent for user: {}", userId);
        } catch (Exception e) {
            log.error("Failed to serialize Outbox payload", e);
            throw new RuntimeException("Failed to serialize Outbox payload", e);
        }
    }

    @Transactional(readOnly = true)
    public List<UserRegistration> getPendingRegistrations() {
        return repository.findByVerificationStatus(VerificationStatus.PENDING);
    }
}
