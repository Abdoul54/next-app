// File: utils/signatureDebug.js
import crypto from 'crypto';

/**
 * Generates a valid signature for testing purposes
 * 
 * @param {string} email - User email
 * @param {string} partner_app_id - Partner app ID
 * @param {string|number} timestamp - Timestamp in seconds
 * @param {string} api_key - Your API key
 * @returns {string} - The generated signature
 */
export const generateTestSignature = (email, partner_app_id, timestamp, api_key) => {
    // Ensure timestamp is a string
    const timestampStr = timestamp.toString();

    // Create the data string
    const data = email + partner_app_id + timestampStr + api_key;

    // Generate the signature matching the PHP server implementation
    // This matches the PHP: hash('sha256', $dataToSign)
    return crypto.createHash('sha256').update(data).digest('hex');
};

/**
 * Generates a complete SSO URL with valid signature
 * 
 * @param {Object} params - Parameters for the SSO URL
 * @param {string} baseUrl - Base URL of your application
 * @returns {string} - The complete SSO URL
 */
export const generateSSOTestUrl = (params, baseUrl = 'http://localhost:3001') => {
    const {
        email,
        partner_app_id,
        external_id,
        api_key,
        first_name = '',
        last_name = '',
        name = '',
        metadata = {}
    } = params;

    // Create timestamp (current time in seconds)
    const timestamp = Math.floor(Date.now() / 1000);

    // Generate signature
    const signature = generateTestSignature(email, partner_app_id, timestamp, api_key);

    // Build query parameters
    const queryParams = new URLSearchParams({
        email,
        partner_app_id,
        external_id,
        timestamp,
        signature
    });

    // Add optional parameters
    if (first_name) queryParams.append('first_name', first_name);
    if (last_name) queryParams.append('last_name', last_name);
    if (name) queryParams.append('name', name);
    if (Object.keys(metadata).length > 0) {
        queryParams.append('metadata', JSON.stringify(metadata));
    }

    // Return the complete URL
    return `${baseUrl}/auth/sso/callback?${queryParams.toString()}`;
};