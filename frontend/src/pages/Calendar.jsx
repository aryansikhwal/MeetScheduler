import React, { useState, useEffect } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';

function Calendar() {
  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;
  
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchMeetings();
  }, []);

  const fetchMeetings = async () => {
    try {
      const response = await fetch(`${API_URL}/meetings?user_id=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setMeetings(data.meetings || []);
      }
    } catch (err) {
      console.error('Failed to fetch meetings:', err);
    } finally {
      setLoading(false);
    }
  };

  // Calendar helpers
  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const today = new Date();

  // Get meetings for a specific day
  const getMeetingsForDay = (day) => {
    return meetings.filter((m) => {
      const meetingDate = new Date(m.start_ts);
      return (
        meetingDate.getDate() === day &&
        meetingDate.getMonth() === currentDate.getMonth() &&
        meetingDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  // Build calendar grid
  const calendarDays = [];
  for (let i = 0; i < firstDay; i++) {
    calendarDays.push(null); // Empty cells before first day
  }
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  const isToday = (day) => {
    return (
      day === today.getDate() &&
      currentDate.getMonth() === today.getMonth() &&
      currentDate.getFullYear() === today.getFullYear()
    );
  };

  const formatTime = (dateStr) => {
    return new Date(dateStr).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Calendar</h1>
          <p className="mt-1 text-sm text-slate-500">View your scheduled meetings by date</p>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {/* Calendar Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              <button
                onClick={goToToday}
                className="px-3 py-1.5 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
              >
                Today
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={prevMonth}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                </svg>
              </button>
              <button
                onClick={nextMonth}
                className="p-2 hover:bg-slate-100 rounded-xl transition-colors"
              >
                <svg className="w-5 h-5 text-slate-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <div className="p-6">
            {/* Day Headers */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {dayNames.map((day) => (
                <div key={day} className="text-center text-xs font-bold text-slate-500 uppercase py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, idx) => {
                if (day === null) {
                  return <div key={`empty-${idx}`} className="h-24 sm:h-32"></div>;
                }

                const dayMeetings = getMeetingsForDay(day);
                const isCurrentDay = isToday(day);

                return (
                  <div
                    key={day}
                    className={`h-24 sm:h-32 border rounded-xl p-1 sm:p-2 transition-colors ${
                      isCurrentDay
                        ? 'bg-blue-50 border-blue-300'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`text-sm font-bold mb-1 ${isCurrentDay ? 'text-blue-700' : 'text-slate-900'}`}>
                      {day}
                    </div>
                    <div className="space-y-1 overflow-y-auto max-h-16 sm:max-h-20">
                      {dayMeetings.slice(0, 3).map((meeting) => (
                        <a
                          key={meeting.id}
                          href={meeting.meet_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block px-1.5 py-0.5 text-xs bg-blue-100 text-blue-700 rounded-lg truncate hover:bg-blue-200 transition-colors font-medium"
                          title={`${meeting.title} - ${meeting.customer_name}`}
                        >
                          {formatTime(meeting.start_ts)} {meeting.title.substring(0, 10)}
                        </a>
                      ))}
                      {dayMeetings.length > 3 && (
                        <div className="text-xs text-slate-500 px-1 font-medium">
                          +{dayMeetings.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4">
        <div className="flex flex-wrap items-center gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-50 border border-blue-300 rounded mr-2"></div>
            <span className="text-slate-600 font-medium">Today</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-blue-100 rounded mr-2"></div>
            <span className="text-slate-600 font-medium">Meeting scheduled</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Calendar;
