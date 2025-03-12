// File: scripts/generate-test-sso.js
/**
 * This script generates a valid SSO test URL with correct signature
 * Run with: node scripts/generate-test-sso.js
 */

const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

// Function to generate signature exactly matching the PHP server implementation
const generateSignature = (email, partner_app_id, timestamp, api_key) => {
    // This matches the PHP: hash('sha256', $dataToSign)
    const data = email + partner_app_id + timestamp + api_key;
    return crypto.createHash('sha256').update(data).digest('hex');
};

// Get API key from env
const API_KEY = process.env.PARTNER_API_KEY;

if (!API_KEY) {
    console.error('Error: PARTNER_API_KEY not found in .env.local');
    process.exit(1);
}

// Test parameters
const email = 'user@example.com';
const partner_app_id = 'partner-app-1';
const external_id = 'user-ext-123';
const timestamp = Math.floor(Date.now() / 1000);
const first_name = 'John';
const last_name = 'Doe';
const metadata = JSON.stringify({ department: 'IT', position: 'Developer' });

// Generate signature
const signature = generateSignature(email, partner_app_id, timestamp, API_KEY);

// Generate URL
const baseUrl = 'http://localhost:3001'; // Change this to your app URL
const url = new URL(`${baseUrl}/auth/sso/callback`);
url.searchParams.append('email', email);
url.searchParams.append('partner_app_id', partner_app_id);
url.searchParams.append('external_id', external_id);
url.searchParams.append('timestamp', timestamp);
url.searchParams.append('signature', signature);
url.searchParams.append('first_name', first_name);
url.searchParams.append('last_name', last_name);
url.searchParams.append('metadata', metadata);

// Print details
console.log('\n=== SSO TEST URL GENERATOR ===\n');
console.log('API Key (from .env.local):', API_KEY);
console.log('Timestamp:', timestamp);
console.log('Data String:', `${email}${partner_app_id}${timestamp}${API_KEY}`);
console.log('Generated Signature:', signature);
console.log('\nTest URL:');
console.log(url.toString());
console.log('\nThis URL will expire in 5 minutes.\n');