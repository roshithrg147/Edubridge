import { useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { AlertTriangle, FileWarning, ExternalLink } from 'lucide-react';

interface IdentityVaultProps {
  onComplete: () => void;
}

interface FormState {
  username: string;
  fullName: string;
  institutionName: string;
  dob: string;
  phoneNumber: string;
  admissionYear: string;
}

const IdentityVault = ({ onComplete }: IdentityVaultProps) => {
  const [form, setForm] = useState<FormState>({ username: '', fullName: '', institutionName: '', dob: '', phoneNumber: '', admissionYear: '' });
  const [files, setFiles] = useState<{ [key: string]: File | null }>({ photo: null, id: null, receipt: null, kyc: null });
  const [identity, setIdentity] = useState<any>(null);
  const { user, getAccessTokenSilently } = useAuth0();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: string) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({ ...prev, [type]: e.target.files![0] }));
    }
  };

  const isAnyFileTooLarge = Object.values(files).some(file => file && file.size > 1024 * 1024);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isAnyFileTooLarge) return;
    setLoading(true);
    setError(null);

    try {
      // Get the Access Token from Auth0
      const token = await getAccessTokenSilently();

      // Create FormData
      const formData = new FormData();

      // 1. Append JSON Data
      const userRegistrationRequest = {
        username: form.username,
        fullName: form.fullName,
        collegeName: form.institutionName, // Mapping institutionName to collegeName
        dob: form.dob,
        email: user?.email || '', // Fallback to empty if not available
        phoneNumber: form.phoneNumber,
        admissionYear: parseInt(form.admissionYear)
      };

      formData.append('data', new Blob([JSON.stringify(userRegistrationRequest)], {
        type: 'application/json'
      }));

      // 2. Append Files
      if (files.photo) formData.append('photo', files.photo);
      if (files.id) formData.append('id', files.id);
      if (files.receipt) formData.append('receipt', files.receipt);
      if (files.kyc) formData.append('kyc', files.kyc);

      // 3. Send Request
      const response = await fetch('http://localhost:8081/api/registrations/register', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // Do NOT set Content-Type header manually for FormData; browser does it with boundary
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || 'Registration failed');
      }

      const result = await response.json();
      setIdentity(result);

      // Notify parent component on successful "provisioning"
      setTimeout(onComplete, 2000);
    } catch (err: any) {
      console.error("Provisioning failed", err);
      setError(err.message || "An error occurred during provisioning. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (identity) {
    if (identity.verificationStatus === 'REJECTED') {
      return (
        <div className="max-w-lg mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-red-100 animate-in fade-in zoom-in duration-500 mt-10">
          <div className="bg-gradient-to-br from-red-600 via-red-700 to-red-900 p-10 text-white relative">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <h2 className="text-3xl font-black tracking-tight mb-2">Verification Failed</h2>
            <p className="text-red-100/80 text-sm font-medium">Action Required</p>
          </div>

          <div className="p-10 space-y-6">
            <div className="bg-red-50 border border-red-100 p-6 rounded-2xl">
              <p className="text-xs font-black text-red-400 uppercase tracking-widest mb-2">Reason for Rejection</p>
              <p className="text-red-900 font-medium text-lg">
                {identity.rejectionReason || "One or more documents were unclear or invalid."}
              </p>
            </div>

            <p className="text-slate-500 text-sm">
              Please review the reason above and update your submission. You can resubmit your documents for verification.
            </p>

            <button
              onClick={() => {
                setIdentity(null);
                // Pre-fill form behavior could be added here if we persisted the state better,
                // currently form state is preserved in 'form' state variable if not reset.
                // We just need to clear 'identity' to show the form again.
              }}
              className="w-full bg-red-600 text-white py-4 rounded-xl font-bold hover:bg-red-700 transition shadow-lg shadow-red-200"
            >
              Update & Resubmit
            </button>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-lg mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-500 mt-10">
        <div className="bg-gradient-to-br from-indigo-600 via-blue-700 to-indigo-900 p-10 text-white relative">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.827a1 1 0 00-.788 0l-7 3a1 1 0 000 1.848l.833.357a6.003 6.003 0 005.952 5.952l.357.833a1 1 0 001.848 0l3-7a1 1 0 000-.788l-7-3z" />
            </svg>
          </div>

          <div className="flex justify-between items-start mb-8">
            <div className="h-14 w-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-xl border border-white/30">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
              </svg>
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className="bg-yellow-400 text-yellow-900 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider shadow-sm">
                Status: {identity.verificationStatus}
              </span>
              <span className="text-[10px] font-bold text-blue-100/60 uppercase tracking-widest">EduBridge IDaaS</span>
            </div>
          </div>

          <h2 className="text-3xl font-black tracking-tight mb-1">{identity.fullName}</h2>
          <p className="text-blue-100/80 text-sm font-medium">{identity.institutionName}</p>
        </div>

        <div className="p-10 space-y-8">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-3">Your Official Academic Email</label>
            <div className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative flex items-center justify-between bg-slate-50 p-5 rounded-2xl border border-slate-100">
                <code className="text-indigo-600 font-bold text-sm md:text-base break-all select-all">{identity.provisionedEmail}</code>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(identity.provisionedEmail);
                  }}
                  className="ml-4 p-2 text-slate-400 hover:text-indigo-600 transition"
                  title="Copy to clipboard"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
                </button>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Issue Date</p>
              <p className="text-sm font-bold text-slate-700">{new Date(identity.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest mb-1">Identity Type</p>
              <p className="text-sm font-bold text-slate-700">Digital Passport</p>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex gap-3 items-start">
            <svg className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-xs text-amber-800 leading-relaxed font-medium">
              Your academic email is being provisioned. Once our verification team approves your documents, this alias will activate.
            </p>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onComplete}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition"
            >
              Access Dashboard
            </button>
            <button
              onClick={() => setIdentity(null)}
              className="flex-1 text-slate-400 text-sm font-bold hover:text-slate-600 transition py-3"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-20 mt-10">
      <div className="mb-12 text-center pt-10">
        <div className="inline-block px-4 py-1.5 mb-6 bg-indigo-50 border border-indigo-100 rounded-full">
          <span className="text-xs font-black text-indigo-600 uppercase tracking-widest">Identity-as-a-Service</span>
        </div>
        <h1 className="text-5xl font-black text-slate-900 mb-4 tracking-tight">EduBridge Vault</h1>
        <p className="text-slate-500 text-lg max-w-lg mx-auto">
          Verify once. Unlock hundreds of dollars in professional benefits for free.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100 space-y-8 relative overflow-hidden">
        {loading && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="font-bold text-slate-700">Provisioning Your Alias...</p>
          </div>
        )}

        <div className="space-y-6">
          {/* Personal Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 group-focus-within:text-blue-600 transition">Desired Username</label>
              <input
                type="text" placeholder="john.doe" required
                value={form.username}
                className="w-full px-8 py-5 rounded-[1.5rem] bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 transition-all outline-none text-slate-800 font-medium"
                onChange={e => setForm({ ...form, username: e.target.value })}
              />
            </div>
            <div className="group">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 group-focus-within:text-blue-600 transition">Full Legal Name</label>
              <input
                type="text" placeholder="Johnathan Doe" required
                value={form.fullName}
                className="w-full px-8 py-5 rounded-[1.5rem] bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 transition-all outline-none text-slate-800 font-medium"
                onChange={e => setForm({ ...form, fullName: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="group">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 group-focus-within:text-blue-600 transition">Date of Birth</label>
              <input
                type="date" required
                value={form.dob}
                className="w-full px-8 py-5 rounded-[1.5rem] bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 transition-all outline-none text-slate-800 font-medium"
                onChange={e => setForm({ ...form, dob: e.target.value })}
              />
            </div>
            <div className="group">
              <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 group-focus-within:text-blue-600 transition">Phone Number</label>
              <input
                type="tel" placeholder="+1 (555) 000-0000" required
                value={form.phoneNumber}
                className="w-full px-8 py-5 rounded-[1.5rem] bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 transition-all outline-none text-slate-800 font-medium"
                onChange={e => setForm({ ...form, phoneNumber: e.target.value })}
              />
            </div>
          </div>

          {/* Academic Information */}
          <div className="group">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 group-focus-within:text-blue-600 transition">Institution Name</label>
            <input
              type="text" placeholder="State University" required
              value={form.institutionName}
              className="w-full px-8 py-5 rounded-[1.5rem] bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 transition-all outline-none text-slate-800 font-medium"
              onChange={e => setForm({ ...form, institutionName: e.target.value })}
            />
          </div>

          <div className="group">
            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-4 mb-2 group-focus-within:text-blue-600 transition">Admission Year</label>
            <input
              type="number" placeholder="2023" required min="1900" max="2099"
              value={form.admissionYear}
              className="w-full px-8 py-5 rounded-[1.5rem] bg-slate-50 border-2 border-transparent focus:bg-white focus:border-blue-500 transition-all outline-none text-slate-800 font-medium"
              onChange={e => setForm({ ...form, admissionYear: e.target.value })}
            />
          </div>
        </div>

        {/* Document Uploads */}
        <div className="space-y-4">
          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest ml-4 mb-2">Verification Documents</label>

          {/* Photo Upload */}
          <div className="p-6 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50 hover:bg-slate-50 transition-all">
            <p className="text-sm font-bold text-slate-700 mb-2">Profile Photo</p>
            <input type="file" required accept="image/*" onChange={e => handleFileChange(e, 'photo')} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>

          {/* College ID Upload */}
          <div className="p-6 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50 hover:bg-slate-50 transition-all">
            <p className="text-sm font-bold text-slate-700 mb-2">College ID Card</p>
            <input type="file" required accept="image/*,application/pdf" onChange={e => handleFileChange(e, 'id')} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>

          {/* Fee Receipt Upload */}
          <div className="p-6 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50 hover:bg-slate-50 transition-all">
            <p className="text-sm font-bold text-slate-700 mb-2">Fee Receipt</p>
            <input type="file" required accept="image/*,application/pdf" onChange={e => handleFileChange(e, 'receipt')} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>

          {/* KYC/Other Upload */}
          <div className="p-6 border-2 border-dashed border-slate-200 rounded-[2rem] bg-slate-50/50 hover:bg-slate-50 transition-all">
            <p className="text-sm font-bold text-slate-700 mb-2">KYC / Transcript</p>
            <input type="file" required accept="image/*,application/pdf" onChange={e => handleFileChange(e, 'kyc')} className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
          </div>
        </div>

        {isAnyFileTooLarge && (
          <div className="p-6 bg-amber-50 border border-amber-200 rounded-[2rem] animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex gap-4 items-start">
              <div className="bg-amber-100 p-2 rounded-xl text-amber-600">
                <FileWarning className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-amber-900 mb-1 caps">Files too large (Max 1MB)</p>
                <p className="text-xs text-amber-700 leading-relaxed mb-4">
                  To ensure fast document processing, please keep all uploads under 1MB. Use these free tools to compress your documents before uploading.
                </p>
                <div className="flex flex-wrap gap-2">
                  <a
                    href="https://tinypng.com" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-amber-200 rounded-xl text-[10px] font-black uppercase tracking-wider text-amber-700 hover:bg-amber-100 transition shadow-sm"
                  >
                    Compress Images <ExternalLink className="w-3 h-3" />
                  </a>
                  <a
                    href="https://ilovepdf.com/compress_pdf" target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-amber-200 rounded-xl text-[10px] font-black uppercase tracking-wider text-amber-700 hover:bg-amber-100 transition shadow-sm"
                  >
                    Compress PDF <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {error && <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-center text-sm font-bold border border-red-100">{error}</div>}

        <button
          type="submit"
          disabled={loading || isAnyFileTooLarge}
          className={`w-full py-6 rounded-[1.8rem] font-black text-xl transition-all shadow-xl active:scale-95 group ${isAnyFileTooLarge
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-slate-900 text-white hover:bg-blue-600 hover:shadow-blue-200'
            }`}
        >
          <span className="flex items-center justify-center gap-3">
            {isAnyFileTooLarge ? 'Documents Too Large' : 'Claim My Academic Email'}
            {!isAnyFileTooLarge && <svg className="w-6 h-6 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6" /></svg>}
            {isAnyFileTooLarge && <AlertTriangle className="w-6 h-6" />}
          </span>
        </button>

        <p className="text-[10px] text-slate-400 text-center uppercase tracking-widest font-bold">
          Encrypted & Secure • Powered by EduBridge IDaaS
        </p>
      </form>
    </div>
  );
};

export default IdentityVault;
