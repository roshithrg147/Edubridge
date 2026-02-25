package com.edubridge.vaultservice.model;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.LocalDate;

@Entity
@Table(name = "registrations")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserRegistration {
    @Id
    private String userId; // From Auth0 'sub' claim

    // Text Data (Stored in Supabase)
    @Column(unique = true)
    private String username;

    private String fullName;
    private LocalDate dob;
    private String collegeName;

    @Column(unique = true)
    private String email;

    private String phoneNumber;
    private Integer admissionYear;

    private String academicLevel;
    private String customAlias;

    // Status & Provisioning
    @Enumerated(EnumType.STRING)
    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    private String rejectionReason;

    private String provisionedEmail; // The generated alias

    // File Pointers (S3 Keys stored in Supabase)
    private String photoKey;
    private String feeReceiptKey;
    private String collegeIdKey;
    private String kycKey;
}
