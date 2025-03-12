// File: middlewares/development-mode.js
/**
 * This middleware skips external API calls in development mode
 * 
 * This is useful for local development without a working API endpoint
 */

import { NextResponse } from 'next/server';

// Constants for development mode
export const DEVELOPMENT_MODE = {
    // Is the app running in development mode?
    IS_DEV: process.env.NODE_ENV === 'development',

    // Should we skip SSO API calls?
    SKIP_SSO_API: process.env.SKIP_SSO_API_CALL === 'true',

    // Default API endpoint and key for development
    DEFAULT_API_ENDPOINT: 'https://api.example.com/tenant/auth/v1/partners/sso',
    DEFAULT_API_KEY: 'test_api_key_placeholder',

    // Test SSO parameters for development
    TEST_SSO_PARAMS: {
        email: 'user@example.com',
        partner_app_id: 'partner-app-1',
        external_id: 'user-ext-123',
        first_name: 'John',
        last_name: 'Doe',
        metadata: { department: 'IT', position: 'Developer' }
    }
};

/**
 * Middleware for development mode requests
 * Usage: Just import this file to access constants
 */
export default function developmentMiddleware(req) {
    // Example of request handling in development mode
    const { IS_DEV, SKIP_SSO_API } = DEVELOPMENT_MODE;

    if (IS_DEV && SKIP_SSO_API && req.nextUrl.pathname.startsWith('/api/auth')) {
        console.log('Development mode: Middleware intercepted auth request');
    }

    return NextResponse.next();
}