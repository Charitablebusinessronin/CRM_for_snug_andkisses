'use client';

import { useEffect, useState } from 'react';

export default function ZohoTestPage() {
  const [testResult, setTestResult] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const testZohoConfig = async () => {
      try {
        const response = await fetch('/api/zoho-test');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.message || 'Failed to test Zoho configuration');
        }
        
        setTestResult(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        console.error('Test failed:', err);
      } finally {
        setIsLoading(false);
      }
    };

    testZohoConfig();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg font-medium text-gray-700">Testing Zoho Configuration...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-red-50 p-6">
        <div className="max-w-md w-full space-y-4">
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="mt-3 text-xl font-bold text-gray-900">Configuration Error</h2>
            <p className="mt-2 text-sm text-gray-600">{error}</p>
          </div>
          <div className="mt-6 bg-white p-4 rounded-lg shadow overflow-hidden">
            <pre className="text-xs text-red-600 overflow-auto max-h-60">
              {JSON.stringify(testResult, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {testResult?.success ? '✅ Configuration Test Passed!' : '⚠️ Configuration Issues Found'}
          </h1>
          <p className="text-lg text-gray-600">
            {testResult?.message}
          </p>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Zoho Configuration Status
            </h3>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Current environment: {process.env.NODE_ENV}
            </p>
          </div>
          <div className="border-t border-gray-200">
            <dl>
              {testResult?.config && Object.entries(testResult.config).map(([key, value]) => (
                <div key={key} className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-b border-gray-100">
                  <dt className="text-sm font-medium text-gray-500">
                    {key}
                  </dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0 font-mono break-all">
                    {String(value) || <span className="text-gray-400">Not set</span>}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>

        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-gray-50">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Next Steps
            </h3>
          </div>
          <div className="px-4 py-5 sm:p-6">
            <ul className="list-disc pl-5 space-y-2">
              {testResult?.success ? (
                <>
                  <li>✅ Your Zoho configuration is correctly set up!</li>
                  <li>You can now proceed with implementing the authentication flow.</li>
                  <li>Check the Zoho Developer Console to ensure your redirect URIs match.</li>
                </>
              ) : (
                <>
                  <li>❌ Some required environment variables are missing or incorrect.</li>
                  <li>Check your <code className="bg-gray-100 px-1 rounded">.env.local</code> file.</li>
                  <li>Make sure to restart your development server after making changes.</li>
                </>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
