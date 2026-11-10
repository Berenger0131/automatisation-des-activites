import express from 'express';
import { dbStore, saveStore, getDerDisplayName } from '../config/db.js';
import { verifyToken, verifyReportOwnership } from '../middleware/auth.js';

const router = express.Router();

const getWeekDetailsByDate = (dateObj = new Date()) => {
  const d = new Date(Date.UTC(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
  
  const curr = new Date(dateObj);
  const currentDay = curr.getDay();
  const distanceToMonday = (currentDay === 0 ? -6 : 1 - currentDay);
  
  const monday = new Date(curr);
  monday.setDate(curr.getDate() + distanceToMonday);
  monday.setHours(0, 0, 0, 0);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);
  sunday.setHours(23, 59, 59, 999);

  const saturdayDeadline = new Date(monday);
  saturdayDeadline.setDate(monday.getDate() + 5);
  saturdayDeadline.setHours(23, 59, 59, 999);

  return {
    semaine_code: `${d.getUTCFullYear()}-W${weekNo < 10 ? '0' + weekNo : weekNo}`,
    weekNumber: weekNo,
    year: d.getUTCFullYear(),
    date_debut: monday.toISOString().split('T')[0],
    date_fin: sunday.toISOString().split('T')[0],
    saturdayDeadline
  };
};

const getAvailableWeeks = () => {
  const weeks = [];
  
  for (let i = 0; i < 26; i++) {
    const targetDate = new Date();
    targetDate.setDate(targetDate.getDate() - (i * 7));
    const info = getWeekDetailsByDate(targetDate);
    
    if (!weeks.some(w => w.semaine_code === info.semaine_code)) {
      weeks.push({
        semaine_code: info.semaine_code,
        label: `Semaine du ${info.date_debut} au ${info.date_fin} (${info.semaine_code.split('-')[1]})`,
        date_debut: info.date_debut,
        date_fin: info.date_fin,
        isCurrent: i === 0,
        saturdayDeadline: info.saturdayDeadline
      });
    }
  }
  return weeks;
};

router.get('/current-week-info', verifyToken, (req, res) => {
  const info = getWeekDetailsByDate();
  res.json(info);
});

router.get('/available-weeks', verifyToken, (req, res) => {
  const weeks = getAvailableWeeks();
  res.json(weeks);
});

router.get('/annual-stats', verifyToken, (req, res) => {
  try {
    const currentYear = new Date().getFullYear().toString();
    const userReports = dbStore.reports.filter(r => r.user_id === req.user.id && r.semaine_code.startsWith(currentYear));
    
    const submitted = userReports.length;
    const expected = 52;
    const percentage = Math.min(100, Math.round((submitted / expected) * 100));

    res.json({
      year: currentYear,
      submitted_count: submitted,
      expected_count: expected,
      rate_percentage: percentage,
      on_time_count: userReports.filter(r => r.statut === 'A_JOUR').length,
      late_count: userReports.filter(r => r.statut === 'EN_RETARD').length
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors du calcul du taux annuel.' });
  }
});

router.get('/my', verifyToken, (req, res) => {
  try {
    const { week, month, year, status } = req.query;
    let reports = dbStore.reports.filter(r => r.user_id === req.user.id);

    if (week) {
      reports = reports.filter(r => r.semaine_code.includes(week));
    }
    if (year) {
      reports = reports.filter(r => r.semaine_code.startsWith(year));
    }
    if (status) {
      reports = reports.filter(r => r.statut === status);
    }
    if (month) {
      reports = reports.filter(r => {
        if (!r.date_debut) return false;
        const m = new Date(r.date_debut).getMonth() + 1;
        return m === parseInt(month, 10);
      });
    }

    const enriched = reports.map(r => {
      const user = dbStore.users.find(u => u.id === r.user_id) || {};
      const der = dbStore.ders.find(d => d.id === r.der_id) || {};
      const missions = dbStore.missions.filter(m => m.report_id === r.id);
      return {
        ...r,
        agent_nom: `${user.prenom || ''} ${user.nom || ''}`.trim(),
        der_nom: getDerDisplayName(der),
        der_code: der.code || '',
        missions
      };
    });

    enriched.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(enriched);
  } catch (err) {
    console.error('Error fetching my reports:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des rapports.' });
  }
});

router.get('/colleagues', verifyToken, (req, res) => {
  try {
    const { der_id, user_id, week, status } = req.query;
    let reports = dbStore.reports.filter(r => r.user_id !== req.user.id);

    if (der_id) {
      reports = reports.filter(r => r.der_id === parseInt(der_id, 10));
    }
    if (user_id) {
      reports = reports.filter(r => r.user_id === parseInt(user_id, 10));
    }
    if (week) {
      reports = reports.filter(r => r.semaine_code.includes(week));
    }
    if (status) {
      reports = reports.filter(r => r.statut === status);
    }

    const enriched = reports.map(r => {
      const user = dbStore.users.find(u => u.id === r.user_id) || {};
      const der = dbStore.ders.find(d => d.id === r.der_id) || {};
      const missions = dbStore.missions.filter(m => m.report_id === r.id);
      return {
        ...r,
        agent_nom: `${user.prenom || ''} ${user.nom || ''}`.trim(),
        agent_email: user.email || '',
        der_nom: getDerDisplayName(der),
        der_code: der.code || '',
        missions
      };
    });

    enriched.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    res.json(enriched);
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la récupération des rapports des collègues.' });
  }
});

router.get('/:id', verifyToken, (req, res) => {
  const reportId = parseInt(req.params.id, 10);
  const report = dbStore.reports.find(r => r.id === reportId);
  if (!report) {
    return res.status(404).json({ error: 'Rapport non trouvé.' });
  }

  const user = dbStore.users.find(u => u.id === report.user_id) || {};
  const der = dbStore.ders.find(d => d.id === report.der_id) || {};
  const missions = dbStore.missions.filter(m => m.report_id === report.id);

  res.json({
    ...report,
    agent_nom: `${user.prenom || ''} ${user.nom || ''}`.trim(),
    agent_email: user.email || '',
    agent_telephone: user.telephone || '',
    der_nom: getDerDisplayName(der),
    der_code: der.code || '',
    der_chef_lieu: der.chef_lieu || '',
    missions
  });
});

router.post('/', verifyToken, (req, res) => {
  try {
    const user = dbStore.users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    const {
      semaine_code,
      date_debut,
      date_fin,
      rencontres_texte,
      facturation_mois,
      facturation_nb,
      int_config_pc,
      int_dep_pc,
      int_config_imp,
      int_dep_imp,
      int_dep_reseau,
      int_config_log,
      divers_texte,
      nb_sites,
      maintenance_programmee,
      maintenance_effectuee,
      maintenance_obs,
      missions
    } = req.body;

    const availableWeeks = getAvailableWeeks();
    let selectedWeek = availableWeeks.find(w => w.semaine_code === semaine_code);

    if (!selectedWeek) {
      const fallbackInfo = getWeekDetailsByDate();
      selectedWeek = {
        semaine_code: semaine_code || fallbackInfo.semaine_code,
        date_debut: date_debut || fallbackInfo.date_debut,
        date_fin: date_fin || fallbackInfo.date_fin,
        saturdayDeadline: fallbackInfo.saturdayDeadline
      };
    }

    const targetSemaine = selectedWeek.semaine_code;

    const existing = dbStore.reports.find(r => r.user_id === user.id && r.semaine_code === targetSemaine);
    if (existing) {
      return res.status(400).json({ 
        error: `Un rapport pour la semaine ${targetSemaine} existe déjà dans vos dossiers.` 
      });
    }

    const now = new Date();
    let statut = 'A_JOUR';
    if (now > new Date(selectedWeek.saturdayDeadline)) {
      statut = 'EN_RETARD';
    }

    const reportId = dbStore.counters.report++;
    const newReport = {
      id: reportId,
      user_id: user.id,
      der_id: user.der_id,
      semaine_code: targetSemaine,
      date_debut: selectedWeek.date_debut,
      date_fin: selectedWeek.date_fin,
      rencontres_texte: rencontres_texte || '',
      facturation_mois: facturation_mois || '',
      facturation_nb: parseInt(facturation_nb || 0, 10),
      int_config_pc: parseInt(int_config_pc || 0, 10),
      int_dep_pc: parseInt(int_dep_pc || 0, 10),
      int_config_imp: parseInt(int_config_imp || 0, 10),
      int_dep_imp: parseInt(int_dep_imp || 0, 10),
      int_dep_reseau: parseInt(int_dep_reseau || 0, 10),
      int_config_log: parseInt(int_config_log || 0, 10),
      divers_texte: divers_texte || '',
      nb_sites: parseInt(nb_sites || 0, 10),
      maintenance_programmee: parseInt(maintenance_programmee || 0, 10),
      maintenance_effectuee: parseInt(maintenance_effectuee || 0, 10),
      maintenance_obs: maintenance_obs || '',
      statut,
      soumis_le: now.toISOString(),
      created_at: now.toISOString(),
      updated_at: now.toISOString()
    };

    dbStore.reports.push(newReport);

    const savedMissions = [];
    if (Array.isArray(missions)) {
      missions.forEach(m => {
        if (m.lieu && m.objet && (m.date_debut || m.date_mission)) {
          const mDebut = m.date_debut || m.date_mission;
          const mFin = m.date_fin || mDebut;
          const missionObj = {
            id: dbStore.counters.mission++,
            report_id: reportId,
            lieu: m.lieu.trim(),
            date_debut: mDebut,
            date_fin: mFin,
            objet: m.objet.trim(),
            created_at: new Date().toISOString()
          };
          dbStore.missions.push(missionObj);
          savedMissions.push(missionObj);
        }
      });
    }

    saveStore();

    res.status(201).json({
      message: 'Rapport hebdomadaire soumis avec succès.',
      report: { ...newReport, missions: savedMissions }
    });
  } catch (err) {
    console.error('Error creating report:', err);
    res.status(500).json({ error: 'Erreur lors de la création du rapport.' });
  }
});

router.put('/:id', verifyToken, verifyReportOwnership, (req, res) => {
  try {
    const report = req.report;
    const {
      rencontres_texte,
      facturation_mois,
      facturation_nb,
      int_config_pc,
      int_dep_pc,
      int_config_imp,
      int_dep_imp,
      int_dep_reseau,
      int_config_log,
      divers_texte,
      nb_sites,
      maintenance_programmee,
      maintenance_effectuee,
      maintenance_obs,
      missions
    } = req.body;

    report.rencontres_texte = rencontres_texte !== undefined ? rencontres_texte : report.rencontres_texte;
    report.facturation_mois = facturation_mois !== undefined ? facturation_mois : report.facturation_mois;
    report.facturation_nb = facturation_nb !== undefined ? parseInt(facturation_nb, 10) : report.facturation_nb;
    report.int_config_pc = int_config_pc !== undefined ? parseInt(int_config_pc, 10) : report.int_config_pc;
    report.int_dep_pc = int_dep_pc !== undefined ? parseInt(int_dep_pc, 10) : report.int_dep_pc;
    report.int_config_imp = int_config_imp !== undefined ? parseInt(int_config_imp, 10) : report.int_config_imp;
    report.int_dep_imp = int_dep_imp !== undefined ? parseInt(int_dep_imp, 10) : report.int_dep_imp;
    report.int_dep_reseau = int_dep_reseau !== undefined ? parseInt(int_dep_reseau, 10) : report.int_dep_reseau;
    report.int_config_log = int_config_log !== undefined ? parseInt(int_config_log, 10) : report.int_config_log;
    report.divers_texte = divers_texte !== undefined ? divers_texte : report.divers_texte;
    report.nb_sites = nb_sites !== undefined ? parseInt(nb_sites, 10) : report.nb_sites;
    report.maintenance_programmee = maintenance_programmee !== undefined ? parseInt(maintenance_programmee, 10) : report.maintenance_programmee;
    report.maintenance_effectuee = maintenance_effectuee !== undefined ? parseInt(maintenance_effectuee, 10) : report.maintenance_effectuee;
    report.maintenance_obs = maintenance_obs !== undefined ? maintenance_obs : report.maintenance_obs;
    report.updated_at = new Date().toISOString();

    if (Array.isArray(missions)) {
      dbStore.missions = dbStore.missions.filter(m => m.report_id !== report.id);
      
      missions.forEach(m => {
        if (m.lieu && m.objet && (m.date_debut || m.date_mission)) {
          const mDebut = m.date_debut || m.date_mission;
          const mFin = m.date_fin || mDebut;
          dbStore.missions.push({
            id: dbStore.counters.mission++,
            report_id: report.id,
            lieu: m.lieu.trim(),
            date_debut: mDebut,
            date_fin: mFin,
            objet: m.objet.trim(),
            created_at: new Date().toISOString()
          });
        }
      });
    }

    saveStore();

    const updatedMissions = dbStore.missions.filter(m => m.report_id === report.id);

    res.json({
      message: 'Rapport mis à jour avec succès.',
      report: { ...report, missions: updatedMissions }
    });
  } catch (err) {
    console.error('Error updating report:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du rapport.' });
  }
});

router.delete('/:id', verifyToken, verifyReportOwnership, (req, res) => {
  try {
    const reportId = req.report.id;
    dbStore.reports = dbStore.reports.filter(r => r.id !== reportId);
    dbStore.missions = dbStore.missions.filter(m => m.report_id !== reportId);
    saveStore();
    res.json({ message: 'Rapport supprimé avec succès.' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur lors de la suppression du rapport.' });
  }
});

export default router;
