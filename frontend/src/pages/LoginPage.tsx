import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/appServices';
import { Sprout, LogIn, Phone, KeyRound, AlertCircle, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  // OTP state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOtpMessage('');
    setLoading(true);

    try {
      const res = await authService.sendOtp(phoneNumber);
      setOtpSent(true);
      setOtpMessage(`Verification code sent to ${phoneNumber}. Demo OTP code: ${res.demo_otp || '123456'}`);
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await authService.verifyOtp(phoneNumber, otpCode);
      localStorage.setItem('agriquest_token', res.access_token);
      window.location.href = '/dashboard';
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Invalid OTP verification code.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[75vh] flex items-center justify-center py-12 px-4">
      <div className="bg-white w-full max-w-md p-6 sm:p-8 rounded-lg border border-slate-200 space-y-6 shadow-xs">
        <div className="text-center space-y-2">
          <div className="p-2.5 rounded-lg bg-green-700 text-white w-fit mx-auto shadow-xs">
            <Sprout className="w-7 h-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Farmer Sign In</h2>
          <p className="text-xs text-slate-600">Access your sustainable farming decision support platform</p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-100 p-1 rounded-md">
          <button
            onClick={() => setAuthMethod('password')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded transition-colors ${
              authMethod === 'password' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Email & Password
          </button>
          <button
            onClick={() => setAuthMethod('otp')}
            className={`flex-1 py-1.5 text-xs font-semibold rounded transition-colors ${
              authMethod === 'otp' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
            }`}
          >
            Phone OTP Sign In
          </button>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-900 text-xs font-medium flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {otpMessage && (
          <div className="p-3 rounded-md bg-green-50 border border-green-200 text-green-900 text-xs font-medium flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-green-700 shrink-0" />
            <span>{otpMessage}</span>
          </div>
        )}

        {authMethod === 'password' ? (
          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="farmer@eco.farm"
                className="w-full px-3 py-2 rounded-md bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-green-700 font-medium"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-md bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-green-700 font-medium"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-md text-xs font-semibold text-white bg-green-700 hover:bg-green-800 shadow-xs flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              <span>{loading ? 'Authenticating...' : 'Sign In'}</span>
            </button>
          </form>
        ) : (
          <div className="space-y-4 text-xs">
            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Mobile Phone Number</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="tel"
                      required
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="+91 9876543210"
                      className="w-full pl-9 pr-3 py-2 rounded-md bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-green-700 font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-md text-xs font-semibold text-white bg-green-700 hover:bg-green-800 shadow-xs flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
                >
                  <Phone className="w-4 h-4" />
                  <span>{loading ? 'Sending Code...' : 'Send Verification OTP Code'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">6-Digit OTP Code</label>
                  <div className="relative">
                    <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="123456"
                      className="w-full pl-9 pr-3 py-2 rounded-md bg-white border border-slate-300 text-slate-900 tracking-widest text-center text-sm font-bold focus:outline-none focus:border-green-700"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 rounded-md text-xs font-semibold text-white bg-green-700 hover:bg-green-800 shadow-xs flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{loading ? 'Verifying...' : 'Verify OTP & Log In'}</span>
                </button>
              </form>
            )}
          </div>
        )}

        <div className="pt-2 text-center space-y-2 border-t border-slate-100">
          <p className="text-xs text-slate-600 font-medium">
            Don't have a farmer account yet?{' '}
            <Link to="/register" className="font-bold text-green-800 hover:underline">
              Register Here
            </Link>
          </p>
          <div className="p-2.5 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-medium space-y-0.5">
            <p><strong>Demo Farmer:</strong> farmer@eco.farm / Farmer@123456</p>
            <p><strong>Demo Admin:</strong> admin@eco.farm / Admin@123456</p>
          </div>
        </div>
      </div>
    </div>
  );
};
