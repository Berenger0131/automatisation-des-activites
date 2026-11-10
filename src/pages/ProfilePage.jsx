import React, { useState, useEffect } from 'react';
import { fetchWithAuth, setStoredUser } from '../utils/auth';
import { User, Mail, Phone, Building2, MapPin, Shield, Save, CheckCircle2, AlertCircle, RefreshCw, ArrowLeft, Award } from 'lucide-react';

const BURKINA_PROVINCES = [
  'Balé', 'Bam', 'Banwa', 'Bazèga', 'Bougouriba', 'Boulgou', 'Boulkiemdé', 'Comoé',
  'Ganzourgou', 'Gnagna', 'Gourma', 'Houet', 'Ioba', 'Kadiogo', 'Kénédougou',
  'Komondjari', 'Kompienga', 'Kossi', 'Koulpélogo', 'Kouritenga', 'Kourwéogo',
  'Léraba', 'Loroum', 'Mouhoun', 'Namentenga', 'Naouri', 'Nayala', 'Noumbiel',
  'Oubritenga', 'Oudalan', 'Passoré', 'Poni', 'Sanguié', 'Sanmatenga', 'Séno',
  'Sissili', 'Soum', 'Sourou', 'Tapoa', 'Tuy', 'Yagha', 'Yatenga', 'Ziro', 'Zondoma', 'Zoundwéogo'
].sort();

