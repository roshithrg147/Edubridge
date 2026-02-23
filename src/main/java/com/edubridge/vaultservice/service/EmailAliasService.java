package com.edubridge.vaultservice.service;

import com.edubridge.vaultservice.model.UserRegistration;
import org.springframework.stereotype.Service;

import java.time.format.DateTimeFormatter;
import java.util.UUID;

@Service
public class EmailAliasService {

    public String generateAlias(UserRegistration user) {
        if (user.getFullName() == null || user.getDob() == null || user.getCollegeName() == null) {
            throw new IllegalArgumentException("User registration data is incomplete for alias generation");
        }

        String fname = user.getFullName().split(" ")[0].toLowerCase();
        String dobFormatted = user.getDob().format(DateTimeFormatter.ofPattern("MMddyy"));
        String shortUuid = UUID.randomUUID().toString().substring(0, 5);
        String domain = user.getCollegeName().toLowerCase().replaceAll("\\s+", "");

        return String.format("%s%s-%s@%s.edubridge.edu",
                fname, dobFormatted, shortUuid, domain);
    }
}
