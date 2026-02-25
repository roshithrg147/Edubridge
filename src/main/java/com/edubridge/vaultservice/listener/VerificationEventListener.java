package com.edubridge.vaultservice.listener;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.amqp.support.AmqpHeaders;
import org.springframework.messaging.handler.annotation.Header;
import com.rabbitmq.client.Channel;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
@Slf4j
public class VerificationEventListener {

    private final ObjectMapper objectMapper;
    private final com.edubridge.vaultservice.service.EmailProvisioner emailProvisioner;

    @RabbitListener(queues = com.edubridge.vaultservice.config.RabbitMQConfig.VERIFICATION_QUEUE)
    public void listen(String message, Channel channel, @Header(AmqpHeaders.DELIVERY_TAG) long tag) {
        log.info("Received verification event: {}", message);
        try {
            JsonNode payload = objectMapper.readTree(message);
            String status = payload.has("status") ? payload.get("status").asText() : "";
            String academicLevel = payload.has("academicLevel") ? payload.get("academicLevel").asText() : "";

            if ("APPROVED".equals(status) && "GRADUATE".equalsIgnoreCase(academicLevel)) {
                log.info("Policy Match Detected: GRADUATE user verification approved.");

                String userId = payload.get("userId").asText();
                String customAlias = payload.has("customAlias") ? payload.get("customAlias").asText() : null;
                String fullName = payload.has("fullName") ? payload.get("fullName").asText() : null;

                emailProvisioner.provisionGraduateAlias(userId, customAlias, fullName);
            }

            // Manual Acknowledgement
            channel.basicAck(tag, false);
        } catch (Exception e) {
            log.error("Failed to process event. Nacking. Message: {}", message, e);
            try {
                // Reject with requeue=false to send to DLQ
                channel.basicNack(tag, false, false);
            } catch (Exception ex) {
                log.error("Failed to Nack message", ex);
            }
        }
    }
}
