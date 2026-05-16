'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { AlertMessage } from '@/components/ui/Spinner';

export default function SignupPage() {
  const [step, setStep] = useState('form'); // 'form' | 'otp'
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'MEMBER' });
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const otpRefs = useRef([]);
  const { login } = useAuth();
  const router = useRouter();

  // Countdown timer for resend
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setTimeout(() => setResendTimer(r => r - 1), 1000);
    return () => clearTimeout(t);
  }, [resendTimer]);

  // Auto-focus first OTP box when entering OTP step
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  }, [step]);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.name || !form.email || !form.password) {
      setError('All fields are required.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      setError('Please enter a valid email address.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Signup failed.');
      } else {
        setPendingEmail(data.email || form.email.toLowerCase());
        setStep('otp');
        setResendTimer(60);
        setSuccess('A 6-digit OTP has been sent to ' + (data.email || form.email));
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (index, value) => {
    if (!/^\d*$/.test(value)) return; // only digits
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1); // one char per box
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
    if (e.key === 'ArrowLeft' && index > 0) otpRefs.current[index - 1]?.focus();
    if (e.key === 'ArrowRight' && index < 5) otpRefs.current[index + 1]?.focus();
  };

  const handleOtpPaste = (e) => {
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted.length === 6) {
      setOtp(pasted.split(''));
      otpRefs.current[5]?.focus();
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const code = otp.join('');
    if (code.length !== 6) {
      setError('Please enter the 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: pendingEmail, otp: code }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Verification failed.');
        setOtp(['', '', '', '', '', '']);
        otpRefs.current[0]?.focus();
      } else {
        login(data.user);
        router.push('/dashboard');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to resend OTP.');
      } else {
        setSuccess('A new OTP has been sent to your email.');
        setOtp(['', '', '', '', '', '']);
        setResendTimer(60);
        otpRefs.current[0]?.focus();
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/40">
            CB
          </div>
          <span className="text-2xl font-bold text-white">CrewBoard</span>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          {step === 'form' ? (
            <>
              <h1 className="text-xl font-bold text-white mb-1">Create your account</h1>
              <p className="text-sm text-gray-500 mb-6">Join CrewBoard and start collaborating</p>

              <AlertMessage type="error" message={error} />

              <form onSubmit={handleFormSubmit} className="space-y-4 mt-4">
                <Input
                  id="name"
                  label="Full name"
                  type="text"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  autoComplete="name"
                  required
                />
                <Input
                  id="email"
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                  autoComplete="email"
                  required
                />
                <Input
                  id="password"
                  label="Password"
                  type="password"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
                  autoComplete="new-password"
                  required
                />
                <Select
                  id="role"
                  label="Role"
                  value={form.role}
                  onChange={e => setForm(p => ({ ...p, role: e.target.value }))}
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                </Select>

                <Button type="submit" className="w-full" size="lg" loading={loading}>
                  Create account
                </Button>
              </form>

              <p className="text-sm text-gray-500 text-center mt-6">
                Already have an account?{' '}
                <Link href="/login" className="text-indigo-400 hover:text-indigo-300 font-medium">
                  Sign in
                </Link>
              </p>
            </>
          ) : (
            /* ── OTP STEP ─────────────────────────────────────── */
            <>
              <div className="text-center mb-6">
                <div className="w-14 h-14 bg-indigo-600/20 border border-indigo-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="text-xl font-bold text-white mb-1">Check your email</h1>
                <p className="text-sm text-gray-500">
                  We sent a 6-digit code to<br />
                  <span className="text-indigo-400 font-medium">{pendingEmail}</span>
                </p>
              </div>

              <AlertMessage type="error" message={error} />
              {success && !error && (
                <div className="mb-4 px-4 py-3 bg-green-500/10 border border-green-500/20 rounded-lg text-sm text-green-400">
                  {success}
                </div>
              )}

              <form onSubmit={handleOtpSubmit}>
                {/* 6-box OTP input */}
                <div className="flex gap-3 justify-center mb-6" onPaste={handleOtpPaste}>
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      ref={el => (otpRefs.current[i] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={e => handleOtpChange(i, e.target.value)}
                      onKeyDown={e => handleOtpKeyDown(i, e)}
                      className="w-12 h-14 text-center text-2xl font-bold bg-gray-800 border border-gray-700 rounded-xl text-white focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all"
                      style={{ caretColor: 'transparent' }}
                    />
                  ))}
                </div>

                <Button type="submit" className="w-full" size="lg" loading={loading}>
                  Verify email
                </Button>
              </form>

              <p className="text-sm text-gray-500 text-center mt-5">
                Didn&apos;t receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendTimer > 0 || loading}
                  className="text-indigo-400 hover:text-indigo-300 font-medium disabled:text-gray-600 disabled:cursor-not-allowed"
                >
                  {resendTimer > 0 ? `Resend in ${resendTimer}s` : 'Resend OTP'}
                </button>
              </p>

              <p className="text-sm text-gray-600 text-center mt-3">
                <button
                  type="button"
                  onClick={() => { setStep('form'); setError(''); setSuccess(''); setOtp(['', '', '', '', '', '']); }}
                  className="hover:text-gray-400 transition-colors"
                >
                  ← Back to signup
                </button>
              </p>
            </>
          )}
        </div>

        <p className="text-center mt-5">
          <Link href="/" className="text-sm text-gray-600 hover:text-gray-400">← Back to home</Link>
        </p>
      </div>
    </div>
  );
}
