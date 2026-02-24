package com.edubridge.vaultservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class EdubridgeVaultApplication {

    public static void main(String[] args) {
        SpringApplication.run(EdubridgeVaultApplication.class, args);
    }

}
