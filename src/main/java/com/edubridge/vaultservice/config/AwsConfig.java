package com.edubridge.vaultservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import software.amazon.awssdk.regions.Region;
import software.amazon.awssdk.services.s3.S3Client;

@Configuration
public class AwsConfig {

    @org.springframework.beans.factory.annotation.Value("${aws.s3.region}")
    private String region;

    @org.springframework.beans.factory.annotation.Value("${aws.access-key}")
    private String accessKey;

    @org.springframework.beans.factory.annotation.Value("${aws.secret-key}")
    private String secretKey;

    @Bean
    public S3Client s3Client() {
        return S3Client.builder()
                .region(Region.of(region))
                .credentialsProvider(software.amazon.awssdk.auth.credentials.StaticCredentialsProvider.create(
                        software.amazon.awssdk.auth.credentials.AwsBasicCredentials.create(accessKey, secretKey)))
                .build();
    }

    @Bean
    public software.amazon.awssdk.services.s3.presigner.S3Presigner s3Presigner() {
        return software.amazon.awssdk.services.s3.presigner.S3Presigner.builder()
                .region(Region.of(region))
                .credentialsProvider(software.amazon.awssdk.auth.credentials.StaticCredentialsProvider.create(
                        software.amazon.awssdk.auth.credentials.AwsBasicCredentials.create(accessKey, secretKey)))
                .build();
    }
}
