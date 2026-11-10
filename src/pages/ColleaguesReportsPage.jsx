import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../utils/auth';
import { exportReportToPDF } from '../utils/exportPdf';
import { exportReportToDocx } from '../utils/exportDocx';
import YearSelector from '../components/YearSelector';
import { Users, Building2, Filter, Eye, FileDown, Calendar, Search, RefreshCw, X, ShieldAlert, ArrowLeft, Edit, Save } from 'lucide-react';

export default function ColleaguesReportsPage({ currentUser, onNavigate }) {
  const currentYearStr = new Date().getFullYear().toString();
  const [reports, setReports] = useState([]);
  const [ders, setDers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [filterYear, setFilterYear] = useState(currentYearStr);
  const [filterDer, setFilterDer] = useState('');
  const [filterWeek, setFilterWeek] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  // Selected Report Modal
  const [selectedReport, setSelectedReport] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editFormData, setEditFormData] = useState(null);
  const [savingEdit, setSavingEdit] = useState(false);
  const [editMsg, setEditMsg] = useState({ type: '', text: '' });

  const calculateDays = (start, end) => {
    if (!start || !end) return 0;
    const d1 = new Date(start);
    const d2 = new Date(end);
    if (isNaN(d1) || isNaN(d2)) return 0;
    const diffTime = d2 - d1;
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return diffDays >= 0 ? diffDays : 0;
  };

  const formatDateDisplay = (dateStr) => {
    if (!dateStr) return '';
    const parts = dateStr.split('-');
    if (parts.length === 3) return `${parts[2]}/${parts[1]}/${parts[0]}`;
    return dateStr;
  };

  useEffect(() => {
    fetchWithAuth('/ders')
      .then(setDers)
      .catch(err => console.error('Error fetching DERs:', err));
  }, []);

  const loadColleaguesReports = () => {
    setLoading(true);
    let query = `/reports/colleagues?`;
    if (filterYear) query += `year=${filterYear}&`;
    if (filterDer) query += `der_id=${filterDer}&`;
    if (filterWeek) query += `week=${filterWeek}&`;
    if (filterStatus) query += `status=${filterStatus}&`;

    fetchWithAuth(query)
      .then(setReports)
      .catch(err => console.error('Error loading colleagues reports:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadColleaguesReports();
  }, [filterDer, filterWeek, filterStatus, filterYear]);

  const handleOpenDetail = (report, editMode = false) => {
    setSelectedReport(report);
    setIsEditing(editMode);
    setEditFormData({
      rencontres_texte: report.rencontres_texte || '',
      facturation_mois: report.facturation_mois || '',
      facturation_nb: report.facturation_nb || 0,
      int_config_pc: report.int_config_pc || 0,
      int_dep_pc: report.int_dep_pc || 0,
      int_config_imp: report.int_config_imp || 0,
      int_dep_imp: report.int_dep_imp || 0,
      int_dep_reseau: report.int_dep_reseau || 0,
      int_config_log: report.int_config_log || 0,
      divers_texte: report.divers_texte || '',
      nb_sites: report.nb_sites || 0,
      maintenance_programmee: report.maintenance_programmee || 0,
      maintenance_effectuee: report.maintenance_effectuee || 0,
      maintenance_obs: report.maintenance_obs || '',
      missions: report.missions ? [...report.missions] : []
    });
    setEditMsg({ type: '', text: '' });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    setSavingEdit(true);
    setEditMsg({ type: '', text: '' });

    try {
      const updated = await fetchWithAuth(`/reports/${selectedReport.id}`, {
        method: 'PUT',
        body: JSON.stringify(editFormData)
      });

      setEditMsg({ type: 'success', text: updated.message });
      setIsEditing(false);
      loadColleaguesReports();
    } catch (err) {
      setEditMsg({ type: 'error', text: err.message || 'Erreur lors de la modification du rapport.' });
    } finally {
      setSavingEdit(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
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

      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#03152E] via-[#0B2545] to-[#13315C] rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-blue-900/50 relative overflow-hidden">
        {/* Background Image: Electric Grid */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-45 z-0 pointer-events-none"
          style={{ backgroundImage: `url('/bg_electric_grid.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#03152E]/80 via-[#0B2545]/75 to-[#13315C]/70 z-0 pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black bg-sky-500/20 text-sky-300 border border-sky-400/40 mb-3">
              <ShieldAlert className="w-4 h-4 text-sky-400" />
              <span>{currentUser?.role === 'ADMINISTRATEUR' ? 'Accès Administrateur (Consultation & Modification)' : 'Consultation des Rapports Régionaux'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3 tracking-tight">
              <Users className="w-8 h-8 text-sky-400" />
              <span>Rapports des Collègues (17 DERs)</span>
            </h1>
            <p className="font-slogan text-xl text-sky-300 font-bold mt-1">
              L'énergie au service du développement
            </p>
          </div>

          <div className="text-xs text-right bg-slate-900/80 p-4 rounded-2xl border border-slate-700/80 shadow-inner">
            <span className="text-sky-400 font-bold">Rapports accessibles : </span>
            <strong className="text-white font-black text-base">{reports.length}</strong>
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-slate-900/70 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-slate-700/60 mb-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-sm font-extrabold text-white">
            <Filter className="w-4 h-4 text-sky-400" />
            <span>Filtres Région & Agent :</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <YearSelector
              value={filterYear}
              onChange={setFilterYear}
              label="Année"
            />

            <select
              value={filterDer}
              onChange={(e) => setFilterDer(e.target.value)}
              className="px-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs font-semibold text-white outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer max-w-[220px]"
            >
              <option value="">Toutes les 17 DERs</option>
              {ders.map(d => (
                <option key={d.id} value={d.id}>
                  {d.nom}
                </option>
              ))}
            </select>

            <input
              type="text"
              placeholder="Filtre semaine (W35)..."
              value={filterWeek}
              onChange={(e) => setFilterWeek(e.target.value)}
              className="px-4 py-2.5 bg-slate-950/80 border border-slate-700 rounded-xl text-xs font-semibold text-white outline-none focus:ring-2 focus:ring-sky-400 placeholder:text-slate-400"
            />

            {(filterDer || filterWeek || filterStatus || filterYear !== currentYearStr) && (
              <button
                onClick={() => { setFilterDer(''); setFilterWeek(''); setFilterStatus(''); setFilterYear(currentYearStr); }}
                className="px-3 py-2 text-xs font-bold text-sky-400 hover:text-sky-300 bg-slate-800 rounded-xl cursor-pointer"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      {loading ? (
        <div className="text-center py-16">
          <RefreshCw className="w-8 h-8 text-sky-400 animate-spin mx-auto mb-2" />
          <p className="text-xs text-slate-300 font-bold">Chargement des rapports des collègues...</p>
        </div>
      ) : reports.length === 0 ? (
        <div className="bg-slate-900/70 backdrop-blur-md rounded-3xl p-12 text-center shadow-2xl border border-slate-700/60">
          <Users className="w-12 h-12 text-slate-500 mx-auto mb-3" />
          <h3 className="text-base font-bold text-white">Aucun rapport trouvé</h3>
          <p className="text-xs text-slate-300 mt-1">Aucun rapport de collègue disponible pour la sélection actuelle.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reports.map((report) => {
            const totalInt = (report.int_config_pc || 0) + (report.int_dep_pc || 0) + (report.int_config_imp || 0) + 
                             (report.int_dep_imp || 0) + (report.int_dep_reseau || 0) + (report.int_config_log || 0);

            return (
              <div
                key={report.id}
                className="bg-slate-900/70 backdrop-blur-md rounded-3xl p-6 shadow-2xl border border-slate-700/60 hover:border-sky-400/50 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-sky-500/20 text-sky-300 border border-sky-400/40 rounded-full text-xs font-extrabold flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-sky-400" />
                      <span>{report.semaine_code}</span>
                    </span>

                    <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 rounded-md text-[11px] font-extrabold border border-blue-400/40">
                      {report.der_nom}
                    </span>
                  </div>

                  <h3 className="font-extrabold text-white text-base mb-0.5">
                    {report.agent_nom || 'Agent SONABEL'}
                  </h3>
                  <p className="text-xs font-semibold text-slate-400 mb-3">
                    {report.agent_email}
                  </p>

                  <div className="bg-slate-950/80 rounded-2xl p-3 space-y-1.5 mb-6 border border-slate-800 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Interventions informatiques :</span>
                      <strong className="text-white font-bold">{totalInt}</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Factures traitées :</span>
                      <strong className="text-white font-bold">{report.facturation_nb || 0}</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Missions de terrain :</span>
                      <strong className="text-white font-bold">{report.missions?.length || 0}</strong>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenDetail(report, false)}
                      className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer border border-slate-700"
                    >
                      <Eye className="w-4 h-4 text-sky-400" />
                      <span>Consulter</span>
                    </button>

                    {currentUser?.role === 'ADMINISTRATEUR' && (
                      <button
                        onClick={() => handleOpenDetail(report, true)}
                        className="py-2.5 px-3 bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-sky-500/20"
                      >
                        <Edit className="w-4 h-4" />
                        <span>Modifier</span>
                      </button>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => exportReportToPDF(report)}
                      className="flex-1 py-2 bg-red-950/60 hover:bg-red-900/80 text-red-300 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 border border-red-500/40 transition-all cursor-pointer shadow-sm"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>PDF</span>
                    </button>

                    <button
                      onClick={() => exportReportToDocx(report)}
                      className="flex-1 py-2 bg-blue-950/60 hover:bg-blue-900/80 text-blue-300 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1 border border-blue-500/40 transition-all cursor-pointer shadow-sm"
                    >
                      <FileDown className="w-3.5 h-3.5" />
                      <span>Word</span>
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL & EDIT MODAL */}
      {selectedReport && (
        <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0B192C] backdrop-blur-xl rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-700 my-8 text-white">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-4 mb-6">
              <div>
                <span className="text-xs font-black text-sky-300 bg-sky-500/20 px-3 py-1 rounded-full border border-sky-400/40">
                  Semaine {selectedReport.semaine_code}
                </span>
                <h2 className="text-lg font-extrabold text-white mt-2">
                  {selectedReport.agent_nom} ({selectedReport.der_nom})
                </h2>
              </div>

              <button
                onClick={() => setSelectedReport(null)}
                className="p-2 text-sky-400 hover:text-white rounded-full hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {editMsg.text && (
              <div className={`mb-6 p-4 rounded-2xl border text-xs font-semibold ${
                editMsg.type === 'success' ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40' : 'bg-red-500/20 text-red-300 border-red-400/40'
              }`}>
                {editMsg.text}
              </div>
            )}

            {!isEditing ? (
              <div className="space-y-6 text-xs text-slate-200">
                <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-slate-400 font-medium">Agent créateur :</p>
                    <p className="font-bold text-white">{selectedReport.agent_nom}</p>
                  </div>
                  <div>
                    <p className="text-slate-400 font-medium">Direction Régionale :</p>
                    <p className="font-bold text-white">{selectedReport.der_nom}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-bold uppercase text-sky-300 mb-1">1. Rencontres & Réunions</h4>
                  <p className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-slate-200">
                    {selectedReport.rencontres_texte || 'Aucune réunion spécifiée.'}
                  </p>
                </div>

                {/* REQUIREMENT 5 DISPLAY: Date de début à Date de fin (X jours) */}
                <div>
                  <h4 className="font-bold uppercase text-sky-300 mb-1">Missions de terrain ({selectedReport.missions?.length || 0})</h4>
                  {selectedReport.missions?.length > 0 ? (
                    <div className="space-y-2">
                      {selectedReport.missions.map((m, i) => {
                        const mStart = m.date_debut || m.date_mission;
                        const mEnd = m.date_fin || mStart;
                        const days = calculateDays(mStart, mEnd);
                        const displayRange = `${formatDateDisplay(mStart)} à ${formatDateDisplay(mEnd)} (${days} jour${days > 1 ? 's' : ''})`;

                        return (
                          <div key={i} className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                            <div>
                              <p className="font-bold text-white">{m.lieu}</p>
                              <p className="text-slate-300">{m.objet}</p>
                            </div>
                            <span className="px-2.5 py-1 bg-sky-500/20 text-sky-300 border border-sky-400/40 rounded-lg text-[11px] font-extrabold shrink-0">
                              « {displayRange} »
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  ) : <p className="text-slate-400 italic">Aucune mission enregistrée.</p>}
                </div>

                <div>
                  <h4 className="font-bold uppercase text-sky-300 mb-1">2. Facturation</h4>
                  <p className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-slate-200">
                    Mois concerné : <strong className="text-white">{selectedReport.facturation_mois}</strong> | Factures : <strong className="text-sky-300">{selectedReport.facturation_nb}</strong>
                  </p>
                </div>

                <div>
                  <h4 className="font-bold uppercase text-sky-300 mb-1">3. Interventions Techniques</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-slate-300">
                    <div>Config PC : <strong className="text-white">{selectedReport.int_config_pc}</strong></div>
                    <div>Dép. PC : <strong className="text-white">{selectedReport.int_dep_pc}</strong></div>
                    <div>Config Imp. : <strong className="text-white">{selectedReport.int_config_imp}</strong></div>
                    <div>Dép. Imp. : <strong className="text-white">{selectedReport.int_dep_imp}</strong></div>
                    <div>Dép. Réseau : <strong className="text-white">{selectedReport.int_dep_reseau}</strong></div>
                    <div>Config Log. : <strong className="text-white">{selectedReport.int_config_log}</strong></div>
                  </div>
                </div>

                {/* REQUIREMENT 4: DIVERS AS FREE TEXT */}
                <div>
                  <h4 className="font-bold uppercase text-sky-300 mb-1">4. Divers (Texte Libre)</h4>
                  <p className="bg-slate-950/80 p-3 rounded-xl border border-slate-800 text-slate-200">
                    {selectedReport.divers_texte || 'Aucune observation enregistrée.'}
                  </p>
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/60">
                  <button
                    onClick={() => setSelectedReport(null)}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer border border-slate-700"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Retour</span>
                  </button>
                  <button
                    onClick={() => exportReportToPDF(selectedReport)}
                    className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer border border-red-400"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>PDF</span>
                  </button>
                  <button
                    onClick={() => exportReportToDocx(selectedReport)}
                    className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md cursor-pointer border border-blue-400"
                  >
                    <FileDown className="w-4 h-4" />
                    <span>Word</span>
                  </button>
                  {currentUser?.role === 'ADMINISTRATEUR' && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer border border-sky-400 shadow-lg shadow-sky-500/25"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Modifier (Admin)</span>
                    </button>
                  )}
                </div>

              </div>
            ) : (
              /* EDIT MODE FORM FOR ADMIN */
              <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-black text-white mb-1 uppercase tracking-wider">Rencontres & Réunions</label>
                  <textarea
                    rows={3}
                    value={editFormData.rencontres_texte}
                    onChange={(e) => setEditFormData({ ...editFormData, rencontres_texte: e.target.value })}
                    className="w-full p-3 bg-slate-950/80 border border-slate-700 rounded-xl outline-none text-white focus:ring-2 focus:ring-sky-400 font-medium"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block font-black text-white mb-1 uppercase tracking-wider">Facturation (Mois)</label>
                    <input
                      type="text"
                      value={editFormData.facturation_mois}
                      onChange={(e) => setEditFormData({ ...editFormData, facturation_mois: e.target.value })}
                      className="w-full p-2.5 bg-slate-950/80 border border-slate-700 text-white rounded-xl font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block font-black text-white mb-1 uppercase tracking-wider">Nombre factures</label>
                    <input
                      type="number"
                      value={editFormData.facturation_nb}
                      onChange={(e) => setEditFormData({ ...editFormData, facturation_nb: e.target.value })}
                      className="w-full p-2.5 bg-slate-950/80 border border-slate-700 text-white rounded-xl font-semibold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                  <div>
                    <label className="block font-bold text-sky-300 uppercase text-[11px]">Config PC</label>
                    <input
                      type="number"
                      value={editFormData.int_config_pc}
                      onChange={(e) => setEditFormData({ ...editFormData, int_config_pc: e.target.value })}
                      className="w-full p-2 bg-slate-900 text-white border border-slate-700 rounded-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-sky-300 uppercase text-[11px]">Dép. PC</label>
                    <input
                      type="number"
                      value={editFormData.int_dep_pc}
                      onChange={(e) => setEditFormData({ ...editFormData, int_dep_pc: e.target.value })}
                      className="w-full p-2 bg-slate-900 text-white border border-slate-700 rounded-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-sky-300 uppercase text-[11px]">Config Imp.</label>
                    <input
                      type="number"
                      value={editFormData.int_config_imp}
                      onChange={(e) => setEditFormData({ ...editFormData, int_config_imp: e.target.value })}
                      className="w-full p-2 bg-slate-900 text-white border border-slate-700 rounded-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-sky-300 uppercase text-[11px]">Dép. Imp.</label>
                    <input
                      type="number"
                      value={editFormData.int_dep_imp}
                      onChange={(e) => setEditFormData({ ...editFormData, int_dep_imp: e.target.value })}
                      className="w-full p-2 bg-slate-900 text-white border border-slate-700 rounded-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-sky-300 uppercase text-[11px]">Dép. Réseau</label>
                    <input
                      type="number"
                      value={editFormData.int_dep_reseau}
                      onChange={(e) => setEditFormData({ ...editFormData, int_dep_reseau: e.target.value })}
                      className="w-full p-2 bg-slate-900 text-white border border-slate-700 rounded-lg font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-sky-300 uppercase text-[11px]">Config Log.</label>
                    <input
                      type="number"
                      value={editFormData.int_config_log}
                      onChange={(e) => setEditFormData({ ...editFormData, int_config_log: e.target.value })}
                      className="w-full p-2 bg-slate-900 text-white border border-slate-700 rounded-lg font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-black text-white mb-1 uppercase tracking-wider">Divers (Texte libre)</label>
                  <textarea
                    rows={3}
                    value={editFormData.divers_texte}
                    onChange={(e) => setEditFormData({ ...editFormData, divers_texte: e.target.value })}
                    className="w-full p-3 bg-slate-950/80 border border-slate-700 rounded-xl outline-none text-white focus:ring-2 focus:ring-sky-400 font-medium"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/60">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-slate-800 font-black text-white rounded-xl cursor-pointer hover:bg-slate-700 border border-slate-700"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={savingEdit}
                    className="px-6 py-2 bg-sky-500 hover:bg-sky-400 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer border border-sky-400 shadow-lg shadow-sky-500/25"
                  >
                    <Save className="w-4 h-4 text-white" />
                    <span>Enregistrer la modification</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
