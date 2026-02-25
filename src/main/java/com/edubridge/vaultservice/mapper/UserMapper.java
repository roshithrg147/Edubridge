package com.edubridge.vaultservice.mapper;

import com.edubridge.vaultservice.dto.UserProfileResponse;
import com.edubridge.vaultservice.dto.UserRegistrationRequest;
import com.edubridge.vaultservice.model.UserRegistration;
import com.edubridge.vaultservice.service.S3Service;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;

@Mapper(componentModel = "spring")
public interface UserMapper {

    @Mapping(target = "userId", ignore = true)
    @Mapping(target = "verificationStatus", ignore = true)
    @Mapping(target = "rejectionReason", ignore = true)
    @Mapping(target = "provisionedEmail", ignore = true)
    @Mapping(target = "photoKey", ignore = true)
    @Mapping(target = "feeReceiptKey", ignore = true)
    @Mapping(target = "collegeIdKey", ignore = true)
    @Mapping(target = "kycKey", ignore = true)
    @Mapping(target = "academicLevel", ignore = true)
    @Mapping(target = "customAlias", ignore = true)
    UserRegistration toEntity(UserRegistrationRequest request);

    @Mapping(target = "photoUrl", expression = "java(s3Service.generatePresignedUrl(user.getPhotoKey()))")
    @Mapping(target = "feeReceiptUrl", expression = "java(s3Service.generatePresignedUrl(user.getFeeReceiptKey()))")
    @Mapping(target = "collegeIdUrl", expression = "java(s3Service.generatePresignedUrl(user.getCollegeIdKey()))")
    @Mapping(target = "kycUrl", expression = "java(s3Service.generatePresignedUrl(user.getKycKey()))")
    UserProfileResponse toResponse(UserRegistration user, S3Service s3Service);
}
