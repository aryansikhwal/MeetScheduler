import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const navigate = useNavigate();
  
  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;
  const userEmail = user.email;
  const username = user.username;
  
  const [copied, setCopied] = useState(false);
  const [signatureCopied, setSignatureCopied] = useState(false);

  const bookingLink = `${window.location.origin}/book/${username}`;

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/');
  };

  const copySignature = () => {
    navigator.clipboard.writeText(`📅 Book a meeting with me: ${bookingLink}`);
    setSignatureCopied(true);
    setTimeout(() => setSignatureCopied(false), 2000);
  };

  const copyLink = () => {
    navigator.clipboard.writeText(bookingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Profile</h1>
        <p className="mt-1 text-sm text-slate-500">Manage your account settings</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Account Info */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-6">Account Information</h2>
            
            <div className="flex items-center mb-6">
              <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center">
                <span className="text-3xl font-black text-white">
                  {userEmail ? userEmail.charAt(0).toUpperCase() : 'U'}
                </span>
              </div>
              <div className="ml-6">
                <p className="text-xl font-black text-slate-900">{username}</p>
                <p className="text-slate-500">{userEmail}</p>
                <div className="mt-2 inline-flex items-center px-2.5 py-1 rounded-xl text-xs font-bold bg-green-100 text-green-700">
                  <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
                  Google Calendar Connected
                </div>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-500 mb-1">User ID</label>
                <p className="text-slate-900">{userId}</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-500 mb-1">Username</label>
                <p className="text-slate-900">@{username}</p>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-slate-500 mb-1">Email</label>
                <p className="text-slate-900">{userEmail}</p>
              </div>
            </div>
          </div>

          {/* Booking Link */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-4">Your Booking Link</h2>
            <p className="text-sm text-slate-500 mb-4">Share this link with anyone who wants to schedule a meeting with you.</p>
            
            <div className="flex items-center space-x-3">
              <input
                type="text"
                readOnly
                value={bookingLink}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm"
              />
              <button
                onClick={copyLink}
                className={`px-4 py-2.5 text-sm font-bold rounded-xl transition-all active:scale-[0.98] ${
                  copied
                    ? 'bg-green-600 text-white'
                    : 'bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200'
                }`}
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href={bookingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 text-sm font-bold text-blue-700 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                Preview Page
              </a>
              <a
                href={`mailto:?subject=Book a meeting with me&body=You can schedule a meeting with me here: ${bookingLink}`}
                className="inline-flex items-center px-4 py-2 text-sm font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                Share via Email
              </a>
            </div>
          </div>

          {/* Email Signature */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-4">Email Signature</h2>
            <p className="text-sm text-slate-500 mb-4">Add this to your email signature to make scheduling easy.</p>
            
            <div className="bg-slate-50 rounded-xl p-4 text-sm text-slate-700 border border-slate-200">
              📅 <a href={bookingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">Book a meeting with me</a>
            </div>

            <button
              onClick={copySignature}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-bold"
            >
              {signatureCopied ? '✓ Copied!' : 'Copy signature text'}
            </button>
          </div>
        </div>

        {/* Sidebar Actions */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-sm font-black text-slate-900 mb-4">Account Status</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 font-medium">Google Calendar</span>
                <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold bg-green-100 text-green-700">
                  Connected
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 font-medium">Booking Link</span>
                <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-bold bg-green-100 text-green-700">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="bg-white rounded-2xl shadow-sm border border-red-200 p-6">
            <h3 className="text-sm font-black text-red-600 mb-4">Danger Zone</h3>
            <p className="text-sm text-slate-500 mb-4">
              Sign out of your account. You'll need to reconnect Google Calendar to use the service again.
            </p>
            <button
              onClick={handleLogout}
              className="w-full px-4 py-2.5 text-sm font-bold text-red-700 bg-red-50 rounded-xl hover:bg-red-100 active:scale-[0.98] transition-all"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;
