import React, { useState, useEffect } from 'react';
import Logo from '../components/Logo';
import { fetchWithAuth, setStoredToken, setStoredUser } from '../utils/auth';
import { 
  Eye, EyeOff, Lock, Mail, Phone, MapPin, Building2, ArrowRight, 
  ShieldCheck, RefreshCw, UserPlus, LogIn, TrendingUp, Map, Wrench, 
  Users, Shield, CheckCircle2, User, LogIn as LogInIcon
} from 'lucide-react';

const BURKINA_PROVINCES = [
  'Balé', 'Bam', 'Banwa', 'Bazèga', 'Bougouriba', 'Boulgou', 'Boulkiemdé', 'Comoé',
  'Ganzourgou', 'Gnagna', 'Gourma', 'Houet', 'Ioba', 'Kadiogo', 'Kénédougou',
  'Komondjari', 'Kompienga', 'Kossi', 'Koulpélogo', 'Kouritenga', 'Kourwéogo',
  'Léraba', 'Loroum', 'Mouhoun', 'Namentenga', 'Naouri', 'Nayala', 'Noumbiel',
  'Oubritenga', 'Oudalan', 'Passoré', 'Poni', 'Sanguié', 'Sanmatenga', 'Séno',
  'Sissili', 'Soum', 'Sourou', 'Tapoa', 'Tuy', 'Yagha', 'Yatenga', 'Ziro', 'Zondoma', 'Zoundwéogo'
].sort();

