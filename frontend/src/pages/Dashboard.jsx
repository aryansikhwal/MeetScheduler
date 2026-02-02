import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function Dashboard() {
  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;
  const username = user.username;
  
  const [stats, setStats] = useState({
    totalMeetings: 0,
    upcomingMeetings: 0,
    thisWeek: 0,
  });
  const [upcomingMeetings, setUpcomingMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every 30 seconds for real-time updates
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch meetings for this user
      const response = await fetch(`${API_URL}/meetings?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        const meetings = data.meetings || [];
        
        const now = new Date();
        const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        const upcoming = meetings.filter(m => new Date(m.start_ts) > now);
        const thisWeek = meetings.filter(m => {
          const date = new Date(m.start_ts);
          return date > now && date < weekFromNow;
        });

        setStats({
          totalMeetings: meetings.length,
          upcomingMeetings: upcoming.length,
          thisWeek: thisWeek.length,
        });
        
        setUpcomingMeetings(upcoming.slice(0, 5));
      }
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const bookingLink = `${window.location.origin}/book/${username}`;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Dashboard</h1>
          <p className="mt-1 text-slate-500 font-medium">Welcome back! Here's what's happening.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            to="/app/meetings"
            className="inline-flex items-center px-4 py-2 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-[0.98]"
          >
            View All Meetings
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-xl">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Total Meetings</p>
              <p className="text-2xl font-black text-slate-900">{loading ? '-' : stats.totalMeetings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-xl">
              <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Upcoming</p>
              <p className="text-2xl font-black text-slate-900">{loading ? '-' : stats.upcomingMeetings}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 rounded-xl">
              <svg className="w-6 h-6 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">This Week</p>
              <p className="text-2xl font-black text-slate-900">{loading ? '-' : stats.thisWeek}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center">
            <div className="p-3 bg-amber-100 rounded-xl">
              <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-slate-500">Booking Link</p>
              <p className="text-sm font-bold text-blue-600 truncate max-w-[120px]">/book/{username}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Upcoming Meetings */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100">
          <div className="p-6 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-slate-900">Upcoming Meetings</h2>
              <Link to="/app/meetings" className="text-sm font-bold text-blue-600 hover:text-blue-700">
                View all
              </Link>
            </div>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : upcomingMeetings.length === 0 ? (
              <div className="text-center py-8">
                <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                <p className="text-slate-500 font-medium">No upcoming meetings</p>
                <p className="text-sm text-slate-400 mt-1">Share your booking link to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingMeetings.map((meeting) => (
                  <div key={meeting.id} className="flex items-center p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                    <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-xl flex flex-col items-center justify-center">
                      <span className="text-xs font-bold text-blue-600">{formatDate(meeting.start_ts).split(' ')[0]}</span>
                      <span className="text-sm font-black text-blue-700">{new Date(meeting.start_ts).getDate()}</span>
                    </div>
                    <div className="ml-4 flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 truncate">{meeting.title}</p>
                      <p className="text-sm text-slate-500">{meeting.customer_name} • {formatTime(meeting.start_ts)}</p>
                    </div>
                    <a
                      href={meeting.meet_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="ml-4 px-3 py-1.5 text-xs font-bold text-white bg-green-600 rounded-xl hover:bg-green-700 transition-colors"
                    >
                      Join
                    </a>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* Share Booking Link */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-xl font-black text-slate-900 mb-4">Share Your Link</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  readOnly
                  value={bookingLink}
                  className="flex-1 px-3 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl truncate outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500"
                />
                <button
                  onClick={() => navigator.clipboard.writeText(bookingLink)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                  title="Copy link"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v0a.75.75 0 01-.75.75H9a.75.75 0 01-.75-.75v0c0-.212.03-.418.084-.612m7.332 0c.646.049 1.288.11 1.927.184 1.1.128 1.907 1.077 1.907 2.185V19.5a2.25 2.25 0 01-2.25 2.25H6.75A2.25 2.25 0 014.5 19.5V6.257c0-1.108.806-2.057 1.907-2.185a48.208 48.208 0 011.927-.184" />
                  </svg>
                </button>
              </div>
              <a
                href={bookingLink}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full text-center px-4 py-2 text-sm font-bold text-blue-600 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors"
              >
                Preview Booking Page
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
            <h3 className="text-xl font-black text-slate-900 mb-4">Quick Actions</h3>
            <div className="space-y-2">
              <Link
                to="/app/calendar"
                className="flex items-center p-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="p-2 bg-blue-100 rounded-xl">
                  <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-bold text-slate-900">View Calendar</p>
                  <p className="text-xs text-slate-500">See all bookings</p>
                </div>
              </Link>
              <Link
                to="/app/meetings"
                className="flex items-center p-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="p-2 bg-green-100 rounded-xl">
                  <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5l4.72-4.72a.75.75 0 011.28.53v11.38a.75.75 0 01-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 002.25-2.25v-9a2.25 2.25 0 00-2.25-2.25h-9A2.25 2.25 0 002.25 7.5v9a2.25 2.25 0 002.25 2.25z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-bold text-slate-900">Google Meets</p>
                  <p className="text-xs text-slate-500">Track all your calls</p>
                </div>
              </Link>
              <Link
                to="/app/booking"
                className="flex items-center p-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="p-2 bg-purple-100 rounded-xl">
                  <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-bold text-slate-900">Booking Page</p>
                  <p className="text-xs text-slate-500">Manage your link</p>
                </div>
              </Link>
              <Link
                to="/app/email"
                className="flex items-center p-3 rounded-xl hover:bg-slate-50 transition-colors"
              >
                <div className="p-2 bg-amber-100 rounded-xl">
                  <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-bold text-slate-900">SMTP Settings</p>
                  <p className="text-xs text-slate-500">Configure email</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
