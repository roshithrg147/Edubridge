import { useState } from 'react';
import axios from 'axios';
import './Registration.css';

interface RegistrationFormProps {
    token: string;
    onSuccess: (student: any) => void;
}

const RegistrationForm = ({ token, onSuccess }: RegistrationFormProps) => {
    const [formData, setFormData] = useState({
        name: '',
        dob: '',
        email: '',
        collegeName: ''
    });
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        setError('');

        try {
            const response = await axios.post('http://localhost:8081/api/students/register', formData, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            onSuccess(response.data);
        } catch (err) {
            console.error(err);
            setError('Failed to register. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="registration-container">
            <h2>Complete Your Profile</h2>
            <p>Please provide your details to access the vault.</p>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="registration-form">
                <div className="form-group">
                    <label>Full Name</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                        placeholder="John Doe"
                    />
                </div>

                <div className="form-group">
                    <label>Date of Birth</label>
                    <input
                        type="date"
                        name="dob"
                        value={formData.dob}
                        onChange={handleChange}
                        required
                    />
                </div>

                <div className="form-group">
                    <label>Email</label>
                    <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                        placeholder="john@college.edu"
                    />
                </div>

                <div className="form-group">
                    <label>College Name</label>
                    <input
                        type="text"
                        name="collegeName"
                        value={formData.collegeName}
                        onChange={handleChange}
                        required
                        placeholder="Springfield University"
                    />
                </div>

                <button type="submit" disabled={submitting} className="submit-btn">
                    {submitting ? 'Creating Account...' : 'Create Account'}
                </button>
            </form>
        </div>
    );
};

export default RegistrationForm;
