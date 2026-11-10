import React, { useState, useEffect } from 'react';
import { getStoredToken, getStoredUser, setStoredToken, setStoredUser, fetchWithAuth } from './utils/auth';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import AuthPage from './pages/AuthPage';
import ProfilePage from './pages/ProfilePage';
import NewReportPage from './pages/NewReportPage';
import MyReportsPage from './pages/MyReportsPage';
import ColleaguesReportsPage from './pages/ColleaguesReportsPage';
import DashboardPage from './pages/DashboardPage';
import AdminUsersPage from './pages/AdminUsersPage';

export default function App() {
  const [currentUser, setCurrentUser] = useState(getStoredUser());
  const [activeTab, setActiveTab] = useState('new-report');
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const token = getStoredToken();
    if (token) {
      fetchWithAuth('/auth/me')
        .then(res => {
          setCurrentUser(res.user);
          setStoredUser(res.user);
        })
        .catch(() => {
          handleLogout();
        })
        .finally(() => setCheckingAuth(false));
    } else {
      setCheckingAuth(false);
    }
  }, []);

  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    if (user && user.role === 'ADMINISTRATEUR') {
      setActiveTab('dashboard');
    } else {
      setActiveTab('new-report');
    }
  };

  const handleLogout = () => {
    setStoredToken(null);
    setStoredUser(null);
    setCurrentUser(null);
  };

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-[#0B192C] flex items-center justify-center text-white font-sans">
        <div className="text-center space-y-4">
          <div className="w-14 h-14 border-4 border-sky-400 border-t-transparent rounded-full animate-spin mx-auto shadow-lg shadow-sky-400/20" />
          <p className="text-xs font-black text-slate-300 tracking-widest uppercase">Chargement de la plateforme SONABEL...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <AuthPage onAuthSuccess={handleAuthSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#071325] text-white flex font-sans relative">
      
      {/* Global Background Image: High Voltage Electric Grid (Bright & Crisp) */}
      <div 
        className="fixed inset-0 bg-cover bg-center bg-no-repeat pointer-events-none z-0 opacity-90"
        style={{ backgroundImage: `url('/bg_electric_grid.jpg')` }}
      />
      {/* Light Overlay Allowing Electric Grid Image to shine brightly */}
      <div className="fixed inset-0 bg-gradient-to-br from-[#03152E]/45 via-[#0B2545]/35 to-[#13315C]/25 pointer-events-none z-0" />

      {/* Desktop Left Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          currentUser={currentUser}
          onLogout={handleLogout}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
      </div>

      {/* Mobile Drawer Overlay Sidebar */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm md:hidden flex">
          <div className="w-72 bg-[#0B192C] h-full shadow-2xl relative">
            <Sidebar
              activeTab={activeTab}
              setActiveTab={(tab) => {
                setActiveTab(tab);
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              currentUser={currentUser}
              onLogout={handleLogout}
              collapsed={false}
              setCollapsed={() => {}}
            />
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col min-w-0 transition-all duration-300 relative z-10 ${
        sidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
      }`}>
        
        {/* Top Header Bar */}
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          onLogout={handleLogout}
          sidebarCollapsed={sidebarCollapsed}
          setSidebarCollapsed={setSidebarCollapsed}
          mobileMenuOpen={mobileMenuOpen}
          setMobileMenuOpen={setMobileMenuOpen}
        />

        {/* Dynamic Active Tab View */}
        <main className="flex-1 pb-16 px-4 sm:px-6 lg:px-8 pt-6">
          {activeTab === 'new-report' && (
            <NewReportPage
              currentUser={currentUser}
              onReportCreated={() => setActiveTab('my-reports')}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'my-reports' && (
            <MyReportsPage
              currentUser={currentUser}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'colleagues-reports' && (
            <ColleaguesReportsPage
              currentUser={currentUser}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'dashboard' && (
            <DashboardPage
              currentUser={currentUser}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'admin-users' && (
            <AdminUsersPage
              currentUser={currentUser}
              onNavigate={setActiveTab}
            />
          )}

          {activeTab === 'profile' && (
            <ProfilePage
              currentUser={currentUser}
              onUserUpdated={(updatedUser) => setCurrentUser(updatedUser)}
              onNavigate={setActiveTab}
            />
          )}
        </main>

        {/* Institutional Footer */}
        <footer className="bg-[#0B192C]/90 text-white py-6 border-t border-slate-800 text-xs text-center font-sans mt-auto backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="font-extrabold text-white">
              SONABEL - Société Nationale d'Électricité du Burkina Faso © 2026
            </p>
            <p className="text-[11px] text-sky-400 font-bold">
              Système de suivi et d'automatisation des 17 Directions & Agences Régionales (DER)
            </p>
          </div>
        </footer>

      </div>

    </div>
  );
}

