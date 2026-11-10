import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let oracledb;
try {
  oracledb = await import('oracledb');
  if (oracledb && oracledb.default) {
    oracledb.default.autoCommit = true;
  }
} catch (err) {
  // Optional driver info
}

const DATA_FILE = path.join(__dirname, '../data_store.json');

export const INITIAL_DERS = [
  { id: 1, code: 'ACBA-DER', nom: 'BANKUI DÉDOUGOU', chef_lieu: 'Dédougou', provinces: 'Mouhoun, Nayala, Kossi, Sourou, Balé, Banwa', responsable_nom: 'KABORE Boureima', responsable_email: 'b.kabore@sonabel.bf', responsable_telephone: '+226 70 11 22 33' },
  { id: 2, code: 'ACGA-DER', nom: 'DJÔRÔ GAOUA', chef_lieu: 'Gaoua', provinces: 'Poni, Bougouriba, Ioba, Noumbiel', responsable_nom: 'SOME Jean-Baptiste', responsable_email: 'jb.some@sonabel.bf', responsable_telephone: '+226 70 22 33 44' },
  { id: 3, code: 'ACFA-DER', nom: 'GOULMOU FADA N\'GOURMA', chef_lieu: 'Fada N\'Gourma', provinces: 'Gourma, Gnagna, Komondjari, Kompienga, Tapoa', responsable_nom: 'THIOMBIANO Harouna', responsable_email: 'h.thiombiano@sonabel.bf', responsable_telephone: '+226 70 33 44 55' },
  { id: 4, code: 'ACBO-DER', nom: 'GUIRIKO BOBO-DIOULASSO', chef_lieu: 'Bobo-Dioulasso', provinces: 'Houet, Tuy, Kénédougou', responsable_nom: 'SANOU Lassina', responsable_email: 'l.sanou@sonabel.bf', responsable_telephone: '+226 70 44 55 66' },
  { id: 5, code: 'ACCE-DER', nom: 'KADIOGO OUAGADOUGOU', chef_lieu: 'Ouagadougou', provinces: 'Kadiogo', responsable_nom: 'OUEDRAOGO Abdoulaye', responsable_email: 'a.ouedraogo@sonabel.bf', responsable_telephone: '+226 70 55 66 77' },
  { id: 6, code: 'ACCN-DER', nom: 'KUILSÉ KAYA', chef_lieu: 'Kaya', provinces: 'Sanmatenga, Namentenga, Bam', responsable_nom: 'SAWADOGO François', responsable_email: 'f.sawadogo@sonabel.bf', responsable_telephone: '+226 70 66 77 88' },
  { id: 7, code: 'ACDO-DER', nom: 'LIPTAKO DORI', chef_lieu: 'Dori', provinces: 'Séno, Yagha, Oudalan, Soum', responsable_nom: 'MAIGA Ousmane', responsable_email: 'o.maiga@sonabel.bf', responsable_telephone: '+226 70 77 88 99' },
  { id: 8, code: 'ACKO-DER', nom: 'NANDO KOUDOUGOU', chef_lieu: 'Koudougou', provinces: 'Boulkiemdé, Sanguié, Passoré, Ziro', responsable_nom: 'YAMEOGO Patrice', responsable_email: 'p.yameogo@sonabel.bf', responsable_telephone: '+226 70 88 99 00' },
  { id: 9, code: 'ACTE-DER', nom: 'NAKAMBÉ TENKODOGO', chef_lieu: 'Tenkodogo', provinces: 'Boulgou, Koulpélogo, Kouritenga', responsable_nom: 'ZONGO Issouf', responsable_email: 'i.zongo@sonabel.bf', responsable_telephone: '+226 71 11 22 33' },
  { id: 10, code: 'ACPO-DER', nom: 'NAZINON MANGA', chef_lieu: 'Manga', provinces: 'Zoundwéogo, Bazèga, Nahouri', responsable_nom: 'COMPAORE Pascal', responsable_email: 'p.compaore@sonabel.bf', responsable_telephone: '+226 71 22 33 44' },
  { id: 11, code: 'ACPC-DER', nom: 'OUBRI ZINIARÉ', chef_lieu: 'Ziniaré', provinces: 'Oubritenga, Ganzourgou, Kourwéogo', responsable_nom: 'ILBOUDO Paul', responsable_email: 'p.ilboudo@sonabel.bf', responsable_telephone: '+226 71 33 44 55' },
  { id: 12, code: 'ACSR-DER', nom: 'SIRBA BOGANDÉ', chef_lieu: 'Bogandé', provinces: 'Gnagna, Sirba', responsable_nom: 'LANKOANDE Moussa', responsable_email: 'm.lankoande@sonabel.bf', responsable_telephone: '+226 71 44 55 66' },
  { id: 13, code: 'ACDJ-DER', nom: 'SOUM DJIBO', chef_lieu: 'Djibo', provinces: 'Soum', responsable_nom: 'DICKO Hamadoun', responsable_email: 'h.dicko@sonabel.bf', responsable_telephone: '+226 71 55 66 77' },
  { id: 14, code: 'ACSO-DER', nom: 'SOUROU TOUGAN', chef_lieu: 'Tougan', provinces: 'Sourou', responsable_nom: 'DRABO Adama', responsable_email: 'a.drabo@sonabel.bf', responsable_telephone: '+226 71 66 77 88' },
  { id: 15, code: 'ACBAF-DER', nom: 'TANNOUNYAN BANFORA', chef_lieu: 'Banfora', provinces: 'Comoé, Léraba', responsable_nom: 'HEBIE Seydou', responsable_email: 's.hebie@sonabel.bf', responsable_telephone: '+226 71 77 88 99' },
  { id: 16, code: 'ACDI-DER', nom: 'TAPOA DIAPAGA', chef_lieu: 'Diapaga', provinces: 'Tapoa', responsable_nom: 'ONADJA Yacouba', responsable_email: 'y.onadja@sonabel.bf', responsable_telephone: '+226 71 88 99 00' },
  { id: 17, code: 'ACOU-DER', nom: 'YAADGA OUAHIGOUYA', chef_lieu: 'Ouahigouya', provinces: 'Yatenga, Loroum, Zondoma', responsable_nom: 'OUEDRAOGO Salif', responsable_email: 's.ouedraogo@sonabel.bf', responsable_telephone: '+226 72 11 22 33' }
];

