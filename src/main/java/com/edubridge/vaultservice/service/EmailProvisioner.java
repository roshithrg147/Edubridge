package com.edubridge.vaultservice.service;

import com.edubridge.vaultservice.repository.UserRegistrationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailProvisioner {

    private final UserRegistrationRepository repository;
    private final CacheService cacheService;

    @Transactional
    public void provisionGraduateAlias(String userId, String customAlias, String fullName) {
        log.info("Alias Provisioning Started for user: {}", userId);
        repository.findById(userId).ifPresentOrElse(user -> {
            if (user.getProvisionedEmail() != null) {
                log.info("Alias already provisioned for user {}: {}", userId, user.getProvisionedEmail());
                return;
            }

            try {
                String alias;
                if (customAlias != null && !customAlias.trim().isEmpty()) {
                    alias = customAlias.trim().toLowerCase() + "@edubridge.edu";
                } else if (fullName != null && !fullName.trim().isEmpty()) {
                    String slug = fullName.trim().toLowerCase().replaceAll("\\s+", ".");
                    alias = slug + "@edubridge.edu";
                } else {
                    alias = "grad." + userId.substring(0, 8) + "@edubridge.edu";
                }

                // Implement Distributed RLock to prevent concurrent duplicate provisioning
                cacheService.executeWithLock("provision_alias_" + alias, () -> {
                    if (repository.existsByProvisionedEmail(alias)) {
                        throw new RuntimeException("Alias already taken: " + alias);
                    }

                    // Mock AWS SES Provisioning
                    mockAwsSesProvisioning(alias);

                    user.setProvisionedEmail(alias);
                    repository.save(user);
                    log.info("Successfully persisted alias {} for user {}", alias, userId);
                    return null;
                });

            } catch (Exception e) {
                log.error("Failed to provision alias for user: {}", userId, e);
                // Depending on requirements, we could rethrow to trigger Kafka retry
                throw new RuntimeException("Provisioning failed", e);
            }
        }, () -> log.error("User not found for provisioning: {}", userId));
    }

    private void mockAwsSesProvisioning(String calcAlias) {
        log.info("AWS SES Success: Created alias {}", calcAlias);
    }
}
