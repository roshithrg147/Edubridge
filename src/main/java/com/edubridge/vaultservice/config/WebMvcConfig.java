package com.edubridge.vaultservice.config;

import com.edubridge.vaultservice.service.SecretsManagerService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
@RequiredArgsConstructor
public class WebMvcConfig implements WebMvcConfigurer {

    private final SecretsManagerService secretsManagerService;

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        String allowedOriginsStr = secretsManagerService.getSecret("CORS_ALLOWED_ORIGINS",
                "http://localhost:5173,http://localhost:5174");
        String[] allowedOrigins = allowedOriginsStr.split(",");

        registry.addMapping("/**")
                .allowedOrigins(allowedOrigins)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);
    }
}
