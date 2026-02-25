package com.edubridge.vaultservice.config;

import com.edubridge.vaultservice.service.SecretsManagerService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.jdbc.DataSourceBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import javax.sql.DataSource;

@Configuration
public class DataSourceConfig {

    private final SecretsManagerService secretsManagerService;

    @Value("${spring.datasource.url}")
    private String url;

    @Value("${spring.datasource.username}")
    private String username;

    public DataSourceConfig(SecretsManagerService secretsManagerService) {
        this.secretsManagerService = secretsManagerService;
    }

    @Bean
    public DataSource dataSource() {
        return DataSourceBuilder.create()
                .url(url)
                .username(username)
                .password(secretsManagerService.getSecret("DB_PASSWORD", ""))
                .driverClassName("org.postgresql.Driver")
                .build();
    }
}
