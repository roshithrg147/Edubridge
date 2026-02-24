CREATE TABLE IF NOT EXISTS registrations (
    user_id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) UNIQUE,
    full_name VARCHAR(255),
    dob DATE,
    college_name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    phone_number VARCHAR(255),
    admission_year INTEGER,
    verification_status VARCHAR(50) DEFAULT 'PENDING',
    rejection_reason VARCHAR(255),
    provisioned_email VARCHAR(255),
    photo_key VARCHAR(255),
    fee_receipt_key VARCHAR(255),
    college_id_key VARCHAR(255),
    kyc_key VARCHAR(255)
);

CREATE TABLE IF NOT EXISTS outbox_events (
    id UUID PRIMARY KEY,
    aggregate_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(255) NOT NULL,
    payload TEXT NOT NULL,
    processed BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);
