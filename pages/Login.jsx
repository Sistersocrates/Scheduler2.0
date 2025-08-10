
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { motion } from "framer-motion";
import { Lock, Mail, LogIn, Eye, EyeOff, AlertTriangle } from 'lucide-react';
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const from = location.state?.from || '/';
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;


  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { error: loginError } = await login(email, password);
      if (loginError) {
        throw loginError;
      }
      toast({ title: "Login Successful", description: "Welcome back!" });
      navigate(from, { replace: true });
    } catch (err) {
      const errorMessage = err.message || "An unexpected error occurred. Please try again.";
      setError(errorMessage);
      toast({ title: "Login Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError('');
    try {
      if (!credentialResponse.credential && !credentialResponse.code) {
        throw new Error("Google authentication failed: No credential or code received.");
      }
      
      // If using 'code' flow (recommended for server-side validation)
      if (credentialResponse.code) {
        const { error: googleLoginError, session } = await loginWithGoogle(credentialResponse.code, window.location.origin + '/auth/callback');
        if (googleLoginError) throw googleLoginError;
        
        if (session) {
            toast({ title: "Google Login Successful", description: "Welcome!" });
            navigate(from, { replace: true });
        } else {
            throw new Error("Google login did not return a session.");
        }
      } else if (credentialResponse.credential) {
        // Handle ID token (less secure for server validation, but simpler for client-only)
        // This path might be deprecated or require different handling in loginWithGoogle
        // For now, we assume loginWithGoogle expects an auth code.
        // If you intend to use the ID token directly, loginWithGoogle needs adjustment.
        console.warn("Received Google ID token, but 'code' flow is preferred.");
        // const { error: googleLoginError, session } = await loginWithGoogleIdToken(credentialResponse.credential);
        // if (googleLoginError) throw googleLoginError;
        // if (session) { ... }
        throw new Error("ID token flow not fully implemented. Please use 'code' flow.");
      }

    } catch (err) {
      const errorMessage = err.message || "Google login failed. Please try again.";
      setError(errorMessage);
      toast({ title: "Google Login Failed", description: errorMessage, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleError = () => {
    setError("Google login failed. Please try again or use email/password.");
    toast({ title: "Google Login Error", description: "Could not sign in with Google.", variant: "destructive" });
    setLoading(false);
  };


  if (!GOOGLE_CLIENT_ID) {
    console.error("Google Client ID is not configured. Google Login will not work.");
    // Optionally, display a message to the user or disable the Google login button
  }


  return (
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID || "disabled"}>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-4 selection:bg-sky-500 selection:text-white">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md bg-slate-800/70 border-slate-700 shadow-2xl backdrop-blur-lg">
            <CardHeader className="text-center">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring' }}>
                <LogIn className="mx-auto h-16 w-16 text-sky-400 mb-4 p-2 bg-sky-500/10 rounded-full border-2 border-sky-500/30 shadow-lg" />
              </motion.div>
              <CardTitle className="text-3xl font-bold text-slate-100">Welcome Back</CardTitle>
              <CardDescription className="text-slate-400">Sign in to access your dashboard</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-300 flex items-center">
                    <Mail className="mr-2 h-4 w-4 text-sky-400" /> Email Address
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-slate-700/50 border-slate-600 text-slate-100 focus:ring-sky-500 focus:border-sky-500 placeholder-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-300 flex items-center">
                    <Lock className="mr-2 h-4 w-4 text-sky-400" /> Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="bg-slate-700/50 border-slate-600 text-slate-100 focus:ring-sky-500 focus:border-sky-500 placeholder-slate-500 pr-10"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 text-slate-400 hover:text-sky-400"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-md text-sm flex items-center"
                  >
                    <AlertTriangle className="h-5 w-5 mr-2 text-red-400" />
                    {error}
                  </motion.div>
                )}
                <Button type="submit" className="w-full bg-sky-600 hover:bg-sky-700 text-white font-semibold py-3 text-base shadow-lg transition-transform hover:scale-105 disabled:opacity-70" disabled={loading}>
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  ) : (
                    <LogIn className="mr-2 h-5 w-5" />
                  )}
                  {loading ? 'Signing In...' : 'Sign In'}
                </Button>
              </form>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-slate-600" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-slate-800/70 px-2 text-slate-400">Or continue with</span>
                </div>
              </div>
              {GOOGLE_CLIENT_ID ? (
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleError}
                  useOneTap={false} // Can be true for auto-login prompts
                  flow="auth-code" // Use 'code' flow for server-side validation
                  ux_mode="popup" // 'popup' or 'redirect'
                  width="100%"
                  theme="filled_blue" // 'outline', 'filled_black', 'filled_blue'
                  shape="rectangular" // 'rectangular', 'pill', 'circle', 'square'
                  logo_alignment="left"
                  containerProps={{ style: { width: '100%' } }}
                  
                />
              ) : (
                <p className="text-center text-sm text-amber-400 bg-amber-500/10 p-3 rounded-md">
                  <AlertTriangle className="inline h-4 w-4 mr-1" /> Google Login is currently unavailable.
                </p>
              )}
            </CardContent>
            <CardFooter className="text-center block">
              <p className="text-xs text-slate-500">
                This system is for authorized users only.
              </p>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginPage;
