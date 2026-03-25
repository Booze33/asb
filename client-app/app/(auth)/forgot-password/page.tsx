'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { apiService } from '@/lib/api';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage(null);

    try {
      const response = await apiService.forgotPassword({ email });
      
      if (response.success) {
        setMessage({
          type: 'success',
          text: 'Password reset instructions have been sent to your email address.'
        });
        // Clear the form
        setEmail('');
      } else {
        setMessage({
          type: 'error',
          text: response.message || 'An error occurred. Please try again.'
        });
      }
    } catch (err) {
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'An error occurred. Please try again.'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="w-full max-w-md border border-slate-700 bg-slate-800/50 backdrop-blur-sm rounded-lg p-6">
        <div className="space-y-1 text-center mb-6">
          <h1 className="text-2xl font-bold text-white">
            Forgot Password
          </h1>
          <p className="text-slate-400">
            Enter your email address and we&apos;ll send you instructions to reset your password.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {message && (
            <div className={`px-4 py-3 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                : 'bg-red-500/10 border border-red-500/20 text-red-400'
            }`}>
              {message.text}
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-slate-300">
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              required
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !email}
            className="w-full px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Sending reset instructions...
              </span>
            ) : (
              'Send Reset Instructions'
            )}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button
            onClick={() => router.push('/login')}
            className="text-sm text-slate-400 hover:text-slate-200 transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}
