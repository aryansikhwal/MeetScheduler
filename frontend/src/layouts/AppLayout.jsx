import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  
  // Get user from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const userId = user.id;
  const userEmail = user.email;
  const username = user.username;
  
  // If not logged in, redirect to connect page
  React.useEffect(() => {
    if (!userId) {
      navigate('/connect');
    }
  }, [userId, navigate]);

  if (!userId) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Sidebar */}
      <Sidebar currentPath={location.pathname} />
      
      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Topbar */}
        <Topbar userEmail={userEmail} username={username} />
        
        {/* Page Content */}
        <main className="p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AppLayout;