export default function ProfilePage({ currentUser, onUserUpdated, onNavigate }) {
  const [ders, setDers] = useState([]);
  const [annualStats, setAnnualStats] = useState(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const [formData, setFormData] = useState({
    nom: currentUser?.nom || '',
    prenom: currentUser?.prenom || '',
    email: currentUser?.email || '',
    telephone: currentUser?.telephone || '',
    province: currentUser?.province || 'Kadiogo',
    der_id: currentUser?.der_id || '',
    role: currentUser?.role || 'UTILISATEUR'
  });

  useEffect(() => {
    fetchWithAuth('/ders')
      .then(setDers)
      .catch(err => console.error('Error loading DERs:', err));

    fetchWithAuth('/reports/annual-stats')
      .then(setAnnualStats)
      .catch(err => console.error('Annual stats error:', err));

    fetchWithAuth('/profile')
      .then(profile => {
        setFormData({
          nom: profile.nom,
          prenom: profile.prenom,
          email: profile.email,
          telephone: profile.telephone,
          province: profile.province,
          der_id: profile.der_id,
          role: profile.role
        });
      })
      .catch(err => console.error('Profile fetch error:', err));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const data = await fetchWithAuth('/profile', {
        method: 'PUT',
        body: JSON.stringify(formData)
      });

      setStoredUser(data.user);
      onUserUpdated(data.user);
      setMessage({ type: 'success', text: 'Votre profil a été mis à jour avec succès !' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Erreur lors de la mise à jour du profil.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">

      {/* Return Button */}
      <div>
        <button
          onClick={() => onNavigate && onNavigate('new-report')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl border border-slate-700 transition-all shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-sky-400" />
          <span>Retour</span>
        </button>
      </div>

      {/* Profile Header Banner */}
      <div className="bg-gradient-to-r from-[#03152E] via-[#0B2545] to-[#13315C] rounded-3xl p-6 sm:p-8 text-white shadow-2xl relative overflow-hidden border border-blue-900/50">
        {/* Background Image: Electric Grid */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-45 z-0 pointer-events-none"
          style={{ backgroundImage: `url('/bg_agent_black.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#03152E]/80 via-[#0B2545]/75 to-[#13315C]/70 z-0 pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex flex-col sm:flex-row items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-sky-500 text-white font-black text-3xl flex items-center justify-center shadow-lg border-2 border-white/20 shrink-0">
              {currentUser?.prenom ? currentUser.prenom.charAt(0).toUpperCase() : 'A'}
            </div>

            <div className="text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
                <h1 className="text-2xl font-black text-white">
                  {formData.prenom} {formData.nom}
                </h1>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-sky-500/20 text-sky-300 border border-sky-400/40">
                  <Shield className="w-3.5 h-3.5 text-sky-400" />
                  {currentUser?.role === 'ADMINISTRATEUR' ? 'ADMINISTRATEUR' : 'UTILISATEUR AGENT'}
                </span>
              </div>

              <p className="font-slogan text-xl text-sky-300 font-bold mt-1">
                L'énergie au service du développement
              </p>

              <p className="text-xs text-sky-400 font-bold mt-2 flex items-center justify-center sm:justify-start gap-2">
                <Mail className="w-4 h-4 text-sky-400" />
                <span>{currentUser?.email}</span>
              </p>
            </div>
          </div>

          {/* Annual Realization Rate Indicator */}
          {annualStats && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 flex items-center gap-3 text-center sm:text-right shrink-0 shadow-inner">
              <div className="w-12 h-12 rounded-xl bg-sky-500 text-white flex items-center justify-center font-black text-base shadow border border-sky-300/40">
                {annualStats.rate_percentage}%
              </div>
              <div className="text-left">
                <span className="text-[10px] font-black uppercase tracking-wider text-sky-400 flex items-center gap-1">
                  <Award className="w-3.5 h-3.5 text-sky-400" />
                  <span>Taux Annuel</span>
                </span>
                <p className="text-xs text-white font-bold mt-0.5">
                  {annualStats.submitted_count} / {annualStats.expected_count} rapports
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Profile Edit Form Card */}
      <div className="bg-slate-900/70 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-700/60">
        <div className="border-b border-slate-700/60 pb-4 mb-6">
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <User className="w-5 h-5 text-sky-400" />
            <span>Informations Personnelles et Affectation</span>
          </h2>
          <p className="text-xs text-sky-400 font-bold mt-1">
            Mettez à jour vos coordonnées. {currentUser?.role === 'ADMINISTRATEUR' ? 'Un administrateur n\'est rattaché à aucune DER.' : 'Notez qu\'un agent ne peut être rattaché qu\'à une seule Direction Régionale (DER).'}
          </p>
        </div>

        {message.text && (
          <div className={`mb-6 p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
            message.type === 'success' 
              ? 'bg-slate-950 border-emerald-400/40 text-emerald-400' 
              : 'bg-slate-950 border-red-400/40 text-white'
          }`}>
            {message.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <AlertCircle className="w-4 h-4 text-red-400" />}
            <span>{message.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-sky-400 mb-2">
                Nom
              </label>
              <input
                type="text"
                required
                value={formData.nom}
                onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700 rounded-2xl text-xs font-semibold text-white focus:ring-2 focus:ring-sky-400 outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-sky-400 mb-2">
                Prénom
              </label>
              <input
                type="text"
                required
                value={formData.prenom}
                onChange={(e) => setFormData({ ...formData, prenom: e.target.value })}
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700 rounded-2xl text-xs font-semibold text-white focus:ring-2 focus:ring-sky-400 outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-sky-400 mb-2">
                Numéro de Téléphone (+226)
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-sky-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  required
                  value={formData.telephone}
                  onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700 rounded-2xl text-xs font-semibold text-white focus:ring-2 focus:ring-sky-400 outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-sky-400 mb-2">
                Adresse Email Gmail / SONABEL
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-sky-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700 rounded-2xl text-xs font-semibold text-white focus:ring-2 focus:ring-sky-400 outline-none"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-yellow-400 mb-2">
                Province de Résidence
              </label>
              <div className="relative">
                <MapPin className="w-4 h-4 text-yellow-400 absolute left-3.5 top-3.5" />
                {formData.role === 'ADMINISTRATEUR' ? (
                  <input
                    type="text"
                    disabled
                    value="Siège National"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/40 border border-slate-800 rounded-2xl text-xs font-bold text-yellow-400 cursor-not-allowed"
                  />
                ) : (
                  <select
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700 rounded-2xl text-xs font-semibold text-white focus:ring-2 focus:ring-yellow-400 outline-none"
                  >
                    {BURKINA_PROVINCES.map((p) => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-yellow-400 mb-2">
                Direction Régionale (DER)
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-yellow-400 absolute left-3.5 top-3.5" />
                {formData.role === 'ADMINISTRATEUR' ? (
                  <input
                    type="text"
                    disabled
                    value="Aucune (Administration Générale / Siège)"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/40 border border-slate-800 rounded-2xl text-xs font-bold text-yellow-400 cursor-not-allowed"
                  />
                ) : (
                  <select
                    value={formData.der_id}
                    onChange={(e) => setFormData({ ...formData, der_id: e.target.value })}
                    className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700 rounded-2xl text-xs font-semibold text-white focus:ring-2 focus:ring-yellow-400 outline-none"
                  >
                    {ders.map((d) => (
                      <option key={d.id} value={d.id}>
                        {d.nom}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </div>
          </div>

          {/* Role modification field for Admin */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-yellow-400 mb-2">
              Rôle de l'utilisateur
            </label>
            <div className="relative">
              <Shield className="w-4 h-4 text-yellow-400 absolute left-3.5 top-3.5" />
              {currentUser?.role === 'ADMINISTRATEUR' ? (
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700 rounded-2xl text-xs font-black text-white focus:ring-2 focus:ring-yellow-400 outline-none cursor-pointer"
                >
                  <option value="ADMINISTRATEUR">ADMINISTRATEUR (Siège)</option>
                  <option value="UTILISATEUR">UTILISATEUR AGENT</option>
                </select>
              ) : (
                <input
                  type="text"
                  disabled
                  value={formData.role}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/40 border border-slate-800 rounded-2xl text-xs font-bold text-yellow-400 cursor-not-allowed"
                />
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-slate-700/60 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="px-8 py-3 bg-[#0E223D] hover:bg-[#16345C] text-white border border-blue-500/30 font-black text-xs rounded-2xl shadow-xl flex items-center gap-2 transition-all cursor-pointer"
            >
              {saving ? (
                <RefreshCw className="w-4 h-4 animate-spin text-white" />
              ) : (
                <>
                  <Save className="w-4 h-4 text-yellow-400" />
                  <span>Enregistrer les modifications</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


