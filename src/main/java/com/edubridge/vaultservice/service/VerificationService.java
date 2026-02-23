package com.edubridge.vaultservice.service;

import com.edubridge.vaultservice.exception.UserNotFoundException;
import com.edubridge.vaultservice.model.UserRegistration;
import com.edubridge.vaultservice.model.VerificationStatus;
import com.edubridge.vaultservice.repository.UserRegistrationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class VerificationService {

    private final UserRegistrationRepository repository;
    private final KafkaTemplate<String, String> kafkaTemplate;

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

        // 🚀 Kafka: Broadcast the result
        String payload = String.format("{\"userId\":\"%s\", \"status\":\"%s\", \"reason\":\"%s\"}",
                userId, status, (reason != null ? reason : ""));

        try {
            kafkaTemplate.send("verification-events", userId, payload);
            log.info("Sent verification event for user: {}", userId);
        } catch (Exception e) {
            log.error("Failed to send Kafka event for user: {}", userId, e);
            // Non-blocking failure for Kafka? Or rethrow?
            // For now, logging error but keeping transaction committed as DB update is more
            // critical
            // In a real system, we might want outbox pattern or retry
        }
    }

    @Transactional(readOnly = true)
    public java.util.List<UserRegistration> getPendingRegistrations() {
        return repository.findByVerificationStatus(VerificationStatus.PENDING);
    }
}
