import express from 'express';
import cors from 'cors';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import { dbStore, saveStore } from './config/db.js';

import authRoutes from './routes/auth.js';
import profileRoutes from './routes/profile.js';
import dersRoutes from './routes/ders.js';
import reportsRoutes from './routes/reports.js';
import dashboardRoutes from './routes/dashboard.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/ders', dersRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Serve Frontend Static Files if built
const distPath = path.resolve(__dirname, '../dist');
if (fs.existsSync(distPath)) {
  console.log('📦 Serving static frontend from:', distPath);
  app.use(express.static(distPath));
  
  // Express 5 SPA Fallback for all non-API GET requests
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(distPath, 'index.html'));
    }
    next();
  });
}

// Seed initial demo data if users table is empty
async function seedInitialData() {
  if (dbStore.users.length === 0) {
    console.log('🌱 Seeding initial demo users and sample reports...');
    const salt = await bcrypt.genSalt(10);
    const password_hash = await bcrypt.hash('sonabel123', salt);

    // Create Agent User
    const user1 = {
      id: dbStore.counters.user++,
      nom: 'OUEDRAOGO',
      prenom: 'Salif',
      telephone: '+226 70 12 34 56',
      email: 'salif.ouedraogo@sonabel.bf',
      password_hash,
      province: 'Kadiogo',
      der_id: 5, // ACCE-DER KADIOGO-Ouagadougou
      role: 'UTILISATEUR',
      created_at: new Date().toISOString()
    };

    // Create Supervisor User
    const user2 = {
      id: dbStore.counters.user++,
      nom: 'SANOU',
      prenom: 'Mariam',
      telephone: '+226 76 98 76 54',
      email: 'mariam.sanou@sonabel.bf',
      password_hash,
      province: 'Houet',
      der_id: 4, // ACBO-DER GUIRIKO-Bobo-Dioulasso
      role: 'UTILISATEUR',
      created_at: new Date().toISOString()
    };

    // Create Admin User
    const user3 = {
      id: dbStore.counters.user++,
      nom: 'KABORE',
      prenom: 'Adama',
      telephone: '+226 78 11 22 33',
      email: 'admin@sonabel.bf',
      password_hash,
      province: 'Kadiogo',
      der_id: 5,
      role: 'ADMINISTRATEUR',
      created_at: new Date().toISOString()
    };

    dbStore.users.push(user1, user2, user3);

    // Create Sample Reports
    const r1Id = dbStore.counters.report++;
    const report1 = {
      id: r1Id,
      user_id: user1.id,
      der_id: 5,
      semaine_code: '2026-W35',
      date_debut: '2026-08-24',
      date_fin: '2026-08-30',
      rencontres_texte: 'Réunion d\'évaluation des infrastructures électriques de Ouagadougou. Alignement stratégique avec l\'équipe technique.',
      facturation_mois: 'Août 2026',
      facturation_nb: 1450,
      int_config_pc: 12,
      int_dep_pc: 8,
      int_config_imp: 4,
      int_dep_imp: 3,
      int_dep_reseau: 15,
      int_config_log: 9,
      divers_nb: 6,
      ecart_motif: 'Contraintes de planning',
      ecart_texte: 'Décalage d\'une intervention réseau suite au retard de livraison des commutateurs CISCO.',
      statut: 'A_JOUR',
      soumis_le: '2026-08-28T16:30:00.000Z',
      created_at: '2026-08-28T16:30:00.000Z',
      updated_at: '2026-08-28T16:30:00.000Z'
    };

    const r2Id = dbStore.counters.report++;
    const report2 = {
      id: r2Id,
      user_id: user2.id,
      der_id: 4,
      semaine_code: '2026-W35',
      date_debut: '2026-08-24',
      date_fin: '2026-08-30',
      rencontres_texte: 'Visite de contrôle au poste de transformation de Bobo-Dioulasso. Échanges avec la direction régionale.',
      facturation_mois: 'Août 2026',
      facturation_nb: 980,
      int_config_pc: 5,
      int_dep_pc: 3,
      int_config_imp: 2,
      int_dep_imp: 1,
      int_dep_reseau: 7,
      int_config_log: 4,
      divers_nb: 2,
      ecart_motif: 'Panne réseau',
      ecart_texte: 'Coupure fibre optique entre Bobo et Houndé résolue en 4h.',
      statut: 'EN_RETARD',
      soumis_le: '2026-08-30T09:15:00.000Z',
      created_at: '2026-08-30T09:15:00.000Z',
      updated_at: '2026-08-30T09:15:00.000Z'
    };

    dbStore.reports.push(report1, report2);

    dbStore.missions.push(
      {
        id: dbStore.counters.mission++,
        report_id: r1Id,
        lieu: 'Agence SONABEL Tanghin',
        date_mission: '2026-08-25',
        objet: 'Installation et configuration de 5 nouveaux postes de travail et de l\'imprimante réseau.',
        created_at: new Date().toISOString()
      },
      {
        id: dbStore.counters.mission++,
        report_id: r1Id,
        lieu: 'Poste HT Zagtouli',
        date_mission: '2026-08-27',
        objet: 'Diagnostic de l\'équipement télécoms et remise en service du routeur secours.',
        created_at: new Date().toISOString()
      },
      {
        id: dbStore.counters.mission++,
        report_id: r2Id,
        lieu: 'Sous-station Banakeledaga',
        date_mission: '2026-08-26',
        objet: 'Inspection périodique du matériel réseau et audit de sécurité informatique.',
        created_at: new Date().toISOString()
      }
    );

    saveStore();
    console.log('✅ Demo data seeded successfully.');
  }
}

seedInitialData();

const HOST = '0.0.0.0';

const server = app.listen(PORT, HOST, () => {
  console.log(`🚀 Serveur SONABEL API et Web App à l'écoute sur http://${HOST}:${PORT}`);
  console.log(`📡 Accessible sur le réseau local via l'adresse IP de cette machine (ex: http://<IP_LOCAL>:${PORT})`);
});

setInterval(() => {}, 60000);
