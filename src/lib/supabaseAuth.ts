import { supabase, isSupabaseConfigured, DATABASE_NOT_CONFIGURED_ERROR } from './supabase';
import { fetchProfile, upgradeToBusinessRole, fetchSavedBusinesses, mapProfileToUser } from './supabaseDB';
import { isValidEmail, validateFullName } from './validation';
import type { User as UserType, ProfileRow } from '../types';

/** One silent profiles.email sync attempt per auth user, per page lifetime. */
const emailSyncAttempted = new Set<string>();

/**
 * If the auth user's confirmed email differs from profiles.email (e.g. after
 * they clicked the change-email confirmation link), write ONLY the email
 * column once per session. Never touches role, id, or any other field.
 */
async function syncProfileEmailIfStale(authUser: any, profile: ProfileRow): Promise<ProfileRow> {
  const authEmail = typeof authUser?.email === 'string' ? authUser.email.trim() : '';
  if (!authEmail) return profile;

  const profileEmail = (profile.email || '').trim();
  if (authEmail.toLowerCase() === profileEmail.toLowerCase()) return profile;

  const withAuthEmail: ProfileRow = { ...profile, email: authEmail };

  if (!authUser.id || emailSyncAttempted.has(authUser.id)) return withAuthEmail;
  emailSyncAttempted.add(authUser.id);

  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({ email: authEmail })
      .eq('id', authUser.id)
      .select('*')
      .maybeSingle();
    if (error || !data) return withAuthEmail;
    return data as ProfileRow;
  } catch {
    return withAuthEmail;
  }
}

export type AuthResult = {
  success: boolean;
  user?: UserType;
  error?: string;
  message?: string;
  needsEmailConfirmation?: boolean;
};

/**
 * Build the application User from the Supabase Auth user, using the
 * `profiles` table row as the ONE authoritative source for the role.
 *
 * - Role is NEVER read from user_metadata (a client can tamper with it).
 * - Role is NEVER read from localStorage.
 * - If the profile row is missing (e.g. DB not migrated yet), the fallback
 *   role is safely 'user' — never an elevated role.
 */
export async function mapSupabaseUser(authUser: any): Promise<UserType | null> {
  if (!authUser) return null;

  const { data: profile } = await fetchProfile(authUser.id);

  if (profile) {
    const synced = await syncProfileEmailIfStale(authUser, profile);
    const { data: saved } = await fetchSavedBusinesses(synced.id);
    return mapProfileToUser(
      synced,
      (saved || []).map((b) => b.id)
    );
  }

  // No profile row yet — safe fallback with the lowest privilege.
  const metadata = authUser?.user_metadata ?? {};
  return {
    id: authUser.id,
    name: metadata.name || metadata.full_name || authUser.email?.split('@')[0] || 'User',
    email: authUser.email ?? '',
    phone: authUser.phone || metadata.phone || undefined,
    role: 'user', // never trust metadata.role
    city: metadata.city || undefined,
    savedBusinessIds: [],
    createdAt: authUser.created_at || new Date().toISOString(),
  };
}

function notConfigured(): AuthResult {
  return { success: false, error: DATABASE_NOT_CONFIGURED_ERROR };
}

function readableAuthError(message: string): string {
  const m = message.toLowerCase();

  if (m.includes('failed to fetch') || m.includes('networkerror')) {
    return 'BizNest could not reach Supabase. Check VITE_SUPABASE_URL in your environment, then restart.';
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
    return 'Password must be at least 8 characters long.';
  }
  if (m.includes('rate limit')) {
    return 'Too many attempts. Please wait a little and try again.';
  }
  return message;
}

