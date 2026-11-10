import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../utils/auth';
import YearSelector from '../components/YearSelector';
import { FilePlus, Plus, Trash2, Calendar, MapPin, CheckCircle, Clock, AlertTriangle, Send, RefreshCw, FileText, ArrowLeft, BarChart2, Building2, Zap, ShieldCheck } from 'lucide-react';

const MONTHS = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
];

const YEARS_2026_2100 = Array.from({ length: 2100 - 2026 + 1 }, (_, i) => (2026 + i).toString());

export default function NewReportPage({ currentUser, onReportCreated, onNavigate }) {
  const [availableWeeks, setAvailableWeeks] = useState([]);
  const [selectedSemaineCode, setSelectedSemaineCode] = useState('');
  const [selectedWeekInfo, setSelectedWeekInfo] = useState(null);
  const [loadingWeeks, setLoadingWeeks] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [msg, setMsg] = useState({ type: '', text: '' });

  // Form State
  const rencontresTextState = useState('');
  const rencontresText = rencontresTextState[0];
  const setRencontresText = rencontresTextState[1];
  
  const todayStr = new Date().toISOString().split('T')[0];
  const missionsState = useState([
    { lieu: '', date_debut: todayStr, date_fin: todayStr, objet: '' }
  ]);
  const missions = missionsState[0];
  const setMissions = missionsState[1];

  const facturationMoisState = useState(`${MONTHS[new Date().getMonth()]} ${new Date().getFullYear()}`);
  const facturationMois = facturationMoisState[0];
  const setFacturationMois = facturationMoisState[1];

  const facturationNbState = useState(0);
  const facturationNb = facturationNbState[0];
  const setFacturationNb = facturationNbState[1];

  const intConfigPcState = useState(0);
  const intConfigPc = intConfigPcState[0];
  const setIntConfigPc = intConfigPcState[1];

  const intDepPcState = useState(0);
  const intDepPc = intDepPcState[0];
  const setIntDepPc = intDepPcState[1];

  const intConfigImpState = useState(0);
  const intConfigImp = intConfigImpState[0];
  const setIntConfigImp = intConfigImpState[1];

  const intDepImpState = useState(0);
  const intDepImp = intDepImpState[0];
  const setIntDepImp = intDepImpState[1];

  const intDepReseauState = useState(0);
  const intDepReseau = intDepReseauState[0];
  const setIntDepReseau = intDepReseauState[1];

  const intConfigLogState = useState(0);
  const intConfigLog = intConfigLogState[0];
  const setIntConfigLog = intConfigLogState[1];

  const diversTexteState = useState('');
  const diversTexte = diversTexteState[0];
  const setDiversTexte = diversTexteState[1];

  const nbSitesState = useState(5);
  const nbSites = nbSitesState[0];
  const setNbSites = nbSitesState[1];

  const maintenanceProgrammeeState = useState(4);
  const maintenanceProgrammee = maintenanceProgrammeeState[0];
  const setMaintenanceProgrammee = maintenanceProgrammeeState[1];

  const maintenanceEffectueeState = useState(4);
  const maintenanceEffectuee = maintenanceEffectueeState[0];
  const setMaintenanceEffectuee = maintenanceEffectueeState[1];

  const maintenanceObsState = useState('');
  const maintenanceObs = maintenanceObsState[0];
  const setMaintenanceObs = maintenanceObsState[1];

  const realizationStatsState = useState([]);
  const realizationStats = realizationStatsState[0];
  const setRealizationStats = realizationStatsState[1];

  const loadingStatsState = useState(true);
  const loadingStats = loadingStatsState[0];
  const setLoadingStats = loadingStatsState[1];

  const selectedRealizationYearState = useState(new Date().getFullYear().toString());
  const selectedRealizationYear = selectedRealizationYearState[0];
  const setSelectedRealizationYear = selectedRealizationYearState[1];

  const availableYearsState = useState([new Date().getFullYear().toString()]);
  const availableYears = availableYearsState[0];
  const setAvailableYears = availableYearsState[1];

  const loadRealizationTable = (targetYear = selectedRealizationYear) => {
    setLoadingStats(true);
    fetchWithAuth('/ders')
      .then((dersData) => {
        return fetchWithAuth('/reports/colleagues?').then(colleagues => {
          return fetchWithAuth('/reports/my?').then(myReports => {
            const allReports = [...myReports, ...colleagues];

            // Extract unique available years from reports
            const yearsSet = new Set(allReports.map(r => r.semaine_code.split('-')[0]).filter(Boolean));
            yearsSet.add(new Date().getFullYear().toString());
            const sortedYears = Array.from(yearsSet).sort().reverse();
            setAvailableYears(sortedYears);

            // Filter reports by selected year
            const filteredReports = allReports.filter(r => r.semaine_code && r.semaine_code.startsWith(targetYear));

            const stats = dersData.map((der, idx) => {
              const derReports = filteredReports.filter(r => r.der_id === der.id);
              let totalSites = 0;
              let totalProg = 0;
              let totalEff = 0;
              let obsList = [];

              derReports.forEach(r => {
                totalSites += (r.nb_sites || 0);
                totalProg += (r.maintenance_programmee || 0);
                totalEff += (r.maintenance_effectuee || 0);
                if (r.maintenance_obs) obsList.push(r.maintenance_obs);
              });

              const taux = totalProg > 0 ? Math.min(100, Math.round((totalEff / totalProg) * 100)) : (totalSites > 0 && totalEff > 0 ? 100 : 0);

              return {
                num: idx + 1,
                der_id: der.id,
                der_nom: der.nom,
                nb_sites: totalSites,
                maintenance_programmee: totalProg,
                maintenance_effectuee: totalEff,
                taux_realisation: taux,
                observations: obsList.join(' ; ') || '-'
              };
            });

            setRealizationStats(stats);
          });
        });
      })
      .catch(err => console.error('Error building realization table:', err))
      .finally(() => setLoadingStats(false));
  };

  useEffect(() => {
    fetchWithAuth('/reports/available-weeks')
      .then(weeks => {
        setAvailableWeeks(weeks);
        if (weeks && weeks.length > 0) {
          const current = weeks.find(w => w.isCurrent) || weeks[0];
          setSelectedSemaineCode(current.semaine_code);
          setSelectedWeekInfo(current);
        }
      })
      .catch(err => console.error('Available weeks error:', err))
      .finally(() => setLoadingWeeks(false));

    loadRealizationTable(selectedRealizationYear);
  }, [selectedRealizationYear]);

  const handleWeekSelectChange = (code) => {
    setSelectedSemaineCode(code);
    const found = availableWeeks.find(w => w.semaine_code === code);
    if (found) {
      setSelectedWeekInfo(found);
    }
  };

  const handleAddMission = () => {
    setMissions([
      ...missions,
      { lieu: '', date_debut: todayStr, date_fin: todayStr, objet: '' }
    ]);
  };

  const handleRemoveMission = (index) => {
    setMissions(missions.filter((_, i) => i !== index));
  };

  const handleMissionChange = (index, field, value) => {
    const updated = [...missions];
    updated[index][field] = value;
    setMissions(updated);
  };

  // Helper to calculate days between dates
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMsg({ type: '', text: '' });

    try {
      const payload = {
        semaine_code: selectedSemaineCode,
        date_debut: selectedWeekInfo?.date_debut,
        date_fin: selectedWeekInfo?.date_fin,
        rencontres_texte: rencontresText,
        facturation_mois: facturationMois,
        facturation_nb: parseInt(facturationNb, 10),
        int_config_pc: parseInt(intConfigPc, 10),
        int_dep_pc: parseInt(intDepPc, 10),
        int_config_imp: parseInt(intConfigImp, 10),
        int_dep_imp: parseInt(intDepImp, 10),
        int_dep_reseau: parseInt(intDepReseau, 10),
        int_config_log: parseInt(intConfigLog, 10),
        divers_texte: diversTexte,
        nb_sites: parseInt(nbSites, 10),
        maintenance_programmee: parseInt(maintenanceProgrammee, 10),
        maintenance_effectuee: parseInt(maintenanceEffectuee, 10),
        maintenance_obs: maintenanceObs,
        missions: missions.filter(m => m.lieu.trim() !== '' && m.objet.trim() !== '')
      };

      const result = await fetchWithAuth('/reports', {
        method: 'POST',
        body: JSON.stringify(payload)
      });

      setMsg({ type: 'success', text: result.message });
      loadRealizationTable();
      if (onReportCreated) onReportCreated();
    } catch (err) {
      setMsg({ type: 'error', text: err.message || 'Erreur lors de la soumission.' });
    } finally {
      setSubmitting(false);
    }
  };

  // Filter realization table according to user role (Requirement 7)
  const displayedTableRows = currentUser?.role === 'ADMINISTRATEUR' 
    ? realizationStats 
    : realizationStats.filter(r => r.der_id === currentUser?.der_id);

  // Compute TOTAL line automatically
  const totalNbSites = displayedTableRows.reduce((sum, r) => sum + r.nb_sites, 0);
  const totalProg = displayedTableRows.reduce((sum, r) => sum + r.maintenance_programmee, 0);
  const totalEff = displayedTableRows.reduce((sum, r) => sum + r.maintenance_effectuee, 0);
  const totalTaux = totalProg > 0 ? Math.min(100, Math.round((totalEff / totalProg) * 100)) : 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

      {/* Return Button */}
      <div>
        <button
          onClick={() => onNavigate && onNavigate('my-reports')}
          className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl border border-slate-700 transition-all shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-sky-400" />
          <span>Retour</span>
        </button>
      </div>
      {/* Header Banner & Week Selector */}
      <div className="bg-gradient-to-r from-[#03152E] via-[#0B2545] to-[#13315C] rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-blue-900/50 relative overflow-hidden">
        {/* Background Image: Electric Grid */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-45 z-0 pointer-events-none"
          style={{ backgroundImage: `url('/bg_electric_grid.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#03152E]/80 via-[#0B2545]/75 to-[#13315C]/70 z-0 pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black bg-sky-500/20 text-sky-300 border border-sky-400/40">
              <Zap className="w-3.5 h-3.5 text-sky-400 fill-sky-400" />
              <span>Espace Agent - Saisie Officielle des Activités</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Rédaction du Rapport Hebdomadaire
            </h1>
            <p className="font-slogan text-xl text-sky-300 font-bold">
              L'énergie au service du développement
            </p>

            <div className="pt-3">
              <label className="block text-[11px] font-black uppercase tracking-wider text-sky-400 mb-1.5">
                Sélection de la semaine concernée
              </label>
              <div className="relative max-w-md">
                <Calendar className="w-4 h-4 text-sky-400 absolute left-3.5 top-3.5 pointer-events-none" />
                <select
                  value={selectedSemaineCode}
                  onChange={(e) => handleWeekSelectChange(e.target.value)}
                  disabled={loadingWeeks}
                  className="w-full pl-10 pr-4 py-3 bg-slate-900/90 border border-slate-700 rounded-2xl text-xs font-bold text-white outline-none focus:ring-2 focus:ring-sky-400 cursor-pointer shadow-sm"
                >
                  {availableWeeks.map(w => (
                    <option key={w.semaine_code} value={w.semaine_code}>
                      {w.label} {w.isCurrent ? ' • [Semaine En Cours]' : ' • [Rattrapage]'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-800 text-xs shrink-0 max-w-xs shadow-inner">
            <div className="flex items-center gap-2 text-sky-300 font-black mb-1">
              <Clock className="w-4 h-4" />
              <span>Échéance Réglementaire :</span>
            </div>
            <p className="text-slate-300 text-[11px] leading-relaxed font-medium">
              • Soumission avant <strong className="text-white font-black">Samedi 23:59</strong>.<br/>
              • Tout rapport après le samedi est marqué <strong className="text-amber-400 font-black">« En retard »</strong>.
            </p>
          </div>
        </div>
      </div>

      {msg.text && (
        <div className={`mb-6 p-4 rounded-2xl border text-xs font-bold flex items-center gap-2 ${
          msg.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-red-50 border-red-200 text-red-800'
        }`}>
          {msg.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-600" /> : <AlertTriangle className="w-5 h-5 text-red-600" />}
          <span>{msg.text}</span>
        </div>
      )}

      {/* REQUIREMENT 7: TABLEAU DYNAMIQUE TAUX DE REALISATION SUR L'ONGLET NOUVEAU RAPPORT */}
      <div className="bg-slate-900/70 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-700/60 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-700/80 pb-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-sky-300 bg-sky-500/20 px-2.5 py-1 rounded-md border border-sky-400/40">
              {currentUser?.role === 'ADMINISTRATEUR' ? 'Vue Globale (Toutes les 17 DERs)' : `Vue DER (${currentUser?.der_nom})`}
            </span>
            <h2 className="text-base font-extrabold text-white mt-2 flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-sky-400" />
              <span>Taux de Réalisation du Programme d'Activités</span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Tableau dynamique recalculé en temps réel à partir des données réellement saisies dans les rapports.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start sm:self-center">
            <YearSelector
              value={selectedRealizationYear}
              onChange={(yr) => {
                setSelectedRealizationYear(yr);
                loadRealizationTable(yr);
              }}
              label="Année"
            />

            <button
              type="button"
              onClick={() => loadRealizationTable(selectedRealizationYear)}
              className="btn-pro-blue text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingStats ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {loadingStats ? (
          <div className="py-8 text-center text-xs font-bold text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
            <span>Calcul dynamique du taux de réalisation...</span>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-slate-700/80">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-[#0B192C]/90 text-white text-[11px] uppercase font-extrabold border-b border-slate-700">
                  <th className="py-3 px-3 rounded-tl-xl text-center">N°</th>
                  <th className="py-3 px-4">DER</th>
                  <th className="py-3 px-3 text-center">Nombre de site</th>
                  <th className="py-3 px-3 text-center">Nb de site dont maintenance programmée</th>
                  <th className="py-3 px-3 text-center">Nombre de site dont la maintenance effectuée</th>
                  <th className="py-3 px-3 text-center">Taux de réalisation</th>
                  <th className="py-3 px-4 rounded-tr-xl">Observations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 text-slate-200 font-medium bg-slate-900/60">
                {displayedTableRows.map((row) => (
                  <tr key={row.num} className="hover:bg-slate-800/60 transition-colors">
                    <td className="py-3 px-3 text-center font-bold text-slate-400">{row.num}</td>
                    <td className="py-3 px-4 font-extrabold text-white">{row.der_nom}</td>
                    <td className="py-3 px-3 text-center font-semibold">{row.nb_sites}</td>
                    <td className="py-3 px-3 text-center font-semibold">{row.maintenance_programmee}</td>
                    <td className="py-3 px-3 text-center font-extrabold text-emerald-400">{row.maintenance_effectuee}</td>
                    <td className="py-3 px-3 text-center">
                      <span className="px-2.5 py-1 bg-sky-500/20 text-sky-300 font-extrabold rounded-lg border border-sky-400/40">
                        {row.taux_realisation}%
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 text-[11px] max-w-xs truncate">{row.observations}</td>
                  </tr>
                ))}
              </tbody>
              {/* REQUIREMENT 7: Ligne TOTAL calculée automatiquement */}
              <tfoot>
                <tr className="bg-[#0B192C]/90 text-sky-400 font-black text-xs border-t-2 border-sky-400">
                  <td className="py-3 px-3 text-center">TOTAL</td>
                  <td className="py-3 px-4">-</td>
                  <td className="py-3 px-3 text-center text-white">{totalNbSites}</td>
                  <td className="py-3 px-3 text-center text-white">{totalProg}</td>
                  <td className="py-3 px-3 text-center text-emerald-400 font-black">{totalEff}</td>
                  <td className="py-3 px-3 text-center">
                    <span className="px-3 py-1 bg-sky-500 text-white font-black rounded-lg shadow border border-sky-300">
                      {totalTaux}%
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-300 font-semibold text-[11px]">-</td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">

        {/* RUBRIQUE 1: RENCONTRES & MISSIONS */}
        <div className="bg-slate-900/70 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-700/60">
          <div className="flex items-center gap-3 border-b border-slate-700/80 pb-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center font-black text-lg border border-sky-300">1</div>
            <div>
              <h2 className="text-base font-extrabold text-white">Rencontres & Missions de terrain</h2>
              <p className="text-xs text-slate-300">Réunions stratégiques et liste dynamique des missions accomplies.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-white mb-2">
                Réunions & Échanges de travail (Texte libre)
              </label>
              <textarea
                rows={3}
                value={rencontresText}
                onChange={(e) => setRencontresText(e.target.value)}
                placeholder="Rédigez les comptes-rendus synthétiques des réunions tenues durant la semaine..."
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700 rounded-2xl text-sm font-medium text-white placeholder:text-slate-400 focus:ring-2 focus:ring-sky-400 outline-none"
              />
            </div>

            {/* Dynamic Missions List with Start Date & End Date */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="block text-xs font-black uppercase tracking-wider text-white">
                  Missions de terrain réalisées ({missions.length})
                </label>
                <button
                  type="button"
                  onClick={handleAddMission}
                  className="btn-pro-cyan px-3.5 py-2 text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter une mission</span>
                </button>
              </div>

              {missions.length === 0 ? (
                <p className="text-xs text-slate-400 italic bg-slate-950/80 p-4 rounded-2xl border border-slate-800 text-center">
                  Aucune mission ajoutée. Cliquez sur le bouton ci-dessus pour ajouter des lignes.
                </p>
              ) : (
                <div className="space-y-3">
                  {missions.map((mission, idx) => {
                    const daysCount = calculateDays(mission.date_debut, mission.date_fin);
                    const displayRange = `${formatDateDisplay(mission.date_debut)} à ${formatDateDisplay(mission.date_fin)} (${daysCount} jour${daysCount > 1 ? 's' : ''})`;

                    return (
                      <div key={idx} className="p-4 bg-slate-950/80 border border-slate-800 rounded-2xl space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] font-black text-sky-400 uppercase mb-1">Lieu de la mission</label>
                            <input
                              type="text"
                              required
                              value={mission.lieu}
                              onChange={(e) => handleMissionChange(idx, 'lieu', e.target.value)}
                              placeholder="Lieu (ex. Agence Tanghin)"
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-xl text-xs font-semibold"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-black text-sky-400 uppercase mb-1">Date de début</label>
                            <input
                              type="date"
                              required
                              value={mission.date_debut}
                              onChange={(e) => handleMissionChange(idx, 'date_debut', e.target.value)}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-xl text-xs font-semibold"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-black text-sky-400 uppercase mb-1">Date de fin</label>
                            <input
                              type="date"
                              required
                              value={mission.date_fin}
                              onChange={(e) => handleMissionChange(idx, 'date_fin', e.target.value)}
                              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 text-white rounded-xl text-xs font-semibold"
                            />
                          </div>
                        </div>

                        {/* DISPLAY BADGE */}
                        <div className="flex items-center justify-between gap-3 bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                          <div className="flex-1">
                            <input
                              type="text"
                              required
                              value={mission.objet}
                              onChange={(e) => handleMissionChange(idx, 'objet', e.target.value)}
                              placeholder="Objet et détails de l'intervention de terrain..."
                              className="w-full px-2 py-1 bg-transparent text-xs font-semibold text-white outline-none"
                            />
                          </div>

                          <div className="shrink-0 flex items-center gap-2">
                            <span className="px-2.5 py-1 bg-sky-500/20 text-sky-300 border border-sky-400/40 rounded-lg text-[11px] font-extrabold">
                              « {displayRange} »
                            </span>
                            <button
                              type="button"
                              onClick={() => handleRemoveMission(idx)}
                              className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-950/50 rounded-lg transition-all cursor-pointer"
                              title="Supprimer cette ligne"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* RUBRIQUE 2: FACTURATION */}
        <div className="bg-slate-900/70 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-700/60">
          <div className="flex items-center gap-3 border-b border-slate-700/80 pb-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center font-black text-lg border border-sky-300">2</div>
            <div>
              <h2 className="text-base font-extrabold text-white">Facturation</h2>
              <p className="text-xs text-slate-300">Volumétrie des factures d'électricité traitées.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-white mb-2">
                Mois concerné
              </label>
              <input
                type="text"
                value={facturationMois}
                onChange={(e) => setFacturationMois(e.target.value)}
                placeholder="ex. Août 2026"
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700 rounded-2xl text-sm font-medium text-white outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-white mb-2">
                Nombre de factures traitées
              </label>
              <input
                type="number"
                min="0"
                value={facturationNb}
                onChange={(e) => setFacturationNb(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700 rounded-2xl text-sm font-medium text-white outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
          </div>
        </div>

        {/* RUBRIQUE 3: INTERVENTIONS */}
        <div className="bg-slate-900/70 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-700/60">
          <div className="flex items-center gap-3 border-b border-slate-700/80 pb-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center font-black text-lg border border-sky-300">3</div>
            <div>
              <h2 className="text-base font-extrabold text-white">Interventions Informatiques et Réseaux</h2>
              <p className="text-xs text-slate-300">Compteurs quantitatifs des opérations effectuées durant la semaine.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <label className="block text-xs font-black uppercase text-white mb-2">Configuration PC</label>
              <input
                type="number"
                min="0"
                value={intConfigPc}
                onChange={(e) => setIntConfigPc(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <label className="block text-xs font-black uppercase text-white mb-2">Dépannage PC</label>
              <input
                type="number"
                min="0"
                value={intDepPc}
                onChange={(e) => setIntDepPc(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <label className="block text-xs font-black uppercase text-white mb-2">Configuration Imprimante</label>
              <input
                type="number"
                min="0"
                value={intConfigImp}
                onChange={(e) => setIntConfigImp(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <label className="block text-xs font-black uppercase text-white mb-2">Dépannage Imprimante</label>
              <input
                type="number"
                min="0"
                value={intDepImp}
                onChange={(e) => setIntDepImp(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <label className="block text-xs font-black uppercase text-white mb-2">Dépannage Réseau</label>
              <input
                type="number"
                min="0"
                value={intDepReseau}
                onChange={(e) => setIntDepReseau(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>

            <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800">
              <label className="block text-xs font-black uppercase text-white mb-2">Configuration Logiciels</label>
              <input
                type="number"
                min="0"
                value={intConfigLog}
                onChange={(e) => setIntConfigLog(e.target.value)}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-bold text-white outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
          </div>
        </div>

        {/* RUBRIQUE 4: DIVERS */}
        <div className="bg-slate-900/70 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-700/60">
          <div className="flex items-center gap-3 border-b border-slate-700/80 pb-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center font-black text-lg border border-sky-300">4</div>
            <div>
              <h2 className="text-base font-extrabold text-white">Divers (Texte Libre)</h2>
              <p className="text-xs text-slate-300">Décrivez librement toute situation ou assistance rencontrée durant la semaine.</p>
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-white mb-2">
              Description de la situation rencontrée (Texte libre)
            </label>
            <textarea
              rows={4}
              value={diversTexte}
              onChange={(e) => setDiversTexte(e.target.value)}
              placeholder="Rédigez librement les détails des assistances ou événements divers survenus..."
              className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700 rounded-2xl text-sm font-medium text-white placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
        </div>

        {/* RUBRIQUE SITES & MAINTENANCE */}
        <div className="bg-slate-900/70 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-700/60">
          <div className="flex items-center gap-3 border-b border-slate-700/80 pb-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center font-black text-lg border border-sky-300">5</div>
            <div>
              <h2 className="text-base font-extrabold text-white">Programme d'Activités / Maintenance des Sites</h2>
              <p className="text-xs text-slate-300">Saisie des données de maintenance pour alimenter le tableau dynamique de la DER.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-white mb-2">
                Nombre total de sites
              </label>
              <input
                type="number"
                min="0"
                value={nbSites}
                onChange={(e) => setNbSites(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700 rounded-2xl text-sm font-bold text-white outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-white mb-2">
                Nb. de sites maintenance programmée
              </label>
              <input
                type="number"
                min="0"
                value={maintenanceProgrammee}
                onChange={(e) => setMaintenanceProgrammee(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700 rounded-2xl text-sm font-bold text-white outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
            <div>
              <label className="block text-xs font-black uppercase tracking-wider text-white mb-2">
                Nb. de sites maintenance effectuée
              </label>
              <input
                type="number"
                min="0"
                value={maintenanceEffectuee}
                onChange={(e) => setMaintenanceEffectuee(e.target.value)}
                className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700 rounded-2xl text-sm font-bold text-white outline-none focus:ring-2 focus:ring-sky-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-white mb-2">
              Observations (Texte libre)
            </label>
            <input
              type="text"
              value={maintenanceObs}
              onChange={(e) => setMaintenanceObs(e.target.value)}
              placeholder="Remarques et détails sur le déroulement de la maintenance..."
              className="w-full px-4 py-3 bg-slate-950/80 border border-slate-700 rounded-2xl text-sm font-medium text-white outline-none focus:ring-2 focus:ring-sky-400"
            />
          </div>
        </div>

        {/* Submit Action */}
        <div className="flex justify-end pt-4">
          <button
            type="submit"
            disabled={submitting}
            className="btn-pro-cyan px-10 py-4 text-sm rounded-2xl flex items-center gap-3 transition-all cursor-pointer"
          >
            {submitting ? (
              <RefreshCw className="w-5 h-5 animate-spin text-white" />
            ) : (
              <>
                <Send className="w-5 h-5" />
                <span>Soumettre le Rapport Hebdomadaire</span>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
