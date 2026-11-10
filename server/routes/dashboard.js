import express from 'express';
import bcrypt from 'bcryptjs';
import { dbStore, saveStore, getDerDisplayName } from '../config/db.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/stats', verifyToken, (req, res) => {
  try {
    const selectedYear = (req.query.year || new Date().getFullYear().toString()).trim();
    const totalDers = dbStore.ders.length;
    const totalUsers = dbStore.users.length;

    // Filter reports for selected year
    const yearReports = dbStore.reports.filter(r => r.semaine_code && r.semaine_code.startsWith(selectedYear));
    const totalReports = yearReports.length;

    const onTimeReports = yearReports.filter(r => r.statut === 'A_JOUR').length;
    const lateReports = yearReports.filter(r => r.statut === 'EN_RETARD').length;

    let totalFactures = 0;
    let intConfigPc = 0;
    let intDepPc = 0;
    let intConfigImp = 0;
    let intDepImp = 0;
    let intDepReseau = 0;
    let intConfigLog = 0;

    let globalProg = 0;
    let globalEff = 0;

    const reportIds = new Set(yearReports.map(r => r.id));
    const totalMissions = dbStore.missions.filter(m => reportIds.has(m.report_id)).length;

    yearReports.forEach(r => {
      totalFactures += (r.facturation_nb || 0);
      intConfigPc += (r.int_config_pc || 0);
      intDepPc += (r.int_dep_pc || 0);
      intConfigImp += (r.int_config_imp || 0);
      intDepImp += (r.int_dep_imp || 0);
      intDepReseau += (r.int_dep_reseau || 0);
      intConfigLog += (r.int_config_log || 0);

      globalProg += (r.maintenance_programmee || 0);
      globalEff += (r.maintenance_effectuee || 0);
    });

    const totalInterventions = intConfigPc + intDepPc + intConfigImp + intDepImp + intDepReseau + intConfigLog;

    // Global Consolidated Realization Rate
    let globalRealizationRate = 0;
    if (globalProg > 0) {
      globalRealizationRate = Math.min(100, Math.round((globalEff / globalProg) * 100));
    } else if (globalEff > 0) {
      globalRealizationRate = 100;
    } else if (totalReports > 0) {
      const totalExpected = Math.max(1, totalUsers * 52);
      globalRealizationRate = Math.min(100, Math.round((totalReports / totalExpected) * 100));
    }

    const derStats = dbStore.ders.map(der => {
      const derReports = yearReports.filter(r => r.der_id === der.id);
      const derUsers = dbStore.users.filter(u => u.der_id === der.id);
      const derOnTime = derReports.filter(r => r.statut === 'A_JOUR').length;
      const derLate = derReports.filter(r => r.statut === 'EN_RETARD').length;

      let derProg = 0;
      let derEff = 0;
      derReports.forEach(r => {
        derProg += (r.maintenance_programmee || 0);
        derEff += (r.maintenance_effectuee || 0);
      });

      let derRealizationRate = 0;
      if (derProg > 0) {
        derRealizationRate = Math.min(100, Math.round((derEff / derProg) * 100));
      } else if (derEff > 0) {
        derRealizationRate = 100;
      } else if (derReports.length > 0) {
        const derExpected = Math.max(52, derUsers.length * 52);
        derRealizationRate = Math.min(100, Math.round((derReports.length / derExpected) * 100));
      }

      return {
        id: der.id,
        code: der.code,
        nom: getDerDisplayName(der),
        chef_lieu: der.chef_lieu,
        users_count: derUsers.length,
        reports_count: derReports.length,
        on_time_count: derOnTime,
        late_count: derLate,
        annual_realization_rate: derRealizationRate,
        responsable: der.responsable_nom
      };
    });

    res.json({
      selectedYear,
      totalDers,
      totalUsers,
      totalReports,
      onTimeReports,
      lateReports,
      totalInterventions,
      totalFactures,
      totalMissions,
      globalRealizationRate,
      interventionsByType: {
        configPc: intConfigPc,
        depPc: intDepPc,
        configImp: intConfigImp,
        depImp: intDepImp,
        depReseau: intDepReseau,
        configLog: intConfigLog
      },
      derStats
    });
  } catch (err) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Erreur lors de la génération du tableau de bord.' });
  }
});

