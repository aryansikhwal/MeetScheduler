import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || process.env.REACT_APP_COMPANY_API_BASE_URL || 'http://localhost:8000';

function ConnectGoogle() {
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleConnect = () => {
    if (!username.trim()) {
      setError('Please enter a username');
      return;
    }
    
    // Validate username format
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      setError('Username can only contain letters, numbers, hyphens, and underscores');
      return;
    }

    if (username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    
    console.log('[ConnectGoogle] Redirecting to Google OAuth for username:', username);
    // Redirect to Google OAuth
    window.location.href = `${API_URL}/auth/google?username=${encodeURIComponent(username)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex flex-col">
      {/* Navigation */}
      <nav className="p-4">
        <div className="max-w-7xl mx-auto">
          <Link to="/" className="flex items-center space-x-3 w-fit">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <span className="text-lg font-black text-slate-900">MeetScheduler</span>
          </Link>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 p-8 sm:p-10 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
              <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Connect Your Calendar</h1>
            <p className="mt-2 text-slate-500">
              Connect your Google Calendar to start accepting bookings
            </p>
          </div>
          
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Choose your booking URL
              </label>
              <div className="flex rounded-xl overflow-hidden border border-slate-200 focus-within:ring-4 focus-within:ring-blue-50 focus-within:border-blue-500">
                <span className="inline-flex items-center px-3 bg-slate-50 text-slate-500 text-sm border-r border-slate-200">
                  /book/
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value.toLowerCase());
                    setError('');
                  }}
                  placeholder="yourname"
                  className="flex-1 px-3 py-2.5 text-sm focus:outline-none bg-slate-50"
                />
              </div>
              {error && (
                <p className="mt-2 text-sm text-red-600">{error}</p>
              )}
              <p className="mt-2 text-xs text-slate-400">
                This will be your unique booking link
              </p>
            </div>
            
            <button
              onClick={handleConnect}
              className="w-full flex items-center justify-center px-4 py-3.5 bg-white border border-slate-200 rounded-xl shadow-sm hover:bg-slate-50 active:scale-[0.98] transition-all"
            >
              <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-sm font-bold text-slate-700">Continue with Google</span>
            </button>
            
            {/* Dev login for testing - remove in production */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <button
                onClick={() => {
                  // Quick login for existing user (dev only)
                  const user = {
                    id: '1',
                    username: 'aryan',
                    email: 'socurated.aryan@gmail.com',
                  };
                  localStorage.setItem('user', JSON.stringify(user));
                  window.location.href = '/app/dashboard';
                }}
                className="w-full px-4 py-2.5 text-sm font-medium text-slate-500 hover:text-slate-700 hover:bg-slate-50 rounded-xl transition-all"
              >
                Skip to Dashboard (Dev Mode)
              </button>
            </div>
          </div>
          
          <p className="mt-6 text-center text-xs text-slate-400">
            By connecting, you allow us to read your calendar for availability and create meeting events.
          </p>
        </div>
      </div>
    </div>
  );
}

export default ConnectGoogle;
