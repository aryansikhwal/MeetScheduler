import React, { useState } from 'react';

function BookingSettings() {
  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const username = user.username;
  const bookingLink = `${window.location.origin}/book/${username}`;
  const [copied, setCopied] = useState(false);
  const [signatureCopied, setSignatureCopied] = useState(false);

  const copyLink = () => {
    navigator.clipboard.writeText(bookingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const copySignature = () => {
    navigator.clipboard.writeText(`📅 Book a meeting with me: ${bookingLink}`);
    setSignatureCopied(true);
    setTimeout(() => setSignatureCopied(false), 2000);
  };

  const openBookingPage = () => {
    window.open(bookingLink, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Booking Page</h1>
        <p className="mt-1 text-sm text-slate-500">Manage and preview your public booking page</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Booking Link Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h2 className="text-xl font-black text-slate-900 tracking-tight mb-4">Your Booking Link</h2>
            <p className="text-sm text-slate-500 mb-4">
              Share this link with anyone who wants to schedule a meeting with you.
            </p>
            
            <div className="flex items-center space-x-3 mb-6">
              <input
                type="text"
                readOnly
                value={bookingLink}
                className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 text-sm font-mono"
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

            <div className="flex flex-wrap gap-3">
              <button
                onClick={openBookingPage}
                className="inline-flex items-center px-5 py-3 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-[0.98] transition-all"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 003 8.25v10.5A2.25 2.25 0 005.25 21h10.5A2.25 2.25 0 0018 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                </svg>
                Open Booking Page
              </button>
              <a
                href={`mailto:?subject=Book a meeting with me&body=You can schedule a meeting with me here: ${bookingLink}`}
                className="inline-flex items-center px-5 py-3 text-sm font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 active:scale-[0.98] transition-all"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                </svg>
                Share via Email
              </a>
            </div>
          </div>

          {/* Booking Page Preview */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900">Live Preview</h2>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              </div>
            </div>
            <div className="relative" style={{ height: '500px' }}>
              <iframe
                src={bookingLink}
                title="Booking Page Preview"
                className="absolute inset-0 w-full h-full border-0"
                style={{ transform: 'scale(0.75)', transformOrigin: 'top left', width: '133.33%', height: '133.33%' }}
              />
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-sm font-black text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={openBookingPage}
                className="w-full flex items-center px-4 py-3 text-sm font-bold text-slate-700 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                View as Visitor
              </button>
              <button
                onClick={copyLink}
                className="w-full flex items-center px-4 py-3 text-sm font-bold text-slate-700 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors"
              >
                <svg className="w-5 h-5 mr-3 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                </svg>
                Copy Link
              </button>
            </div>
          </div>

          {/* Email Signature */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-sm font-black text-slate-900 mb-4">Email Signature</h3>
            <p className="text-xs text-slate-500 mb-3">Add this to your email signature to make scheduling easy.</p>
            <div className="bg-slate-50 rounded-xl p-3 text-sm text-slate-700 border border-slate-200">
              📅 <a href={bookingLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-medium">Book a meeting with me</a>
            </div>
            <button
              onClick={copySignature}
              className="mt-3 text-xs text-blue-600 hover:text-blue-700 font-bold"
            >
              {signatureCopied ? '✓ Copied!' : 'Copy signature text'}
            </button>
          </div>

          {/* Stats */}
          <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
            <h3 className="text-sm font-bold text-blue-100 mb-4">Booking Stats</h3>
            <div className="space-y-4">
              <div>
                <p className="text-2xl font-black">Active</p>
                <p className="text-sm text-blue-200">Your booking page is live</p>
              </div>
              <div className="pt-4 border-t border-white/20">
                <p className="text-xs text-blue-200">
                  Anyone with the link can book time on your calendar
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BookingSettings;
