import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import apiClient from '../api/client';
import ImageUpload from '../components/ImageUpload';
import { useMasterData } from '../context/MasterDataContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardFooter, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Sparkles, AlertCircle, ChevronRight, ChevronLeft, User, Mail, Key, IdCard, Building } from 'lucide-react';

const Register = () => {
  const { colleges: COLLEGES, loading: metadataLoading } = useMasterData();
  const [searchParams] = useSearchParams();
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [error, setError] = useState('');
  const [prefillNote, setPrefillNote] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const navigate = useNavigate();

  useEffect(() => {
    const pEmail = searchParams.get('email');
    const pFirst = searchParams.get('first_name');
    const pLast = searchParams.get('last_name');
    const pCollege = searchParams.get('college');

    if (pEmail || pFirst || pLast || pCollege) {
      if (pEmail) setEmail(pEmail);
      if (pFirst) setFirstName(pFirst);
      if (pLast) setLastName(pLast);
      if (pCollege) setDepartment(pCollege);
      
      setPrefillNote("We've pre-filled your details from your recent claim! Please set a password to continue.");
    }
  }, [searchParams]);

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

      <Card className="w-full max-w-md mx-auto relative z-10 my-8 bg-slate-900/40 border-white/10 backdrop-blur-xl">
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-white via-white/90 to-slate-500 bg-clip-text text-transparent italic uppercase">
            Create account
          </CardTitle>
          <CardDescription className="text-slate-400 font-medium italic">
            Join the university lost & found network.
          </CardDescription>
          
          <div className="space-y-2 pt-2">
            <Progress value={(step / totalSteps) * 100} className="h-1.5 bg-slate-800/50" />
            <p className="text-[10px] font-black text-sky-500/70 uppercase tracking-[0.4em] italic">Step {step} of {totalSteps}</p>
          </div>

          {prefillNote && (
            <Alert className="bg-uni-500/10 border-uni-500/20 text-uni-400 animate-pulse text-left py-3">
              <Sparkles className="h-4 w-4" />
              <div className="flex flex-col gap-0.5 ml-2">
                <AlertTitle className="text-[10px] font-black uppercase tracking-widest italic leading-none">Prefilled Entry</AlertTitle>
                <AlertDescription className="text-[10px] font-bold uppercase tracking-widest leading-none opacity-80">
                  {prefillNote}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-500 text-left py-3">
              <AlertCircle className="h-4 w-4" />
              <div className="flex flex-col gap-0.5 ml-2">
                <AlertTitle className="text-[10px] font-black uppercase tracking-widest italic leading-none">Registry Error</AlertTitle>
                <AlertDescription className="text-xs font-medium italic leading-none">
                  {error}
                </AlertDescription>
              </div>
            </Alert>
          )}
        </CardHeader>
        
        <CardContent>
        
        <div className="flex-grow flex flex-col justify-center">
            <div
              key={step}
              className="w-full flex flex-col justify-center h-full"
            >
              {step === 1 && (
                  <div className="space-y-6">
                      <div className="text-center">
                          <h3 className="text-xl font-bold text-white tracking-tight uppercase italic">Account Details</h3>
                          <p className="text-xs text-slate-400 mt-1 font-medium italic">Set up your login credentials.</p>
                      </div>
                      <div className="space-y-4">
                          <div className="space-y-2">
                              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</Label>
                              <div className="relative">
                                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                  <Input 
                                      placeholder="yourname@email.com"
                                      type="email" 
                                      className="pl-10 bg-slate-950/50 border-white/5 focus:border-sky-500 transition-all text-sm h-12"
                                      value={email} 
                                      onChange={(e) => setEmail(e.target.value)} 
                                      autoFocus
                                      onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                                  />
                              </div>
                          </div>
                          <div className="space-y-2">
                              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Secure Password</Label>
                              <div className="relative">
                                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                  <Input 
                                      placeholder="••••••••••"
                                      type="password" 
                                      className="pl-10 bg-slate-950/50 border-white/5 focus:border-sky-500 transition-all text-sm h-12"
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
                      <div className="text-center">
                          <h3 className="text-xl font-bold text-white tracking-tight uppercase italic">Personal Info</h3>
                          <p className="text-xs text-slate-400 mt-1 font-medium italic">How should we identify you?</p>
                      </div>
                      <div className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                              <div className="space-y-2">
                                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">First Name</Label>
                                  <div className="relative">
                                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                      <Input 
                                          placeholder="Juan"
                                          type="text" 
                                          className="pl-10 bg-slate-950/50 border-white/5 focus:border-sky-500 transition-all text-sm h-12"
                                          value={firstName} 
                                          onChange={(e) => setFirstName(e.target.value)} 
                                          autoFocus
                                          onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                                      />
                                  </div>
                              </div>
                              <div className="space-y-2">
                                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Last Name</Label>
                                  <Input 
                                      placeholder="Cruz"
                                      type="text" 
                                      className="bg-slate-950/50 border-white/5 focus:border-sky-500 transition-all text-sm h-12"
                                      value={lastName} 
                                      onChange={(e) => setLastName(e.target.value)} 
                                      onKeyDown={(e) => e.key === 'Enter' && handleNext()}
                                  />
                              </div>
                          </div>
                          <div className="space-y-2">
                              <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Student ID Number</Label>
                              <div className="relative">
                                  <IdCard className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                                  <Input 
                                      placeholder="2024-123456"
                                      type="text" 
                                      className="pl-10 bg-slate-950/50 border-white/5 focus:border-sky-500 transition-all text-sm h-12 font-mono tracking-wider"
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
                      <div className="text-center">
                          <h3 className="text-xl font-bold text-white tracking-tight uppercase italic">Department</h3>
                          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto font-medium italic">Select your primary college.</p>
                      </div>
                      <div className="space-y-2">
                          <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Primary Department</Label>
                          <Select value={department} onValueChange={setDepartment}>
                            <SelectTrigger className="bg-slate-950/50 border-white/5 focus:ring-sky-500 h-12 text-sm">
                              <div className="flex items-center gap-3">
                                <Building className="h-4 w-4 text-slate-500" />
                                <SelectValue placeholder="Select your college" />
                              </div>
                            </SelectTrigger>
                            <SelectContent className="bg-slate-900 border-white/10 text-white">
                              {COLLEGES.map(college => (
                                <SelectItem key={college.id} value={college.label} className="focus:bg-sky-500 focus:text-white uppercase text-[10px] font-black tracking-widest">
                                  {college.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                      </div>
                  </div>
              )}

              {step === 4 && (
                  <div className="space-y-6">
                      <div className="text-center">
                          <h3 className="text-xl font-bold text-white tracking-tight uppercase italic text-sky-500">Student Proof</h3>
                          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto font-medium italic">To activate your account, please upload a clear photo of your <span className="text-slate-200">Student ID</span> or <span className="text-slate-200">Certificate of Registration (COR)</span>.</p>
                      </div>
                      <div className="h-[250px] relative z-20">
                          <ImageUpload 
                              label="Upload ID or COR Photo"
                              value={proofUrl}
                              onUploadSuccess={setProofUrl}
                          />
                      </div>
                  </div>
              )}
              {step === 5 && (
                  <div className="space-y-6">
                      <div className="text-center">
                          <h3 className="text-2xl font-black text-white tracking-tight uppercase italic">Almost done!</h3>
                          <p className="text-xs text-slate-400 mt-1 max-w-xs mx-auto italic font-medium">Review your details before activating.</p>
                      </div>
                      
                      <div className="space-y-4 bg-white/5 p-6 rounded-3xl border border-white/5 relative z-20">
                           <div className="flex justify-between items-center py-2 border-b border-white/5">
                               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Name</span>
                               <span className="text-sm font-black text-white uppercase italic">{firstName} {lastName}</span>
                           </div>
                           <div className="flex justify-between items-center py-2 border-b border-white/5">
                               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Student ID</span>
                               <span className="text-sm font-black text-white font-mono tracking-widest italic">{studentId}</span>
                           </div>
                           <div className="flex justify-between items-center py-2">
                               <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Department</span>
                               <span className="text-sm font-black text-sky-500 italic text-right break-words">{department}</span>
                           </div>
                      </div>
                  </div>
              )}
            </div>
        </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4 border-t border-white/5 pt-6">
          {step < totalSteps && (
            <Button 
              onClick={handleNext}
              className="w-full bg-white hover:bg-slate-200 text-black font-black uppercase tracking-[0.2em] italic py-6 rounded-xl transition-all group"
            >
              Continue
              <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          )}

          {step === 5 && (
            <Button 
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-sky-500 hover:bg-sky-400 text-white font-black uppercase tracking-[0.2em] italic py-6 rounded-xl transition-all shadow-lg shadow-sky-500/20"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                  Creating...
                </div>
              ) : (
                "Complete Activation"
              )}
            </Button>
          )}
          
          <div className="flex flex-col items-center gap-3 w-full">
            {step > 1 && (
              <Button 
                variant="link" 
                onClick={handlePrev}
                className="text-slate-500 hover:text-white text-xs font-black uppercase tracking-widest italic"
              >
                <ChevronLeft className="mr-2 h-3 w-3" />
                Go Back
              </Button>
            )}

            {step === 1 && (
              <p className="text-slate-400 text-xs font-medium italic">
                Already have an account? 
                <Link to="/login" className="text-sky-400 hover:underline ml-2 font-bold transition-all">Log in</Link>
              </p>
            )}

            {step === 5 && (
              <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest text-center mt-2 leading-relaxed opacity-60">
                By activating, you agree to our<br/>
                <span className="text-slate-300">Institutional Terms & Conditions</span>
              </p>
            )}
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
