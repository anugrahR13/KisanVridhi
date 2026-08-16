import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sprout, UserPlus, AlertCircle } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await register({
        email,
        password,
        full_name: fullName,
        location
      });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Registration failed. Email may already be registered.');
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
          <h2 className="text-xl font-bold text-slate-900">Create Farmer Account</h2>
          <p className="text-xs text-slate-600">Register your farm profile to access AI decision support</p>
        </div>

        {error && (
          <div className="p-3 rounded-md bg-red-50 border border-red-200 text-red-900 text-xs font-medium flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Ramesh Kumar"
              className="w-full px-3 py-2 rounded-md bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-green-700 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ramesh@eco.farm"
              className="w-full px-3 py-2 rounded-md bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-green-700 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 rounded-md bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-green-700 font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Farm Location / District</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Ludhiana, Punjab"
              className="w-full px-3 py-2 rounded-md bg-white border border-slate-300 text-slate-900 focus:outline-none focus:border-green-700 font-medium"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-md text-xs font-semibold text-white bg-green-700 hover:bg-green-800 shadow-xs flex items-center justify-center space-x-2 transition-colors disabled:opacity-50"
          >
            <UserPlus className="w-4 h-4" />
            <span>{loading ? 'Creating Account...' : 'Register Account'}</span>
          </button>
        </form>

        <div className="pt-2 text-center border-t border-slate-100">
          <p className="text-xs text-slate-600 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-green-800 hover:underline">
              Sign In Here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
