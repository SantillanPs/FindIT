import React, { useState } from 'react';
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
  CardFooter,
} from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Key, ChevronRight, AlertCircle, CheckCircle2 } from 'lucide-react';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    setLoading(true);
    setError('');

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) throw error;
      
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may be invalid or expired.');
    } finally {
      setLoading(false);
    }
  };

  if (!token && !supabase.auth.getSession()) {
    return (
      <div className="flex items-center justify-center min-h-[80vh] px-4">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Invalid Reset Link</AlertTitle>
          <AlertDescription>
            This password reset link is invalid. Please request a new one from the login page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-[90vh] px-4 py-10 md:py-20 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-sky-900/20 via-transparent to-transparent"></div>
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[400px] bg-sky-500/10 rounded-full pointer-events-none"></div>
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none"></div>

      <Card className="w-full max-w-md mx-auto relative z-10 my-8 bg-slate-900/40 border-white/10 backdrop-blur-xl">
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-white via-white/90 to-slate-500 bg-clip-text text-transparent italic uppercase">
            Reset Password
          </CardTitle>
          <CardDescription className="text-slate-400 font-medium italic">
            Secure your account with a new password.
          </CardDescription>

          {error && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-500 text-left py-3">
              <AlertCircle className="h-4 w-4" />
              <div className="flex flex-col gap-0.5 ml-2">
                <AlertTitle className="text-[10px] font-black uppercase tracking-widest italic leading-none">Reset Error</AlertTitle>
                <AlertDescription className="text-xs font-medium italic leading-none">
                  {error}
                </AlertDescription>
              </div>
            </Alert>
          )}

          {success && (
            <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-500 text-left py-3">
              <CheckCircle2 className="h-4 w-4" />
              <div className="flex flex-col gap-0.5 ml-2">
                <AlertTitle className="text-[10px] font-black uppercase tracking-widest italic leading-none">Success</AlertTitle>
                <AlertDescription className="text-xs font-medium italic leading-none">
                  Password reset successfully! Redirecting to login...
                </AlertDescription>
              </div>
            </Alert>
          )}
        </CardHeader>

        <CardContent>
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
              disabled={loading || success} 
              className="w-full bg-white hover:bg-slate-200 text-black font-black uppercase tracking-[0.2em] italic py-6 rounded-xl transition-all group mt-4"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                  Updating...
                </div>
              ) : (
                <>
                  Update Password
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResetPassword;
