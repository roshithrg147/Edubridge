# EduBridge Secure Document Vault

A high-performance, secure document storage solution built with **Spring Boot 3**, **Spring Security (OAuth2 / JWT)**, **AWS S3**, and **React (Vite)**.

## 🚀 Key Features

*   **Multi-tenant Storage**: Files are securely partitioned in AWS S3 using user-specific prefixes (e.g., `user-id/filename`).
*   **Stateless Authentication**: Secured with JWT-based OAuth2 Resource Server implementation.
*   **Modern Frontend**: A beautiful React + TypeScript UI styled with glassmorphism and animations.
*   **Scalable Architecture**: Microservices-ready design with clear separation of concerns.

## 🛠️ Tech Stack

*   **Backend**: Java 17+, Spring Boot 3, Spring Security 6
*   **Cloud Storage**: AWS S3 (via AWS SDK v2)
*   **Frontend**: React 18, TypeScript, Vite, Axios
*   **Identity Provider**: Auth0 (OpenID Connect)

## 📦 Project Structure

```
edubridge-vault/
├── src/main/java    # Spring Boot Backend
├── frontend/        # React + Vite Frontend
├── pom.xml          # Maven Configuration
```

## ⚙️ Setup & Configuration

### 1. Backend Configuration
Update `src/main/resources/application.yaml`:
```yaml
aws:
  s3:
    bucket-name: your-s3-bucket-name
    region: your-region
```
ensure you have AWS credentials set up in `~/.aws/credentials` or environment variables.

### 2. Frontend Configuration
The frontend requires an Auth0 Client ID to authenticate users.
Open `frontend/src/App.tsx` and update:
```typescript
const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID || 'YOUR_AUTO_CLIENT_ID';
```

## ▶️ Running the Application

### Start the Backend
```bash
./mvnw spring-boot:run
```
The backend will start on `http://localhost:8081`.

### Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
The frontend will start on `http://localhost:5173`.

## 🔒 Security & Multi-tenancy
The application uses strict JWT validation. When a file is uploaded:
1.  The JWT token is validated by the Spring Security Resource Server.
2.  The User ID (sub) is extracted from the token.
3.  The file is uploaded to `s3://bucket-name/{user-id}/{file-name}`.

This ensures users can only access their own isolated storage space (logic can be extended for read access).

---
**EduBridge** - *Bridge the gap to secure learning.*

# Edubridge
🎓 EduBridge Secure Document Vault  A secure, multi-tenant document management system for educational institutions. Stack: Spring Boot 3 · Spring Security (JWT/OAuth2) · AWS S3 SDK v2 · PostgreSQL · Redis · RabbitMQ · React + TypeScript · Docker