export let dbStore = {
  ders: INITIAL_DERS,
  users: [],
  reports: [],
  missions: [],
  counters: { user: 1, report: 1, mission: 1 }
};

export function getDerDisplayName(der, role) {
  if (role === 'ADMINISTRATEUR') return 'Siège National (Aucune DER)';
  if (!der || !der.id) return 'Administration Générale (Aucune DER)';
  if (der.chef_lieu) return `DER ${der.chef_lieu.toUpperCase()}`;
  if (der.nom && der.nom.startsWith('DER ')) return der.nom;
  return `DER ${der.nom || 'SONABEL'}`;
}

export function loadStore() {
  if (fs.existsSync(DATA_FILE)) {
    try {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      dbStore = JSON.parse(raw);
      if (!dbStore.ders || dbStore.ders.length === 0) {
        dbStore.ders = INITIAL_DERS;
      }
      if (!dbStore.users) {
        dbStore.users = [];
      }

      // Enforce der_id = null and province = 'Siège National' for all ADMINISTRATEUR users
      dbStore.users.forEach(u => {
        if (u.role === 'ADMINISTRATEUR') {
          u.der_id = null;
          u.province = 'Siège National';
        }
      });

      // Ensure at least 2 admins exist with valid gmail addresses
      const admin1Exists = dbStore.users.some(u => u.email === 'adama.kabore@gmail.com');
      const admin2Exists = dbStore.users.some(u => u.email === 'mariam.admin@gmail.com');
      
      if (!admin1Exists) {
        dbStore.users.push({
          id: dbStore.counters.user++,
          nom: "KABORE",
          prenom: "Adama",
          telephone: "+226 78 11 22 33",
          email: "adama.kabore@gmail.com",
          password_hash: "$2b$10$nRYK258RDyf3w/3lNlhgwe63tq7XOJ8i0zzCzWbk4TGyf0XudDL5G",
          province: "Siège National",
          der_id: null,
          role: "ADMINISTRATEUR",
          created_at: new Date().toISOString()
        });
      }
      if (!admin2Exists) {
        dbStore.users.push({
          id: dbStore.counters.user++,
          nom: "OUEDRAOGO",
          prenom: "Mariam",
          telephone: "+226 70 99 88 77",
          email: "mariam.admin@gmail.com",
          password_hash: "$2b$10$nRYK258RDyf3w/3lNlhgwe63tq7XOJ8i0zzCzWbk4TGyf0XudDL5G",
          province: "Siège National",
          der_id: null,
          role: "ADMINISTRATEUR",
          created_at: new Date().toISOString()
        });
      }
      saveStore();
    } catch (e) {
      console.error('Error loading data file:', e);
    }
  } else {
    saveStore();
  }
}

export function saveStore() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(dbStore, null, 2), 'utf-8');
  } catch (e) {
    console.error('Error saving data store:', e);
  }
}

loadStore();
