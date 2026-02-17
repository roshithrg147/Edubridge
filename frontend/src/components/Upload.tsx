
import { useState } from 'react';
import axios from 'axios';
import './Upload.css'; // Assume similar styles or extend App.css

interface UploadProps {
    token: string;
}

const Upload = ({ token }: UploadProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFile(e.target.files[0]);
            setMessage('');
            setError('');
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        setMessage('');
        setError('');

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('/api/vault/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                    'Authorization': `Bearer ${token}`
                }
            });
            setMessage('File uploaded successfully! Key: ' + response.data);
            setFile(null);
        } catch (err: any) {
            setError(err.response?.data || 'Upload failed. Check console.');
            console.error(err);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="upload-container">
            <h2>Upload Document</h2>
            <div className="file-input-wrapper">
                <input type="file" onChange={handleFileChange} className="file-input" />
            </div>

            {file && (
                <div className="file-preview">
                    <p>Selected: {file.name}</p>
                    <button
                        onClick={handleUpload}
                        disabled={uploading}
                        className="upload-btn"
                    >
                        {uploading ? 'Uploading...' : 'Upload to Vault'}
                    </button>
                </div>
            )}

            {message && <p className="success-msg">{message}</p>}
            {error && <p className="error-msg">{error}</p>}
        </div>
    );
};

export default Upload;
