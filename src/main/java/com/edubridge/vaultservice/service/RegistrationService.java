package com.edubridge.vaultservice.service;

import com.edubridge.vaultservice.model.UserRegistration;
import com.edubridge.vaultservice.model.VerificationStatus;
import com.edubridge.vaultservice.repository.UserRegistrationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@Service
@RequiredArgsConstructor
@Slf4j
public class RegistrationService {

    private final UserRegistrationRepository repository;
    private final S3Service s3Service;
    private final CacheService cacheService;

    @Transactional
    public UserRegistration processSignup(UserRegistration reg,
            MultipartFile photo,
            MultipartFile receipt,
            MultipartFile id,
            MultipartFile kyc) throws IOException {

        log.info("Processing signup for user: {}", reg.getUserId());

        // 1. Concurrent Uploads to S3 (Sequential here, but fast enough)
        if (photo != null && !photo.isEmpty()) {
            reg.setPhotoKey(s3Service.uploadFile(reg.getUserId() + "/profile", photo));
        }
        if (receipt != null && !receipt.isEmpty()) {
            reg.setFeeReceiptKey(s3Service.uploadFile(reg.getUserId() + "/finance", receipt));
        }
        if (id != null && !id.isEmpty()) {
            reg.setCollegeIdKey(s3Service.uploadFile(reg.getUserId() + "/docs", id));
        }
        if (kyc != null && !kyc.isEmpty()) {
            reg.setKycKey(s3Service.uploadFile(reg.getUserId() + "/kyc", kyc));
        }

        // 2. Generate Provisioned Email Alias & Save inside a distributed lock
        return cacheService.executeWithLock("alias_lock_" + reg.getUserId(), () -> {
            String safeName = reg.getFullName().toLowerCase().replaceAll("\\s+", "");
            String safeDob = reg.getDob().toString().replaceAll("-", "");
            String safeCollege = reg.getCollegeName().toLowerCase().replaceAll("\\s+", "").replaceAll("[^a-z0-9]", "");

            String alias = String.format("%s-%s-%s@edubridge.edu", safeName, safeDob, safeCollege);

            reg.setProvisionedEmail(alias);
            reg.setVerificationStatus(VerificationStatus.PENDING);

            // 3. Final save to Supabase
            return repository.save(reg);
        });
    }
}
