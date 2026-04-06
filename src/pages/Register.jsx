import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '../lib/supabase';
import { logSupabaseError } from '../context/AuthContext';
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
import { Sparkles, AlertCircle, ChevronRight, ChevronLeft, User, Mail, Key, IdCard, Building, CheckCircle } from 'lucide-react';

const Register = () => {
  const { colleges: COLLEGES } = useMasterData();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  // Form State
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [department, setDepartment] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  
  // UI State
  const [error, setError] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const totalSteps = 5;

  // Pre-fill Logic
  useEffect(() => {
    const pEmail = searchParams.get('email');
    const pFirst = searchParams.get('first_name');
    const pLast = searchParams.get('last_name');
    const pCollege = searchParams.get('college');

    if (pEmail) setEmail(pEmail);
    if (pFirst) setFirstName(pFirst);
    if (pLast) setLastName(pLast);
    if (pCollege) setDepartment(pCollege);
  }, [searchParams]);

  const handleNext = () => {
    setError('');
    
    if (step === 1) {
      if (!email || !password) return setError("Email and password are required.");
      if (password.length < 6) return setError("Password must be at least 6 characters.");
    }

    if (step === 2) {
      if (!firstName || !lastName || !studentId) return setError("All identity fields are required.");
    }

    if (step === 3 && !department) return setError("Please select your college.");
    if (step === 4 && !proofUrl) return setError("Verification proof is required.");

    setStep(s => Math.min(s + 1, totalSteps));
  };
  
  const handlePrev = () => {
    setError('');
    setStep(s => Math.max(s - 1, 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      // 1. Auth Sign Up
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;

      // 2. Profile Creation
      const { error: dbError } = await supabase
        .from('users')
        .insert([{
          email,
          role: 'student',
          first_name: firstName,
          last_name: lastName,
          student_id_number: studentId,
          department: department,
          verification_proof_url: proofUrl,
          integrity_points: 0,
          is_verified: false,
          show_full_name: false
        }]);

      if (dbError) throw dbError;

      // 3. Set local storage flag for Dashboard Success Banner
      sessionStorage.setItem('just_registered', 'true');
      setIsSuccess(true);
    } catch (err) {
      logSupabaseError('Registration Submission', err);
      setError({
        message: err.message || 'Registration failed.',
        hint: err.hint || err.details || ''
      });
    } finally {
      setLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex items-center justify-center min-h-[90vh] px-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md"
        >
          <Card className="bg-slate-900/60 border-emerald-500/20 backdrop-blur-2xl text-center py-10 px-6">
            <CardHeader className="space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30">
                  <CheckCircle className="w-10 h-10 text-emerald-500" />
                </div>
              </div>
              <CardTitle className="text-3xl font-black text-white uppercase italic tracking-tighter">Registration Complete</CardTitle>
              <CardDescription className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">
                Your university identity has been archived successfully.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-8">
              <div className="p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10 text-left">
                <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1 italic leading-none">Security Note</p>
                <p className="text-xs text-slate-300 font-medium leading-relaxed italic">
                  You are now automatically logged in. Your registration is pending administrative verification, but you can start using the dashboard immediately.
                </p>
              </div>
              <Button 
                onClick={() => navigate('/student')}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-black uppercase tracking-[0.2em] italic py-6 rounded-xl"
              >
                Access Dashboard
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[90vh] px-4 py-20 relative">
      <Card className="w-full max-w-md bg-slate-900/40 border-white/10 backdrop-blur-xl transition-all">
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-white to-slate-500 bg-clip-text text-transparent italic uppercase">
            Create account
          </CardTitle>
          <div className="space-y-2 pt-2">
            <Progress value={(step / totalSteps) * 100} className="h-1.5 bg-slate-800/50" />
            <p className="text-[10px] font-black text-sky-500/70 uppercase tracking-[0.4em] italic">Step {step} of {totalSteps}</p>
          </div>
          {error && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-500 py-3 text-left">
              <AlertCircle className="h-4 w-4" />
              <div className="flex flex-col gap-1 ml-2">
                <AlertTitle className="text-[10px] font-black uppercase tracking-widest mb-0 italic leading-none">Registry Error</AlertTitle>
                <AlertDescription className="text-[10px] font-bold uppercase tracking-widest leading-relaxed">
                  {error.message}
                  {error.hint && (
                    <span className="block mt-1 text-red-400 opacity-60 font-medium lowercase italic border-t border-red-500/10 pt-1">
                      TECHNICAL HINT: {error.hint}
                    </span>
                  )}
                </AlertDescription>
              </div>
            </Alert>
          )}
        </CardHeader>
        
        <CardContent className="min-h-[350px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="space-y-6"
            >
              {step === 1 && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input placeholder="yourname@email.com" value={email} onChange={e => setEmail(e.target.value)} className="pl-10 h-12 bg-slate-950/50" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Password</Label>
                    <div className="relative">
                      <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} className="pl-10 h-12 bg-slate-950/50" />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">First Name</Label>
                      <Input placeholder="Juan" value={firstName} onChange={e => setFirstName(e.target.value)} className="h-12 bg-slate-950/50" />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Last Name</Label>
                      <Input placeholder="Cruz" value={lastName} onChange={e => setLastName(e.target.value)} className="h-12 bg-slate-950/50" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Student ID</Label>
                    <Input placeholder="2024-12345" value={studentId} onChange={e => setStudentId(e.target.value)} className="h-12 bg-slate-950/50" />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 italic">Select College</Label>
                  <Select value={department} onValueChange={setDepartment}>
                    <SelectTrigger className="h-12 bg-slate-950/50">
                      <SelectValue placeholder="Select your college" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-white/10 text-white">
                      {COLLEGES.map(c => <SelectItem key={c.id} value={c.label} className="focus:bg-sky-500 italic uppercase text-[10px] font-black">{c.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-4 text-center">
                  <p className="text-[10px] font-black text-sky-500 uppercase tracking-widest mb-2 italic leading-none">Verification Required</p>
                  <div className="h-[250px] relative z-20">
                    <ImageUpload label="Upload your COR or ID" value={proofUrl} onUploadSuccess={setProofUrl} />
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-4 bg-white/5 p-6 rounded-3xl border border-white/5">
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">User</span>
                    <span className="text-sm font-black text-white italic">{firstName} {lastName}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-white/5">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">ID</span>
                    <span className="text-sm font-black text-white italic">{studentId}</span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic">COLLEGE</span>
                    <span className="text-sm font-black text-sky-500 italic text-right">{department}</span>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>

        <CardFooter className="flex flex-col gap-4 border-t border-white/5 pt-6">
          {step < totalSteps ? (
            <Button onClick={handleNext} className="w-full bg-white text-black font-black uppercase tracking-[0.2em] italic h-12 rounded-xl">
              Next Step
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading} className="w-full bg-sky-500 text-white font-black uppercase tracking-[0.2em] italic h-12 rounded-xl">
              {loading ? "Activating..." : "Complete Registry"}
            </Button>
          )}
          {step > 1 && (
            <Button variant="link" onClick={handlePrev} className="text-slate-500 font-black uppercase text-[10px] tracking-widest italic">
              Go Back
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Register;
