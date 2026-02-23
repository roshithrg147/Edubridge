package com.edubridge.vaultservice.dto;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDate;

@Data
@Builder
public class UserProfileResponse {
    private String fullName;
    private String email;
    private String collegeName;
    private LocalDate dob;
    private String phoneNumber;
    private Integer admissionYear;

    // Secure Pre-signed URLs

    private String verificationStatus;
    private String provisionedEmail;

    private String photoUrl;
    private String feeReceiptUrl;
    private String collegeIdUrl;
    private String kycUrl;
}
