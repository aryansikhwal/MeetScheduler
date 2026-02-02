import React from 'react';
import { Link } from 'react-router-dom';

function Landing() {
  // Check if user is logged in
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const isLoggedIn = !!user;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navigation */}
      <nav className="border-b border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <span className="text-xl font-extrabold text-slate-900 tracking-tight">MeetScheduler</span>
            </div>
            <div className="flex items-center space-x-3">
              {isLoggedIn ? (
                <Link
                  to="/app/dashboard"
                  className="inline-flex items-center px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-[0.98]"
                >
                  Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/app/dashboard"
                    className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/connect"
                    className="inline-flex items-center px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-[0.98]"
                  >
                    Sign In
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="text-center">
            <h1 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
              Schedule meetings
              <span className="text-blue-600"> effortlessly</span>
            </h1>
            <p className="mt-4 text-lg text-slate-500 font-medium max-w-2xl mx-auto">
              Connect your Google Calendar, share your booking link, and let others book time with you.
            </p>
            <div className="mt-8 flex items-center justify-center gap-4">
              <Link
                to="/app/dashboard"
                className="inline-flex items-center px-6 py-3 text-base font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-[0.98]"
              >
                Dashboard
                <svg className="w-5 h-5 ml-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                to="/connect"
                className="inline-flex items-center px-6 py-3 text-base font-bold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-all active:scale-[0.98]"
              >
                Sign In
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-black text-slate-900 tracking-tight">How it works</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center text-xl font-black mx-auto mb-4 shadow-lg shadow-blue-200">
                1
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Connect Google Calendar</h3>
              <p className="text-sm text-slate-500 font-medium">
                Sign in with Google and grant calendar access.
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center text-xl font-black mx-auto mb-4 shadow-lg shadow-blue-200">
                2
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Share Your Link</h3>
              <p className="text-sm text-slate-500 font-medium">
                Get your personalized booking link to share.
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-xl flex items-center justify-center text-xl font-black mx-auto mb-4 shadow-lg shadow-blue-200">
                3
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">Get Booked</h3>
              <p className="text-sm text-slate-500 font-medium">
                People pick a time and get Google Meet links.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-3 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-white p-1.5 rounded-xl shadow-sm">
                <svg className="w-full h-full text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white">MeetScheduler</span>
            </div>
            <p className="text-slate-400 text-sm font-medium">
              © 2026 MeetScheduler. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Landing;
