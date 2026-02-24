package com.edubridge.vaultservice.service;

import com.edubridge.vaultservice.model.OutboxEvent;
import com.edubridge.vaultservice.repository.OutboxEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.kafka.core.KafkaTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class OutboxMessageRelay {

    private final OutboxEventRepository outboxEventRepository;
    private final KafkaTemplate<String, String> kafkaTemplate;

    @Scheduled(fixedDelay = 5000)
    public void relayOutboxMessages() {
        List<OutboxEvent> pendingEvents = outboxEventRepository.findByStatus("PENDING");

        if (!pendingEvents.isEmpty()) {
            log.info("Found {} pending outbox events to relay to Kafka", pendingEvents.size());
        }

        for (OutboxEvent event : pendingEvents) {
            try {
                // Send payload to Kafka securely and wait for acknowledgement
                kafkaTemplate.send(event.getEventType(), event.getAggregateId(), event.getPayload()).get();

                // Mark as processed
                event.setStatus("PROCESSED");
                event.setProcessedAt(LocalDateTime.now());
                outboxEventRepository.save(event);

                log.info("Successfully relayed outbox event ID: {} to topic {}", event.getId(), event.getEventType());
            } catch (Exception e) {
                log.error("Failed to relay outbox event ID: {}", event.getId(), e);
                // Mark as failed for retry matching later or DLQ
                event.setStatus("FAILED");
                outboxEventRepository.save(event);
            }
        }
    }
}
