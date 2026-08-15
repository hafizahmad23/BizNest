import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type ResetPasswordProps = {
  onBack?: () => void;
};

export default function ResetPassword({
  onBack,
}: ResetPasswordProps) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);

  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    let mounted = true;

    const checkRecoverySession = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!mounted) return;

        setHasSession(!!session);
        setCheckingSession(false);
      } catch (err) {
        console.error('Recovery session error:', err);

        if (!mounted) return;

        setHasSession(false);
        setCheckingSession(false);
      }
    };

    checkRecoverySession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;

      if (
        event === 'PASSWORD_RECOVERY' ||
        event === 'SIGNED_IN'
      ) {
        setHasSession(!!session);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const handleResetPassword = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    setError('');
    setMessage('');

    if (!password || !confirmPassword) {
      setError('Please enter your new password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        setError(
          'This password reset link is invalid or has expired. Please request a new reset email.'
        );
        setLoading(false);
        return;
      }

      const { error: updateError } =
        await supabase.auth.updateUser({
          password,
        });

      if (updateError) {
        setError(updateError.message);
        setLoading(false);
        return;
      }

      setPassword('');
      setConfirmPassword('');
      setMessage(
        'Password updated successfully. You can now log in with your new password.'
      );

      await supabase.auth.signOut();

      setHasSession(false);
    } catch (err) {
      console.error('Password reset error:', err);

      setError(
        'Something went wrong while updating your password. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white p-8 shadow-xl text-center">
          <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />

          <h2 className="text-xl font-semibold text-gray-900">
            Verifying reset link
          </h2>

          <p className="mt-2 text-sm text-gray-500">
            Please wait while we verify your password reset session.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-200 bg-white p-7 shadow-xl">
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-2xl text-white shadow-lg">
              🔐
            </div>

            <h1 className="text-2xl font-bold text-gray-900">
              Reset Password
            </h1>

            <p className="mt-2 text-sm text-gray-500">
              Create a new password for your BizNest account.
            </p>
          </div>

          {!hasSession && !message && (
            <div className="rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm leading-6 text-red-700">
                This password reset link is invalid or has expired.
                Please request a new password reset email.
              </p>
            </div>
          )}

          {message && (
            <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-4">
              <p className="text-sm leading-6 text-green-700">
                {message}
              </p>
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-4">
              <p className="text-sm leading-6 text-red-700">
                {error}
              </p>
            </div>
          )}

          {hasSession && !message && (
            <form
              onSubmit={handleResetPassword}
              className="space-y-5"
            >
              <div>
                <label
                  htmlFor="new-password"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  New Password
                </label>

                <input
                  id="new-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                />
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Confirm New Password
                </label>

                <input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) =>
                    setConfirmPassword(e.target.value)
                  }
                  placeholder="Confirm new password"
                  autoComplete="new-password"
                  disabled={loading}
                  className="w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100 disabled:bg-gray-100"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow-md transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? 'Updating Password...'
                  : 'Update Password'}
              </button>
            </form>
          )}

          {(!hasSession || message) && (
            <button
              type="button"
              onClick={onBack}
              className="mt-5 w-full rounded-xl border border-gray-300 bg-white px-4 py-3 font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Back to Login
            </button>
          )}
        </div>

        <p className="mt-5 text-center text-xs text-gray-500">
          BizNest • Secure Account Recovery
        </p>
      </div>
    </div>
  );
}