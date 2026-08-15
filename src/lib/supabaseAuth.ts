import { supabase } from './supabase';
import type { User as UserType } from '../types';

export type AuthResult = {
  success: boolean;
  user?: UserType;
  error?: string;
  message?: string;
  needsEmailConfirmation?: boolean;
};

function mapSupabaseUser(user: any): UserType {
  const metadata = user?.user_metadata ?? {};

  return {
    id: user.id,
    name:
      metadata.name ||
      metadata.full_name ||
      user.email?.split('@')[0] ||
      'User',

    email: user.email ?? '',

    phone: user.phone || metadata.phone || '',

    role: metadata.role === 'business' ? 'business' : 'user',

    city: metadata.city || 'Lahore',

    savedBusinessIds: Array.isArray(metadata.savedBusinessIds)
      ? metadata.savedBusinessIds
      : [],

    businessName: metadata.businessName || undefined,

    businessId: metadata.businessId || undefined,

    createdAt: user.created_at
      ? user.created_at.split('T')[0]
      : new Date().toISOString().split('T')[0],
  } as UserType;
}

function readableAuthError(message: string): string {
  const m = message.toLowerCase();

  if (m.includes('failed to fetch') || m.includes('networkerror')) {
    return 'BizNest could not reach Supabase. Check VITE_SUPABASE_URL in the .env file, then restart the development server.';
  }

  if (m.includes('invalid login credentials')) {
    return 'Incorrect email/phone or password.';
  }

  if (m.includes('email not confirmed')) {
    return 'Please verify your email address first, then log in.';
  }

  if (m.includes('user already registered')) {
    return 'An account with this email address already exists. Please log in instead.';
  }

  if (m.includes('password should be at least')) {
    return 'Password must be at least 6 characters long.';
  }

  if (m.includes('rate limit')) {
    return 'Too many attempts. Please wait a little and try again.';
  }

  return message;
}

/* =========================================================
   SIGN UP
========================================================= */

export async function registerWithSupabase(data: {
  name: string;
  email: string;
  phone: string;
  password: string;
  role: 'user' | 'business';
  city: string;
  businessName?: string;
  businessCategory?: string;
}): Promise<AuthResult> {
  const email = data.email.trim().toLowerCase();

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password: data.password,

    options: {
      emailRedirectTo: window.location.origin,

      data: {
        name: data.name.trim(),
        phone: data.phone.trim(),
        role: data.role,
        city: data.city,
        businessName: data.businessName?.trim() || '',
        savedBusinessIds: [],
      },
    },
  });

  if (error) {
    return {
      success: false,
      error: readableAuthError(error.message),
    };
  }

  if (!authData.user) {
    return {
      success: false,
      error: 'Account could not be created.',
    };
  }

  const user = mapSupabaseUser(authData.user);

  /*
   * If email confirmation is enabled in Supabase,
   * user exists but session is null until email is verified.
   */
  if (!authData.session) {
    return {
      success: true,
      user,
      needsEmailConfirmation: true,
      message:
        'Account created successfully. Please check your email and verify your account before logging in.',
    };
  }

  return {
    success: true,
    user,
  };
}

/* =========================================================
   LOGIN WITH EMAIL + PASSWORD
========================================================= */

export async function loginWithSupabaseEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  const cleanEmail = email.trim().toLowerCase();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password,
  });

  if (error) {
    return {
      success: false,
      error: readableAuthError(error.message),
    };
  }

  if (!data.user) {
    return {
      success: false,
      error: 'Login failed.',
    };
  }

  return {
    success: true,
    user: mapSupabaseUser(data.user),
  };
}

/* =========================================================
   LOGIN WITH PHONE + PASSWORD
========================================================= */

export async function loginWithSupabasePhone(
  phone: string,
  password: string
): Promise<AuthResult> {
  const cleanPhone = phone.trim();

  if (!cleanPhone) {
    return {
      success: false,
      error: 'Please enter your phone number.',
    };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    phone: cleanPhone,
    password,
  });

  if (error) {
    return {
      success: false,
      error: readableAuthError(error.message),
    };
  }

  if (!data.user) {
    return {
      success: false,
      error: 'Login failed.',
    };
  }

  return {
    success: true,
    user: mapSupabaseUser(data.user),
  };
}

/* =========================================================
   GOOGLE LOGIN
========================================================= */

export async function loginWithGoogle(): Promise<AuthResult> {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',

    options: {
      redirectTo: window.location.origin,
    },
  });

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
  };
}

/* =========================================================
   FORGOT PASSWORD - SEND REAL EMAIL OTP
========================================================= */

export async function sendPasswordResetCode(
  email: string
): Promise<AuthResult> {
  const cleanEmail = email.trim().toLowerCase();

  if (!cleanEmail) {
    return {
      success: false,
      error: 'Please enter your email address.',
    };
  }

  const { error } =
    await supabase.auth.resetPasswordForEmail(
      cleanEmail,
      {
        redirectTo: `${window.location.origin}/reset-password`,
      }
    );

  if (error) {
    return {
      success: false,
      error: readableAuthError(error.message),
    };
  }

  return {
    success: true,
    message:
      'A password reset email has been sent. Please check your inbox and spam folder.',
  };
}

/* =========================================================
   FORGOT PASSWORD - VERIFY OTP
========================================================= */

export async function verifyPasswordResetCode(
  email: string,
  code: string
): Promise<AuthResult> {
  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = code.trim();

  if (!cleanEmail || !cleanCode) {
    return {
      success: false,
      error: 'Email and verification code are required.',
    };
  }

  const { data, error } =
    await supabase.auth.verifyOtp({
      email: cleanEmail,
      token: cleanCode,
      type: 'recovery',
    });

  if (error) {
    return {
      success: false,
      error:
        'Invalid or expired verification code. Please request a new code.',
    };
  }

  if (!data.user) {
    return {
      success: false,
      error: 'Verification failed.',
    };
  }

  return {
    success: true,
    user: mapSupabaseUser(data.user),
  };
}

/* =========================================================
   UPDATE PASSWORD AFTER OTP VERIFICATION
========================================================= */

export async function updateSupabasePassword(
  newPassword: string
): Promise<AuthResult> {
  if (!newPassword || newPassword.length < 6) {
    return {
      success: false,
      error: 'New password must be at least 6 characters long.',
    };
  }

  const { data, error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) {
    return {
      success: false,
      error: readableAuthError(error.message),
    };
  }

  return {
    success: true,
    user: data.user ? mapSupabaseUser(data.user) : undefined,
    message: 'Password updated successfully.',
  };
}

/* =========================================================
   STANDARD SUPABASE RESET LINK
   Kept available for future use.
========================================================= */

export async function sendPasswordResetEmail(
  email: string
): Promise<AuthResult> {
  const cleanEmail = email.trim().toLowerCase();

  const { error } = await supabase.auth.resetPasswordForEmail(
    cleanEmail,
    {
      redirectTo: `${window.location.origin}/reset-password`,
    }
  );

  if (error) {
    return {
      success: false,
      error: readableAuthError(error.message),
    };
  }

  return {
    success: true,
    message: 'A password reset email has been sent.',
  };
}

/* =========================================================
   LOGOUT
========================================================= */

export async function logoutFromSupabase(): Promise<AuthResult> {
  const { error } = await supabase.auth.signOut();

  if (error) {
    return {
      success: false,
      error: error.message,
    };
  }

  return {
    success: true,
  };
}

/* =========================================================
   CURRENT USER
========================================================= */

export async function getCurrentSupabaseUser(): Promise<UserType | null> {
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  return mapSupabaseUser(user);
}
