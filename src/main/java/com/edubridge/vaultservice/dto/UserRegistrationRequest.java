package com.edubridge.vaultservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class UserRegistrationRequest {
    @NotBlank
    private String username;

    @NotBlank
    private String fullName;

    @NotNull
    private LocalDate dob;

    @NotBlank
    private String collegeName;

    @NotBlank
    @Email
    private String email;

    private String phoneNumber;

    private Integer admissionYear;
}
