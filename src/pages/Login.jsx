import React, { useState } from 'react';
import { useNavigate, Link, useLocation, useSearchParams } from 'react-router-dom';
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
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [view, setView] = useState('login'); // 'login' or 'forgot'
  const [resetEmail, setResetEmail] = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  
  const { login, session, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const isRegistered = searchParams.get('registered') === 'true';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const queryParams = new URLSearchParams(location.search);
    const redirectPath = queryParams.get('redirect') || '/';
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // AuthContext listener will handle the user state and SafeRoute will redirect 
      // automatically once the profile is confirmed.
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    setError('');
    
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: window.location.origin + '/reset-password',
      });
      if (error) throw error;
      setResetSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to send reset link.');
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-theme(spacing.24))] px-4 py-10 md:py-20 relative overflow-hidden">

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
                  Your account has been created and verified! You can now sign in.
                </AlertDescription>
              </div>
            </Alert>
          )}

          <p className="text-slate-400 text-xs font-medium italic">
            Enter your credentials to manage your reports and items.
          </p>

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
                    {(session && !user) ? "Syncing Identity..." : "Signing In..."}
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
                <form onSubmit={handleForgotPassword} className="space-y-6">
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
                    disabled={resetLoading} 
                    className="w-full bg-white hover:bg-slate-200 text-black font-black uppercase tracking-[0.2em] italic py-6 rounded-xl transition-all group"
                  >
                    {resetLoading ? 'Sending...' : 'Send Reset Link'}
                    {!resetLoading && <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />}
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
                  <Button 
                    onClick={() => { setView('login'); setResetSuccess(false); setResetEmail(''); }}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-black uppercase tracking-[0.2em] italic py-6 rounded-xl transition-all"
                  >
                    Return to Sign In
                  </Button>
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
                 "In case of immediate access needs, you may still visit the <span className="text-slate-300">USG Office</span> for manual identity verification."
               </p>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
