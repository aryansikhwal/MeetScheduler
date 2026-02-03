import React, { useState, useEffect } from 'react';
import { localApi } from '../services/companyApi';

function SmtpSettings() {
  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;
  
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    smtp_host: '',
    smtp_port: 587,
    smtp_user: '',
    smtp_password: '',
    is_active: true,
  });

  useEffect(() => {
    if (userId) {
      fetchAccounts();
    }
  }, [userId]);

  const fetchAccounts = async () => {
    try {
      const response = await localApi.get(`/smtp/list?user_id=${userId}`);
      const data = response.data;
      setAccounts(data.accounts || []);
      console.log('[SmtpSettings] Fetched accounts:', data);
    } catch (err) {
      console.error('[SmtpSettings] Failed to load accounts:', err.response?.data || err.message);
      setError(err.response?.data?.detail || 'Failed to load SMTP accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setError('');
    setSuccess('');
    
    try {
      const response = await localApi.post('/smtp/test', {
        smtp_host: formData.smtp_host,
        smtp_port: formData.smtp_port,
        smtp_user: formData.smtp_user,
        smtp_password: formData.smtp_password,
      });
      
      const data = response.data;
      console.log('[SmtpSettings] Test result:', data);
      
      if (data.success) {
        setSuccess(data.message);
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('[SmtpSettings] Test failed:', err.response?.data || err.message);
      setError('Failed to test SMTP connection');
    } finally {
      setTesting(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    
    try {
      await localApi.post(`/smtp/add?user_id=${userId}`, formData);
      console.log('[SmtpSettings] Account saved successfully');
      
      setSuccess('SMTP account saved successfully!');
      setFormData({
        smtp_host: '',
        smtp_port: 587,
        smtp_user: '',
        smtp_password: '',
        is_active: true,
      });
      fetchAccounts();
    } catch (err) {
      console.error('[SmtpSettings] Save failed:', err.response?.data || err.message);
      setError(err.response?.data?.detail || 'Failed to save SMTP account');
    } finally {
      setSaving(false);
    }
  };

  const handleSetActive = async (smtpId) => {
    try {
      await localApi.post(`/smtp/set-active/${smtpId}?user_id=${userId}`);
      console.log('[SmtpSettings] Set active:', smtpId);
      
      setSuccess('SMTP account set as active');
      fetchAccounts();
    } catch (err) {
      console.error('[SmtpSettings] Set active failed:', err.response?.data || err.message);
      setError(err.response?.data?.detail || 'Failed to set active');
    }
  };

  const handleDelete = async (smtpId) => {
    if (!window.confirm('Are you sure you want to delete this SMTP account?')) return;
    
    try {
      await localApi.delete(`/smtp/${smtpId}?user_id=${userId}`);
      console.log('[SmtpSettings] Deleted:', smtpId);
      
      setSuccess('SMTP account deleted');
      fetchAccounts();
    } catch (err) {
      console.error('[SmtpSettings] Delete failed:', err.response?.data || err.message);
      setError(err.response?.data?.detail || 'Failed to delete');
    }
  };

  const presets = [
    { name: 'Gmail', host: 'smtp.gmail.com', port: 587 },
    { name: 'Outlook', host: 'smtp.office365.com', port: 587 },
    { name: 'Yahoo', host: 'smtp.mail.yahoo.com', port: 587 },
  ];

  const applyPreset = (preset) => {
    setFormData({
      ...formData,
      smtp_host: preset.host,
      smtp_port: preset.port,
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Email Settings</h1>
        <p className="mt-1 text-sm text-slate-500">Configure SMTP to send meeting confirmation emails</p>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start">
          <svg className="w-5 h-5 text-red-500 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
          </svg>
          <p className="ml-3 text-sm text-red-700 font-medium">{error}</p>
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start">
          <svg className="w-5 h-5 text-green-500 mt-0.5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="ml-3 text-sm text-green-700 font-medium">{success}</p>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Add New SMTP Form */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-xl font-black text-slate-900 tracking-tight mb-6">Add SMTP Account</h2>
          
          {/* Quick Presets */}
          <div className="mb-6">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Quick Setup</label>
            <div className="flex flex-wrap gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => applyPreset(preset)}
                  className="px-3 py-1.5 text-sm font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors"
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSave} className="space-y-5">
            <div className="grid sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">SMTP Host *</label>
                <input
                  type="text"
                  value={formData.smtp_host}
                  onChange={(e) => setFormData({...formData, smtp_host: e.target.value})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all"
                  placeholder="smtp.gmail.com"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Port *</label>
                <select
                  value={formData.smtp_port}
                  onChange={(e) => setFormData({...formData, smtp_port: parseInt(e.target.value)})}
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all"
                >
                  <option value={587}>587 (STARTTLS - Recommended)</option>
                  <option value={465}>465 (SSL)</option>
                  <option value={25}>25 (SMTP)</option>
                  <option value={2525}>2525 (Alternative)</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email / Username *</label>
              <input
                type="email"
                value={formData.smtp_user}
                onChange={(e) => setFormData({...formData, smtp_user: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all"
                placeholder="your-email@gmail.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password / App Password *</label>
              <input
                type="password"
                value={formData.smtp_password}
                onChange={(e) => setFormData({...formData, smtp_password: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-50 focus:border-blue-500 transition-all"
                placeholder="••••••••••••••••"
                required
              />
              <p className="mt-1.5 text-xs text-slate-500">
                For Gmail, use an App Password from Google Account → Security → 2FA → App passwords
              </p>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                id="is_active"
                checked={formData.is_active}
                onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="is_active" className="ml-2 text-sm text-slate-700 font-medium">
                Set as active (use for sending emails)
              </label>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <button
                type="button"
                onClick={handleTest}
                disabled={testing || !formData.smtp_host || !formData.smtp_user || !formData.smtp_password}
                className="flex-1 flex items-center justify-center px-4 py-2.5 text-sm font-bold text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
              >
                {testing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-slate-600 mr-2"></div>
                    Testing...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
                    </svg>
                    Test Connection
                  </>
                )}
              </button>
              
              <button
                type="submit"
                disabled={saving || !formData.smtp_host || !formData.smtp_user || !formData.smtp_password}
                className="flex-1 flex items-center justify-center px-4 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] transition-all"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Saving...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Save SMTP Account
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Saved Accounts */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
          <h2 className="text-xl font-black text-slate-900 tracking-tight mb-4">Saved Accounts</h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
            </div>
          ) : accounts.length === 0 ? (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-slate-300 mx-auto mb-3" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              <p className="text-sm text-slate-700 font-semibold">No SMTP accounts configured</p>
              <p className="text-xs text-slate-400 mt-1">Add one to send emails</p>
            </div>
          ) : (
            <div className="space-y-3">
              {accounts.map((account) => (
                <div key={account.id} className="p-4 bg-slate-50 rounded-xl">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center">
                        <p className="text-sm font-bold text-slate-900 truncate">{account.smtp_host}</p>
                        {account.is_active && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-bold bg-green-100 text-green-700">
                            Active
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Port {account.smtp_port} • {account.smtp_user_masked}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex space-x-2">
                    {!account.is_active && (
                      <button
                        onClick={() => handleSetActive(account.id)}
                        className="flex-1 px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        Set Active
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="flex-1 px-3 py-1.5 text-xs font-bold text-red-700 bg-red-50 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Help Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-6">
        <h3 className="text-sm font-black text-blue-900 mb-2">Need help with Gmail?</h3>
        <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside font-medium">
          <li>Enable 2-Factor Authentication in your Google Account</li>
          <li>Go to Google Account → Security → App passwords</li>
          <li>Create a new app password for "Mail"</li>
          <li>Use that 16-character password above</li>
        </ol>
      </div>
    </div>
  );
}

export default SmtpSettings;
