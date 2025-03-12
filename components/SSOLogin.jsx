// File: components/SSOLogin.jsx
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function SSOLogin({ callbackUrl = '/dashboard' }) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [debug, setDebug] = useState(false);

    // This function would be called with the SSO parameters from your partner's redirect
    const handleSSOLogin = async (ssoParams) => {
        // In a real implementation, you would get these parameters from the URL or a token
        // Example ssoParams structure:
        // {
        //   email: 'user@example.com',
        //   partner_app_id: 'partner-app-1',
        //   external_id: 'user-ext-123',
        //   timestamp: '1741691099',
        //   signature: 'a1b2c3d4e5f6g7h8i9j0',
        //   first_name: 'John',
        //   last_name: 'Doe',
        //   metadata: '{"department":"IT","position":"Developer"}'
        // }

        try {
            setLoading(true);
            setError('');

            const result = await signIn('sso-signature', {
                redirect: false,
                ...ssoParams,
                callbackUrl
            });

            if (result?.error) {
                setError(result.error);
            } else if (result?.ok) {
                // Redirect to dashboard or intended destination
                router.push(callbackUrl || '/dashboard');
            }
        } catch (err) {
            setError('An unexpected error occurred');
            console.error('SSO login error:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Error message */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                        <div className="ml-3">
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Loading indicator */}
            {loading && (
                <div className="flex justify-center items-center py-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    <span className="ml-2 text-gray-700">Authenticating...</span>
                </div>
            )}

            {/* SSO Login button */}
            <button
                onClick={() => {
                    // In a real implementation, you would extract the SSO parameters
                    // from the URL query parameters or the hash fragment
                    const mockSSOParams = {
                        email: 'user@example.com',
                        partner_app_id: 'partner-app-1',
                        external_id: 'user-ext-123',
                        timestamp: Math.floor(Date.now() / 1000).toString(),
                        signature: 'a1b2c3d4e5f6g7h8i9j0', // This is our test signature
                        first_name: 'John',
                        last_name: 'Doe',
                        metadata: JSON.stringify({ department: 'IT', position: 'Developer' })
                    };

                    handleSSOLogin(mockSSOParams);
                }}
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
                {loading ? 'Authenticating...' : 'Continue with Partner SSO'}
            </button>

            {/* Generate SSO Link button - for development */}
            {process.env.NODE_ENV === 'development' && (
                <div className="mt-2">
                    <a
                        href="/api/dev/generate-sso-link"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800 flex justify-center"
                    >
                        Generate Test SSO Link
                    </a>
                </div>
            )}

            {/* Debug toggle for development */}
            {process.env.NODE_ENV === 'development' && (
                <div className="mt-4">
                    <button
                        onClick={() => setDebug(!debug)}
                        className="text-xs text-gray-500 hover:text-gray-700"
                    >
                        {debug ? 'Hide Debug Info' : 'Show Debug Info'}
                    </button>

                    {debug && (
                        <div className="mt-2 p-3 bg-gray-50 rounded text-xs font-mono overflow-auto">
                            <p>Test with the following information:</p>
                            <ul className="space-y-1 list-disc pl-5 mt-2">
                                <li>API Key: Set in your .env.local file</li>
                                <li>Email: user@example.com</li>
                                <li>Partner App ID: partner-app-1</li>
                                <li>External ID: user-ext-123</li>
                                <li>Test Signature: a1b2c3d4e5f6g7h8i9j0</li>
                            </ul>
                            <p className="mt-2">To generate a real signature, use the signatureDebug.js utility.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}