/* =========================================================
   SIGN UP
   - Auth account created with (harmless) metadata used by the
     handle_new_user DB trigger to build the profiles row.
   - Role 'business' is applied via an awaited profiles update
     AFTER signup (profiles table is authoritative).
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
  if (!isSupabaseConfigured) return notConfigured();

  const nameError = validateFullName(data.name);
  if (nameError) return { success: false, error: nameError };

  const email = data.email.trim().toLowerCase();
  const fullName = data.name.trim();

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password: data.password,
    options: {
      emailRedirectTo: window.location.origin,
      data: {
        name: fullName,
        full_name: fullName,
        phone: data.phone.trim(),
        city: data.city,
      },
    },
  });

  if (error) {
    return { success: false, error: readableAuthError(error.message) };
  }

  if (!authData.user) {
    return { success: false, error: 'Account could not be created.' };
  }

  if (!authData.session) {
    return {
      success: true,
      needsEmailConfirmation: true,
      message:
        'Account created successfully. Please check your email and verify your account before logging in.',
    };
  }

  // Applying a requested business role is a real awaited DB write on the
  // profiles table (the trigger may need a moment to create the row first).
  if (data.role === 'business') {
    for (let attempt = 0; attempt < 5; attempt++) {
      const res = await upgradeToBusinessRole();
      if (!res.error) break;
      await new Promise((r) => setTimeout(r, 600));
    }
  }

  const user = await mapSupabaseUser(authData.user);
  if (!user) return { success: false, error: 'Account could not be loaded.' };

  return { success: true, user };
}

/* =========================================================
   LOGIN — EMAIL + PASSWORD
========================================================= */

export async function loginWithSupabaseEmail(
  email: string,
  password: string
): Promise<AuthResult> {
  if (!isSupabaseConfigured) return notConfigured();

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });

  if (error) return { success: false, error: readableAuthError(error.message) };
  if (!data.user) return { success: false, error: 'Login failed.' };

  const user = await mapSupabaseUser(data.user);
  return { success: true, user: user ?? undefined };
}

/* =========================================================
   LOGIN — PHONE + PASSWORD
========================================================= */

export async function loginWithSupabasePhone(
  phone: string,
  password: string
): Promise<AuthResult> {
  if (!isSupabaseConfigured) return notConfigured();

  const cleanPhone = phone.trim();
  if (!cleanPhone) {
    return { success: false, error: 'Please enter your phone number.' };
  }

  const { data, error } = await supabase.auth.signInWithPassword({
    phone: cleanPhone,
    password,
  });

  if (error) return { success: false, error: readableAuthError(error.message) };
  if (!data.user) return { success: false, error: 'Login failed.' };

  const user = await mapSupabaseUser(data.user);
  return { success: true, user: user ?? undefined };
}

/* =========================================================
   GOOGLE LOGIN
========================================================= */

export async function loginWithGoogle(): Promise<AuthResult> {
  if (!isSupabaseConfigured) return notConfigured();

  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

/* =========================================================
   PASSWORD RESET FLOW
========================================================= */

export async function sendPasswordResetCode(email: string): Promise<AuthResult> {
  if (!isSupabaseConfigured) return notConfigured();

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail) {
    return { success: false, error: 'Please enter your email address.' };
  }

  const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) return { success: false, error: readableAuthError(error.message) };

  return {
    success: true,
    message: 'A password reset email has been sent. Please check your inbox and spam folder.',
  };
}

export async function verifyPasswordResetCode(
  email: string,
  code: string
): Promise<AuthResult> {
  if (!isSupabaseConfigured) return notConfigured();

  const cleanEmail = email.trim().toLowerCase();
  const cleanCode = code.trim();

  if (!cleanEmail || !cleanCode) {
    return { success: false, error: 'Email and verification code are required.' };
  }

  const { data, error } = await supabase.auth.verifyOtp({
    email: cleanEmail,
    token: cleanCode,
    type: 'recovery',
  });

  if (error) {
    return {
      success: false,
      error: 'Invalid or expired verification code. Please request a new code.',
    };
  }

  if (!data.user) return { success: false, error: 'Verification failed.' };

  const user = await mapSupabaseUser(data.user);
  return { success: true, user: user ?? undefined };
}