// Requirement 3: Global Consolidated Report endpoint reserved for Admins
router.get('/global-report', verifyToken, requireRole('ADMINISTRATEUR'), (req, res) => {
  try {
    const { period_type, period_value } = req.query; // period_type: 'week' | 'month' | 'year'

    let filteredReports = [...dbStore.reports];

    if (period_type === 'week' && period_value) {
      filteredReports = filteredReports.filter(r => r.semaine_code.includes(period_value));
    } else if (period_type === 'month' && period_value) {
      filteredReports = filteredReports.filter(r => {
        if (!r.date_debut) return false;
        const m = (new Date(r.date_debut).getMonth() + 1).toString().padStart(2, '0');
        return m === period_value || r.facturation_mois?.toLowerCase().includes(period_value.toLowerCase());
      });
    } else if (period_type === 'year' && period_value) {
      filteredReports = filteredReports.filter(r => r.semaine_code.startsWith(period_value));
    }

    const derConsolidated = dbStore.ders.map(der => {
      const derReports = filteredReports.filter(r => r.der_id === der.id);
      
      let totalFactures = 0;
      let intConfigPc = 0;
      let intDepPc = 0;
      let intConfigImp = 0;
      let intDepImp = 0;
      let intDepReseau = 0;
      let intConfigLog = 0;
      let totalMissions = 0;

      let totalSites = 0;
      let totalProg = 0;
      let totalEff = 0;
      let observationsList = [];

      derReports.forEach(r => {
        totalFactures += (r.facturation_nb || 0);
        intConfigPc += (r.int_config_pc || 0);
        intDepPc += (r.int_dep_pc || 0);
        intConfigImp += (r.int_config_imp || 0);
        intDepImp += (r.int_dep_imp || 0);
        intDepReseau += (r.int_dep_reseau || 0);
        intConfigLog += (r.int_config_log || 0);

        totalSites += (r.nb_sites || 0);
        totalProg += (r.maintenance_programmee || 0);
        totalEff += (r.maintenance_effectuee || 0);

        if (r.maintenance_obs) observationsList.push(r.maintenance_obs);

        const rMissions = dbStore.missions.filter(m => m.report_id === r.id);
        totalMissions += rMissions.length;
      });

      const totalInterventions = intConfigPc + intDepPc + intConfigImp + intDepImp + intDepReseau + intConfigLog;
      const tauxRealisation = totalProg > 0 ? Math.min(100, Math.round((totalEff / totalProg) * 100)) : (totalSites > 0 && totalEff > 0 ? 100 : 0);

      return {
        der_id: der.id,
        der_code: der.code,
        der_nom: getDerDisplayName(der),
        chef_lieu: der.chef_lieu,
        reports_count: derReports.length,
        totalFactures,
        totalInterventions,
        interventionsByType: {
          configPc: intConfigPc,
          depPc: intDepPc,
          configImp: intConfigImp,
          depImp: intDepImp,
          depReseau: intDepReseau,
          configLog: intConfigLog
        },
        totalMissions,
        totalSites,
        totalProg,
        totalEff,
        tauxRealisation,
        observations: observationsList.join(' ; ') || '-'
      };
    });

    // Calculate Global Total row
    let grandTotalReports = 0;
    let grandTotalFactures = 0;
    let grandTotalInterventions = 0;
    let grandTotalMissions = 0;
    let grandTotalSites = 0;
    let grandTotalProg = 0;
    let grandTotalEff = 0;

    derConsolidated.forEach(d => {
      grandTotalReports += d.reports_count;
      grandTotalFactures += d.totalFactures;
      grandTotalInterventions += d.totalInterventions;
      grandTotalMissions += d.totalMissions;
      grandTotalSites += d.totalSites;
      grandTotalProg += d.totalProg;
      grandTotalEff += d.totalEff;
    });

    const grandTauxRealisation = grandTotalProg > 0 ? Math.min(100, Math.round((grandTotalEff / grandTotalProg) * 100)) : 0;

    res.json({
      period_type: period_type || 'all',
      period_value: period_value || 'Global',
      total_reports_submitted: grandTotalReports,
      total_factures: grandTotalFactures,
      total_interventions: grandTotalInterventions,
      total_missions: grandTotalMissions,
      grand_total_sites: grandTotalSites,
      grand_total_prog: grandTotalProg,
      grand_total_eff: grandTotalEff,
      grand_taux_realisation: grandTauxRealisation,
      ders: derConsolidated
    });
  } catch (err) {
    console.error('Global report error:', err);
    res.status(500).json({ error: 'Erreur lors de la génération du rapport global consolidé.' });
  }
});

