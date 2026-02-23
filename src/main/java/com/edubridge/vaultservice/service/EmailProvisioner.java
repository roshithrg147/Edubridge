package com.edubridge.vaultservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.edubridge.vaultservice.repository.UserRegistrationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailProvisioner {

    private final UserRegistrationRepository repository;
    private final EmailAliasService emailAliasService;
    private final ObjectMapper objectMapper;

    @KafkaListener(topics = "verification-events", groupId = "email-provisioner-group")
    @Transactional
    public void processVerificationEvent(String message) {
        log.info("Received verification event: {}", message);
        try {
            JsonNode payload = objectMapper.readTree(message);
            String userId = payload.get("userId").asText();
            String statusStr = payload.get("status").asText();

            if ("APPROVED".equals(statusStr)) {
                repository.findById(userId).ifPresentOrElse(user -> {
                    if (user.getProvisionedEmail() == null) {
                        try {
                            String alias = emailAliasService.generateAlias(user);
                            user.setProvisionedEmail(alias);
                            repository.save(user);
                            log.info("Provisioned email {} for user {}", alias, userId);
                        } catch (Exception e) {
                            log.error("Failed to generate/save alias for user: {}", userId, e);
                        }
                    } else {
                        log.info("User {} already has provisioned email: {}", userId, user.getProvisionedEmail());
                    }
                }, () -> log.error("User not found for provisioning: {}", userId));
            }
        } catch (Exception e) {
            log.error("Failed to parse verification event: {}", message, e);
        }
    }
}
