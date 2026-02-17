package com.edubridge.vaultservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@lombok.extern.slf4j.Slf4j
public class S3Service {
    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    public S3Service(S3Client s3Client) {
        this.s3Client = s3Client;
    }

    public String uploadFile(String userId, MultipartFile file) throws IOException {
        log.info("Starting file upload for user: {}", userId);

        // Create a unique key using the userId as a folder (Multi-tenancy)
        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        String key = userId + "/" + fileName;

        // Adding Metadata - Interviewer's favorite!
        Map<String, String> metadata = new HashMap<>();
        metadata.put("original-name", file.getOriginalFilename());
        metadata.put("uploaded-by", userId);

        log.debug("Uploading file to bucket: {} with key: {}", bucketName, key);

        try {
            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .metadata(metadata)
                    .contentType(file.getContentType())
                    .build();

            s3Client.putObject(putObjectRequest,
                    RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

            log.info("File upload successful. Key: {}", key);
            return key;
        } catch (software.amazon.awssdk.services.s3.model.S3Exception e) {
            log.error("S3 Upload failed: {}", e.awsErrorDetails().errorMessage(), e);
            throw new IOException("Failed to upload file to S3", e);
        } catch (Exception e) {
            log.error("Unexpected error during file upload", e);
            throw e;
        }
    }
}