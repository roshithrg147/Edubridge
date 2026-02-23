package com.edubridge.vaultservice.listener;

import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class VerificationEventListener {

    @KafkaListener(topics = "verification-events", groupId = "edubridge-vault-group")
    public void listen(String message) {
        log.info("Received verification event: {}", message);
    }
}
