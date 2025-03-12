// File: app/dashboard/page.jsx
'use client';

import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

const DashboardPage = () => {
    const { data: session, status } = useSession({
        required: true,
        onUnauthenticated() {
            redirect('/auth/signin');
        },
    });

    // Handle loading state
    if (status === 'loading') {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>

            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4">Welcome, {session?.user?.name || session?.user?.email || 'User'}!</h2>
                <p className="text-gray-600 mb-4">You've successfully logged in via SSO.</p>

                <div className="bg-gray-50 p-4 rounded-md">
                    <h3 className="text-md font-medium mb-2">Your session information:</h3>
                    <pre className="bg-gray-100 p-3 rounded text-sm overflow-auto">
                        {JSON.stringify(session, null, 2)}
                    </pre>
                </div>
            </div>
        </div>
    );
};

export default DashboardPage;




/*
  "username": "master-royal-air-maroc",
  "password": "idectti3b@2025",



*/