import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { localApi } from '../services/companyApi';

function BookingPage() {
  const { username } = useParams();
  const [slots, setSlots] = useState([]);
  const [hostId, setHostId] = useState(null);
  const [hostEmail, setHostEmail] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [bookingStep, setBookingStep] = useState('select'); // select, form, success
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    notes: ''
  });
  const [formError, setFormError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [bookingResult, setBookingResult] = useState(null);

  useEffect(() => {
    fetchSlots();
  }, [username]);

  const fetchSlots = async () => {
    try {
      // Fetch availability from local backend
      const response = await localApi.get(`/availability/username/${username}?days=14`);
      const data = response.data;
      // Store host info and slots
      setHostId(data.host_id);
      setHostEmail(data.host_email);
      setSlots(data.available_slots || []);
      console.log('[BookingPage] Fetched slots:', data);
    } catch (err) {
      console.error('[BookingPage] Failed to fetch slots:', err.response?.data || err.message);
      if (err.response?.status === 404) {
        setError('User not found. Please check the booking link.');
      } else {
        setError('Failed to load available slots');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!formData.name.trim() || !formData.email.trim()) {
      setFormError('Please fill in all required fields');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      setFormError('Please enter a valid email address');
      return;
    }

    setSubmitting(true);

    try {
      // Book meeting via local backend
      const response = await localApi.post('/book', {
        host_id: hostId,
        start_time: selectedSlot.start,
        end_time: selectedSlot.end,
        customer_name: formData.name,
        customer_email: formData.email,
        title: `Meeting with ${formData.name}`
      });

      const data = response.data;
      console.log('[BookingPage] Booking created:', data);
      setBookingResult(data);
      setBookingStep('success');
    } catch (err) {
      console.error('[BookingPage] Failed to book meeting:', err.response?.data || err.message);
      setFormError(err.response?.data?.detail || 'Failed to book meeting');
    } finally {
      setSubmitting(false);
    }
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (dateStr) => {
    const date = new Date(dateStr);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  // Group slots by date
  const groupedSlots = slots.reduce((acc, slot) => {
    const dateKey = new Date(slot.start).toDateString();
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(slot);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-500">Loading available slots...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-xl p-8 max-w-md w-full text-center border border-slate-100">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
            </svg>
          </div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight mb-2">Oops!</h2>
          <p className="text-slate-500">{error}</p>
          <Link to="/" className="inline-block mt-6 text-blue-600 hover:text-blue-700 font-bold">
            Go to homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <Link to="/" className="flex items-center space-x-2 w-fit">
            <div className="w-8 h-8 bg-blue-600 rounded-xl flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
              </svg>
            </div>
            <span className="font-black text-slate-900">MeetScheduler</span>
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {bookingStep === 'success' ? (
          /* Success State */
          <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8 text-center max-w-lg mx-auto">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight mb-2">Meeting Booked!</h2>
            <p className="text-slate-500 mb-6">
              You'll receive a calendar invite at <span className="font-bold text-slate-700">{formData.email}</span>
            </p>
            
            <div className="bg-slate-50 rounded-xl p-4 text-left mb-6">
              <div className="flex items-center text-slate-600 mb-2">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                <span className="font-medium">{formatDate(selectedSlot.start)}</span>
              </div>
              <div className="flex items-center text-slate-600">
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">{formatTime(selectedSlot.start)} - {formatTime(selectedSlot.end)}</span>
              </div>
            </div>

            {bookingResult?.meet_link && (
              <a
                href={bookingResult.meet_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 active:scale-[0.98] transition-all"
              >
                <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                </svg>
                Open Meet Link
              </a>
            )}
          </div>
        ) : bookingStep === 'form' ? (
          /* Booking Form */
          <div className="max-w-lg mx-auto">
            <button
              onClick={() => setBookingStep('select')}
              className="flex items-center text-slate-500 hover:text-slate-700 mb-6 transition-colors font-medium"
            >
              <svg className="w-5 h-5 mr-1" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              Back to slots
            </button>

            <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6 sm:p-8">
              <h2 className="text-xl font-black text-slate-900 tracking-tight mb-2">Confirm Your Booking</h2>
              
              <div className="bg-blue-50 rounded-xl p-4 mb-6 border border-blue-100">
                <div className="flex items-center text-blue-700 mb-1">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  <span className="font-bold">{formatDate(selectedSlot.start)}</span>
                </div>
                <div className="flex items-center text-blue-600">
                  <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">{formatTime(selectedSlot.start)} - {formatTime(selectedSlot.end)}</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all"
                    placeholder="John Doe"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all"
                    placeholder="john@example.com"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Notes (optional)
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    rows={3}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all"
                    placeholder="Any details you'd like to share..."
                  />
                </div>

                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm font-medium">
                    {formError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 shadow-lg shadow-blue-200 disabled:bg-blue-400 disabled:cursor-not-allowed active:scale-[0.98] transition-all flex items-center justify-center"
                >
                  {submitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                      Booking...
                    </>
                  ) : (
                    'Confirm Booking'
                  )}
                </button>
              </form>
            </div>
          </div>
        ) : (
          /* Slot Selection */
          <div>
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-blue-100">
                <span className="text-2xl font-black text-blue-600">
                  {username.charAt(0).toUpperCase()}
                </span>
              </div>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                Book a Meeting with {username}
              </h1>
              <p className="text-slate-500 mt-1">Select an available time slot below</p>
            </div>

            {Object.keys(groupedSlots).length === 0 ? (
              <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8 text-center max-w-lg mx-auto">
                <svg className="w-12 h-12 text-slate-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5m-9-6h.008v.008H12v-.008zM12 15h.008v.008H12V15zm0 2.25h.008v.008H12v-.008zM9.75 15h.008v.008H9.75V15zm0 2.25h.008v.008H9.75v-.008zM7.5 15h.008v.008H7.5V15zm0 2.25h.008v.008H7.5v-.008zm6.75-4.5h.008v.008h-.008v-.008zm0 2.25h.008v.008h-.008V15zm0 2.25h.008v.008h-.008v-.008zm2.25-4.5h.008v.008H16.5v-.008zm0 2.25h.008v.008H16.5V15z" />
                </svg>
                <h3 className="text-lg font-black text-slate-900 tracking-tight mb-2">No Available Slots</h3>
                <p className="text-slate-500">There are no available time slots at the moment. Please check back later.</p>
              </div>
            ) : (
              <div className="space-y-6 max-w-2xl mx-auto">
                {Object.entries(groupedSlots).map(([date, dateSlots]) => (
                  <div key={date} className="bg-white rounded-2xl shadow-lg border border-slate-100 overflow-hidden">
                    <div className="bg-slate-50 px-6 py-3 border-b border-slate-100">
                      <h3 className="font-black text-slate-900">{formatDate(dateSlots[0].start)}</h3>
                    </div>
                    <div className="p-4">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {dateSlots.map((slot, idx) => (
                          <button
                            key={idx}
                            onClick={() => {
                              setSelectedSlot(slot);
                              setBookingStep('form');
                            }}
                            className="px-4 py-3 border border-slate-200 rounded-xl hover:border-blue-500 hover:bg-blue-50 active:scale-[0.98] transition-all text-center group"
                          >
                            <span className="text-slate-700 group-hover:text-blue-700 font-bold">
                              {formatTime(slot.start)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default BookingPage;
