// File: scripts/test-sso.js
/**
 * This script tests the SSO integration by simulating the client and server side validation
 * Run with: node scripts/test-sso.js
 */

const crypto = require('crypto');
require('dotenv').config({ path: '.env.local' });

// Get API key from env or use a default for testing
const API_KEY = process.env.PARTNER_API_KEY || 'test_api_key';

// Create test data
const email = 'user@example.com';
const partner_app_id = 'partner-app-1';
const external_id = 'user-ext-123';
const timestamp = Math.floor(Date.now() / 1000);
const first_name = 'John';
const last_name = 'Doe';
const metadata = { department: 'IT', position: 'Developer' };

// Client-side signature generation (JS)
function generateClientSignature(email, partner_app_id, timestamp, api_key) {
    const data = email + partner_app_id + timestamp + api_key;
    return crypto.createHash('sha256').update(data).digest('hex');
}

// Server-side signature verification (PHP equivalent in JS)
function verifyServerSignature(signature, data, api_key) {
    try {
        // Extract data like the PHP server does
        const email = data.email || '';
        const partnerAppId = data.partner_app_id || '';
        const timestamp = data.timestamp || 0;

        // Create the data string like PHP does
        const dataToSign = email + partnerAppId + timestamp + api_key;

        // Generate expected signature like PHP: hash('sha256', $dataToSign)
        const expectedSignature = crypto.createHash('sha256').update(dataToSign).digest('hex');

        // Check timestamp like PHP does
        const now = Math.floor(Date.now() / 1000);
        const timestampDiff = now - timestamp;

        if (timestampDiff > 300 || timestampDiff < 0) {
            console.log('⚠️ Server would reject: Timestamp is invalid');
            console.log(`   Current time: ${now}, Request time: ${timestamp}, Diff: ${timestampDiff} seconds`);
            return false;
        }

        // Compare signatures like PHP does with hash_equals
        const signaturesMatch = expectedSignature === signature;
        return signaturesMatch;
    } catch (error) {
        console.error('Error in server verification:', error.message);
        return false;
    }
}

// Generate the client-side signature
const clientSignature = generateClientSignature(email, partner_app_id, timestamp, API_KEY);

// Create the data object like what would be sent to the server
const requestData = {
    email,
    partner_app_id,
    timestamp,
    external_id,
    signature: clientSignature,
    first_name,
    last_name,
    metadata: JSON.stringify(metadata)
};

// Test server-side verification
const serverVerificationResult = verifyServerSignature(clientSignature, requestData, API_KEY);

// Generate the test URL
const baseUrl = 'http://localhost:3001'; // Change to your app URL
const url = new URL(`${baseUrl}/auth/sso/callback`);

// Add all parameters to URL
Object.entries(requestData).forEach(([key, value]) => {
    url.searchParams.append(key, value);
});

// Print results
console.log('\n===== SSO INTEGRATION TEST =====\n');
console.log('API Key:', API_KEY);
console.log('Timestamp:', timestamp);
console.log('Current server time:', Math.floor(Date.now() / 1000));
console.log('Time difference:', Math.floor(Date.now() / 1000) - timestamp, 'seconds');
console.log('\nData to sign:', `"${email}${partner_app_id}${timestamp}${API_KEY}"`);
console.log('Generated signature:', clientSignature);

console.log('\nServer Verification:', serverVerificationResult ? '✅ PASSED' : '❌ FAILED');

if (serverVerificationResult) {
    console.log('\n✅ Integration should work! Try this URL:');
    console.log(url.toString());
    console.log('\nThis URL will expire in 5 minutes.\n');
} else {
    console.log('\n❌ Integration would fail on the server side.');
    console.log('Please check for any inconsistencies between client and server implementations.\n');
}

// Create curl command for testing
const curlCommand = `curl -X POST "${baseUrl}/api/auth/callback/sso-signature" \\
  -H "Content-Type: application/json" \\
  -d '{
    "redirect": "false",
    "email": "${email}",
    "partner_app_id": "${partner_app_id}",
    "external_id": "${external_id}",
    "timestamp": "${timestamp}",
    "signature": "${clientSignature}",
    "first_name": "${first_name}",
    "last_name": "${last_name}",
    "metadata": ${JSON.stringify(JSON.stringify(metadata))},
    "json": "true"
  }'`;

console.log('Test with this curl command:');
console.log(curlCommand);