'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { supabase } from '../services/supabase';
import AnimatedCat from '../components/AnimatedCat';

export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (isSignUp) {
        // Sign up
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        });

        if (signUpError) throw signUpError;
        
        if (signUpData?.user) {
          setError('Please check your email to confirm your account.');
        }
      } else {
        // Sign in
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;
        
        // Redirect after successful sign in
        const redirectTo = searchParams.get('next') || '/';
        router.push(redirectTo);
        router.refresh();
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative cats */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-20 left-20 transform -rotate-12">
          <AnimatedCat />
        </div>
        <div className="absolute bottom-20 right-20 transform rotate-12 scale-75">
          <AnimatedCat />
        </div>
      </div>

      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-lg relative z-10">
        <div>
          <div className="w-32 h-32 mx-auto relative">
            <AnimatedCat />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Welcome to Meowmery
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            {isSignUp 
              ? "Create an account to share precious memories of your beloved cats"
              : "Sign in to continue sharing and honoring your cat's memories"}
          </p>
        </div>

        <div className="flex justify-center space-x-4 text-sm">
          <button
            onClick={() => setIsSignUp(false)}
            className={`px-4 py-2 rounded-full transition-colors ${
              !isSignUp 
                ? 'bg-[#745260] text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setIsSignUp(true)}
            className={`px-4 py-2 rounded-full transition-colors ${
              isSignUp 
                ? 'bg-[#745260] text-white' 
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Sign Up
          </button>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleAuth}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-t-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#745260] focus:border-[#745260] focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={isSignUp ? 'new-password' : 'current-password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-b-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-[#745260] focus:border-[#745260] focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-center text-red-600 bg-red-50 p-2 rounded">
              {error}
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-[#745260] hover:bg-[#634250] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#745260] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                <svg className="h-5 w-5 text-[#fdf9de] group-hover:text-[#abe7db]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </span>
              {loading ? 'Processing...' : (isSignUp ? 'Create Account' : 'Sign In')}
            </button>
          </div>
        </form>

        <div className="text-center text-sm text-gray-500">
          {isSignUp ? (
            <p>
              Already have an account?{' '}
              <button
                onClick={() => setIsSignUp(false)}
                className="font-medium text-[#745260] hover:text-[#634250]"
              >
                Sign in instead
              </button>
            </p>
          ) : (
            <p>
              New to Meowmery?{' '}
              <button
                onClick={() => setIsSignUp(true)}
                className="font-medium text-[#745260] hover:text-[#634250]"
              >
                Create an account
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 