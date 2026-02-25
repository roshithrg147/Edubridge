package com.edubridge.vaultservice.config;

import org.springframework.amqp.core.*;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    public static final String EXCHANGE = "vault.exchange";

    public static final String VERIFICATION_QUEUE = "verification.queue";
    public static final String VERIFICATION_ROUTING_KEY = "verification.events";

    public static final String DLQ_EXCHANGE = "vault.provisioning.dlx";
    public static final String DLQ_QUEUE = "provisioning-failure-queue";
    public static final String DLQ_ROUTING_KEY = "provisioning.failure.routingKey";

    // --- Main Verification Topology ---

    @Bean
    public DirectExchange exchange() {
        return new DirectExchange(EXCHANGE);
    }

    @Bean
    public Queue verificationQueue() {
        return QueueBuilder.durable(VERIFICATION_QUEUE)
                .withArgument("x-dead-letter-exchange", DLQ_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", DLQ_ROUTING_KEY)
                .build();
    }

    @Bean
    public Binding binding(Queue verificationQueue, DirectExchange exchange) {
        return BindingBuilder.bind(verificationQueue).to(exchange).with(VERIFICATION_ROUTING_KEY);
    }

    // --- Dead Letter Queue Topology ---

    @Bean
    public DirectExchange deadLetterExchange() {
        return new DirectExchange(DLQ_EXCHANGE);
    }

    @Bean
    public Queue deadLetterQueue() {
        return QueueBuilder.durable(DLQ_QUEUE).build();
    }

    @Bean
    public Binding deadLetterBinding(Queue deadLetterQueue, DirectExchange deadLetterExchange) {
        return BindingBuilder.bind(deadLetterQueue).to(deadLetterExchange).with(DLQ_ROUTING_KEY);
    }
}