// Admin endpoint to list all user profiles with stats for the dashboard
router.get('/users', verifyToken, requireRole('ADMINISTRATEUR'), (req, res) => {
  try {
    const usersWithStats = dbStore.users.map(u => {
      const der = u.role === 'ADMINISTRATEUR' ? null : dbStore.ders.find(d => d.id === u.der_id);
      const uReports = dbStore.reports.filter(r => r.user_id === u.id);
      return {
        id: u.id,
        nom: u.nom,
        prenom: u.prenom,
        email: u.email,
        telephone: u.telephone,
        province: u.role === 'ADMINISTRATEUR' ? 'Siège National' : u.province,
        der_id: u.role === 'ADMINISTRATEUR' ? null : u.der_id,
        der_nom: getDerDisplayName(der, u.role),
        role: u.role,
        created_at: u.created_at,
        reports_count: uReports.length,
        on_time_count: uReports.filter(r => r.statut === 'A_JOUR').length,
        late_count: uReports.filter(r => r.statut === 'EN_RETARD').length
      };
    });
    res.json(usersWithStats);
  } catch (err) {
    console.error('Error fetching dashboard users:', err);
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs.' });
  }
});

// Admin endpoint to edit any user profile
router.put('/users/:id', verifyToken, requireRole('ADMINISTRATEUR'), async (req, res) => {
  try {
    const userId = parseInt(req.params.id, 10);
    const user = dbStore.users.find(u => u.id === userId);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    const { nom, prenom, email, telephone, province, der_id, role, password } = req.body;

    if (password && password.trim()) {
      if (password.trim().length < 6) {
        return res.status(400).json({ error: 'Le mot de passe doit comporter au moins 6 caractères.' });
      }
      const salt = await bcrypt.genSalt(10);
      user.password_hash = await bcrypt.hash(password.trim(), salt);
    }

    if (email && email.trim()) {
      const cleanEmail = email.toLowerCase().trim();
      if (!cleanEmail.endsWith('@gmail.com') && !cleanEmail.endsWith('@sonabel.bf')) {
        return res.status(400).json({ error: 'Seules les adresses Gmail (@gmail.com) ou SONABEL (@sonabel.bf) sont autorisées.' });
      }

      const existingUser = dbStore.users.find(u => u.id !== user.id && u.email.toLowerCase() === cleanEmail);
      if (existingUser) {
        return res.status(400).json({ error: 'Un autre compte utilise déjà cette adresse email.' });
      }
      user.email = cleanEmail;
    }

    if (role && role !== user.role) {
      if (role === 'ADMINISTRATEUR') {
        const currentAdminCount = dbStore.users.filter(u => u.role === 'ADMINISTRATEUR').length;
        if (currentAdminCount >= 2) {
          return res.status(400).json({ error: 'Le nombre maximum de 2 comptes administrateurs a déjà été atteint.' });
        }
      }
      user.role = role;
    }

    if (nom) user.nom = nom.trim();
    if (prenom) user.prenom = prenom.trim();
    if (telephone !== undefined) user.telephone = telephone.trim();

    if (user.role === 'ADMINISTRATEUR') {
      user.der_id = null;
      user.province = 'Siège National';
    } else {
      if (province !== undefined) user.province = province.trim();
      if (der_id !== undefined && der_id !== '' && der_id !== null) {
        const parsedDerId = parseInt(der_id, 10);
        const der = dbStore.ders.find(d => d.id === parsedDerId);
        if (!der) {
          return res.status(400).json({ error: 'Direction Régionale invalide.' });
        }
        user.der_id = parsedDerId;
      }
    }

    saveStore();

    const der = user.role === 'ADMINISTRATEUR' ? null : dbStore.ders.find(d => d.id === user.der_id);
    const uReports = dbStore.reports.filter(r => r.user_id === user.id);

    res.json({
      message: 'Profil utilisateur mis à jour avec succès.',
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone,
        province: user.province,
        der_id: user.der_id,
        der_nom: getDerDisplayName(der, user.role),
        role: user.role,
        created_at: user.created_at,
        reports_count: uReports.length,
        on_time_count: uReports.filter(r => r.statut === 'A_JOUR').length,
        late_count: uReports.filter(r => r.statut === 'EN_RETARD').length
      }
    });
  } catch (err) {
    console.error('Error updating user profile:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du profil utilisateur.' });
  }
});

export default router;
