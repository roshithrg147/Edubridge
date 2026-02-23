export interface UserProfile {
    fullName: string;
    email: string;
    collegeName: string;
    dob: string;
    phoneNumber: string;
    admissionYear: number;

    // Secure Pre-signed URLs
    photoUrl?: string;
    feeReceiptUrl?: string;
    collegeIdUrl?: string;
    kycUrl?: string;
}
