import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Key, ChevronRight, AlertCircle, CheckCircle2, ShieldCheck, Loader2 } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const verifySession = async () => {
      setIsVerifying(true);
      
      // 1. Check for PKCE 'code' in URL
      const code = searchParams.get('code');
      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setError("The recovery link is invalid or has expired.");
          setIsVerifying(false);
          return;
        }
      }

      // 2. Check if we have a session (either from code exchange or implicit hash)
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        setError("No active recovery session found. Please request a new reset link.");
      }
      
      setIsVerifying(false);
    };

    verifySession();
  }, [searchParams]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setIsUpdating(true);
    setError('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      
      // Explicitly sign out to prevent auto-login as per user request
      await supabase.auth.signOut();
      
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update password.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (isVerifying) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="h-8 w-8 text-sky-500 animate-spin" />
        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest italic animate-pulse">
          Verifying Recovery Token...
        </p>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.24))] px-4 py-10 md:py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-900/20 via-transparent to-transparent"></div>
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] bg-sky-500/10 rounded-full pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <Card className="w-full max-w-md mx-auto relative z-10 my-8 bg-slate-900/40 border-white/10 backdrop-blur-xl">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center mb-2">
            <div className="p-3 bg-sky-500/10 rounded-2xl border border-sky-500/20">
              <ShieldCheck className="h-6 w-6 text-sky-400" />
            </div>
          </div>
          <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-white via-white/90 to-slate-500 bg-clip-text text-transparent italic uppercase">
            Reset Password
          </CardTitle>
          <CardDescription className="text-slate-400 font-medium italic">
            Enter your new secure credentials below.
          </CardDescription>

          {error && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-500 text-left py-3 animate-in fade-in slide-in-from-top-4">
              <AlertCircle className="h-4 w-4" />
              <div className="flex flex-col gap-0.5 ml-2">
                <AlertTitle className="text-[10px] font-black uppercase tracking-widest italic leading-none">Security Alert</AlertTitle>
                <AlertDescription className="text-xs font-medium italic leading-none">
                  {error}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {success && (
            <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-500 text-left py-3 animate-in fade-in zoom-in">
              <CheckCircle2 className="h-4 w-4" />
              <div className="flex flex-col gap-0.5 ml-2">
                <AlertTitle className="text-[10px] font-black uppercase tracking-widest italic leading-none">Success</AlertTitle>
                <AlertDescription className="text-xs font-medium italic leading-none">
                  Password updated! Return to Sign In.
                </AlertDescription>
              </div>
            </Alert>
          )}
        </CardHeader>

        <CardContent>
          {!success && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">New Password</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input 
                    placeholder="••••••••"
                    type="password" 
                    className="pl-10 bg-slate-950/50 border-white/5 focus:border-sky-500 transition-all text-sm h-12"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirm New Password</Label>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input 
                    placeholder="••••••••"
                    type="password" 
                    className="pl-10 bg-slate-950/50 border-white/5 focus:border-sky-500 transition-all text-sm h-12"
                    value={confirmPassword} 
                    onChange={(e) => setConfirmPassword(e.target.value)} 
                    required 
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isUpdating || success} 
                className="w-full bg-white hover:bg-slate-200 text-black font-black uppercase tracking-[0.2em] italic py-6 rounded-xl transition-all group mt-4"
              >
                {isUpdating ? (
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Updating Security...
                  </div>
                ) : (
                  <>
                    Update Password
                    <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          )}

          {error && !success && (
            <Button 
              variant="link"
              onClick={() => navigate('/login')}
              className="w-full text-slate-500 hover:text-white font-bold uppercase tracking-widest text-[9px] mt-4"
            >
              Back to Sign In
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
