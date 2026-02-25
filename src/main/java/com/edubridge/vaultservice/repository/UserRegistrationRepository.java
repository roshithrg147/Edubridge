package com.edubridge.vaultservice.repository;

import com.edubridge.vaultservice.model.UserRegistration;
import com.edubridge.vaultservice.model.VerificationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRegistrationRepository extends JpaRepository<UserRegistration, String> {
    Optional<UserRegistration> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    boolean existsByProvisionedEmail(String provisionedEmail);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = { "verificationStatus" })
    java.util.List<UserRegistration> findByVerificationStatus(VerificationStatus status);
}
