// File: app/auth/sso/callback/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { signIn } from 'next-auth/react';

export default function SSOCallback() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState('Initializing SSO login...');
    const [error, setError] = useState('');

    useEffect(() => {
        const handleSSOCallback = async () => {
            try {
                setStatus('Processing SSO parameters...');

                // Debug: Log all available parameters
                console.log('Available search params:',
                    Array.from(searchParams.entries()).reduce((acc, [key, value]) => {
                        acc[key] = value;
                        return acc;
                    }, {})
                );

                // Extract SSO parameters from URL
                const email = searchParams.get('email');
                const partner_app_id = searchParams.get('partner_app_id');
                const external_id = searchParams.get('external_id');
                const timestamp = searchParams.get('timestamp');
                const signature = searchParams.get('signature');
                const first_name = searchParams.get('first_name');
                const last_name = searchParams.get('last_name');
                const name = searchParams.get('name');
                const metadata = searchParams.get('metadata');

                // Log extracted parameters for debugging
                console.log('Extracted SSO Parameters:', {
                    email,
                    partner_app_id,
                    external_id,
                    timestamp,
                    signature,
                    first_name,
                    last_name,
                    name,
                    metadata,
                    paramCount: Array.from(searchParams.entries()).length
                });

                // Validate required parameters - provide more specific error messages
                if (!email) {
                    throw new Error('Missing required SSO parameter: email');
                }
                if (!partner_app_id) {
                    throw new Error('Missing required SSO parameter: partner_app_id');
                }
                if (!external_id) {
                    throw new Error('Missing required SSO parameter: external_id');
                }
                if (!timestamp) {
                    throw new Error('Missing required SSO parameter: timestamp');
                }
                if (!signature) {
                    throw new Error('Missing required SSO parameter: signature');
                }

                setStatus('Authenticating...');

                // Sign in with NextAuth using the SSO parameters
                const signInResult = await signIn('sso-signature', {
                    redirect: false,
                    email,
                    partner_app_id,
                    external_id,
                    timestamp,
                    signature,
                    first_name: first_name || null,
                    last_name: last_name || null,
                    name: name || null,
                    metadata: metadata || null,
                });

                console.log('Sign-in result:', signInResult);

                if (signInResult?.error) {
                    setError(signInResult.error);
                    setStatus('Authentication failed');
                } else if (signInResult?.ok) {
                    setStatus('Authentication successful, redirecting...');

                    // Get the callbackUrl if provided, or default to dashboard
                    const callbackUrl = searchParams.get('callbackUrl') || '/dashboard';
                    router.push(callbackUrl);
                }
            } catch (err) {
                console.error('SSO callback error:', err);
                setError(err.message || 'An unexpected error occurred');
                setStatus('Authentication failed');
            }
        };

        handleSSOCallback();
    }, [router, searchParams]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
                <div className="text-center">
                    <h1 className="text-3xl font-extrabold text-gray-900">SSO Authentication</h1>
                    <p className="mt-2 text-sm text-gray-600">{status}</p>
                </div>

                {error && (
                    <div className="mt-6 bg-red-50 border-l-4 border-red-400 p-4">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-red-700">Error: {error}</p>
                                <div className="mt-4">
                                    <button
                                        onClick={() => router.push('/auth/signin')}
                                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                    >
                                        Return to Sign In
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {status === 'Authenticating...' && (
                    <div className="flex justify-center items-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                )}

                {/* Debug information in development mode */}
                {process.env.NODE_ENV === 'development' && error && (
                    <div className="mt-6 p-4 bg-gray-50 rounded-md">
                        <details>
                            <summary className="text-sm font-medium text-gray-700 cursor-pointer">
                                Debug Information
                            </summary>
                            <div className="mt-2">
                                <p className="text-xs font-mono">Check the console for detailed parameter logs</p>
                                <p className="mt-2 text-xs text-gray-700">
                                    Make sure your SSO URL has all required parameters:
                                </p>
                                <ul className="mt-1 text-xs list-disc list-inside text-gray-600">
                                    <li>email</li>
                                    <li>partner_app_id</li>
                                    <li>external_id</li>
                                    <li>timestamp</li>
                                    <li>signature</li>
                                </ul>
                            </div>
                        </details>
                    </div>
                )}
            </div>
        </div>
    );
}