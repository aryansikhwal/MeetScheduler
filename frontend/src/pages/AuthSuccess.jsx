import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

function AuthSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [status, setStatus] = useState('Processing...');

  useEffect(() => {
    const userId = searchParams.get('user_id');
    const username = searchParams.get('username');
    const email = searchParams.get('email');

    if (userId && username) {
      // Save to localStorage
      const user = {
        id: userId,
        username: username,
        email: email || '',
      };
      localStorage.setItem('user', JSON.stringify(user));
      
      setStatus('Success! Redirecting to dashboard...');
      
      // Redirect to dashboard
      setTimeout(() => {
        navigate('/app/dashboard', { replace: true });
      }, 1500);
    } else {
      setError('Authentication failed. Missing user information.');
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 max-w-md w-full text-center">
        {error ? (
          <>
            <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Authentication Failed</h2>
            <p className="text-slate-500 mb-6">{error}</p>
            <button
              onClick={() => navigate('/connect')}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-[0.98] transition-all"
            >
              Try Again
            </button>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600 animate-pulse" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2 tracking-tight">Connected Successfully!</h2>
            <p className="text-slate-500">{status}</p>
            <div className="mt-6 flex justify-center">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default AuthSuccess;