export default function AuthPage({ onAuthSuccess }) {
  const [activeAuthTab, setActiveAuthTab] = useState('login'); // 'login' | 'register'
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [ders, setDers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [registeredUserModalData, setRegisteredUserModalData] = useState(null);

  // Login Form state
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form state
  const [registerData, setRegisterData] = useState({
    nom: '',
    prenom: '',
    email: '',
    telephone: '+226 ',
    password: '',
    province: 'Kadiogo',
    der_id: '',
    role: 'UTILISATEUR'
  });

  // Password reset modal
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStep, setResetStep] = useState(1);
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');

  // Admin status state
  const [maxAdminsReached, setMaxAdminsReached] = useState(false);

  useEffect(() => {
    fetchWithAuth('/ders')
      .then(data => {
        setDers(data);
        if (data.length > 0) {
          setRegisterData(prev => ({ ...prev, der_id: data[0]?.id }));
        }
      })
      .catch(err => console.error('Error fetching DERs:', err));

    fetchWithAuth('/auth/admin-status')
      .then(res => {
        if (res && res.maxAdminsReached) {
          setMaxAdminsReached(true);
        }
      })
      .catch(err => console.error('Error checking admin status:', err));
  }, []);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const inputTrim = loginIdentifier.trim();
    if (inputTrim.includes('@')) {
      const lower = inputTrim.toLowerCase();
      if (!lower.endsWith('@gmail.com') && !lower.endsWith('@sonabel.bf')) {
        setErrorMsg('Seules les adresses Gmail (@gmail.com) ou SONABEL (@sonabel.bf) sont autorisées.');
        return;
      }
    }

    setLoading(true);

    try {
      const data = await fetchWithAuth('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          identifier: inputTrim,
          password: loginPassword
        })
      });

      setStoredToken(data.token);
      setStoredUser(data.user);
      onAuthSuccess(data.user);
    } catch (err) {
      setErrorMsg(err.message || 'Échec de la connexion. Vérifiez vos identifiants.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    const emailTrim = registerData.email.trim();
    const lower = emailTrim.toLowerCase();
    if (!lower.endsWith('@gmail.com') && !lower.endsWith('@sonabel.bf')) {
      setErrorMsg('Seules les adresses Gmail (@gmail.com) ou SONABEL (@sonabel.bf) sont autorisées sur le portail.');
      return;
    }

    if (registerData.role === 'ADMINISTRATEUR') {
      const minLength = registerData.password.length >= 8;
      const hasUpper = /[A-Z]/.test(registerData.password);
      const hasDigit = /[0-9]/.test(registerData.password);
      const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(registerData.password);
      if (!minLength || !hasUpper || !hasDigit || !hasSpecial) {
        setErrorMsg('Le mot de passe administrateur doit comporter au moins 8 caractères, incluant au moins 1 majuscule, 1 chiffre et 1 caractère spécial.');
        return;
      }
    } else {
      if (registerData.password.length < 6) {
        setErrorMsg('Le mot de passe utilisateur doit comporter au moins 6 caractères.');
        return;
      }
    }

    setLoading(true);

    try {
      const payload = { ...registerData, email: emailTrim };
      if (registerData.role === 'ADMINISTRATEUR') {
        payload.province = 'Siège National';
        payload.der_id = ders.length > 0 ? ders[0].id : 5;
      }

      const data = await fetchWithAuth('/auth/register', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setStoredToken(data.token);
      setStoredUser(data.user);
      
      setRegisteredUserModalData(data.user);
    } catch (err) {
      setErrorMsg(err.message || 'Échec de l\'inscription.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmModalAccess = () => {
    if (registeredUserModalData) {
      onAuthSuccess(registeredUserModalData);
    }
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const data = await fetchWithAuth('/auth/forgot-password', {
        method: 'POST',
        body: JSON.stringify({ email: resetEmail })
      });
      setResetToken(data.resetToken);
      setSuccessMsg(data.message);
      setResetStep(2);
    } catch (err) {
      setErrorMsg(err.message || 'Adresse email introuvable.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmReset = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLoading(true);

    try {
      const data = await fetchWithAuth('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({ resetToken, newPassword })
      });
      setSuccessMsg(data.message);
      setTimeout(() => {
        setShowResetModal(false);
        setResetStep(1);
      }, 1200);
    } catch (err) {
      setErrorMsg(err.message || 'Échec de la réinitialisation.');
    } finally {
      setLoading(false);
    }
  };

  const selectedDerObj = ders.find(d => d.id === parseInt(registerData.der_id, 10));

  return (
    <div className="min-h-screen w-full relative flex flex-col lg:flex-row overflow-hidden font-sans">
      
      {/* ================= LEFT PANE: HIGH VOLTAGE GRID & SLOGAN ================= */}
      <div className="lg:w-1/2 relative min-h-[420px] lg:min-h-screen flex flex-col justify-between p-8 sm:p-12 lg:p-14 text-white">
        
        {/* Background Image: Electric Grid (Bright & Clear) */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0"
          style={{ backgroundImage: `url('/bg_agent_black.jpg')` }}
        />
        {/* Light Overlay to show crisp electric grid */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#03152E]/65 via-[#0B2545]/50 to-[#13315C]/40 z-0" />

        {/* Top Section: Script Slogan */}
        <div className="relative z-10 space-y-2">
          <h2 className="font-slogan text-3xl sm:text-4xl lg:text-5xl text-white font-bold leading-none tracking-wide drop-shadow-md">
            L'énergie au service <br className="hidden sm:inline" /> du développement
          </h2>
          <div className="w-32 h-1 bg-sky-400 rounded-full" />
        </div>

        {/* Middle Section: 4 Key Bullet Highlights with Icon Circles */}
        <div className="relative z-10 space-y-6 my-8 max-w-lg">
          
          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-full bg-slate-900/90 border border-sky-400/50 backdrop-blur-md flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform">
              <TrendingUp className="w-6 h-6 text-sky-400 stroke-[2.2]" />
            </div>
            <span className="text-sm sm:text-base font-bold text-white tracking-tight">
              Suivi en temps réel des activités
            </span>
          </div>

          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-full bg-slate-900/90 border border-sky-400/50 backdrop-blur-md flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform">
              <Map className="w-6 h-6 text-sky-400 stroke-[2.2]" />
            </div>
            <span className="text-sm sm:text-base font-bold text-white tracking-tight">
              Pilotage des 14 régions
            </span>
          </div>

          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-full bg-slate-900/90 border border-sky-400/50 backdrop-blur-md flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform">
              <Wrench className="w-6 h-6 text-sky-400 stroke-[2.2]" />
            </div>
            <span className="text-sm sm:text-base font-bold text-white tracking-tight">
              Gestion des interventions et maintenances
            </span>
          </div>

          <div className="flex items-center gap-4 group">
            <div className="w-12 h-12 rounded-full bg-slate-900/90 border border-sky-400/50 backdrop-blur-md flex items-center justify-center shrink-0 shadow-lg group-hover:scale-105 transition-transform">
              <Users className="w-6 h-6 text-sky-400 stroke-[2.2]" />
            </div>
            <span className="text-sm sm:text-base font-bold text-white tracking-tight">
              Rapports automatiques et tableaux de bord
            </span>
          </div>

        </div>

        {/* Bottom Section: Glass Security Badge */}
        <div className="relative z-10 pt-4">
          <div className="bg-slate-900/80 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 sm:p-5 flex items-start gap-4 max-w-md shadow-2xl">
            <div className="w-10 h-10 rounded-xl bg-sky-500/20 border border-sky-400/40 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-6 h-6 text-sky-400" />
            </div>
            <p className="text-xs sm:text-sm text-white font-semibold leading-relaxed">
              Une plateforme fiable, sécurisée et performante pour une meilleure qualité de service.
            </p>
          </div>
        </div>

      </div>

      {/* ================= RIGHT PANE: ELECTRIC GRID & CENTERED FLOATING CARD ================= */}
      <div className="lg:w-1/2 relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 my-auto overflow-y-auto">
        
        {/* Background Image: Electric Grid (Bright & Clear) */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 scale-x-[-1]"
          style={{ backgroundImage: `url('/bg_agent_black.jpg')` }}
        />
        {/* Light Overlay matching pane 1 design (No Blur for max clarity) */}
        <div className="absolute inset-0 bg-gradient-to-l from-[#03152E]/60 via-[#0B2545]/45 to-[#13315C]/35 z-0" />

        {/* CENTERED FLOATING CRISP DARK CARD */}
        <div className="relative z-10 w-full max-w-md bg-[#0B192C]/95 rounded-3xl shadow-2xl p-6 sm:p-10 border border-slate-700/80 text-white font-sans transform transition-all duration-300 mx-auto my-auto flex flex-col justify-center backdrop-blur-xl">
          
          {/* Top Logo Container */}
          <div className="flex flex-col items-center text-center mb-6">
            <div className="mb-4">
              <Logo size="xl" showText={true} layout="vertical" />
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-2">
              Plateforme intégrée de pilotage
            </h1>
            <p className="text-xs sm:text-sm text-sky-400 font-extrabold mt-1">
              Connexion à votre espace SONABEL
            </p>
          </div>

          {/* Mode Switcher Tabs (Connexion / Inscription) */}
          <div className="bg-slate-950 p-1.5 rounded-2xl flex items-center mb-6 border border-slate-800 shadow-inner">
            <button
              type="button"
              onClick={() => { setActiveAuthTab('login'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeAuthTab === 'login'
                  ? 'bg-sky-500 text-white shadow-md ring-1 ring-sky-300'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <LogInIcon className="w-3.5 h-3.5" />
              <span>Connexion</span>
            </button>
            <button
              type="button"
              onClick={() => { setActiveAuthTab('register'); setErrorMsg(''); setSuccessMsg(''); }}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                activeAuthTab === 'register'
                  ? 'bg-sky-500 text-white shadow-md ring-1 ring-sky-300'
                  : 'text-slate-300 hover:text-white'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Inscription Agent</span>
            </button>
          </div>

          {/* Feedback Alert Messages */}
          {errorMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-red-900/90 border border-red-700 text-white text-xs font-bold flex items-center gap-2 shadow">
              <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0 animate-pulse" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-900/90 border border-emerald-700 text-white text-xs font-bold flex items-center gap-2 shadow">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ================= TAB 1: CONNEXION ================= */}
          {activeAuthTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              
              <div>
                <label className="block text-xs font-black text-white mb-1.5">
                  Identifiant / Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-sky-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="Votre identifiant ou adresse e-mail"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 text-white border border-slate-700 rounded-xl text-xs font-bold placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all shadow-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-white mb-1.5">
                  Mot de passe
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-sky-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Votre mot de passe"
                    className="w-full pl-10 pr-10 py-3 bg-slate-950 text-white border border-slate-700 rounded-xl text-xs font-bold placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 transition-all shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 p-1 text-sky-400 hover:text-sky-300 rounded-lg cursor-pointer"
                    title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Checkbox & Forgot Password Link */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-white font-bold select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 text-sky-400 focus:ring-sky-400 w-4 h-4 cursor-pointer"
                  />
                  <span>Se souvenir de moi</span>
                </label>

                <button
                  type="button"
                  onClick={() => setShowResetModal(true)}
                  className="font-extrabold text-sky-400 hover:text-sky-300 hover:underline cursor-pointer"
                >
                  Mot de passe oublié?
                </button>
              </div>

              {/* Primary Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="btn-pro-cyan w-full mt-2 py-3.5 px-5 text-sm rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer transform active:scale-[0.99]"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    <span>Se connecter</span>
                  </>
                )}
              </button>

            </form>
          )}

          {/* ================= TAB 2: INSCRIPTION AGENT ================= */}
          {activeAuthTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-black text-white mb-1">Nom</label>
                  <input
                    type="text"
                    required
                    value={registerData.nom}
                    onChange={(e) => setRegisterData({ ...registerData, nom: e.target.value })}
                    placeholder="OUEDRAOGO"
                    className="w-full px-3 py-2.5 bg-slate-950 text-white border border-slate-700 rounded-xl font-bold outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-white mb-1">Prénom</label>
                  <input
                    type="text"
                    required
                    value={registerData.prenom}
                    onChange={(e) => setRegisterData({ ...registerData, prenom: e.target.value })}
                    placeholder="Salif"
                    className="w-full px-3 py-2.5 bg-slate-950 text-white border border-slate-700 rounded-xl font-bold outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-white mb-1">Email Gmail ou SONABEL</label>
                <input
                  type="email"
                  required
                  value={registerData.email}
                  onChange={(e) => setRegisterData({ ...registerData, email: e.target.value })}
                  placeholder="agent@gmail.com ou agent@sonabel.bf"
                  className="w-full px-3 py-2.5 bg-slate-950 text-white border border-slate-700 rounded-xl font-bold outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-black text-white mb-1">Téléphone</label>
                  <input
                    type="text"
                    required
                    value={registerData.telephone}
                    onChange={(e) => setRegisterData({ ...registerData, telephone: e.target.value })}
                    placeholder="+226 70123456"
                    className="w-full px-3 py-2.5 bg-slate-950 text-white border border-slate-700 rounded-xl font-bold outline-none focus:ring-2 focus:ring-sky-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-black text-white mb-1">Rôle</label>
                  <select
                    value={registerData.role}
                    onChange={(e) => setRegisterData({ ...registerData, role: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-950 text-white border border-slate-700 rounded-xl font-black outline-none focus:ring-2 focus:ring-sky-400"
                  >
                    <option value="UTILISATEUR">Utilisateur Agent</option>
                    {!maxAdminsReached && (
                      <option value="ADMINISTRATEUR">Administrateur</option>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-black text-white mb-1">Mot de passe</label>
                <input
                  type="password"
                  required
                  value={registerData.password}
                  onChange={(e) => setRegisterData({ ...registerData, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-3 py-2.5 bg-slate-950 text-white border border-slate-700 rounded-xl font-bold outline-none focus:ring-2 focus:ring-sky-400"
                />
              </div>

              {registerData.role !== 'ADMINISTRATEUR' && (
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-xs font-black text-white mb-1">Province</label>
                    <select
                      value={registerData.province}
                      onChange={(e) => setRegisterData({ ...registerData, province: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-950 text-white border border-slate-700 rounded-xl font-bold outline-none focus:ring-2 focus:ring-sky-400 text-xs"
                    >
                      {BURKINA_PROVINCES.map((prov) => (
                        <option key={prov} value={prov}>{prov}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-black text-white mb-1">DER (Direction)</label>
                    <select
                      value={registerData.der_id}
                      onChange={(e) => setRegisterData({ ...registerData, der_id: e.target.value })}
                      className="w-full px-3 py-2.5 bg-slate-950 text-white border border-slate-700 rounded-xl font-bold outline-none focus:ring-2 focus:ring-sky-400 text-xs"
                    >
                      {ders.map((der) => (
                        <option key={der.id} value={der.id}>{der.nom}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-pro-cyan w-full mt-2 py-3 px-4 text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <>
                    <UserPlus className="w-4 h-4" />
                    <span>S'inscrire</span>
                  </>
                )}
              </button>
            </form>
          )}

          {/* Secondary Security Banner Box */}
          <div className="mt-5 p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center gap-2 text-xs font-black text-sky-400">
            <ShieldCheck className="w-4 h-4 text-sky-400 shrink-0" />
            <span>Accès réservé aux personnels habilités SONABEL</span>
          </div>

          {/* Footer Details */}
          <div className="mt-6 pt-4 border-t border-slate-800 text-center text-slate-300 text-[11px] space-y-1 font-extrabold">
            <div className="flex items-center justify-center gap-2 text-sky-400 font-black uppercase tracking-wider text-[10px]">
              <span>—— SONABEL ——</span>
            </div>
            <p className="text-white font-bold">Société Nationale d'Électricité du Burkina</p>
            <p className="text-sky-400">© 2026 SONABEL - Tous droits réservés</p>
          </div>

        </div>

      </div>

      {/* REGISTRATION SUCCESS MODAL */}
      {registeredUserModalData && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0B192C] rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-700 font-sans text-center relative text-white">
            <div className="w-16 h-16 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center mb-3">
              <CheckCircle2 className="w-8 h-8 stroke-[2.5]" />
            </div>

            <h3 className="text-lg font-black text-white">
              Bienvenue sur la Plateforme SONABEL !
            </h3>
            
            <p className="text-xs text-slate-300 font-medium mt-1 mb-5">
              Votre compte agent a été créé avec succès.
            </p>

            <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-left text-xs space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Agent :</span>
                <span className="font-bold text-white">{registeredUserModalData.prenom} {registeredUserModalData.nom}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Email :</span>
                <span className="font-bold text-sky-400">{registeredUserModalData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Rôle :</span>
                <span className="font-bold text-white">{registeredUserModalData.role}</span>
              </div>
            </div>

            <button
              onClick={handleConfirmModalAccess}
              className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs rounded-xl shadow-lg flex items-center justify-center gap-2 cursor-pointer border border-emerald-400"
            >
              <span>Accéder à mon espace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* RESET PASSWORD MODAL */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#0B192C] rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-700 font-sans text-white">
            <h3 className="text-sm font-bold text-white mb-1">Réinitialisation du mot de passe</h3>
            <p className="text-xs text-slate-300 mb-4">Entrez votre adresse email Gmail ou SONABEL.</p>

            {resetStep === 1 ? (
              <form onSubmit={handleRequestReset} className="space-y-3 text-xs">
                <input
                  type="email"
                  required
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  placeholder="votre.email@gmail.com"
                  className="w-full px-3.5 py-2.5 bg-slate-950 text-white border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-sky-400"
                />
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setShowResetModal(false)} className="flex-1 py-2.5 font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600">Annuler</button>
                  <button type="submit" disabled={loading} className="btn-pro-cyan flex-1 py-2.5 rounded-xl">Continuer</button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleConfirmReset} className="space-y-3 text-xs">
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Nouveau mot de passe"
                  className="w-full px-3.5 py-2.5 bg-slate-950 text-white border border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-sky-400"
                />
                <div className="flex gap-2 pt-2">
                  <button type="button" onClick={() => setShowResetModal(false)} className="flex-1 py-2.5 font-bold text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-600">Fermer</button>
                  <button type="submit" disabled={loading} className="btn-pro-cyan flex-1 py-2.5 rounded-xl">Enregistrer</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
