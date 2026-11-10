import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../utils/auth';
import { Users, Search, ShieldCheck, Eye, Edit, Save, RefreshCw, X, ArrowLeft, Mail, Phone, MapPin, Building2, UserCheck, AlertCircle, CheckCircle2 } from 'lucide-react';

const BURKINA_PROVINCES = [
  'Balé', 'Bam', 'Banwa', 'Bazèga', 'Bougouriba', 'Boulgou', 'Boulkiemdé', 'Comoé',
  'Ganzourgou', 'Gnagna', 'Gourma', 'Houet', 'Ioba', 'Kadiogo', 'Kénédougou',
  'Komondjari', 'Kompienga', 'Kossi', 'Koulpélogo', 'Kouritenga', 'Kourwéogo',
  'Léraba', 'Loroum', 'Mouhoun', 'Namentenga', 'Naouri', 'Nayala', 'Noumbiel',
  'Oubritenga', 'Oudalan', 'Passoré', 'Poni', 'Sanguié', 'Sanmatenga', 'Séno',
  'Sissili', 'Soum', 'Sourou', 'Tapoa', 'Tuy', 'Yagha', 'Yatenga', 'Ziro', 'Zondoma', 'Zoundwéogo'
].sort();

export default function AdminUsersPage({ currentUser, onNavigate }) {
  const [users, setUsers] = useState([]);
  const [ders, setDers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modals state
  const [viewingUser, setViewingUser] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editMsg, setEditMsg] = useState({ type: '', text: '' });

  const loadUsersAndDers = () => {
    setLoading(true);
    Promise.all([
      fetchWithAuth('/dashboard/users'),
      fetchWithAuth('/ders')
    ])
      .then(([usersData, dersData]) => {
        setUsers(usersData);
        setDers(dersData);
      })
      .catch(err => console.error('Error loading users or ders:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadUsersAndDers();
  }, []);

  const handleOpenEdit = (user) => {
    setEditingUser(user);
    setEditFormData({
      nom: user.nom || '',
      prenom: user.prenom || '',
      email: user.email || '',
      telephone: user.telephone || '',
      province: user.province || 'Kadiogo',
      der_id: user.der_id || '',
      role: user.role || 'UTILISATEUR'
    });
    setEditMsg({ type: '', text: '' });
  };

  const handleSaveUserEdit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    setEditMsg({ type: '', text: '' });

    try {
      const data = await fetchWithAuth(`/dashboard/users/${editingUser.id}`, {
        method: 'PUT',
        body: JSON.stringify(editFormData)
      });

      setEditMsg({ type: 'success', text: data.message });
      loadUsersAndDers();
      setTimeout(() => {
        setEditingUser(null);
      }, 1000);
    } catch (err) {
      setEditMsg({ type: 'error', text: err.message || 'Erreur lors de la modification du profil.' });
    } finally {
      setSavingEdit(false);
    }
  };

  const filteredUsers = users.filter(u => {
    const matchesSearch = !searchQuery || (
      (u.nom && u.nom.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.prenom && u.prenom.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.email && u.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.der_nom && u.der_nom.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (u.telephone && u.telephone.includes(searchQuery))
    );
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const adminCount = users.filter(u => u.role === 'ADMINISTRATEUR').length;

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Return Button */}
      <div>
        <button
          onClick={() => onNavigate && onNavigate('dashboard')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl border border-slate-700 transition-all shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-sky-400" />
          <span>Retour au Tableau de Bord</span>
        </button>
      </div>

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#03152E] via-[#0B2545] to-[#13315C] rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-blue-900/50">
        {/* Background Image: Electric Grid */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-45 z-0 pointer-events-none"
          style={{ backgroundImage: `url('/bg_electric_grid.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#03152E]/80 via-[#0B2545]/75 to-[#13315C]/70 z-0 pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black bg-sky-500/20 text-sky-300 border border-sky-400/40 mb-3">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>Gestion Administrative des Utilisateurs & Administrateurs</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3 tracking-tight">
              <UserCheck className="w-8 h-8 text-sky-400" />
              <span>Profils Utilisateurs & Administrateurs SONABEL</span>
            </h1>
            <p className="font-slogan text-xl text-sky-300 font-bold mt-1">
              L'énergie au service du développement
            </p>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/80 text-xs shrink-0 text-right">
            <span className="text-sky-400 font-bold">Comptes Administrateurs : </span>
            <span className="text-white font-black text-sm block mt-1">{adminCount} / 2 autorisés</span>
          </div>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-slate-900/70 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-slate-700/60">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-sky-400 absolute left-3.5 top-3.5 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher un agent par nom, prénom ou email..."
              className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700 rounded-2xl text-xs font-semibold text-white outline-none focus:ring-2 focus:ring-sky-400 placeholder:text-slate-400"
            />
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-4 py-3 bg-slate-950/80 border border-slate-700 rounded-2xl text-xs font-bold text-white outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer"
            >
              <option value="">Tous les rôles</option>
              <option value="UTILISATEUR">Utilisateurs</option>
              <option value="ADMINISTRATEUR">Administrateurs</option>
            </select>

            <button
              onClick={loadUsersAndDers}
              className="px-4 py-3 bg-[#0E223D] hover:bg-[#16345C] text-white border border-blue-500/30 font-bold text-xs rounded-2xl flex items-center gap-2 transition-all cursor-pointer shadow-lg"
            >
              <RefreshCw className={`w-4 h-4 text-white ${loading ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
          </div>

        </div>
      </div>

      {/* Users Table Card */}
      <div className="bg-slate-900/70 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-700/60">
        {loading ? (
          <div className="py-16 text-center text-xs font-bold text-sky-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-5 h-5 animate-spin text-sky-400" />
            <span>Chargement des comptes utilisateurs...</span>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="py-12 text-center text-slate-400 space-y-2">
            <Users className="w-12 h-12 text-sky-400/60 mx-auto" />
            <p className="text-sm font-bold text-white">Aucun utilisateur ne correspond à votre recherche.</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-700/80">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#0B192C]/90 text-white text-[11px] uppercase font-black border-b border-slate-700">
                  <th className="py-3.5 px-4 rounded-tl-xl">Agent (Nom & Prénom)</th>
                  <th className="py-3.5 px-4">Contact (Email & Tél)</th>
                  <th className="py-3.5 px-4">Direction Régionale (DER)</th>
                  <th className="py-3.5 px-4">Province</th>
                  <th className="py-3.5 px-4 text-center">Rôle</th>
                  <th className="py-3.5 px-4 text-center">Rapports</th>
                  <th className="py-3.5 px-4 text-right rounded-tr-xl">Actions Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-medium text-white bg-slate-900/60">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/60 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-sky-500 text-white font-black text-xs flex items-center justify-center shadow">
                          {u.prenom ? u.prenom.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div>
                          <span className="font-extrabold text-white block text-xs">{u.prenom} {u.nom}</span>
                          <span className="text-[10px] text-sky-400 font-bold">Inscrit le {new Date(u.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <p className="font-bold text-white">{u.email}</p>
                      <p className="text-sky-300 text-[11px] font-bold">{u.telephone || '-'}</p>
                    </td>

                    <td className="py-3.5 px-4 font-extrabold text-white">
                      {u.role === 'ADMINISTRATEUR' ? 'Aucune (Siège National)' : (u.der_nom || 'Non attribuée')}
                    </td>

                    <td className="py-3.5 px-4 text-white font-bold">
                      {u.province || '-'}
                    </td>

                    <td className="py-3.5 px-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black ${
                        u.role === 'ADMINISTRATEUR'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-center font-bold">
                      <span className="text-sky-400 font-black">{u.reports_count || 0} soumis</span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewingUser(u)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer border border-slate-700"
                          title="Consulter le profil"
                        >
                          <Eye className="w-3.5 h-3.5 text-sky-400" />
                          <span>Consulter</span>
                        </button>

                        <button
                          onClick={() => handleOpenEdit(u)}
                          className="px-3 py-1.5 bg-[#0E223D] hover:bg-[#16345C] text-white border border-blue-500/30 font-bold rounded-xl text-xs flex items-center gap-1 transition-all cursor-pointer shadow-md"
                          title="Modifier le profil utilisateur"
                        >
                          <Edit className="w-3.5 h-3.5 text-white" />
                          <span>Modifier</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VIEW USER PROFILE MODAL */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-700/80 font-sans relative text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-sky-500 text-white font-black text-xl flex items-center justify-center shadow">
                  {viewingUser.prenom ? viewingUser.prenom.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">
                    {viewingUser.prenom} {viewingUser.nom}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/40 mt-0.5">
                    <ShieldCheck className="w-3 h-3 text-sky-400" />
                    {viewingUser.role}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setViewingUser(null)}
                className="p-2 text-sky-400 hover:text-white rounded-full hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-sky-400 font-black uppercase">Adresse Email</p>
                    <p className="font-extrabold text-white">{viewingUser.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-sky-400 font-black uppercase">Numéro de Téléphone</p>
                    <p className="font-extrabold text-white">{viewingUser.telephone || 'Non renseigné'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-sky-400 font-black uppercase">Direction Régionale (DER)</p>
                    <p className="font-extrabold text-white">{viewingUser.der_nom || 'Non attribuée'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-sky-400 font-black uppercase">Province de résidence</p>
                    <p className="font-extrabold text-white">{viewingUser.province || 'Non renseignée'}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 text-center">
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-sky-400 font-bold block">Total Rapports</span>
                  <span className="text-xl font-black text-white">{viewingUser.reports_count || 0}</span>
                </div>
                <div className="bg-slate-950 text-white p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-emerald-400 font-bold block">À jour</span>
                  <span className="text-xl font-black text-white">{viewingUser.on_time_count || 0}</span>
                </div>
                <div className="bg-slate-950 text-white p-3 rounded-2xl border border-slate-800">
                  <span className="text-[10px] text-amber-400 font-bold block">En retard</span>
                  <span className="text-xl font-black text-white">{viewingUser.late_count || 0}</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between gap-3">
              <button
                onClick={() => {
                  const target = viewingUser;
                  setViewingUser(null);
                  handleOpenEdit(target);
                }}
                className="px-4 py-2 bg-[#0E223D] hover:bg-[#16345C] text-white border border-blue-500/30 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-lg cursor-pointer"
              >
                <Edit className="w-4 h-4 text-white" />
                <span>Modifier ce profil</span>
              </button>

              <button
                onClick={() => setViewingUser(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl text-xs cursor-pointer transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT USER PROFILE MODAL (ADMIN) */}
      {editingUser && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl border border-slate-700/80 font-sans my-8 text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div>
                <span className="text-xs font-black text-white bg-sky-500 px-2.5 py-1 rounded-md border border-sky-400">
                  Modification Administrateur
                </span>
                <h3 className="text-lg font-black text-white mt-2">
                  Modifier le profil de {editingUser.prenom} {editingUser.nom}
                </h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="p-2 text-sky-400 hover:text-white rounded-full hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editMsg.text && (
              <div className={`mb-6 p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
                editMsg.type === 'success' ? 'bg-slate-950 text-sky-400 border-sky-400/40' : 'bg-slate-950 text-rose-400 border-rose-500/40'
              }`}>
                {editMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-sky-400" /> : <AlertCircle className="w-4 h-4 text-rose-400" />}
                <span>{editMsg.text}</span>
              </div>
            )}

            <form onSubmit={handleSaveUserEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-sky-300 mb-1">Nom</label>
                  <input
                    type="text"
                    required
                    value={editFormData.nom}
                    onChange={(e) => setEditFormData({ ...editFormData, nom: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 text-white rounded-xl font-semibold outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-sky-300 mb-1">Prénom</label>
                  <input
                    type="text"
                    required
                    value={editFormData.prenom}
                    onChange={(e) => setEditFormData({ ...editFormData, prenom: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 text-white rounded-xl font-semibold outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-sky-300 mb-1">Adresse Email</label>
                  <input
                    type="email"
                    required
                    value={editFormData.email}
                    onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 text-white rounded-xl font-semibold outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
                <div>
                  <label className="block font-bold text-sky-300 mb-1">Numéro de Téléphone</label>
                  <input
                    type="text"
                    required
                    value={editFormData.telephone}
                    onChange={(e) => setEditFormData({ ...editFormData, telephone: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 text-white rounded-xl font-semibold outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-sky-300 mb-1">Province de résidence</label>
                  {editFormData.role === 'ADMINISTRATEUR' ? (
                    <input
                      type="text"
                      disabled
                      value="Siège National"
                      className="w-full px-3.5 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl font-bold text-sky-300 cursor-not-allowed"
                    />
                  ) : (
                    <select
                      value={editFormData.province}
                      onChange={(e) => setEditFormData({ ...editFormData, province: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 text-white rounded-xl font-semibold outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer"
                    >
                      {BURKINA_PROVINCES.map((p) => (
                        <option key={p} value={p}>{p}</option>
                      ))}
                    </select>
                  )}
                </div>

                <div>
                  <label className="block font-bold text-sky-300 mb-1">Direction Régionale (DER)</label>
                  {editFormData.role === 'ADMINISTRATEUR' ? (
                    <input
                      type="text"
                      disabled
                      value="Aucune (Siège National)"
                      className="w-full px-3.5 py-2.5 bg-slate-950/40 border border-slate-800 rounded-xl font-bold text-sky-300 cursor-not-allowed"
                    />
                  ) : (
                    <select
                      value={editFormData.der_id}
                      onChange={(e) => setEditFormData({ ...editFormData, der_id: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 text-white rounded-xl font-semibold outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer"
                    >
                      {ders.map((d) => (
                        <option key={d.id} value={d.id}>{d.nom}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>

              <div>
                <label className="block font-bold text-sky-300 mb-1">Rôle de l'utilisateur</label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-950/80 border border-slate-700 text-white rounded-xl font-bold outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer"
                >
                  <option value="UTILISATEUR">Utilisateur</option>
                  <option value="ADMINISTRATEUR">Administrateur</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2.5 bg-slate-800 font-bold text-white rounded-xl cursor-pointer hover:bg-slate-700 transition-all"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-6 py-2.5 bg-[#0E223D] hover:bg-[#16345C] text-white border border-blue-500/30 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-lg transition-all"
                >
                  {savingEdit ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-white" />
                  ) : (
                    <>
                      <Save className="w-4 h-4 text-white" />
                      <span>Enregistrer la modification</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
