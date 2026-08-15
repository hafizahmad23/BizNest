import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Building2, ShieldCheck, Mail, Lock, Phone, MapPin, Sparkles, CheckCircle2, 
  ArrowRight, KeyRound, User, ChevronRight, RefreshCw, AlertCircle, Eye, EyeOff,
  Briefcase, Globe, Zap, Star, ArrowLeft, Check, Smartphone, CheckCircle
} from 'lucide-react';
import { User as UserType } from '../types';
import {
  loginWithSupabaseEmail,
  loginWithSupabasePhone,
  registerWithSupabase,
  sendPasswordResetEmail,
  loginWithGoogle,
} from '../lib/supabaseAuth';

interface WelcomeAuthScreenProps {
  onLoginSuccess: (user: UserType, rememberMe: boolean) => void;
  isDarkMode?: boolean;
}

export const WelcomeAuthScreen: React.FC<WelcomeAuthScreenProps> = ({
  onLoginSuccess,
  isDarkMode = false
}) => {
  const [activeTab, setActiveTab] = useState<'welcome' | 'login' | 'signup' | 'forgot'>('welcome');
  
  // Login Tab: Email vs Phone Number
  const [loginMethod, setLoginMethod] = useState<'email' | 'phone'>('email');
  
  // Registration Multi-Step State: 1 = Personal Details, 2 = Account Type & Business Setup
  const [signupStep, setSignupStep] = useState<1 | 2>(1);
  const [role, setRole] = useState<'user' | 'business'>('user');
  
  // Login Inputs
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Sign Up Inputs - Step 1: Personal Info & Credentials
  const [signupName, setSignupName] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPhone, setSignupPhone] = useState('');
  const [signupCity, setSignupCity] = useState('Lahore');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAgreed, setTermsAgreed] = useState(true);

  // Sign Up Inputs - Step 2: Business Info
  const [businessName, setBusinessName] = useState('');
  const [businessCategory, setBusinessCategory] = useState('Botanical & Nursery');
  const [businessTagline, setBusinessTagline] = useState('');

  const [signupError, setSignupError] = useState('');
  const [signupLoading, setSignupLoading] = useState(false);

  // Forgot Password Inputs
  const [forgotStep] = useState<1>(1);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);

  // Google OAuth Picker Modal State
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Validation helpers
  const validateEmail = (email: string) => /\S+@\S+\.\S+/.test(email);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: 'bg-slate-700' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass) && /[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score === 2) return { score: 2, label: 'Fair', color: 'bg-amber-500' };
    if (score === 3) return { score: 3, label: 'Good', color: 'bg-sky-500' };
    return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
  };

  const passStrength = getPasswordStrength(signupPassword);

  // Submit Login Handler (Email or Phone)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (loginMethod === 'email') {
      if (!loginEmail.trim()) {
        setLoginError('Please enter your email address.');
        return;
      }
      if (!validateEmail(loginEmail)) {
        setLoginError('Please enter a valid email address (e.g. user@example.pk).');
        return;
      }
      if (!loginPassword) {
        setLoginError('Please enter your password.');
        return;
      }

      setLoginLoading(true);
      const res = await loginWithSupabaseEmail(loginEmail, loginPassword);
      setLoginLoading(false);
      if (!res.success || !res.user) {
        setLoginError(res.error || 'Invalid credentials.');
        return;
      }
      onLoginSuccess(res.user, rememberMe);

    } else {
      // Phone Login
      if (!loginPhone.trim()) {
        setLoginError('Please enter your registered phone number.');
        return;
      }
      if (!loginPassword) {
        setLoginError('Please enter your password.');
        return;
      }

      setLoginLoading(true);
      const res = await loginWithSupabasePhone(loginPhone, loginPassword);
      setLoginLoading(false);
      if (!res.success || !res.user) {
        setLoginError(res.error || 'Invalid phone number or password.');
        return;
      }
      onLoginSuccess(res.user, rememberMe);
    }
  };

  // Step 1 Validation -> Proceed to Step 2
  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    if (!signupName.trim()) {
      setSignupError('Please enter your full name.');
      return;
    }

    if (!signupEmail.trim() || !validateEmail(signupEmail)) {
      setSignupError('Please enter a valid email address.');
      return;
    }

    if (!signupPhone.trim()) {
      setSignupError('Please enter your phone number.');
      return;
    }

    if (!signupPassword || signupPassword.length < 6) {
      setSignupError('Password must be at least 6 characters long.');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setSignupError('Passwords do not match. Please re-enter your password.');
      return;
    }

    if (!termsAgreed) {
      setSignupError('You must agree to the Terms of Service & Privacy Policy to create an account.');
      return;
    }

    setSignupStep(2);
  };

  // Final Registration Completion
  const handleCompleteRegistration = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');

    if (role === 'business' && !businessName.trim()) {
      setSignupError('Please enter your registered business name.');
      return;
    }

    setSignupLoading(true);
    const res = await registerWithSupabase({
        name: signupName,
        email: signupEmail,
        phone: signupPhone,
        password: signupPassword,
        role: role,
        city: signupCity,
        businessName: role === 'business' ? businessName : undefined,
        businessCategory: role === 'business' ? businessCategory : undefined
    });
    setSignupLoading(false);

    if (!res.success || !res.user) {
      setSignupError(res.error || 'Failed to create account. Please try again.');
      return;
    }

    if (res.needsEmailConfirmation) {
      setSignupError(res.message || 'Please verify your email address before logging in.');
      return;
    }
      onLoginSuccess(res.user, rememberMe);
  };

  // Google OAuth Login Action
  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    const res = await loginWithGoogle();
    setGoogleLoading(false);
    if (!res.success) setLoginError(res.error || 'Could not start Google sign-in.');
  };

  // The former in-page account picker is deliberately disabled. Google account
  // selection must happen only on Supabase's OAuth page.
  const handleGoogleSelectAccount = (_email: string, _name: string) => {
    void handleGoogleLogin();
  };

  // Forgot Password Submit Steps
  const handleForgotSubmitIdentifier = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError('');
    if (!forgotIdentifier.trim()) {
      setForgotError('Please enter your registered email address.');
      return;
    }
    setForgotLoading(true);
    const res = await sendPasswordResetEmail(forgotIdentifier);
    setForgotLoading(false);
    if (!res.success) {
      setForgotError(res.error || 'Could not send the password reset email.');
      return;
    }
    setForgotMsg(res.message || 'A password reset email has been sent. Please check your inbox and spam folder.');
  };

  return (
    <div className="min-h-screen w-full flex flex-col lg:flex-row bg-slate-950 text-white relative overflow-hidden font-sans select-none">
      {/* Background Animated Gradient Mesh */}
      <div className="absolute inset-0 pointer-events-none z-0">
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-emerald-600/15 blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 -right-40 w-[600px] h-[600px] rounded-full bg-purple-600/15 blur-[120px] animate-pulse" />
        <div className="absolute -bottom-40 left-1/3 w-[500px] h-[500px] rounded-full bg-cyan-600/10 blur-[100px]" />
      </div>

      {/* LEFT SIDE: Hero Brand Showcase */}
      <div className="lg:w-1/2 p-8 lg:p-16 flex flex-col justify-between relative z-10 border-b lg:border-b-0 lg:border-r border-slate-800/80 bg-slate-900/40 backdrop-blur-md">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 via-teal-400 to-cyan-400 p-0.5 shadow-xl shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                <Building2 className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black tracking-tight text-white">BizNest</span>
                <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Pakistan
                </span>
              </div>
              <p className="text-xs text-slate-400 font-medium">Verified Commercial & Industrial Directory</p>
            </div>
          </div>
        </div>

        {/* Center Hero Copy */}
        <div className="my-10 lg:my-0 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-emerald-400 text-xs font-bold shadow-lg">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>AI-Powered B2B & B2C Commerce Engine</span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-none text-white">
            Connect with <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">Pakistan’s Top</span> Verified Merchants
          </h1>

          <p className="text-sm text-slate-300 leading-relaxed font-normal">
            Welcome to Pakistan’s most trusted business marketplace. Access thousands of verified suppliers, nurseries, real estate firms, medical centers, and top-tier service providers across all provinces and districts.
          </p>

          {/* Feature Pillars */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">Gold Shield Verification</div>
                <div className="text-[11px] text-slate-400">Strictly vetted businesses</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-3">
              <Zap className="w-5 h-5 text-amber-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">Gemini AI Matchmaker</div>
                <div className="text-[11px] text-slate-400">Instant seller recommendations</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-3">
              <Globe className="w-5 h-5 text-cyan-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">All Pakistan Network</div>
                <div className="text-[11px] text-slate-400">158 Districts & Tehsils</div>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-3">
              <Briefcase className="w-5 h-5 text-purple-400 mt-0.5 shrink-0" />
              <div>
                <div className="text-xs font-bold text-white">Merchant Growth Suite</div>
                <div className="text-[11px] text-slate-400">Inquiry tracking & analytics</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Metrics */}
        <div className="pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              <img className="w-7 h-7 rounded-full border-2 border-slate-950 object-cover" src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80" alt="User" />
              <img className="w-7 h-7 rounded-full border-2 border-slate-950 object-cover" src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80" alt="User" />
              <img className="w-7 h-7 rounded-full border-2 border-slate-950 object-cover" src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=80" alt="User" />
            </div>
            <span className="font-semibold text-slate-300">10,000+ Active Members</span>
          </div>

          <div className="flex items-center gap-1 text-amber-400 font-bold">
            <Star className="w-4 h-4 fill-amber-400" />
            <span>4.9 / 5 Rating</span>
          </div>
        </div>
      </div>

      {/* RIGHT SIDE: Interactive Auth Portal */}
      <div className="lg:w-1/2 p-6 sm:p-12 lg:p-16 flex flex-col justify-center relative z-10 overflow-y-auto">
        <div className="max-w-md mx-auto w-full">

          {/* WELCOME PORTAL SELECTION CARD */}
          {activeTab === 'welcome' && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              <div className="text-center space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Secure Member Gateway</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-white">Welcome to BizNest</h2>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Sign in to your account or create a new profile to connect with buyers and sellers across Pakistan.
                </p>
              </div>

              {/* Quick Google Login Option */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-3.5 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-3 shadow-lg transition cursor-pointer"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-800" />
                </div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-500">
                  <span className="bg-slate-950 px-3">Or sign in with account</span>
                </div>
              </div>

              {/* Main Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={() => setActiveTab('login')}
                  className="w-full py-4 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-sm flex items-center justify-between shadow-xl shadow-emerald-500/15 transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <KeyRound className="w-5 h-5 text-slate-950" />
                    <span>Log In to Account</span>
                  </div>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => {
                    setActiveTab('signup');
                    setSignupStep(1);
                  }}
                  className="w-full py-4 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-extrabold text-sm flex items-center justify-between shadow-lg transition cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5 text-emerald-400" />
                    <span>Create New Account (Free)</span>
                  </div>
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

            </motion.div>
          )}

          {/* LOGIN FORM */}
          {activeTab === 'login' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-white">Sign In to BizNest</h2>
                  <p className="text-xs text-slate-400 mt-0.5">Enter your account credentials</p>
                </div>
                <button
                  onClick={() => setActiveTab('welcome')}
                  className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition flex items-center gap-1 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              </div>

              {/* Login Method Tabs */}
              <div className="flex rounded-2xl p-1 bg-slate-900 border border-slate-800">
                <button
                  type="button"
                  onClick={() => { setLoginMethod('email'); setLoginError(''); }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    loginMethod === 'email' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Login with Email</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setLoginMethod('phone'); setLoginError(''); }}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 cursor-pointer ${
                    loginMethod === 'phone' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Login with Phone</span>
                </button>
              </div>

              {/* Google Fast Sign In Button */}
              <button
                type="button"
                onClick={handleGoogleLogin}
                className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-3 shadow-md transition cursor-pointer"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Continue with Google</span>
              </button>

              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800" /></div>
                <div className="relative flex justify-center text-[10px] uppercase font-bold text-slate-500"><span className="bg-slate-950 px-2">Or enter credentials</span></div>
              </div>

              {loginError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{loginError}</span>
                </div>
              )}

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                {loginMethod === 'email' ? (
                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-1 block">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        value={loginEmail}
                        onChange={(e) => setLoginEmail(e.target.value)}
                        placeholder="ali.hassan@example.pk"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-1 block">Phone Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={loginPhone}
                        onChange={(e) => setLoginPhone(e.target.value)}
                        placeholder="+92 300 9876543"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-300">Password</label>
                    <button
                      type="button"
                      onClick={() => { setActiveTab('forgot'); setForgotIdentifier(loginMethod === 'email' ? loginEmail : loginPhone); }}
                      className="text-xs font-semibold text-emerald-400 hover:underline cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                    <input
                      type={showLoginPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
                    />
                    <button
                      type="button"
                      onClick={() => setShowLoginPassword(!showLoginPassword)}
                      className="absolute right-3.5 top-3.5 text-slate-400 hover:text-white cursor-pointer"
                    >
                      {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span>Remember me on this device</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {loginLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                      <span>Authenticating...</span>
                    </>
                  ) : (
                    <span>Log In to Account</span>
                  )}
                </button>
              </form>

              <div className="text-center pt-2">
                <span className="text-xs text-slate-400">Don’t have an account yet? </span>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('signup');
                    setSignupStep(1);
                  }}
                  className="text-xs font-extrabold text-emerald-400 hover:underline cursor-pointer"
                >
                  Sign Up Free
                </button>
              </div>
            </motion.div>
          )}

          {/* MULTI-STEP SIGN UP FORM */}
          {activeTab === 'signup' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h2 className="text-2xl font-extrabold text-white">
                      {signupStep === 1 ? 'Create Account' : 'Select Account Type'}
                    </h2>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {signupStep === 1 
                        ? 'Step 1 of 2: Registration & security details'
                        : 'Step 2 of 2: Account type and business setup'}
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (signupStep === 2) {
                        setSignupStep(1);
                      } else {
                        setActiveTab('welcome');
                      }
                    }}
                    className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition flex items-center gap-1 cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>{signupStep === 2 ? 'Step 1' : 'Cancel'}</span>
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <div className="flex-1 h-1.5 rounded-full bg-emerald-500" />
                  <div className={`flex-1 h-1.5 rounded-full transition-colors ${signupStep === 2 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                </div>
              </div>

              {signupError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{signupError}</span>
                </div>
              )}

              {/* STEP 1: Personal Details */}
              {signupStep === 1 && (
                <form onSubmit={handleProceedToStep2} className="space-y-3.5">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 mb-1 block">Full Name *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        required
                        value={signupName}
                        onChange={(e) => setSignupName(e.target.value)}
                        placeholder="e.g. Muhammad Ali"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 mb-1 block">Email Address *</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="email"
                        required
                        value={signupEmail}
                        onChange={(e) => setSignupEmail(e.target.value)}
                        placeholder="user@domain.pk"
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[11px] font-bold text-slate-300 mb-1 block">Phone Number *</label>
                      <div className="relative">
                        <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <input
                          type="text"
                          required
                          value={signupPhone}
                          onChange={(e) => setSignupPhone(e.target.value)}
                          placeholder="+92 300 1234567"
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-300 mb-1 block">City</label>
                      <div className="relative">
                        <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                        <select
                          value={signupCity}
                          onChange={(e) => setSignupCity(e.target.value)}
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option value="Lahore">Lahore</option>
                          <option value="Karachi">Karachi</option>
                          <option value="Islamabad">Islamabad</option>
                          <option value="Rawalpindi">Rawalpindi</option>
                          <option value="Multan">Multan</option>
                          <option value="Peshawar">Peshawar</option>
                          <option value="Faisalabad">Faisalabad</option>
                          <option value="Quetta">Quetta</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 mb-1 block">Password *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type={showSignupPassword ? 'text' : 'password'}
                        required
                        value={signupPassword}
                        onChange={(e) => setSignupPassword(e.target.value)}
                        placeholder="At least 6 characters"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSignupPassword(!showSignupPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                      >
                        {showSignupPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    {signupPassword && (
                      <div className="mt-1.5 flex items-center gap-2">
                        <div className="flex-1 h-1 rounded-full bg-slate-800 overflow-hidden flex gap-1">
                          <div className={`h-full transition-all duration-300 ${passStrength.color}`} style={{ width: `${(passStrength.score / 4) * 100}%` }} />
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">{passStrength.label} Password</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 mb-1 block">Confirm Password *</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={signupConfirmPassword}
                        onChange={(e) => setSignupConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-3 text-slate-400 hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <label className="flex items-start gap-2 cursor-pointer text-[11px] text-slate-300 pt-1">
                    <input
                      type="checkbox"
                      checked={termsAgreed}
                      onChange={(e) => setTermsAgreed(e.target.checked)}
                      className="w-4 h-4 mt-0.5 rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500"
                    />
                    <span>I agree to BizNest Terms of Service and Privacy Policy.</span>
                  </label>

                  <button
                    type="submit"
                    className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer mt-2"
                  >
                    <span>Continue to Account Type</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* STEP 2: Account Type Selection & Business Info */}
              {signupStep === 2 && (
                <form onSubmit={handleCompleteRegistration} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-300 block">Select Account Type:</label>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div
                        onClick={() => setRole('user')}
                        className={`p-4 rounded-2xl border transition cursor-pointer relative flex flex-col justify-between ${
                          role === 'user'
                            ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-lg shadow-emerald-500/10'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="w-8 h-8 rounded-xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                              <User className="w-4 h-4" />
                            </div>
                            {role === 'user' && (
                              <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </span>
                            )}
                          </div>
                          <h3 className="font-extrabold text-sm text-white">User Account</h3>
                          <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                            Ideal for buyers, clients, and everyday platform visitors.
                          </p>
                        </div>
                      </div>

                      <div
                        onClick={() => setRole('business')}
                        className={`p-4 rounded-2xl border transition cursor-pointer relative flex flex-col justify-between ${
                          role === 'business'
                            ? 'border-emerald-500 bg-emerald-500/10 text-white shadow-lg shadow-emerald-500/10'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                              <Building2 className="w-4 h-4" />
                            </div>
                            {role === 'business' && (
                              <span className="w-5 h-5 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center">
                                <Check className="w-3.5 h-3.5 stroke-[3]" />
                              </span>
                            )}
                          </div>
                          <h3 className="font-extrabold text-sm text-white">Business Account</h3>
                          <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                            Ideal for merchants, vendors, manufacturers & services.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {role === 'business' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="p-4 rounded-2xl bg-slate-900 border border-emerald-500/30 space-y-3"
                    >
                      <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold pb-1 border-b border-slate-800">
                        <Building2 className="w-4 h-4" />
                        <span>Business Setup Details</span>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-300 mb-1 block">Registered Business Name *</label>
                        <input
                          type="text"
                          required
                          value={businessName}
                          onChange={(e) => setBusinessName(e.target.value)}
                          placeholder="e.g. Green Flora Botanical Nursery"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </motion.div>
                  )}

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSignupStep(1)}
                      className="py-3.5 px-4 rounded-2xl bg-slate-900 border border-slate-800 text-slate-300 font-bold text-xs hover:text-white transition cursor-pointer"
                    >
                      ← Back
                    </button>

                    <button
                      type="submit"
                      disabled={signupLoading}
                      className="flex-1 py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {signupLoading ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                          <span>Creating Account...</span>
                        </>
                      ) : (
                        <span>Complete Registration</span>
                      )}
                    </button>
                  </div>
                </form>
              )}

              <div className="text-center pt-1">
                <span className="text-xs text-slate-400">Already registered? </span>
                <button
                  type="button"
                  onClick={() => setActiveTab('login')}
                  className="text-xs font-extrabold text-emerald-400 hover:underline cursor-pointer"
                >
                  Log In Here
                </button>
              </div>
            </motion.div>
          )}

          {/* FORGOT PASSWORD FORM */}
          {activeTab === 'forgot' && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.25 }}
              className="space-y-5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-extrabold text-white">Reset Password</h2>
                  <p className="text-xs text-slate-400 mt-0.5">We will send a secure password reset link to your email.</p>
                </div>
                <button
                  onClick={() => setActiveTab('login')}
                  className="text-xs font-bold text-slate-400 hover:text-white px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 transition cursor-pointer"
                >
                  Back to Login
                </button>
              </div>

              {forgotMsg && (
                <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0 text-emerald-400" />
                  <span>{forgotMsg}</span>
                </div>
              )}

              {forgotError && (
                <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  <span>{forgotError}</span>
                </div>
              )}

              {forgotStep === 1 && (
                <form onSubmit={handleForgotSubmitIdentifier} className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-1 block">Registered Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                      <input
                        type="email"
                        required
                        value={forgotIdentifier}
                        onChange={(e) => setForgotIdentifier(e.target.value)}
                        placeholder="you@example.pk"
                        className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-3.5 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
                  >
                    {forgotLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <span>Send Password Reset Email</span>}
                  </button>
                </form>
              )}

            </motion.div>
          )}

        </div>
      </div>

      {/* GOOGLE ACCOUNT SELECTION MODAL */}
      <AnimatePresence>
        {showGoogleModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-sm rounded-3xl bg-slate-900 border border-slate-800 p-6 shadow-2xl text-white space-y-4 relative"
            >
              <button
                onClick={() => setShowGoogleModal(false)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-full bg-slate-800"
              >
                ✕
              </button>

              <div className="text-center space-y-1">
                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mx-auto shadow-md mb-2">
                  <svg className="w-7 h-7" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                </div>
                <h3 className="text-lg font-black text-white">Sign in with Google</h3>
                <p className="text-xs text-slate-400">Choose an account to continue to BizNest</p>
              </div>

              {googleLoading ? (
                <div className="py-8 text-center space-y-2">
                  <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
                  <p className="text-xs text-slate-300 font-semibold">Authenticating with Google OAuth...</p>
                </div>
              ) : (
                <div className="space-y-2 pt-2">
                  {/* Account 1 */}
                  <button
                    onClick={() => handleGoogleSelectAccount('AHMADALI2132507@gmail.com', 'Ahmad Ali')}
                    className="w-full p-3 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center gap-3 transition text-left cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold flex items-center justify-center shrink-0">
                      AA
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-white group-hover:text-emerald-400 transition">Ahmad Ali</div>
                      <div className="text-[11px] text-slate-400 truncate">AHMADALI2132507@gmail.com</div>
                    </div>
                  </button>

                  {/* Account 2 */}
                  <button
                    onClick={() => handleGoogleSelectAccount('ali.hassan@example.pk', 'Ali Hassan')}
                    className="w-full p-3 rounded-2xl bg-slate-950 hover:bg-slate-800 border border-slate-800 flex items-center gap-3 transition text-left cursor-pointer group"
                  >
                    <div className="w-9 h-9 rounded-full bg-sky-500/20 text-sky-400 font-extrabold flex items-center justify-center shrink-0">
                      AH
                    </div>
                    <div className="overflow-hidden">
                      <div className="text-xs font-bold text-white group-hover:text-sky-400 transition">Ali Hassan</div>
                      <div className="text-[11px] text-slate-400 truncate">ali.hassan@example.pk</div>
                    </div>
                  </button>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
