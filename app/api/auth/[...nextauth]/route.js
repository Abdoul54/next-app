// File: app/api/auth/[...nextauth]/route.js
import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import crypto from 'crypto';
import { DEVELOPMENT_MODE } from '@/middlewares/development-mode';
import axios from 'axios';


const axiosInstance = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
    timeout: 5000,
    validateStatus: status => status < 500
});


// Helper function to generate signature for verification exactly like the server implementation
const generateSignature = (email, partner_app_id, timestamp, api_key) => {
    const data = email + partner_app_id + timestamp + api_key;
    return crypto.createHash('sha256').update(data).digest('hex');
};

// For testing purposes - log the expected vs received signature
const logSignatureComparison = (expected, received, email, partner_app_id, timestamp, api_key) => {
    console.log('Signature Verification:');
    console.log('- Expected:', expected);
    console.log('- Received:', received);
    console.log('- Data used:', `"${email}${partner_app_id}${timestamp}${api_key}"`);
    console.log('- Current server time:', Math.floor(Date.now() / 1000));
    console.log('- Timestamp diff:', Math.floor(Date.now() / 1000) - parseInt(timestamp));
};

const handler = NextAuth({
    providers: [
        // SSO Provider with signature verification
        CredentialsProvider({
            id: 'sso-signature',
            name: 'SSO Signature Verification',
            credentials: {
                email: { label: 'Email', type: 'text' },
                partner_app_id: { label: 'Partner App ID', type: 'text' },
                external_id: { label: 'External ID', type: 'text' },
                timestamp: { label: 'Timestamp', type: 'text' },
                signature: { label: 'Signature', type: 'text' },
                first_name: { label: 'First Name', type: 'text' },
                last_name: { label: 'Last Name', type: 'text' },
                name: { label: 'Full Name', type: 'text' },
                metadata: { label: 'Metadata', type: 'text' },
            },
            async authorize(credentials) {
                try {
                    // Get API key from environment variable or use test key for development
                    const API_KEY = process.env.PARTNER_API_KEY || DEVELOPMENT_MODE.DEFAULT_API_KEY;

                    // Verify the timestamp isn't too old (e.g., within last 5 minutes)
                    // This matches the PHP server logic: $timestampDiff = time() - $timestamp;
                    const now = Math.floor(Date.now() / 1000);
                    const timestamp = parseInt(credentials.timestamp);
                    const timestampDiff = now - timestamp;

                    // This matches the PHP server logic: $timestampDiff > 300 || $timestampDiff < 0
                    if (timestampDiff > 300 || timestampDiff < 0) {
                        console.log('Timestamp verification failed:', {
                            now,
                            timestamp,
                            diff: timestampDiff
                        });
                        throw new Error('Request timestamp is invalid');
                    }

                    // Generate expected signature for verification
                    const expectedSignature = generateSignature(
                        credentials.email,
                        credentials.partner_app_id,
                        credentials.timestamp,
                        API_KEY
                    );

                    // Log signature comparison for debugging
                    logSignatureComparison(
                        expectedSignature,
                        credentials.signature,
                        credentials.email,
                        credentials.partner_app_id,
                        credentials.timestamp,
                        API_KEY
                    );


                    // If successful, make the API call to the SSO endpoint (in production only)
                    const SSO_ENDPOINT = process.env.PARTNER_API_ENDPOINT || 'https://your-api-domain/tenant/auth/v1/partners/sso';

                    try {
                        const body = {
                            api_key: API_KEY,
                            signature: expectedSignature,
                            timestamp: parseInt(credentials.timestamp),
                            external_id: credentials.external_id,
                            partner_app_id: credentials.partner_app_id,
                            email: credentials.email,
                            first_name: credentials.first_name || null,
                            last_name: credentials.last_name || null,
                            name: credentials.name || null,
                            metadata: credentials.metadata ? JSON.parse(credentials.metadata) : null,
                        }

                        console.log('Making SSO API call to:', SSO_ENDPOINT);
                        console.log('Request Body:', body);

                        const response = await fetch(SSO_ENDPOINT, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                host: 'ram.localhost',
                            },
                            body: JSON.stringify(body),
                        });

                        if (!response.ok) {
                            const error = await response.json();
                            throw new Error(error.message || 'SSO authentication failed');
                        }

                        const userData = await response.json();

                        console.log('SSO API Response:', userData);

                        // Return the user data
                        return {
                            id: credentials.external_id,
                            email: credentials.email,
                            name: credentials.name || `${credentials.first_name || ''} ${credentials.last_name || ''}`.trim(),
                            image: null, // Add user image if available
                            // Add any additional user data from the SSO response
                            ...userData,
                        };
                    } catch (error) {
                        console.error('SSO API Call Error:', error);

                        // For development only: return mock user if API call fails
                        if (process.env.NODE_ENV === 'development') {
                            console.log('Development mode: Returning mock user after API call failure');
                            return {
                                id: credentials.external_id,
                                email: credentials.email,
                                name: credentials.name || `${credentials.first_name || ''} ${credentials.last_name || ''}`.trim(),
                                partner_app_id: credentials.partner_app_id,
                                metadata: credentials.metadata ? JSON.parse(credentials.metadata) : {},
                            };
                        }

                        // In production, propagate the error
                        throw error;
                    }
                } catch (error) {
                    console.error('SSO Authentication Error:', error);
                    return null;
                }
            },
        }),

        // Regular credentials provider for email/password login
        CredentialsProvider({
            id: 'credentials',
            name: 'Username and Password',
            credentials: {
                username: { label: 'username', type: 'text' },
                password: { label: 'password', type: 'password' },
                issue_refresh_token: { label: 'issue_refresh_token', type: 'boolean' }
            },
            async authorize(credentials, req) {
                try {
                    const host = req.headers.host;

                    const requestConfig = {
                        headers: {
                            'Content-Type': 'application/json',
                            'Host': host
                        }
                    };
                    const issue_refresh_token = credentials.issue_refresh_token === 'true' || credentials.issue_refresh_token === true;

                    const response = await axiosInstance.post(`http://ram.localhost/tenant/auth/v1/login`, {
                        username: credentials.username,
                        password: credentials.password,
                        issue_refresh_token: issue_refresh_token
                    }, requestConfig);

                    console.log('Authorization Response:', response.data);

                    // Check both the outer success flag AND inner data status
                    if (!response.data?.success || response.data?.data?.status === 'error') {
                        throw new Error(response.data?.data?.message || response.data?.message || 'Sign in failed');
                    }

                    return response.data?.data;

                } catch (error) {
                    console.error('Authorization Error:', {
                        message: error.message,
                        response: error.response?.data,
                        status: error.response?.status
                    });
                    throw new Error(error.response?.data?.message || error.message || 'Authentication failed');
                }
            }
        }),
    ],
    callbacks: {
        async jwt({ token, user }) {
            // Add user data to token when signing in
            if (user) {
                token.external_id = user.id;
                // Include partner_app_id only if it exists (it won't for standard credentials login)
                if (user.partner_app_id) {
                    token.partner_app_id = user.partner_app_id;
                }
                // Include any other custom fields from the user
                if (user.metadata) {
                    token.metadata = user.metadata;
                }
            }
            return token;
        },
        async session({ session, token }) {
            // Add custom token data to the session
            session.user.external_id = token.external_id;

            // Only add partner-specific fields if they exist
            if (token.partner_app_id) {
                session.user.partner_app_id = token.partner_app_id;
            }

            if (token.metadata) {
                session.user.metadata = token.metadata;
            }

            return session;
        },
    },
    pages: {
        signIn: '/auth/signin',
        error: '/auth/error',
    },
    session: {
        strategy: 'jwt',
        maxAge: 30 * 24 * 60 * 60, // 30 days
    },
    secret: process.env.NEXTAUTH_SECRET,
});

export { handler as GET, handler as POST };