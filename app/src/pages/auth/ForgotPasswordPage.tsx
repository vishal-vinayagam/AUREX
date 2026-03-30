/**
 * Forgot Password Page - AUREX Civic Issue Reporting System
 */

import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import { authService } from '../../services/authService';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react';

export default function ForgotPasswordPage() {
  const { t } = useLanguage();
  const { error: showError, success: showSuccess } = useNotification();

  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      showError('Please enter your email address');
      return;
    }

    setIsLoading(true);

    try {
      await authService.forgotPassword(email);
      setIsSubmitted(true);
      showSuccess('Password reset link sent to your email');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } } | undefined;
      showError(error?.response?.data?.message ?? 'Failed to send reset link');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="space-y-6 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <div>
          <h2 className="text-2xl font-bold">Check your email</h2>
          <p className="text-muted-foreground mt-2">
            We've sent a password reset link to <strong>{email}</strong>
          </p>
        </div>
        <p className="text-sm text-muted-foreground">
          Didn't receive the email? Check your spam folder or{' '}
          <button
            onClick={() => setIsSubmitted(false)}
            className="text-primary hover:underline"
          >
            try again
          </button>
        </p>
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-primary hover:underline"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Forgot Password?</h2>
        <p className="text-muted-foreground mt-1">
          No worries, we'll send you reset instructions.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">{t('auth.email')}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pl-10"
              required
            />
          </div>
        </div>

        {/* Submit */}
        <Button
          type="submit"
          className="w-full"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending...
            </span>
          ) : (
            'Reset Password'
          )}
        </Button>
      </form>

      {/* Back to login */}
      <Link
        to="/login"
        className="inline-flex items-center justify-center gap-2 text-primary hover:underline w-full"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to login
      </Link>
    </div>
  );
}