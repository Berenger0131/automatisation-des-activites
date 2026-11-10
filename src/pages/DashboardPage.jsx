import React, { useState, useEffect } from 'react';
import { fetchWithAuth } from '../utils/auth';
import { exportReportToPDF, exportGlobalReportToPDF } from '../utils/exportPdf';
import { exportReportToDocx, exportGlobalReportToDocx } from '../utils/exportDocx';
import YearSelector from '../components/YearSelector';
import { LayoutDashboard, Building2, Users, FileText, CheckCircle2, AlertTriangle, Cpu, Wrench, RefreshCw, BarChart2, ShieldCheck, ArrowLeft, Award, FileDown, Calendar, Filter, Eye, User, Mail, Phone, MapPin, X, Search, Zap, Activity, Globe } from 'lucide-react';

const YEARS_2026_2100 = Array.from({ length: 2100 - 2026 + 1 }, (_, i) => (2026 + i).toString());

export default function DashboardPage({ currentUser, onNavigate }) {
  const currentYearStr = new Date().getFullYear().toString();
  const [selectedDashboardYear, setSelectedDashboardYear] = useState(currentYearStr);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  // Requirement 3: Global Consolidated Report state
  const [periodType, setPeriodType] = useState('year'); // 'week' | 'month' | 'year'
  const [periodValue, setPeriodValue] = useState(currentYearStr);
  const [globalReport, setGlobalReport] = useState(null);
  const [loadingGlobalReport, setLoadingGlobalReport] = useState(false);

  // Requirement: Admin user profile consultation state
  const [usersList, setUsersList] = useState([]);
  const [selectedUserModal, setSelectedUserModal] = useState(null);
  const [userSearchQuery, setUserSearchQuery] = useState('');

  const loadDashboardStats = (yearToFetch = selectedDashboardYear) => {
    setLoading(true);
    fetchWithAuth(`/dashboard/stats?year=${yearToFetch}`)
      .then(setStats)
      .catch(err => console.error('Error loading dashboard stats:', err))
      .finally(() => setLoading(false));
  };

  const loadGlobalReport = () => {
    setLoadingGlobalReport(true);
    fetchWithAuth(`/dashboard/global-report?period_type=${periodType}&period_value=${periodValue}`)
      .then(setGlobalReport)
      .catch(err => console.error('Error loading global report:', err))
      .finally(() => setLoadingGlobalReport(false));
  };

  const reloadUsers = () => {
    fetchWithAuth('/dashboard/users')
      .then(setUsersList)
      .catch(err => console.error('Error fetching dashboard users:', err));
  };

  useEffect(() => {
    loadDashboardStats(selectedDashboardYear);
    reloadUsers();
  }, [selectedDashboardYear]);

  useEffect(() => {
    loadGlobalReport();
  }, [periodType, periodValue]);

  if (loading) {
    return (
      <div className="text-center py-24 font-sans">
        <RefreshCw className="w-12 h-12 text-blue-700 animate-spin mx-auto mb-3" />
        <p className="text-xs font-black text-slate-600 tracking-wider uppercase">Génération du tableau de bord consolidé des 17 DERs...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 font-sans">
      
      {/* Return Button */}
      <div>
        <button
          onClick={() => onNavigate && onNavigate('my-reports')}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-xl border border-slate-700 transition-all shadow-sm cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4 text-yellow-400" />
          <span>Retour aux rapports</span>
        </button>
      </div>

      {/* Institutional Banner Header */}
      <div className="bg-gradient-to-r from-[#03152E] via-[#0B2545] to-[#13315C] rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-blue-900/50 relative overflow-hidden">
        {/* Background Image: Electric Grid */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-45 z-0 pointer-events-none"
          style={{ backgroundImage: `url('/bg_electric_grid.jpg')` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#03152E]/80 via-[#0B2545]/75 to-[#13315C]/70 z-0 pointer-events-none" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl pointer-events-none z-0" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-400/10 rounded-full blur-3xl pointer-events-none z-0" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full text-xs font-black bg-sky-500/20 text-sky-300 border border-sky-400/40 mb-3">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              <span>Espace Officiel d'Administration & Pilotage</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white flex items-center gap-3 tracking-tight">
              <LayoutDashboard className="w-8 h-8 text-sky-400" />
              <span>Tableau de Bord Consolidé (17 Régions SONABEL)</span>
            </h1>
            <p className="font-slogan text-xl text-sky-300 font-bold mt-1">
              L'énergie au service du développement
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-4">
            <div className="bg-slate-900/80 p-3 rounded-2xl border border-slate-700/80 text-xs shrink-0 shadow-inner text-right">
              <span className="text-sky-400 font-bold block mb-1">Sélection de l'exercice :</span>
              <YearSelector
                value={selectedDashboardYear}
                onChange={setSelectedDashboardYear}
                label="Année"
              />
            </div>

            <div className="bg-slate-900/80 p-4 rounded-2xl border border-slate-700/80 text-xs shrink-0 shadow-inner text-right">
              <span className="text-sky-400 font-bold">Statut du Réseau National : </span>
              <span className="text-white font-black flex items-center gap-1.5 justify-end mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-sky-400 animate-pulse" />
                <span>17 DERs Synchronisées</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid - Real Project Data */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        
        <div className="bg-slate-900/70 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-slate-700/60 hover:border-sky-400/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-sky-400">Taux Réal. Annuel</span>
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-300 flex items-center justify-center font-black shadow-sm border border-sky-400/40">
              <Award className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{stats?.globalRealizationRate || 0}%</div>
          <p className="text-[11px] font-bold text-sky-400 mt-1">Taux global de réalisation</p>
        </div>

        <div className="bg-slate-900/70 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-slate-700/60 hover:border-sky-400/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-sky-400">Régions DER</span>
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-300 flex items-center justify-center font-black shadow-sm border border-sky-400/40">
              <Building2 className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{stats?.totalDers || 0}</div>
          <p className="text-[11px] font-bold text-sky-400 mt-1">Directions Régionales (14 Régions)</p>
        </div>

        <div className="bg-slate-900/70 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-slate-700/60 hover:border-sky-400/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-sky-400">Total Rapports</span>
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-300 flex items-center justify-center font-black shadow-sm border border-sky-400/40">
              <FileText className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{stats?.totalReports || 0}</div>
          <div className="flex items-center gap-1.5 mt-1 text-[11px]">
            <span className="text-sky-400 font-extrabold">{stats?.onTimeReports || 0} à jour</span>
            <span className="text-white">•</span>
            <span className="text-white font-extrabold">{stats?.lateReports || 0} retard</span>
          </div>
        </div>

        <div className="bg-slate-900/70 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-slate-700/60 hover:border-sky-400/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-sky-400">Interventions IT</span>
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-300 flex items-center justify-center font-black shadow-sm border border-sky-400/40">
              <Wrench className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{stats?.totalInterventions || 0}</div>
          <p className="text-[11px] font-bold text-sky-400 mt-1">Opérations technologiques</p>
        </div>

        <div className="bg-slate-900/70 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-slate-700/60 hover:border-sky-400/50 transition-all">
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] font-black uppercase tracking-wider text-sky-400">Factures</span>
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-300 flex items-center justify-center font-black shadow-sm border border-sky-400/40">
              <BarChart2 className="w-5 h-5 text-sky-400" />
            </div>
          </div>
          <div className="text-3xl font-black text-white">{(stats?.totalFactures || 0).toLocaleString('fr-FR')}</div>
          <p className="text-[11px] font-bold text-sky-400 mt-1">Factures d'électricité</p>
        </div>

      </div>

      {/* RAPPORT GLOBAL CONSOLIDÉ (ADMINISTRATEURS) */}
      <div className="bg-slate-900/70 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-700/60 space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-700/80 pb-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-400/40 mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>Fonctionnalité réservée aux Administrateurs</span>
            </div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <BarChart2 className="w-5 h-5 text-sky-400" />
              <span>Rapport Global Consolidé des 17 DERs</span>
            </h2>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Agrégation globale des données soumises par l'ensemble des utilisateurs sur une période choisie.
            </p>
          </div>

          {/* Period Selector (Semaine / Mois / Année) */}
          <div className="flex flex-wrap items-center gap-2 bg-slate-950/80 p-2.5 rounded-2xl border border-slate-800 text-xs">
            <div className="flex items-center gap-1 font-extrabold text-sky-400">
              <Filter className="w-3.5 h-3.5 text-sky-400" />
              <span>Période :</span>
            </div>

            <select
              value={periodType}
              onChange={(e) => {
                setPeriodType(e.target.value);
                if (e.target.value === 'year') setPeriodValue('2026');
                if (e.target.value === 'month') setPeriodValue('08');
                if (e.target.value === 'week') setPeriodValue('W35');
              }}
              className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl font-bold text-white shadow-sm outline-none focus:ring-2 focus:ring-sky-500"
            >
              <option value="year">Année</option>
              <option value="month">Mois</option>
              <option value="week">Semaine</option>
            </select>

            {periodType === 'year' ? (
              <YearSelector
                value={periodValue}
                onChange={setPeriodValue}
                label=""
              />
            ) : (
              <input
                type="text"
                value={periodValue}
                onChange={(e) => setPeriodValue(e.target.value)}
                placeholder={periodType === 'week' ? 'ex. W35' : 'ex. 08'}
                className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl font-bold text-white max-w-[90px] shadow-sm outline-none focus:ring-2 focus:ring-sky-500"
              />
            )}

            <button
              onClick={loadGlobalReport}
              className="px-3.5 py-1.5 bg-[#0E223D] hover:bg-[#16345C] text-white border border-sky-400/40 font-extrabold rounded-xl flex items-center gap-1.5 transition-all cursor-pointer shadow-lg"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingGlobalReport ? 'animate-spin' : ''}`} />
              <span>Générer</span>
            </button>

            {globalReport && (
              <>
                <button
                  onClick={() => exportGlobalReportToPDF(globalReport)}
                  className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-extrabold rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-lg shadow-red-600/30"
                  title="Exporter en PDF"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>PDF</span>
                </button>

                <button
                  onClick={() => exportGlobalReportToDocx(globalReport)}
                  className="px-3.5 py-1.5 bg-[#0E223D] hover:bg-[#16345C] text-white border border-blue-500/40 font-extrabold rounded-xl flex items-center gap-1 transition-all cursor-pointer shadow-lg"
                  title="Exporter en Word"
                >
                  <FileDown className="w-3.5 h-3.5" />
                  <span>Word</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Global Report Data Table */}
        {loadingGlobalReport ? (
          <div className="py-8 text-center text-xs font-bold text-slate-400 flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4 animate-spin text-sky-400" />
            <span>Chargement du rapport global consolidé...</span>
          </div>
        ) : globalReport && globalReport.ders ? (() => {
          const calcTotalReports = globalReport.ders.reduce((acc, d) => acc + Number(d.reports_count || 0), 0);
          const calcTotalFactures = globalReport.ders.reduce((acc, d) => acc + Number(d.totalFactures || 0), 0);
          const calcTotalMissions = globalReport.ders.reduce((acc, d) => acc + Number(d.totalMissions || 0), 0);
          const calcTotalInterventions = globalReport.ders.reduce((acc, d) => acc + Number(d.totalInterventions || 0), 0);
          const calcTotalSites = globalReport.ders.reduce((acc, d) => acc + Number(d.totalSites || 0), 0);
          const calcTotalProg = globalReport.ders.reduce((acc, d) => acc + Number(d.totalProg || 0), 0);
          const calcTotalEff = globalReport.ders.reduce((acc, d) => acc + Number(d.totalEff || 0), 0);
          const calcTauxRealisation = calcTotalProg > 0 ? Math.min(100, Math.round((calcTotalEff / calcTotalProg) * 100)) : (calcTotalSites > 0 && calcTotalEff > 0 ? 100 : 0);

          return (
            <div className="space-y-4">
              <div className="overflow-x-auto rounded-2xl border border-slate-700/80">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-[#0B192C]/90 text-white text-[11px] uppercase font-black tracking-wider border-b border-slate-700">
                      <th className="py-3.5 px-4 rounded-tl-xl">DER</th>
                      <th className="py-3.5 px-3 text-center">Rapports Soumis</th>
                      <th className="py-3.5 px-3 text-center">Factures Traitées</th>
                      <th className="py-3.5 px-3 text-center">Missions Terrain</th>
                      <th className="py-3.5 px-3 text-center">Total Interventions</th>
                      <th className="py-3.5 px-3 text-center">Nb Sites</th>
                      <th className="py-3.5 px-3 text-center">Maint. Prog.</th>
                      <th className="py-3.5 px-3 text-center">Maint. Eff.</th>
                      <th className="py-3.5 px-3 text-center rounded-tr-xl">Taux Réalisation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/80 font-semibold text-slate-200 bg-slate-900/60">
                    {globalReport.ders.map((der) => (
                      <tr key={der.der_id} className="hover:bg-slate-800/60 transition-colors">
                        <td className="py-3 px-4 font-black text-white">{der.der_nom}</td>
                        <td className="py-3 px-3 text-center font-bold text-slate-300">{der.reports_count}</td>
                        <td className="py-3 px-3 text-center">{der.totalFactures}</td>
                        <td className="py-3 px-3 text-center">{der.totalMissions}</td>
                        <td className="py-3 px-3 text-center font-bold text-sky-400">{der.totalInterventions}</td>
                        <td className="py-3 px-3 text-center">{der.totalSites}</td>
                        <td className="py-3 px-3 text-center">{der.totalProg}</td>
                        <td className="py-3 px-3 text-center font-black text-emerald-400">{der.totalEff}</td>
                        <td className="py-3 px-3 text-center">
                          <span className="px-2.5 py-1 bg-sky-500/20 text-sky-300 font-black rounded-lg border border-sky-400/40">
                            {der.tauxRealisation}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-[#0B192C]/90 text-sky-400 font-black text-xs border-t-2 border-sky-400">
                      <td className="py-3.5 px-4">TOTAL CONSOLIDÉ</td>
                      <td className="py-3.5 px-3 text-center text-white">{calcTotalReports}</td>
                      <td className="py-3.5 px-3 text-center text-white">{calcTotalFactures}</td>
                      <td className="py-3.5 px-3 text-center text-white">{calcTotalMissions}</td>
                      <td className="py-3.5 px-3 text-center text-white">{calcTotalInterventions}</td>
                      <td className="py-3.5 px-3 text-center text-white">{calcTotalSites}</td>
                      <td className="py-3.5 px-3 text-center text-white">{calcTotalProg}</td>
                      <td className="py-3.5 px-3 text-center text-emerald-400 font-black">{calcTotalEff}</td>
                      <td className="py-3.5 px-3 text-center">
                        <span className="px-3 py-1 bg-sky-400 text-slate-950 font-black rounded-lg shadow">
                          {calcTauxRealisation}%
                        </span>
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          );
        })() : null}
      </div>

      {/* Interventions Breakdown Grid */}
      <div className="bg-slate-900/70 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-700/60">
        <h2 className="text-base font-black text-white mb-6 flex items-center gap-2">
          <Cpu className="w-5 h-5 text-sky-400" />
          <span>Répartition des Interventions par Typologie</span>
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 text-xs">
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 hover:border-sky-400/40 transition-all">
            <span className="text-slate-400 font-bold">Config. PC</span>
            <p className="text-2xl font-black text-white mt-1">{stats?.interventionsByType?.configPc || 0}</p>
          </div>
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 hover:border-sky-400/40 transition-all">
            <span className="text-slate-400 font-bold">Dépannage PC</span>
            <p className="text-2xl font-black text-white mt-1">{stats?.interventionsByType?.depPc || 0}</p>
          </div>
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 hover:border-sky-400/40 transition-all">
            <span className="text-slate-400 font-bold">Config. Imprimante</span>
            <p className="text-2xl font-black text-white mt-1">{stats?.interventionsByType?.configImp || 0}</p>
          </div>
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 hover:border-sky-400/40 transition-all">
            <span className="text-slate-400 font-bold">Dépannage Imprimante</span>
            <p className="text-2xl font-black text-white mt-1">{stats?.interventionsByType?.depImp || 0}</p>
          </div>
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 hover:border-sky-400/40 transition-all">
            <span className="text-slate-400 font-bold">Dépannage Réseau</span>
            <p className="text-2xl font-black text-white mt-1">{stats?.interventionsByType?.depReseau || 0}</p>
          </div>
          <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 hover:border-sky-400/40 transition-all">
            <span className="text-slate-400 font-bold">Config. Logiciels</span>
            <p className="text-2xl font-black text-white mt-1">{stats?.interventionsByType?.configLog || 0}</p>
          </div>
        </div>
      </div>

      {/* 17 DERs Detailed Table */}
      <div className="bg-slate-900/70 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-700/60">
        <h2 className="text-base font-black text-white mb-6 flex items-center gap-2">
          <Building2 className="w-5 h-5 text-sky-400" />
          <span>Statut Synthétique et Taux Annuel des 17 Directions Régionales (DER)</span>
        </h2>

        <div className="overflow-x-auto rounded-2xl border border-slate-700/80">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-700 text-[11px] uppercase font-black text-slate-300 bg-[#0B192C]/90">
                <th className="py-3.5 px-4 rounded-l-xl">DER (Nom & Ville)</th>
                <th className="py-3.5 px-4">Chef-lieu</th>
                <th className="py-3.5 px-4 text-center">Agents</th>
                <th className="py-3.5 px-4 text-center">Taux Réal. Annuel</th>
                <th className="py-3.5 px-4 text-center">Rapports Soumis</th>
                <th className="py-3.5 px-4 text-center">Retards</th>
                <th className="py-3.5 px-4 rounded-r-xl">Responsable Régional</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 text-xs font-semibold text-slate-200 bg-slate-900/60">
              {stats?.derStats?.map((der) => (
                <tr key={der.id} className="hover:bg-slate-800/60 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-black text-white block">{der.nom}</span>
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-slate-300">{der.chef_lieu}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-white">{der.users_count}</td>
                  <td className="py-3.5 px-4 text-center">
                    <span className="px-2.5 py-1 bg-sky-500/20 text-sky-300 font-black rounded-lg border border-sky-400/40">
                      {der.annual_realization_rate || 0}%
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-emerald-400">{der.reports_count}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-red-400">{der.late_count}</td>
                  <td className="py-3.5 px-4 text-slate-400 text-[11px]">{der.responsable || 'Non attribué'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User Profiles Consultation for Admins */}
      <div className="bg-slate-900/70 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-700/60">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black bg-blue-500/20 text-blue-300 border border-blue-400/40 mb-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
              <span>Administration Utilisateurs</span>
            </div>
            <h2 className="text-base font-black text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-400" />
              <span>Consultation des Profils Utilisateurs ({usersList.length})</span>
            </h2>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Les administrateurs peuvent consulter la liste et le détail des comptes utilisateurs inscrits.
            </p>
          </div>

          <div className="relative max-w-xs w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher un agent par nom, prénom ou email..."
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-slate-950/80 border border-slate-700 rounded-xl text-xs font-semibold text-white outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="overflow-x-auto rounded-2xl border border-slate-700/80">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-700 text-[11px] uppercase font-black text-slate-300 bg-[#0B192C]/90">
                <th className="py-3.5 px-4 rounded-l-xl">Agent</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Affectation DER</th>
                <th className="py-3.5 px-4">Province</th>
                <th className="py-3.5 px-4 text-center">Rôle</th>
                <th className="py-3.5 px-4 text-center">Rapports</th>
                <th className="py-3.5 px-4 text-right rounded-r-xl">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80 font-semibold text-slate-200 bg-slate-900/60">
              {usersList
                .filter(u => {
                  if (!userSearchQuery) return true;
                  const q = userSearchQuery.toLowerCase();
                  return (
                    (u.nom && u.nom.toLowerCase().includes(q)) ||
                    (u.prenom && u.prenom.toLowerCase().includes(q)) ||
                    (u.email && u.email.toLowerCase().includes(q)) ||
                    (u.der_nom && u.der_nom.toLowerCase().includes(q))
                  );
                })
                .map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/60 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow">
                          {u.prenom ? u.prenom.charAt(0).toUpperCase() : 'A'}
                        </div>
                        <div>
                          <span className="font-black text-white block">{u.prenom} {u.nom}</span>
                          <span className="text-[10px] text-slate-400 font-medium">Inscrit le {new Date(u.created_at).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <p className="font-extrabold text-white">{u.email}</p>
                      <p className="text-slate-400 text-[11px]">{u.telephone}</p>
                    </td>
                    <td className="py-3 px-4 font-black text-slate-200">{u.der_nom || 'Non spécifiée'}</td>
                    <td className="py-3 px-4 text-slate-300">{u.province || '-'}</td>
                    <td className="py-3 px-4 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                        u.role === 'ADMINISTRATEUR'
                          ? 'bg-sky-500/20 text-sky-300 border border-sky-400/40'
                          : 'bg-slate-800 text-slate-300 border border-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-bold">
                      <span className="text-emerald-400">{u.reports_count || 0} soumis</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setSelectedUserModal(u)}
                        className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-extrabold rounded-xl text-xs flex items-center gap-1.5 ml-auto transition-all cursor-pointer shadow-lg shadow-blue-600/30"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Consulter Profil</span>
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* USER PROFILE CONSULTATION MODAL FOR ADMIN */}
      {selectedUserModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900/95 backdrop-blur-xl rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-700/80 font-sans relative text-white">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-black text-xl flex items-center justify-center shadow">
                  {selectedUserModal.prenom ? selectedUserModal.prenom.charAt(0).toUpperCase() : 'U'}
                </div>
                <div>
                  <h3 className="text-base font-black text-white">
                    {selectedUserModal.prenom} {selectedUserModal.nom}
                  </h3>
                  <span className="inline-flex items-center gap-1 text-[10px] font-black px-2.5 py-0.5 rounded-full bg-sky-500/20 text-sky-300 border border-sky-400/40 mt-0.5">
                    <ShieldCheck className="w-3 h-3 text-sky-400" />
                    {selectedUserModal.role}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedUserModal(null)}
                className="p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-sky-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Adresse Email</p>
                    <p className="font-extrabold text-white">{selectedUserModal.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-sky-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Téléphone</p>
                    <p className="font-extrabold text-white">{selectedUserModal.telephone || 'Non renseigné'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Building2 className="w-4 h-4 text-sky-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Affectation DER</p>
                    <p className="font-extrabold text-white">{selectedUserModal.der_nom || 'Siège SONABEL'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
                  <div>
                    <p className="text-[10px] text-slate-400 font-bold uppercase">Province</p>
                    <p className="font-extrabold text-white">{selectedUserModal.province || 'Kadiogo'}</p>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-bold text-sky-400 uppercase">Activité Réglementaire</p>
                  <p className="text-xs font-black text-white mt-0.5">Rapports d'activité soumis</p>
                </div>
                <div className="text-2xl font-black text-sky-400">
                  {selectedUserModal.reports_count || 0}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedUserModal(null)}
                className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-extrabold rounded-xl text-xs cursor-pointer transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
