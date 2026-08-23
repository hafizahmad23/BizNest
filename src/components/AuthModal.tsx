import React, { useState } from 'react';

import {
  registerWithSupabase,
  loginWithSupabaseEmail,
  loginWithSupabasePhone,
  loginWithGoogle,
  sendPasswordResetCode,
  verifyPasswordResetCode,
  updateSupabasePassword,
} from '../lib/supabaseAuth';

import type { User as UserType } from '../types';

import {
  X,
  ShieldCheck,
  Mail,
  Smartphone,
  Phone,
  Lock,
  Eye,
  EyeOff,
  User,
  Building2,
  Check,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: UserType) => void;
  isDarkMode?: boolean;
  initialMode?: 'login' | 'signup';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  isDarkMode = true,
  initialMode = 'login',
}) => {
  /* ======================================================
     MAIN MODE
  ====================================================== */

  const [mode, setMode] = useState<
    'login' | 'signup' | 'forgot'
  >(initialMode);

  const [loginMethod, setLoginMethod] = useState<
    'email' | 'phone'
  >('email');

  /* ======================================================
     SIGNUP
  ====================================================== */

  const [signupStep, setSignupStep] = useState<1 | 2>(1);

  const [role, setRole] = useState<'user' | 'business'>(
    'user'
  );

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('Lahore');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] =
    useState('');

  const [businessName, setBusinessName] =
    useState('');

  const [businessCategory, setBusinessCategory] =
    useState('Botanical & Nursery');

  const [signupLoading, setSignupLoading] =
    useState(false);

  /* ======================================================
     LOGIN
  ====================================================== */

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPhone, setLoginPhone] = useState('');
  const [loginPassword, setLoginPassword] =
    useState('');

  const [showLoginPass, setShowLoginPass] =
    useState(false);

  const [loginLoading, setLoginLoading] =
    useState(false);

  /* ======================================================
     FORGOT PASSWORD
  ====================================================== */

  const [forgotStep, setForgotStep] = useState<
    1 | 2 | 3
  >(1);

  const [forgotEmail, setForgotEmail] =
    useState('');

  const [otpCode, setOtpCode] =
    useState('');

  const [newPassword, setNewPassword] =
    useState('');

  const [confirmNewPassword, setConfirmNewPassword] =
    useState('');

  const [forgotLoading, setForgotLoading] =
    useState(false);

  /* ======================================================
     MESSAGES
  ====================================================== */

  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] =
    useState('');

  /* ======================================================
     HELPERS
  ====================================================== */

  const validateEmail = (value: string) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      value.trim()
    );
  };

  const clearMessages = () => {
    setError('');
    setSuccessMessage('');
  };

  const switchMode = (
    newMode: 'login' | 'signup' | 'forgot'
  ) => {
    setMode(newMode);
    clearMessages();

    if (newMode === 'signup') {
      setSignupStep(1);
    }

    if (newMode === 'forgot') {
      setForgotStep(1);
      setOtpCode('');
      setNewPassword('');
      setConfirmNewPassword('');
    }
  };

  if (!isOpen) {
    return null;
  }

  /* ======================================================
     LOGIN
  ====================================================== */

  const handleLoginSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    clearMessages();

    if (loginMethod === 'email') {
      if (
        !loginEmail.trim() ||
        !validateEmail(loginEmail)
      ) {
        setError(
          'Please enter a valid email address.'
        );
        return;
      }
    } else {
      if (!loginPhone.trim()) {
        setError(
          'Please enter your registered phone number.'
        );
        return;
      }
    }

    if (!loginPassword) {
      setError('Please enter your password.');
      return;
    }

    setLoginLoading(true);

    try {
      const result =
        loginMethod === 'email'
          ? await loginWithSupabaseEmail(
              loginEmail,
              loginPassword
            )
          : await loginWithSupabasePhone(
              loginPhone,
              loginPassword
            );

      if (!result.success || !result.user) {
        setError(
          result.error ||
            'Invalid email/phone or password.'
        );
        return;
      }

      onSuccess(result.user);
      onClose();
    } catch (err) {
      console.error(err);

      setError(
        'Something went wrong while logging in. Please try again.'
      );
    } finally {
      setLoginLoading(false);
    }
  };

  /* ======================================================
     SIGNUP STEP 1
  ====================================================== */

  const handleStep1Next = (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    clearMessages();

    if (!name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (
      !email.trim() ||
      !validateEmail(email)
    ) {
      setError(
        'Please enter a valid email address.'
      );
      return;
    }

    if (!phone.trim()) {
      setError(
        'Please enter your phone number.'
      );
      return;
    }

    if (
      !password ||
      password.length < 8
    ) {
      setError(
        'Password must be at least 8 characters long.'
      );
      return;
    }

    if (
      password !== confirmPassword
    ) {
      setError(
        'Passwords do not match.'
      );
      return;
    }

    setSignupStep(2);
  };

  /* ======================================================
     FINAL SIGNUP
  ====================================================== */

  const handleFinalSignupSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    clearMessages();

    if (
      role === 'business' &&
      !businessName.trim()
    ) {
      setError(
        'Please enter your registered business name.'
      );
      return;
    }

    setSignupLoading(true);

    try {
      const result =
        await registerWithSupabase({
          name,
          email,
          phone,
          password,
          role,
          city,
          businessName:
            role === 'business'
              ? businessName
              : undefined,
        });

      if (!result.success || !result.user) {
        setError(
          result.error ||
            'Failed to create account.'
        );
        return;
      }

      /*
       * Email confirmation enabled:
       * account created but user must verify email.
       */
      if (
        result.needsEmailConfirmation
      ) {
        setSuccessMessage(
          result.message ||
            'Account created. Please check your email and verify your account before logging in.'
        );

        setMode('login');
        setSignupStep(1);
        setLoginEmail(email);
        setLoginPassword('');

        return;
      }

      onSuccess(result.user);
      onClose();
    } catch (err) {
      console.error(err);

      setError(
        'Something went wrong while creating your account.'
      );
    } finally {
      setSignupLoading(false);
    }
  };

  /* ======================================================
     FORGOT PASSWORD STEP 1
     SEND REAL OTP
  ====================================================== */

  const handleSendResetCode = async () => {
    clearMessages();

    const cleanEmail =
      forgotEmail.trim().toLowerCase();

    if (!cleanEmail) {
      setError(
        'Please enter your email address.'
      );
      return;
    }

    if (!validateEmail(cleanEmail)) {
      setError(
        'Please enter a valid email address.'
      );
      return;
    }

    setForgotLoading(true);

    try {
      const result =
        await sendPasswordResetCode(
          cleanEmail
        );

      if (!result.success) {
        setError(
          result.error ||
            'Could not send verification code.'
        );
        return;
      }

      setSuccessMessage(
  result.message ||
    'Password reset email sent. Please check your inbox and spam folder, then click the reset link.'
);
    } catch (err) {
      console.error(err);

      setError(
        'Unable to send verification code. Please try again.'
      );
    } finally {
      setForgotLoading(false);
    }
  };

  /* ======================================================
     FORGOT PASSWORD STEP 2
     VERIFY REAL OTP
  ====================================================== */

  const handleVerifyResetCode = async () => {
  clearMessages();

  setSuccessMessage(
    'Please use the password reset link sent to your email. It will open the secure password reset page.'
  );
};

  /* ======================================================
     FORGOT PASSWORD STEP 3
     UPDATE PASSWORD
  ====================================================== */

  const handleUpdatePassword = async () => {
    clearMessages();

    if (
      !newPassword ||
      newPassword.length < 8
    ) {
      setError(
        'New password must be at least 8 characters long.'
      );
      return;
    }

    if (
      newPassword !==
      confirmNewPassword
    ) {
      setError(
        'Passwords do not match.'
      );
      return;
    }

    setForgotLoading(true);

    try {
      const result =
        await updateSupabasePassword(
          newPassword
        );

      if (!result.success) {
        setError(
          result.error ||
            'Could not update password.'
        );
        return;
      }

      setSuccessMessage(
        'Password updated successfully. You can now log in with your new password.'
      );

      setTimeout(() => {
        setMode('login');
        setForgotStep(1);

        setLoginEmail(
          forgotEmail
        );

        setLoginPassword('');

        setForgotEmail('');
        setOtpCode('');
        setNewPassword('');
        setConfirmNewPassword('');

        clearMessages();
      }, 1500);
    } catch (err) {
      console.error(err);

      setError(
        'Something went wrong while updating your password.'
      );
    } finally {
      setForgotLoading(false);
    }
  };

  /* ======================================================
     GOOGLE LOGIN
  ====================================================== */

  const handleGoogleLogin = async () => {
    clearMessages();

    try {
      const result =
        await loginWithGoogle();

      if (!result.success) {
        setError(
          result.error ||
            'Google login failed.'
        );
      }

      /*
       * Supabase redirects the browser to Google.
       * After successful OAuth, the session is restored
       * by Supabase.
       */
    } catch (err) {
      console.error(err);

      setError(
        'Unable to start Google login.'
      );
    }
  };

  /* ======================================================
     UI
  ====================================================== */

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div
        className={`w-full max-w-md rounded-3xl border overflow-hidden shadow-2xl relative max-h-[90vh] flex flex-col ${
          isDarkMode
            ? 'bg-slate-900 border-slate-800 text-white'
            : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Glow */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-4 right-4 p-2 rounded-full transition z-10 ${
            isDarkMode
              ? 'hover:bg-slate-800 text-slate-400'
              : 'hover:bg-slate-100 text-slate-500'
          }`}
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="p-6 pb-3 shrink-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />

            <span>
              BizNest Secure ID
            </span>
          </div>

          <h2 className="text-2xl font-extrabold tracking-tight">
            {mode === 'login'
              ? 'Sign In to BizNest'
              : mode === 'signup'
              ? signupStep === 1
                ? 'Create Account'
                : 'Choose Account Type'
              : 'Reset Password'}
          </h2>

          <p className="text-xs text-slate-400 mt-1">
            {mode === 'login'
              ? 'Access saved businesses, chats, and orders.'
              : mode === 'signup'
              ? signupStep === 1
                ? 'Step 1 of 2: Details & credentials'
                : 'Step 2 of 2: Select account type'
              : forgotStep === 1
              ? 'Enter your email to receive a verification code.'
              : forgotStep === 2
              ? 'Enter the verification code sent to your email.'
              : 'Create a new secure password.'}
          </p>

          {/* Mode tabs */}
          {mode !== 'forgot' && (
            <div
              className={`flex rounded-2xl p-1 mt-4 border ${
                isDarkMode
                  ? 'bg-slate-950 border-slate-800'
                  : 'bg-slate-100 border-slate-200'
              }`}
            >
              <button
                type="button"
                onClick={() =>
                  switchMode('login')
                }
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                  mode === 'login'
                    ? isDarkMode
                      ? 'bg-slate-800 text-white'
                      : 'bg-white text-slate-900'
                    : 'text-slate-500'
                }`}
              >
                Log In
              </button>

              <button
                type="button"
                onClick={() =>
                  switchMode('signup')
                }
                className={`flex-1 py-2 rounded-xl text-xs font-bold transition ${
                  mode === 'signup'
                    ? isDarkMode
                      ? 'bg-slate-800 text-white'
                      : 'bg-white text-slate-900'
                    : 'text-slate-500'
                }`}
              >
                Sign Up
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6 pt-2 overflow-y-auto space-y-4 flex-1">
          {/* ERROR */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-medium flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />

              <span>{error}</span>
            </div>
          )}

          {/* SUCCESS */}
          {successMessage && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-medium flex items-center gap-2">
              <CheckCircle className="w-4 h-4 shrink-0" />

              <span>
                {successMessage}
              </span>
            </div>
          )}

          {/* =================================================
              LOGIN
          ================================================= */}

          {mode === 'login' && (
            <div className="space-y-4">
              {/* Login method */}
              <div className="flex rounded-xl p-1 bg-slate-950 border border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod(
                      'email'
                    );
                    clearMessages();
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 ${
                    loginMethod ===
                    'email'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-400'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />

                  Email
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setLoginMethod(
                      'phone'
                    );
                    clearMessages();
                  }}
                  className={`flex-1 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 ${
                    loginMethod ===
                    'phone'
                      ? 'bg-emerald-500 text-slate-950'
                      : 'text-slate-400'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />

                  Phone Number
                </button>
              </div>

              {/* Google */}
              <button
                type="button"
                onClick={
                  handleGoogleLogin
                }
                className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2 shadow transition"
              >
                <svg
                  className="w-4 h-4"
                  viewBox="0 0 24 24"
                >
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>

                Continue with Google
              </button>

              <form
                onSubmit={
                  handleLoginSubmit
                }
                className="space-y-3"
              >
                {/* Email */}
                {loginMethod ===
                'email' ? (
                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-1 block">
                      Email Address
                    </label>

                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />

                      <input
                        type="email"
                        required
                        placeholder="name@example.com"
                        value={
                          loginEmail
                        }
                        onChange={(e) =>
                          setLoginEmail(
                            e.target.value
                          )
                        }
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                ) : (
                  /* Phone */
                  <div>
                    <label className="text-xs font-bold text-slate-300 mb-1 block">
                      Phone Number
                    </label>

                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />

                      <input
                        type="text"
                        required
                        placeholder="+92 300 0000000"
                        value={
                          loginPhone
                        }
                        onChange={(e) =>
                          setLoginPhone(
                            e.target.value
                          )
                        }
                        className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}

                {/* Password */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-300">
                      Password
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        switchMode(
                          'forgot'
                        )
                      }
                      className="text-[11px] font-semibold text-emerald-400 hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>

                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />

                    <input
                      type={
                        showLoginPass
                          ? 'text'
                          : 'password'
                      }
                      required
                      placeholder="••••••••"
                      value={
                        loginPassword
                      }
                      onChange={(e) =>
                        setLoginPassword(
                          e.target.value
                        )
                      }
                      className="w-full pl-9 pr-9 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowLoginPass(
                          !showLoginPass
                        )
                      }
                      className="absolute right-3 top-3.5 text-slate-400"
                    >
                      {showLoginPass ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={
                    loginLoading
                  }
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2"
                >
                  {loginLoading ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    'Log In'
                  )}
                </button>
              </form>
            </div>
          )}

          {/* =================================================
              SIGNUP STEP 1
          ================================================= */}

          {mode ===
            'signup' &&
            signupStep === 1 && (
              <form
                onSubmit={
                  handleStep1Next
                }
                className="space-y-3"
              >
                {/* Name */}
                <div>
                  <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                    Full Name *
                  </label>

                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />

                    <input
                      type="text"
                      required
                      placeholder="e.g. Ali Hassan"
                      value={name}
                      onChange={(e) =>
                        setName(
                          e.target.value
                        )
                      }
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                    Email Address *
                  </label>

                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />

                    <input
                      type="email"
                      required
                      placeholder="name@example.com"
                      value={email}
                      onChange={(e) =>
                        setEmail(
                          e.target.value
                        )
                      }
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {/* Phone + City */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                      Phone Number *
                    </label>

                    <input
                      type="text"
                      required
                      placeholder="+92 300..."
                      value={phone}
                      onChange={(e) =>
                        setPhone(
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                      City
                    </label>

                    <select
                      value={city}
                      onChange={(e) =>
                        setCity(
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Lahore">
                        Lahore
                      </option>

                      <option value="Karachi">
                        Karachi
                      </option>

                      <option value="Islamabad">
                        Islamabad
                      </option>

                      <option value="Multan">
                        Multan
                      </option>

                      <option value="Bahawalpur">
                        Bahawalpur
                      </option>

                      <option value="Dera Ghazi Khan">
                        Dera Ghazi Khan
                      </option>
                    </select>
                  </div>
                </div>

                {/* Password */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                      Password *
                    </label>

                    <input
                      type="password"
                      required
                      placeholder="Min 6 chars"
                      value={password}
                      onChange={(e) =>
                        setPassword(
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 mb-1 block">
                      Confirm Password *
                    </label>

                    <input
                      type="password"
                      required
                      placeholder="Re-enter"
                      value={
                        confirmPassword
                      }
                      onChange={(e) =>
                        setConfirmPassword(
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2"
                >
                  Continue to Account Type

                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

          {/* =================================================
              SIGNUP STEP 2
          ================================================= */}

          {mode ===
            'signup' &&
            signupStep === 2 && (
              <form
                onSubmit={
                  handleFinalSignupSubmit
                }
                className="space-y-4"
              >
                <div>
                  <label className="text-xs font-bold text-slate-300">
                    Select Account Type
                  </label>

                  <div className="grid grid-cols-2 gap-3 mt-2">
                    {/* User */}
                    <button
                      type="button"
                      onClick={() =>
                        setRole('user')
                      }
                      className={`p-4 rounded-2xl border text-left relative ${
                        role ===
                        'user'
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <User
                        className={`w-5 h-5 mb-2 ${
                          role ===
                          'user'
                            ? 'text-emerald-400'
                            : 'text-slate-400'
                        }`}
                      />

                      <div className="font-bold text-xs text-white">
                        User Account
                      </div>

                      <div className="text-[10px] text-slate-400 mt-1">
                        Browse & order
                      </div>

                      {role ===
                        'user' && (
                        <Check className="w-4 h-4 text-emerald-400 absolute top-3 right-3" />
                      )}
                    </button>

                    {/* Business */}
                    <button
                      type="button"
                      onClick={() =>
                        setRole(
                          'business'
                        )
                      }
                      className={`p-4 rounded-2xl border text-left relative ${
                        role ===
                        'business'
                          ? 'border-emerald-500 bg-emerald-500/10'
                          : 'bg-slate-950 border-slate-800'
                      }`}
                    >
                      <Building2
                        className={`w-5 h-5 mb-2 ${
                          role ===
                          'business'
                            ? 'text-emerald-400'
                            : 'text-slate-400'
                        }`}
                      />

                      <div className="font-bold text-xs text-white">
                        Business Account
                      </div>

                      <div className="text-[10px] text-slate-400 mt-1">
                        List business
                      </div>

                      {role ===
                        'business' && (
                        <Check className="w-4 h-4 text-emerald-400 absolute top-3 right-3" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Business name */}
                {role ===
                  'business' && (
                  <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                    <label className="text-[11px] font-bold text-slate-300 block">
                      Registered Business Name *
                    </label>

                    <input
                      type="text"
                      required
                      placeholder="e.g. Green Flora"
                      value={
                        businessName
                      }
                      onChange={(e) =>
                        setBusinessName(
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />

                    <select
                      value={
                        businessCategory
                      }
                      onChange={(e) =>
                        setBusinessCategory(
                          e.target.value
                        )
                      }
                      className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                    >
                      <option>
                        Botanical & Nursery
                      </option>

                      <option>
                        Electronics
                      </option>

                      <option>
                        Fashion
                      </option>

                      <option>
                        Restaurant & Food
                      </option>

                      <option>
                        Construction
                      </option>

                      <option>
                        Services
                      </option>

                      <option>
                        Other
                      </option>
                    </select>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSignupStep(1)
                    }
                    className="px-4 py-3 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 font-bold text-xs"
                  >
                    Back
                  </button>

                  <button
                    type="submit"
                    disabled={
                      signupLoading
                    }
                    className="flex-1 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2"
                  >
                    {signupLoading ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Creating...
                      </>
                    ) : (
                      'Finish Registration'
                    )}
                  </button>
                </div>
              </form>
            )}

          {/* =================================================
              FORGOT PASSWORD
          ================================================= */}

          {mode ===
            'forgot' && (
              <div className="space-y-4">
                {/* STEP 1 */}
                {forgotStep ===
                  1 && (
                  <>
                    <div>
                      <label className="text-xs font-bold text-slate-300 mb-1 block">
                        Email Address
                      </label>

                      <div className="relative">
                        <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" />

                        <input
                          type="email"
                          required
                          placeholder="name@example.com"
                          value={
                            forgotEmail
                          }
                          onChange={(e) =>
                            setForgotEmail(
                              e.target.value
                            )
                          }
                          className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>

                    <button
                      type="button"
                      disabled={
                        forgotLoading
                      }
                      onClick={
                        handleSendResetCode
                      }
                      className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2"
                    >
                      {forgotLoading ? (
  <>
    <RefreshCw className="w-4 h-4 animate-spin" />
    Sending Email...
  </>
) : (
  'Send Password Reset Email'
)}
                    </button>
                  </>
                )}

              

               

                <button
                  type="button"
                  onClick={() =>
                    switchMode(
                      'login'
                    )
                  }
                  className="w-full py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 font-bold text-xs"
                >
                  Back to Login
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;