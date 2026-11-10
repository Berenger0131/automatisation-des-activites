import React from 'react';
import Logo from './Logo';
import { LayoutDashboard, FilePlus, FileText, Users, UserCheck, User, LogOut, ChevronLeft, ChevronRight, Zap, ShieldCheck } from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, currentUser, onLogout, collapsed, setCollapsed }) {
  const navItems = [
    { id: 'new-report', label: 'Rédiger un rapport', icon: FilePlus, category: 'Activités' },
    { id: 'my-reports', label: 'Mes rapports', icon: FileText, category: 'Activités' },
    { id: 'colleagues-reports', label: 'Rapports des collègues (17 DERs)', icon: Users, category: 'Régions' },
  ];

  if (currentUser && currentUser.role === 'ADMINISTRATEUR') {
    navItems.unshift({ id: 'dashboard', label: 'Tableau de bord consolidé', icon: LayoutDashboard, category: 'Pilotage' });
    navItems.push({ id: 'admin-users', label: 'Profils Utilisateurs', icon: UserCheck, category: 'Administration' });
  } else {
    // Non-admin can also see dashboard summary if allowed or required
  }

  navItems.push({ id: 'profile', label: 'Mon Profil Agent', icon: User, category: 'Compte' });

  return (
    <aside
      className={`fixed top-0 left-0 bottom-0 z-40 bg-gradient-to-b from-[#0B192C] via-[#0F172A] to-[#09101D] text-white transition-all duration-300 flex flex-col justify-between border-r border-slate-800 shadow-2xl overflow-hidden ${
        collapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Background Image: Electric Grid */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-30 pointer-events-none z-0"
        style={{ backgroundImage: `url('/bg_electric_grid.jpg')` }}
      />

      {/* Top Branding Section */}
      <div className="relative z-10 flex flex-col flex-1 min-h-0 justify-between">
        <div>
          <div className="h-20 flex items-center justify-between px-4 border-b border-slate-800/80">
          {!collapsed ? (
            <div className="flex items-center cursor-pointer" onClick={() => setActiveTab(currentUser?.role === 'ADMINISTRATEUR' ? 'dashboard' : 'new-report')}>
              <Logo size="md" showText={true} />
            </div>
          ) : (
            <div className="mx-auto cursor-pointer" onClick={() => setActiveTab('new-report')}>
              <Logo size="sm" showText={false} />
            </div>
          )}

          {/* Toggle Expand / Collapse Button */}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-sky-400 hover:text-sky-300 transition-colors cursor-pointer border border-slate-700/60 hidden md:flex items-center justify-center"
            title={collapsed ? 'Agrandir le menu' : 'Réduire le menu'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* User Info Badge in Sidebar */}
        {!collapsed && currentUser && (
          <div className="p-4 mx-3 mt-4 rounded-2xl bg-slate-900/90 border border-slate-800/90 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-500 text-white font-black flex items-center justify-center text-xs shadow border border-sky-300/40 shrink-0">
              {currentUser.prenom ? currentUser.prenom.charAt(0).toUpperCase() : 'A'}
            </div>
            <div className="overflow-hidden text-left">
              <p className="text-xs font-black text-white truncate">{currentUser.prenom} {currentUser.nom}</p>
              <div className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-400 truncate">
                <ShieldCheck className="w-3 h-3 text-sky-400 shrink-0" />
                <span className="truncate">{currentUser.role === 'ADMINISTRATEUR' ? 'Administration (Siège)' : (currentUser.der_nom || 'Agent SONABEL')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Items */}
        <nav className="p-3 space-y-1.5 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-black transition-all cursor-pointer ${
                  isActive
                    ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25 ring-1 ring-sky-300'
                    : 'text-slate-200 hover:text-white hover:bg-slate-800/80'
                } ${collapsed ? 'justify-center px-0' : ''}`}
                title={collapsed ? item.label : ''}
              >
                <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-white' : 'text-sky-400'}`} />
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section - Logout & Slogan */}
      <div className="p-3 border-t border-slate-800/80 space-y-3">
        {!collapsed && (
          <div className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-[10px] text-sky-400 font-black flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 fill-sky-400 text-sky-400 shrink-0" />
            <span>« L'énergie au service du développement »</span>
          </div>
        )}

        <button
          onClick={onLogout}
          className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-black text-rose-400 hover:text-rose-300 hover:bg-slate-800 transition-all cursor-pointer ${
            collapsed ? 'justify-center px-0' : ''
          }`}
          title="Se déconnecter"
        >
          <LogOut className="w-5 h-5 shrink-0 text-rose-400" />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
      </div>
    </aside>
  );
}
