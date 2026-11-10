import React, { useState } from 'react';
import Logo from './Logo';
import { FilePlus, FileText, Users, LayoutDashboard, LogOut, ChevronDown, Shield, User, UserCheck, Bell, Search, Menu, X, ShieldCheck, Zap } from 'lucide-react';

export default function Header({ activeTab, setActiveTab, currentUser, onLogout, sidebarCollapsed, setSidebarCollapsed, mobileMenuOpen, setMobileMenuOpen }) {
  const [showDropdown, setShowDropdown] = useState(false);

  const pageTitles = {
    'new-report': 'Rédiger un Rapport Hebdomadaire',
    'my-reports': 'Mes Rapports Hebdomadaires',
    'colleagues-reports': 'Rapports des Collègues (17 DERs)',
    'dashboard': 'Tableau de Bord Consolidé (17 Régions)',
    'admin-users': 'Profils Utilisateurs & Administrateurs',
    'profile': 'Mon Profil Agent'
  };

  const navItems = [
    { id: 'new-report', label: 'Nouveau rapport', icon: FilePlus },
    { id: 'my-reports', label: 'Mes rapports', icon: FileText },
    { id: 'colleagues-reports', label: 'Rapports collègues', icon: Users },
  ];

  if (currentUser && currentUser.role === 'ADMINISTRATEUR') {
    navItems.unshift({ id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard });
    navItems.push({ id: 'admin-users', label: 'Utilisateurs', icon: UserCheck });
  }

  return (
    <header className="glass-header text-white sticky top-0 z-50 shadow-lg border-b border-slate-800/80 relative">
      {/* Background Image: Electric Grid */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-15 pointer-events-none z-0 rounded-b-xl overflow-hidden"
        style={{ backgroundImage: `url('/bg_electric_grid.jpg')` }}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex items-center justify-between h-20">
          
          {/* Left Area: Mobile Menu Button & Current Page Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen && setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-slate-800 text-slate-200 hover:text-white cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>

            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center justify-center">
                <Logo size="sm" showText={false} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black uppercase tracking-widest text-sky-400">SONABEL Pilotage</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                </div>
                <h1 className="text-base sm:text-lg font-black text-white tracking-tight leading-none">
                  {pageTitles[activeTab] || 'Plateforme intégrée de pilotage'}
                </h1>
              </div>
            </div>
          </div>

          {/* Right Area: System Status, Notifications & User Dropdown */}
          <div className="flex items-center gap-3">
            
            {/* National Sync Status Indicator */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] text-white font-bold">
              <span className="w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
              <span>17 DERs Synchronisées</span>
            </div>

            {/* Profile Dropdown Trigger */}
            <div className="relative z-50">
              {currentUser ? (
                <div className="flex items-center gap-3 relative">
                  <button
                    onClick={() => setShowDropdown(!showDropdown)}
                    className="flex items-center gap-3 bg-slate-900 hover:bg-slate-800 px-3.5 py-2 rounded-2xl border border-slate-700 transition-all text-left cursor-pointer shadow-lg text-white"
                  >
                    <div className="w-9 h-9 rounded-xl bg-sky-500 text-white font-black flex items-center justify-center text-xs shadow-md border border-sky-300/40">
                      {currentUser.prenom ? currentUser.prenom.charAt(0).toUpperCase() : 'A'}
                    </div>
                    <div className="hidden sm:block">
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <span>{currentUser.prenom} {currentUser.nom}</span>
                      </div>
                      <div className="text-[10px] text-sky-400 font-bold truncate max-w-[150px]">
                        {currentUser.role === 'ADMINISTRATEUR' ? 'Administration (Siège)' : (currentUser.der_nom || 'Agent SONABEL')}
                      </div>
                    </div>
                    <ChevronDown className={`w-4 h-4 text-sky-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Dropdown Menu */}
                  {showDropdown && (
                    <div className="absolute right-0 top-14 w-64 bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl py-2 z-50 text-white font-sans">
                      <div className="px-4 py-3 border-b border-slate-800">
                        <p className="text-[11px] text-sky-400 font-bold">Connecté en tant que</p>
                        <p className="text-xs font-extrabold text-white truncate">{currentUser.email}</p>
                        <div className="mt-1.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-slate-950 text-sky-400 border border-sky-400/40">
                          <Shield className="w-3 h-3 text-sky-400" />
                          <span>{currentUser.role}</span>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          setActiveTab('profile');
                          setShowDropdown(false);
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-slate-800 flex items-center gap-2.5 text-white hover:text-sky-300 cursor-pointer"
                      >
                        <User className="w-4 h-4 text-sky-400" />
                        <span>Mon Profil Agent</span>
                      </button>

                      {currentUser.role === 'ADMINISTRATEUR' && (
                        <button
                          onClick={() => {
                            setActiveTab('admin-users');
                            setShowDropdown(false);
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-slate-800 flex items-center gap-2.5 text-sky-400 hover:text-sky-300 cursor-pointer border-t border-slate-800/80"
                        >
                          <UserCheck className="w-4 h-4 text-sky-400" />
                          <span>Profils Utilisateurs</span>
                        </button>
                      )}

                      <button
                        onClick={() => {
                          setShowDropdown(false);
                          onLogout();
                        }}
                        className="w-full text-left px-4 py-2.5 text-xs font-bold hover:bg-slate-800 text-rose-400 hover:text-rose-300 flex items-center gap-2.5 border-t border-slate-800 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-400" />
                        <span>Se déconnecter</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : null}
            </div>

          </div>

        </div>

      </div>
    </header>
  );
}


