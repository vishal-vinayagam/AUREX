/**
 * Register Page - AUREX Civic Issue Reporting System
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { useNotification } from '../../context/NotificationContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Eye, EyeOff, User, Mail, Phone, Lock } from 'lucide-react';

export default function RegisterPage() {
  const { register } = useAuth();
  const { t } = useLanguage();
  const { error: showError, success: showSuccess } = useNotification();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    agreeTerms: false
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.name || !formData.email || !formData.phone || !formData.password) {
      showError('Please fill in all fields');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }

    if (!/^[0-9]{10}$/.test(formData.phone)) {
      showError('Please enter a valid 10-digit phone number');
      return;
    }

    if (!formData.agreeTerms) {
      showError('Please agree to the terms and conditions');
      return;
    }

    setIsLoading(true);

    try {
      await register({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      });
      showSuccess('Account created successfully!');
      navigate('/');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } } | undefined;
      showError(error?.response?.data?.message ?? 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold">{t('auth.signUp')}</h2>
        <p className="text-muted-foreground mt-1">
          Create an account to start reporting issues.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name">{t('auth.name')}</Label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="pl-10"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email">{t('auth.email')}</Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="pl-10"
              required
            />
          </div>
        </div>

        {/* Phone */}
        <div className="space-y-2">
          <Label htmlFor="phone">{t('auth.phone')}</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder="9876543210"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="pl-10"
              maxLength={10}
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password">{t('auth.password')}</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="pl-10 pr-10"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="pl-10"
              required
            />
          </div>
        </div>

        {/* Terms */}
        <div className="flex items-start gap-2">
          <Checkbox
            id="terms"
            checked={formData.agreeTerms}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, agreeTerms: checked as boolean })
            }
          />
          <Label htmlFor="terms" className="text-sm font-normal leading-tight cursor-pointer">
            I agree to the{' '}
            <Link to="/terms-and-conditions" className="text-primary hover:underline">Terms and Conditions</Link>
          </Label>
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
              Creating account...
            </span>
          ) : (
            t('auth.signUp')
          )}
        </Button>
      </form>

      {/* Sign in link */}
      <p className="text-center text-sm text-muted-foreground">
        {t('auth.hasAccount')}{' '}
        <Link to="/login" className="text-primary hover:underline font-medium">
          {t('auth.signIn')}
        </Link>
      </p>
    </div>
  );
}