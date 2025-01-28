'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import SignInForm from '@/components/auth/SignInForm';
import SignUpForm from '@/components/auth/SignUpForm';
import { Toaster } from 'react-hot-toast';

export default function AuthPage() {
  const [isSignIn, setIsSignIn] = useState(true);
  const [loading, setLoading] = useState<string | null>(null);
  const supabase = createClientComponentClient();

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    try {
      setLoading(provider);
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;
    } catch (error) {
      console.error('Social login error:', error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <Toaster position="top-right" />
      
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          {isSignIn ? 'Sign in to your account' : 'Create your account'}
        </h2>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {/* Social Login Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => handleSocialLogin('google')}
              disabled={!!loading}
              className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading === 'google' ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M12.545,12.151L12.545,12.151c0,1.054,0.855,1.909,1.909,1.909h3.536c-0.684,1.887-2.256,3.276-4.218,3.276c-2.454,0-4.445-1.991-4.445-4.445s1.991-4.445,4.445-4.445c1.164,0,2.224,0.447,3.018,1.176l2.835-2.835C18.224,5.021,15.598,4,12.545,4C7.021,4,2.545,8.476,2.545,14s4.476,10,10,10c9.142,0,10.827-8.056,10.827-11.636c0-0.769-0.063-1.344-0.139-1.909H12.545V12.151z"
                    />
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            <button
              onClick={() => handleSocialLogin('apple')}
              disabled={!!loading}
              className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading === 'apple' ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-700" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Signing in...
                </span>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                    <path
                      fill="currentColor"
                      d="M17.543,12.578c-0.008-1.339,0.604-2.35,1.836-3.197c-0.692-1.031-1.732-1.592-3.121-1.687c-1.207-0.096-2.522,0.724-3.021,0.724c-0.532,0-1.751-0.692-2.707-0.692C8.011,7.727,6,9.096,6,12.039c0,0.892,0.165,1.819,0.488,2.775c0.436,1.291,2.012,4.461,3.658,4.416c0.859-0.02,1.466-0.629,2.576-0.629c1.067,0,1.636,0.629,2.576,0.629c1.659,0.045,3.078-2.898,3.487-4.189C16.952,13.847,17.543,13.339,17.543,12.578z M15.379,6.947c0.957-1.196,0.872-2.276,0.84-2.664c-0.849,0.058-1.835,0.599-2.396,1.291c-0.604,0.724-1.067,1.75-0.932,2.775C13.547,8.444,14.487,8.018,15.379,6.947z"
                    />
                  </svg>
                  Continue with Apple
                </>
              )}
            </button>
          </div>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>
          </div>

          {/* Email Form */}
          {isSignIn ? <SignInForm /> : <SignUpForm />}
          
          <div className="mt-6">
            <button
              onClick={() => setIsSignIn(!isSignIn)}
              className="w-full text-center text-sm text-indigo-600 hover:text-indigo-500"
            >
              {isSignIn ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
} 