export async function updateSupabasePassword(newPassword: string): Promise<AuthResult> {
  if (!isSupabaseConfigured) return notConfigured();

  if (!newPassword || newPassword.length < 8) {
    return { success: false, error: 'New password must be at least 8 characters long.' };
  }

  const { data, error } = await supabase.auth.updateUser({ password: newPassword });

  if (error) return { success: false, error: readableAuthError(error.message) };

  const user = data.user ? await mapSupabaseUser(data.user) : undefined;
  return { success: true, user: user ?? undefined, message: 'Password updated successfully.' };
}

export async function sendPasswordResetEmail(email: string): Promise<AuthResult> {
  return sendPasswordResetCode(email);
}

/* =========================================================
   CHANGE EMAIL
   Relies on the authenticated session. Supabase emails a
   confirmation link to the NEW address; the session and
   login email stay on the old address until that link is
   clicked. We never write profiles.email here — the
   self-heal in mapSupabaseUser syncs it after confirmation.
========================================================= */

function readableEmailChangeError(message: string): string {
  const m = message.toLowerCase();
  if (m.includes('already') || m.includes('exists') || m.includes('registered')) {
    return 'This email is already in use. Please choose a different address.';
  }
  if (m.includes('invalid') || m.includes('valid email')) {
    return 'Please enter a valid email address.';
  }
  if (m.includes('rate limit')) {
    return 'Too many attempts. Please wait a little and try again.';
  }
  if (m.includes('same') && m.includes('email')) {
    return 'Please enter a different email from your current one.';
  }
  return message;
}

export async function requestEmailChange(newEmail: string): Promise<AuthResult> {
  if (!isSupabaseConfigured) return notConfigured();

  const email = newEmail.trim().toLowerCase();
  if (!email || !isValidEmail(email)) {
    return { success: false, error: 'Please enter a valid email address.' };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const current = (user?.email || '').trim().toLowerCase();
  if (current && current === email) {
    return { success: false, error: 'Please enter a different email from your current one.' };
  }

  const { error } = await supabase.auth.updateUser(
    { email },
    { emailRedirectTo: window.location.origin }
  );

  if (error) return { success: false, error: readableEmailChangeError(error.message) };

  return {
    success: true,
    message:
      'Confirmation link bhej diya gaya hai — apne NAYE email ka inbox khol kar link click karein. Tab tak purana email hi login ke liye kaam karega.',
  };
}

/* =========================================================
   LOGOUT
========================================================= */

export async function logoutFromSupabase(): Promise<AuthResult> {
  if (!isSupabaseConfigured) return notConfigured();

  const { error } = await supabase.auth.signOut();
  if (error) return { success: false, error: error.message };
  return { success: true };
}

/* =========================================================
   CURRENT USER (session restore)
========================================================= */

export async function getCurrentSupabaseUser(): Promise<UserType | null> {
  if (!isSupabaseConfigured) return null;

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.user) return null;
  return mapSupabaseUser(session.user);
}

/* =========================================================
   AUTH STATE LISTENER
   Emits the full profile-backed User (role from profiles table)
   on SIGNED_IN, and null on SIGNED_OUT.
   HARDENING: a missing/null session on any other event
   (INITIAL_SESSION, TOKEN_REFRESHED, mid-refresh gaps…) is NOT
   a sign-out — emitting null for those briefly unmounted the
   whole app mid-use (dead clicks, scroll resets). Only the
   explicit SIGNED_OUT event does.
========================================================= */

export function subscribeToSupabaseAuthChanges(
  onUserChange: (user: UserType | null, event: string) => void
): () => void {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    if (event === 'SIGNED_OUT') {
      onUserChange(null, 'SIGNED_OUT');
      return;
    }

    if (event !== 'SIGNED_IN' || !session?.user) {
      // INITIAL_SESSION (handled by the app's own session restore),
      // TOKEN_REFRESHED, USER_UPDATED, transient null sessions, etc.:
      // keep current UI state as-is.
      return;
    }

    void mapSupabaseUser(session.user).then((user) => {
      onUserChange(user, 'SIGNED_IN');
    });
  });

  return () => {
    data.subscription.unsubscribe();
  };
}
