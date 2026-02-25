package com.edubridge.vaultservice.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;
import software.amazon.awssdk.services.s3.presigner.S3Presigner;

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

    private final S3Presigner s3Presigner;

    public S3Service(S3Client s3Client, S3Presigner s3Presigner) {
        this.s3Client = s3Client;
        this.s3Presigner = s3Presigner;
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
            if (file.getSize() > 5 * 1024 * 1024) {
                log.info("File exceeds 5MB, initiating multipart upload for key: {}", key);
                software.amazon.awssdk.services.s3.model.CreateMultipartUploadResponse createResponse = s3Client
                        .createMultipartUpload(r -> r.bucket(bucketName).key(key).metadata(metadata)
                                .contentType(file.getContentType()));
                String uploadId = createResponse.uploadId();

                java.util.List<software.amazon.awssdk.services.s3.model.CompletedPart> completedParts = new java.util.ArrayList<>();
                long partSize = 5 * 1024 * 1024; // 5 MB
                int partNumber = 1;
                byte[] buffer = new byte[(int) partSize];

                try (java.io.InputStream is = file.getInputStream()) {
                    int bytesRead;
                    while ((bytesRead = is.read(buffer)) > 0) {
                        software.amazon.awssdk.services.s3.model.UploadPartRequest uploadPartRequest = software.amazon.awssdk.services.s3.model.UploadPartRequest
                                .builder()
                                .bucket(bucketName)
                                .key(key)
                                .uploadId(uploadId)
                                .partNumber(partNumber)
                                .build();

                        software.amazon.awssdk.services.s3.model.UploadPartResponse uploadPartResponse = s3Client
                                .uploadPart(uploadPartRequest,
                                        RequestBody.fromBytes(java.util.Arrays.copyOf(buffer, bytesRead)));

                        completedParts.add(software.amazon.awssdk.services.s3.model.CompletedPart.builder()
                                .partNumber(partNumber)
                                .eTag(uploadPartResponse.eTag())
                                .build());
                        partNumber++;
                    }
                } catch (Exception e) {
                    log.error("Multipart upload failed. Aborting...", e);
                    s3Client.abortMultipartUpload(a -> a.bucket(bucketName).key(key).uploadId(uploadId));
                    throw e;
                }

                s3Client.completeMultipartUpload(c -> c.bucket(bucketName).key(key).uploadId(uploadId)
                        .multipartUpload(m -> m.parts(completedParts)));
            } else {
                PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                        .bucket(bucketName)
                        .key(key)
                        .metadata(metadata)
                        .contentType(file.getContentType())
                        .build();

                s3Client.putObject(putObjectRequest,
                        RequestBody.fromInputStream(file.getInputStream(), file.getSize()));
            }

            log.info("File upload successful. Key: {}", key);
            return key;
        } catch (software.amazon.awssdk.services.s3.model.S3Exception e) {
            log.error("S3 Upload failed. Status: {}, Code: {}, Message: {}",
                    e.statusCode(), e.awsErrorDetails().errorCode(), e.awsErrorDetails().errorMessage());
            throw new IOException("S3 service rejected upload", e);
        } catch (software.amazon.awssdk.awscore.exception.AwsServiceException e) {
            log.error("AWS Service Error during upload: {}", e.getMessage(), e);
            throw new IOException("AWS service error", e);
        } catch (software.amazon.awssdk.core.exception.SdkClientException e) {
            log.error("AWS Client Error (Network/Timeout) during upload: {}", e.getMessage(), e);
            throw new IOException("AWS client connection error", e);
        } catch (Exception e) {
            log.error("Unexpected error during file upload", e);
            throw new IOException("Unexpected file upload error", e);
        }
    }

    public String generatePresignedUrl(String key) {
        if (key == null || key.isEmpty()) {
            return null;
        }

        try {
            var presignRequest = software.amazon.awssdk.services.s3.model.GetObjectRequest.builder()
                    .bucket(bucketName)
                    .key(key)
                    .build();

            var presignOptions = software.amazon.awssdk.services.s3.presigner.model.GetObjectPresignRequest.builder()
                    .signatureDuration(java.time.Duration.ofMinutes(15))
                    .getObjectRequest(presignRequest)
                    .build();

            var presignedUrl = s3Presigner.presignGetObject(presignOptions).url();
            return presignedUrl.toString();
        } catch (Exception e) {
            log.error("Error generating pre-signed URL for key: {}", key, e);
            return null;
        }
    }
}