import React, { useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import apiClient from '../api/client';
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
} from '@/components/ui/card';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
   const [showRecoveryInfo, setShowRecoveryInfo] = useState(false);
   const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const queryParams = new URLSearchParams(location.search);
    const redirectPath = queryParams.get('redirect') || '/';
    
    const formData = new FormData();
    formData.append('username', email);
    formData.append('password', password);

    try {
      const response = await apiClient.post('/auth/login', formData);
      login(response.data.access_token, response.data.user);
      navigate(redirectPath);
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[85vh] px-4 relative">
      <Card className="w-full max-w-md overflow-hidden z-20 my-8 border border-border/50 bg-card/95 backdrop-blur-sm shadow-[0_0_50px_-12px_rgba(2,132,199,0.3)]">
        <CardHeader className="text-left space-y-2 pt-8">
          <div className="flex items-center gap-4 mb-1">
             <div className="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-brand-secondary to-brand-primary rounded-xl flex items-center justify-center text-xl text-white shadow-lg shadow-brand-primary/20">
                <i className="fa-solid fa-lock"></i>
             </div>
             <div className="space-y-0.5">
               <CardTitle className="text-2xl md:text-3xl font-bold tracking-tight font-sans">
                 Sign In
               </CardTitle>
               <CardDescription className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                 FindIT Lost & Found
               </CardDescription>
             </div>
          </div>
          <p className="text-muted-foreground text-sm pt-2">
            Enter your credentials to manage your reports and items.
          </p>
        </CardHeader>

        <CardContent className="pt-0">
          {error && (
              <div 
                className="mb-6 p-3 bg-destructive/10 border border-destructive/20 text-destructive text-sm rounded-lg text-center"
              >
                 {error}
              </div>
            )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                  <i className="fa-solid fa-envelope absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs z-20"></i>
                  <Input 
                    id="email"
                    placeholder="name@example.com"
                    type="email" 
                    className="pl-10"
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    required 
                  />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                  <i className="fa-solid fa-key absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs z-20"></i>
                  <Input 
                    id="password"
                    placeholder="••••••••"
                    type="password" 
                    className="pl-10"
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)} 
                    required 
                  />
              </div>
              <div className="flex justify-end">
                <button 
                  type="button"
                  onClick={() => setShowRecoveryInfo(!showRecoveryInfo)}
                  className="text-[10px] font-bold text-brand-primary/60 hover:text-brand-primary hover:underline transition-all uppercase tracking-wider focus:outline-none"
                >
                  {showRecoveryInfo ? 'Close Instructions' : 'Forgot password?'}
                </button>
              </div>
              {showRecoveryInfo && (
                <div className="p-3 bg-brand-primary/5 border border-brand-primary/10 rounded-lg space-y-2 mt-1">
                  <p className="text-[11px] leading-relaxed text-text-header/80 italic">
                    "Password recovery is handled via manual verification. Please visit the <strong>USG Office</strong> or the <strong>Student Affairs Desk</strong> with your Student ID to reset your credentials."
                  </p>
                </div>
              )}
            </div>

            <Button 
              type="submit" 
              disabled={loading} 
              className="w-full mt-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                  Signing In...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>
          
          <div className="mt-8 pt-6 border-t border-border/40 text-center">
            <p className="text-muted-foreground text-sm">
              Don't have an account? 
              <Link to="/register" className="text-brand-primary hover:text-brand-primary/80 hover:underline font-bold ml-2 transition-colors">Create account</Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
