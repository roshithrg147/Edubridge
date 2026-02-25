package com.edubridge.vaultservice.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.secretsmanager.SecretsManagerClient;
import software.amazon.awssdk.services.secretsmanager.model.GetSecretValueRequest;

import jakarta.annotation.PostConstruct;

@Service
@Slf4j
public class SecretsManagerService {

    @Value("${aws.s3.region}")
    private String region;

    @Value("${aws.secrets-manager.secret-name}")
    private String secretName;

    private JsonNode cachedSecrets;
    private final ObjectMapper mapper = new ObjectMapper();

    @PostConstruct
    public void init() {
        log.info("Fetching runtime credentials from AWS Secrets Manager: {}", secretName);
        try (SecretsManagerClient client = SecretsManagerClient.builder()
                .region(Region.of(region))
                .credentialsProvider(DefaultCredentialsProvider.create())
                .build()) {

            GetSecretValueRequest getSecretValueRequest = GetSecretValueRequest.builder()
                    .secretId(secretName)
                    .build();

            String secretString = client.getSecretValue(getSecretValueRequest).secretString();
            cachedSecrets = mapper.readTree(secretString);
            log.info("Successfully fetched and cached secrets from AWS Secrets Manager.");
        } catch (Exception e) {
            log.error("Failed to fetch secrets from AWS Secrets Manager. Falling back to environment variables.", e);
            cachedSecrets = mapper.createObjectNode();
        }
    }

    public String getSecret(String key, String defaultValue) {
        if (cachedSecrets != null && cachedSecrets.has(key)) {
            return cachedSecrets.get(key).asText();
        }
        String value = System.getenv(key);
        if (value == null) {
            value = System.getProperty(key);
        }
        return value != null ? value : defaultValue;
    }
}
