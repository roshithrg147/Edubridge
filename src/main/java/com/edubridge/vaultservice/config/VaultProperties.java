package com.edubridge.vaultservice.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

@Configuration
@ConfigurationProperties(prefix = "edubridge.vault")
@Data
public class VaultProperties {
    private Security security = new Security();

    @Data
    public static class Security {
        private int jwksConnectTimeoutMs = 30000;
        private int jwksReadTimeoutMs = 30000;
        private String issuerUri = "https://dev-edubridge.us.auth0.com/";
    }
}
