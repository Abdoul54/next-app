// File: app/auth/signin/page.jsx
'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import SSOLogin from '@/components/SSOLogin';

export default function SignIn() {
    const searchParams = useSearchParams();
    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
    const error = searchParams.get('error');

    const [isPartnerLogin, setIsPartnerLogin] = useState(true);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [credentialsError, setCredentialsError] = useState('');

    const handleEmailLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setCredentialsError('');

        try {
            const result = await signIn('credentials', {
                redirect: false,
                username,
                password,
                callbackUrl
            });

            if (result?.error) {
                console.log('Sign-in error:', result.error);
                setCredentialsError(result.error === 'CredentialsSignin'
                    ? 'Invalid Credentials. Please try again.'
                    : result.error);
            } else if (result?.url) {
                window.location.href = result.url;
            }
        } catch (error) {
            setCredentialsError('An unexpected error occurred');
            console.error('Sign-in error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900">Sign In</h1>
                    <p className="mt-2 text-sm text-gray-600">
                        {isPartnerLogin
                            ? "Sign in with your partner account"
                            : "Enter your credentials to access your account"}
                    </p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">
                                    {error === 'CredentialsSignin'
                                        ? 'Invalid login credentials. Please try again.'
                                        : `Error: ${error}`}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                <div className="flex justify-center space-x-4 mb-6">
                    <button
                        onClick={() => setIsPartnerLogin(true)}
                        className={`px-4 py-2 text-sm font-medium rounded-md ${isPartnerLogin
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Partner SSO
                    </button>
                    <button
                        onClick={() => setIsPartnerLogin(false)}
                        className={`px-4 py-2 text-sm font-medium rounded-md ${!isPartnerLogin
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                            }`}
                    >
                        Email Login
                    </button>
                </div>

                {isPartnerLogin ? (
                    <SSOLogin callbackUrl={callbackUrl} />
                ) : (
                    <form onSubmit={handleEmailLogin} className="mt-8 space-y-6">
                        {credentialsError && (
                            <div className="bg-red-50 border-l-4 border-red-400 p-4">
                                <p className="text-sm text-red-700">{credentialsError}</p>
                            </div>
                        )}

                        <div className="rounded-md shadow-sm -space-y-px">
                            <div>
                                <label htmlFor="username" className="sr-only">Username</label>
                                <input
                                    id="username"
                                    name="username"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                    placeholder="Username"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="password" className="sr-only">Password</label>
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                                    placeholder="Password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <input
                                    id="remember-me"
                                    name="remember-me"
                                    type="checkbox"
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                />
                                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                                    Remember me
                                </label>
                            </div>

                            <div className="text-sm">
                                <Link
                                    href="/auth/forgot-password"
                                    className="font-medium text-blue-600 hover:text-blue-500"
                                >
                                    Forgot your password?
                                </Link>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {loading ? (
                                    <>
                                        <span className="absolute left-0 inset-y-0 flex items-center pl-3">
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                        </span>
                                        Signing in...
                                    </>
                                ) : (
                                    'Sign in'
                                )}
                            </button>
                        </div>
                    </form>
                )}

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-gray-500">
                                Or
                            </span>
                        </div>
                    </div>

                    <div className="mt-6">
                        <div className="relative">
                            <Link
                                href="/auth/signup"
                                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Create new account
                            </Link>
                        </div>
                    </div>
                </div>

                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-6 p-3 bg-gray-50 rounded text-xs">
                        <details>
                            <summary className="font-medium cursor-pointer">Development Test Credentials</summary>
                            <div className="mt-2">
                                <p><strong>Email:</strong> test@example.com</p>
                                <p><strong>Password:</strong> password</p>
                            </div>
                        </details>
                    </div>
                )}

                <div className="mt-6 text-center text-xs text-gray-500">
                    <p>By signing in, you agree to our <Link href="/terms" className="text-blue-600 hover:underline">Terms of Service</Link> and <Link href="/privacy" className="text-blue-600 hover:underline">Privacy Policy</Link>.</p>
                    <p className="mt-2">If you're having trouble signing in, please <Link href="/contact" className="text-blue-600 hover:underline">contact support</Link>.</p>
                </div>
            </div>
        </div>
    );
}