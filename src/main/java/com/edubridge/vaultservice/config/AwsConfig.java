package com.edubridge.vaultservice.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import software.amazon.awssdk.auth.credentials.DefaultCredentialsProvider;
import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;
import software.amazon.awssdk.http.apache.ApacheHttpClient;
import java.time.Duration;

@Configuration
@Slf4j
public class AwsConfig {

        @Value("${aws.s3.region}")
        private String region;

        @Value("${aws.secrets-manager.secret-name:edubridge/vault/production/secrets}")
        private String secretName;

        @Bean
        public S3Client s3Client() {
                // Milestone 3: S3Client managed as a robust Singleton with High Concurrency
                // Pool
                return S3Client.builder()
                                .region(Region.of(region))
                                .credentialsProvider(DefaultCredentialsProvider.create())
                                .httpClientBuilder(ApacheHttpClient.builder()
                                                .maxConnections(100)
                                                .connectionTimeout(Duration.ofSeconds(5))
                                                .socketTimeout(Duration.ofSeconds(30)))
                                .build();
        }

        @Bean
        public S3Presigner s3Presigner() {
                return S3Presigner.builder()
                                .region(Region.of(region))
                                .credentialsProvider(DefaultCredentialsProvider.create())
                                .build();
        }
}
