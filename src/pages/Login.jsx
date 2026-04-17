import React, { useState } from 'react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
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
import { Mail, Key, ChevronRight, AlertCircle, Lock, CheckCircle, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [view, setView] = useState('login'); // 'login' or 'forgot'
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [countdown, setCountdown] = useState(0);

  React.useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);
  
  const { login, session, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isRegistered = searchParams.get('registered') === 'true';
  const returnTo = searchParams.get('returnTo');

  const { mutate: handleLogin, isPending: loading } = useMutation({
    mutationFn: async ({ email, password }) => {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      // If we have a returnTo param (e.g. from claim flow), redirect there
      if (returnTo) {
        navigate(returnTo, { replace: true });
      }
      // Otherwise GuestRoute auto-redirects to dashboard
    },
    onError: async (err, variables) => {
      if (err.message === 'Invalid login credentials') {
        const { data: profile } = await supabase
          .from('user_profiles_v1')
          .select('id')
          .eq('email', variables.email)
          .maybeSingle();

        if (profile) {
          setError('Incorrect password. Please try again.');
        } else {
          setError("Account doesn't exist. Please check your email or create an account.");
        }
      } else {
        setError(err.message || 'Invalid email or password.');
      }
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    handleLogin({ email, password });
  };

  const { mutate: handleForgotPassword, isPending: resetLoading } = useMutation({
    mutationFn: async (email) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin + '/reset-password',
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setResetSuccess(true);
      setCountdown(60);
    },
    onError: (err) => {
      setError(err.message || 'Failed to send reset link.');
    }
  });

  const onResetSubmit = (e) => {
    e.preventDefault();
    setError('');
    handleForgotPassword(resetEmail);
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-var(--navbar-height))] px-4 py-10 md:py-20 relative overflow-hidden">

      <Card className="w-full max-w-md mx-auto relative z-10 my-8 bg-slate-900/40 border-white/10 backdrop-blur-xl">
        <CardHeader className="text-center space-y-4">
          <CardTitle className="text-3xl font-extrabold tracking-tight bg-gradient-to-br from-white via-white/90 to-slate-500 bg-clip-text text-transparent italic uppercase">
            Sign In
          </CardTitle>
          <CardDescription className="text-slate-400 font-medium italic">
            FindIT Lost & Found
          </CardDescription>
          
          {isRegistered && (
            <Alert className="bg-emerald-500/10 border-emerald-500/20 text-emerald-500 text-left py-3 animate-in fade-in slide-in-from-top-4 duration-500">
              <CheckCircle className="h-4 w-4" />
              <div className="flex flex-col gap-0.5 ml-2">
                <AlertTitle className="text-[10px] font-black uppercase tracking-widest italic leading-none text-emerald-400">Success</AlertTitle>
                <AlertDescription className="text-xs font-medium italic leading-tight">
                  Your account has been created and authorized! You can now sign in.
                </AlertDescription>
              </div>
            </Alert>
          )}


          {error && (
            <Alert variant="destructive" className="bg-red-500/10 border-red-500/20 text-red-500 text-left py-3">
              <AlertCircle className="h-4 w-4" />
              <div className="flex flex-col gap-0.5 ml-2">
                <AlertTitle className="text-[10px] font-black uppercase tracking-widest italic leading-none">Sign In Error</AlertTitle>
                <AlertDescription className="text-xs font-medium italic leading-none">
                  {error}
                </AlertDescription>
              </div>
            </Alert>
          )}
        </CardHeader>

        <CardContent>
          {view === 'login' ? (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input 
                    id="email"
                    placeholder="name@example.com"
                    type="email" 
                    className="pl-10 bg-slate-950/50 border-white/5 focus:border-sky-500 transition-all text-sm h-12"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between items-end">
                  <Label htmlFor="password" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Password</Label>
                  <button 
                    type="button"
                    onClick={() => setView('forgot')}
                    className="text-[9px] font-black text-sky-500/60 hover:text-sky-500 transition-all uppercase tracking-widest italic mb-1"
                  >
                    Forgot?
                  </button>
                </div>
                <div className="relative">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                  <Input 
                    id="password"
                    placeholder="••••••••"
                    type={showPassword ? "text" : "password"} 
                    className="pl-10 pr-10 bg-slate-950/50 border-white/5 focus:border-sky-500 transition-all text-sm h-12"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={loading || (session && !user)} 
                className="w-full bg-white hover:bg-slate-200 text-black font-black uppercase tracking-[0.2em] italic py-6 rounded-xl transition-all group mt-4 overflow-hidden relative"
              >
                {(loading || (session && !user)) ? (
                  <div className="flex items-center gap-2 animate-in fade-in zoom-in duration-300">
                    <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    {(session && !user) ? "Syncing Profile..." : "Signing In..."}
                  </div>
                ) : (
                  <>
                    Sign In
                    <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </Button>
            </form>
          ) : (
            <div className="space-y-6">
              {!resetSuccess ? (
                <form onSubmit={onResetSubmit} className="space-y-6">
                  <div className="space-y-2 text-center pb-2">
                    <h3 className="text-sm font-black text-white uppercase italic">Account Recovery</h3>
                    <p className="text-[10px] text-slate-400 italic">Enter your email to receive a secure reset link.</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="reset-email" className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Recovery Email</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                      <Input 
                        id="reset-email"
                        placeholder="yourname@email.com"
                        type="email" 
                        className="pl-10 bg-slate-950/50 border-white/5 focus:border-sky-500 transition-all text-sm h-12"
                        value={resetEmail} 
                        onChange={(e) => setResetEmail(e.target.value)} 
                        required 
                      />
                    </div>
                  </div>
                  <Button 
                    type="submit" 
                    disabled={resetLoading || countdown > 0} 
                    className="w-full bg-white hover:bg-slate-200 text-black font-black uppercase tracking-[0.2em] italic py-6 rounded-xl transition-all group"
                  >
                    {resetLoading ? 'Sending...' : (countdown > 0 ? `Retry in ${countdown}s` : 'Send Reset Link')}
                    {!resetLoading && countdown === 0 && <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
                  </Button>
                  <button 
                    type="button"
                    onClick={() => { setView('login'); setError(''); }}
                    className="w-full text-[10px] font-black text-slate-500 hover:text-white transition-all uppercase tracking-[0.3em] italic"
                  >
                    Back to Login
                  </button>
                </form>
              ) : (
                <div className="text-center space-y-6 py-4">
                  <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-8 w-8 text-emerald-500" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-white uppercase italic">Check your Inbox</h3>
                    <p className="text-[10px] text-slate-400 italic leading-relaxed px-4">
                      If an account exists for <span className="text-slate-200">{resetEmail}</span>, a recovery link has been generated. 
                      <br/><br/>
                      <span className="text-sky-400 font-bold uppercase tracking-widest">Dev Note:</span> Check your backend terminal output for the mock reset link.
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 w-full">
                    <Button 
                      onClick={() => handleForgotPassword(resetEmail)}
                      disabled={resetLoading || countdown > 0}
                      className="w-full bg-white/10 hover:bg-white/20 border border-white/10 text-white font-black uppercase tracking-[0.2em] italic py-6 rounded-xl transition-all"
                    >
                      {resetLoading ? 'Sending...' : (countdown > 0 ? `Resend in ${countdown}s` : 'Resend Link')}
                    </Button>
                    <Button 
                      onClick={() => { setView('login'); setResetSuccess(false); setResetEmail(''); }}
                      className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-[0.2em] italic py-6 rounded-xl transition-all"
                    >
                      Return to Sign In
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>

        <CardFooter className="flex flex-col gap-4 border-t border-white/5 pt-6 pb-8">
          {view === 'login' && (
            <p className="text-slate-400 text-xs font-medium italic">
              Don't have an account? 
              <Link to="/register" className="text-sky-400 hover:underline ml-2 font-bold transition-all">Create account</Link>
            </p>
          )}
          {view === 'forgot' && !resetSuccess && (
            <div className="p-4 bg-sky-500/5 border border-sky-500/10 rounded-2xl">
               <p className="text-[9px] leading-relaxed text-slate-500 italic text-center">
                 "In case of immediate access needs, you may still visit the <span className="text-slate-300">USG Office</span> for manual account authorization."
               </p>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
