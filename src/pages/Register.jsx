import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../api/client';
import ImageUpload from '../components/ImageUpload';
import { useMasterData } from '../context/MasterDataContext';

const Register = () => {
  const { colleges: COLLEGES, loading: metadataLoading } = useMasterData();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const navigate = useNavigate();

  const handleNext = () => {
    setError('');
    // Basic step validation
    if (step === 1 && (!email || !password)) {
      setError("Please provide both email and password.");
      return;
    }
    if (step === 2 && (!firstName || !lastName || !studentId)) {
      setError("Please fill in all identity fields.");
      return;
    }
    if (step === 3 && !department) {
      setError("Please select your department.");
      return;
    }
    if (step === 4 && !proofUrl) {
      setError("Please upload your verification proof.");
      return;
    }
    setStep(s => Math.min(s + 1, totalSteps));
  };
  
  const handlePrev = () => {
    setError('');
    setStep(s => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    const payload = { 
      email, 
      password, 
      role: 'student',
      first_name: firstName,
      last_name: lastName,
      student_id_number: studentId,
      department: department,
      verification_proof_url: proofUrl
    };

    try {
      await apiClient.post('/auth/register', payload);
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="flex items-center justify-center min-h-[90vh] px-4 py-10 md:py-20 relative overflow-hidden">
      {/* Dynamic Ambient Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-900/20 via-transparent to-transparent"></div>
      
      <div 
        className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] md:w-[700px] h-[400px] md:h-[700px] bg-sky-500/10 rounded-full pointer-events-none"
      ></div>

      <div 
        className="absolute bottom-1/4 right-1/4 w-[300px] md:w-[500px] h-[300px] md:h-[500px] bg-uni-500/10 rounded-full pointer-events-none"
      ></div>
      
      {/* Subtle Grid Overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <div 
        className="w-full max-w-md mx-auto p-4 sm:p-8 relative z-10 my-8 flex flex-col justify-center"
      >
        <div className="text-center mb-8 relative z-20">
           <h1 className="text-3xl font-extrabold tracking-tight mb-2 bg-gradient-to-br from-white via-white/90 to-slate-500 bg-clip-text text-transparent">Create an account</h1>
           <p className="text-slate-400 text-sm mb-6 pb-2 mx-6">Join the university lost & found network.</p>
           
           {/* Liquid Progress Bar */}
           <div className="relative w-full max-w-[200px] mx-auto h-1.5 bg-slate-800/50 rounded-full overflow-hidden mb-3 border border-white/5">
                <div 
                    style={{ width: `${(step / totalSteps) * 100}%` }}
                    className="absolute top-0 left-0 h-full bg-gradient-to-r from-sky-500 to-sky-300 rounded-full transition-all duration-300"
                ></div>
           </div>
           <span className="text-[10px] font-bold text-sky-500/70 uppercase tracking-[0.2em]">Step {step} of {totalSteps}</span>
        </div>

          {error && (
            <div 
              className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-medium text-center rounded-2xl"
            >
               {error}
            </div>
          )}
        
        <div className="flex-grow flex flex-col justify-center">
            <div
              key={step}
              className="w-full flex flex-col justify-center h-full"
            >
              {step === 1 && (
                  <div className="space-y-6">
                      <div className="text-center mb-8">
                          <h3 className="text-xl font-bold text-white tracking-tight">Account Details</h3>
                          <p className="text-sm text-slate-400 mt-1 font-medium">Set up your login credentials.</p>
                      </div>
                      <div className="space-y-5 text-left mx-auto w-full">
                          <div className="space-y-2">
                              <label className="block text-[11px] font-bold text-slate-400 tracking-widest ml-1">Email Address</label>
                              <div className="relative flex items-center bg-slate-900/60 border border-white/5 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500/50 focus-within:bg-slate-900/80 rounded-xl overflow-hidden transition-all duration-300 group">
                                  <div className="w-12 h-12 flex justify-center items-center text-slate-500 group-focus-within:text-sky-400 transition-colors">
                                      <i className="fa-solid fa-envelope text-sm"></i>
                                  </div>
                                  <input 
                                      placeholder="yourname@email.com"
                                      type="email" 
                                      className="w-full bg-transparent py-4 pr-4 text-sm text-white focus:outline-none placeholder-slate-600 font-medium"
                                      value={email} 
                                      onChange={(e) => setEmail(e.target.value)} 
                                      autoFocus
                                      onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                                  />
                              </div>
                          </div>
                          <div className="space-y-2">
                              <label className="block text-[11px] font-bold text-slate-400 tracking-widest ml-1">Secure Password</label>
                              <div className="relative flex items-center bg-slate-900/60 border border-white/5 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500/50 focus-within:bg-slate-900/80 rounded-xl overflow-hidden transition-all duration-300 group">
                                  <div className="w-12 h-12 flex justify-center items-center text-slate-500 group-focus-within:text-sky-400 transition-colors">
                                      <i className="fa-solid fa-key text-sm"></i>
                                  </div>
                                  <input 
                                      placeholder="••••••••••"
                                      type="password" 
                                      className="w-full bg-transparent py-4 pr-4 text-sm text-white focus:outline-none placeholder-slate-600 font-medium"
                                      value={password} 
                                      onChange={(e) => setPassword(e.target.value)} 
                                      onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                                  />
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {step === 2 && (
                  <div className="space-y-6">
                      <div className="text-center mb-8">
                          <h3 className="text-xl font-bold text-white tracking-tight">Personal Information</h3>
                          <p className="text-sm text-slate-400 mt-1 font-medium">How should we identify you?</p>
                      </div>
                      <div className="space-y-5 text-left mx-auto w-full">
                          <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2 text-left">
                                  <label className="block text-[11px] font-bold text-slate-400 tracking-widest ml-1">First Name</label>
                                  <div className="relative flex items-center bg-slate-900/60 border border-white/5 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500/50 focus-within:bg-slate-900/80 rounded-xl overflow-hidden transition-all duration-300 group">
                                      <div className="w-10 h-12 flex justify-center items-center text-slate-500 group-focus-within:text-sky-400 transition-colors">
                                          <i className="fa-solid fa-user text-sm"></i>
                                      </div>
                                      <input 
                                          placeholder="Juan"
                                          type="text" 
                                          className="w-full bg-transparent py-4 pr-4 text-sm text-white focus:outline-none placeholder-slate-600 font-medium"
                                          value={firstName} 
                                          onChange={(e) => setFirstName(e.target.value)} 
                                          autoFocus
                                          onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                                      />
                                  </div>
                              </div>
                              <div className="space-y-2 text-left">
                                  <label className="block text-[11px] font-bold text-slate-400 tracking-widest ml-1">Last Name</label>
                                  <div className="relative flex items-center bg-slate-900/60 border border-white/5 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500/50 focus-within:bg-slate-900/80 rounded-xl overflow-hidden transition-all duration-300 group">
                                      <input 
                                          placeholder="Cruz"
                                          type="text" 
                                          className="w-full bg-transparent py-4 px-4 text-sm text-white focus:outline-none placeholder-slate-600 font-medium"
                                          value={lastName} 
                                          onChange={(e) => setLastName(e.target.value)} 
                                          onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                                      />
                                  </div>
                              </div>
                          </div>
                          <div className="space-y-2 text-left">
                              <label className="block text-[11px] font-bold text-slate-400 tracking-widest ml-1">Student ID Number</label>
                              <div className="relative flex items-center bg-slate-900/60 border border-white/5 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500/50 focus-within:bg-slate-900/80 rounded-xl overflow-hidden transition-all duration-300 group">
                                  <div className="w-12 h-12 flex justify-center items-center text-slate-500 group-focus-within:text-sky-400 transition-colors">
                                      <i className="fa-solid fa-id-badge text-sm"></i>
                                  </div>
                                  <input 
                                      placeholder="2024-123456"
                                      type="text" 
                                      className="w-full bg-transparent py-4 pr-4 font-mono tracking-wider text-sm text-white focus:outline-none placeholder-slate-600"
                                      value={studentId} 
                                      onChange={(e) => setStudentId(e.target.value)} 
                                      onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                                  />
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {step === 3 && (
                  <div className="space-y-6">
                      <div className="text-center mb-8">
                          <h3 className="text-xl font-bold text-white tracking-tight">Department</h3>
                          <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto font-medium">Select your primary college.</p>
                      </div>
                      <div className="space-y-5 text-left mx-auto w-full">
                          <div className="space-y-2">
                              <label className="block text-[11px] font-bold text-slate-400 tracking-widest ml-1">Primary Department</label>
                              <div className="relative flex items-center bg-slate-900/60 border border-white/5 focus-within:border-sky-500 focus-within:ring-1 focus-within:ring-sky-500/50 focus-within:bg-slate-900/80 rounded-xl overflow-hidden transition-all duration-300 group">
                                  <div className="w-12 h-12 flex justify-center items-center text-slate-500 group-focus-within:text-sky-400 transition-colors">
                                      <i className="fa-solid fa-building-columns text-sm"></i>
                                  </div>
                                  <select 
                                      className="w-full bg-transparent py-4 pr-10 font-medium text-sm text-white focus:outline-none cursor-pointer appearance-none"
                                      value={department} 
                                      onChange={(e) => setDepartment(e.target.value)} 
                                      autoFocus
                                      onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                                  >
                                      <option value="" disabled className="bg-slate-900 text-slate-500">Select your college</option>
                                      {COLLEGES.map(college => (
                                          <option key={college.id} value={college.label} className="bg-slate-900 text-white">{college.label}</option>
                                      ))}
                                  </select>
                                  <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none group-hover:text-white transition-colors">
                                      <i className="fa-solid fa-chevron-down text-xs"></i>
                                  </div>
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {step === 4 && (
                  <div className="space-y-6">
                      <div className="text-center mb-6">
                          <h3 className="text-xl font-bold text-white tracking-tight">Student Verification</h3>
                          <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto font-medium">Upload a clear photo of your student ID.</p>
                      </div>
                      <div className="text-left w-full h-[250px] relative z-20 group">
                          <ImageUpload 
                              label="Upload ID Photo"
                              value={proofUrl}
                              onUploadSuccess={setProofUrl}
                          />
                      </div>
                  </div>
              )}

              {step === 5 && (
                  <div className="space-y-6">
                      <div className="text-center mb-8">
                          <h3 className="text-2xl font-semibold text-white tracking-tight">Almost done!</h3>
                          <p className="text-sm text-slate-400 mt-1 max-w-xs mx-auto">Review your details before activating.</p>
                      </div>
                      
                      <div className="mx-auto w-full space-y-4 bg-white/5 p-6 rounded-3xl border border-white/5 relative z-20">
                           <div className="flex justify-between items-center py-2 border-b border-white/5">
                               <span className="text-xs font-medium text-slate-400">Name</span>
                               <span className="text-sm font-medium text-white">{firstName} {lastName}</span>
                           </div>
                           <div className="flex justify-between items-center py-2 border-b border-white/5">
                               <span className="text-xs font-medium text-slate-400">Student ID</span>
                               <span className="text-sm font-medium text-white font-mono">{studentId}</span>
                           </div>
                           <div className="flex justify-between items-center py-2">
                               <span className="text-xs font-medium text-slate-400">Department</span>
                               <span className="text-sm font-medium text-amber-500 text-right max-w-[150px] truncate">{department}</span>
                           </div>
                      </div>

                      <div className="mx-auto w-full mt-8 relative z-20">
                              <button 
                              onClick={handleSubmit} 
                              className="w-full bg-white text-black py-4 rounded-xl font-bold text-sm hover:bg-uni-100 transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-3 overflow-hidden"
                              disabled={loading}
                              >
                              {loading ? (
                                  <>
                                     <div className="w-4 h-4 border-2 border-black border-t-transparent group-hover:border-white group-hover:border-t-transparent rounded-full animate-spin"></div>
                                     Creating account...
                                  </>
                              ) : (
                                  <>Create Account</>
                              )}
                              </button>
                      </div>
                  </div>
              )}
            </div>
        </div>

        {/* Footer Navigation */}
        <div className="mt-8 flex flex-col items-center gap-4 relative z-20 w-full mx-auto">
           {step < totalSteps && (
              <button 
                 onClick={handleNext}
                 className="group w-full py-4 rounded-xl bg-gradient-to-r from-white to-slate-200 text-black font-bold text-sm transition-all flex justify-center items-center active:scale-[0.98] hover:-translate-y-0.5"
              >
                 <span className="flex items-center gap-2">
                    Continue
                    <i className="fa-solid fa-arrow-right text-xs group-hover:translate-x-1 transition-transform"></i>
                 </span>
              </button>
           )}
           
           {step > 1 && step < 5 && (
              <button 
                 onClick={handlePrev}
                 className="py-2 text-sm font-medium text-slate-500 hover:text-white transition-colors"
              >
                 Go Back
              </button>
           )}

           {step === 5 && (
               <div className="text-center mt-2">
                   <p className="text-slate-500 text-xs font-medium">
                        By creating an account, you agree to our <span className="text-slate-300">Terms & Conditions</span>.
                   </p>
               </div>
           )}
           
           {step === 1 && (
               <div className="text-center mt-2">
                  <p className="text-slate-400 text-sm font-medium">
                    Already have an account? 
                    <Link to="/login" className="text-uni-400 hover:text-uni-300 transition-colors ml-2 font-semibold hover:underline relative z-30">Log in</Link>
                  </p>
               </div>
           )}
        </div>

      </div>
    </div>
  );
};

export default Register;
