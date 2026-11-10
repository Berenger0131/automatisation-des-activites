import express from 'express';
import { dbStore } from '../config/db.js';

const router = express.Router();

import { getDerDisplayName } from '../config/db.js';

router.get('/', (req, res) => {
  const ders = dbStore.ders.map(d => ({
    ...d,
    nom_interne: d.nom,
    nom: getDerDisplayName(d)
  }));
  res.json(ders);
});

router.get('/:id', (req, res) => {
  const der = dbStore.ders.find(d => d.id === parseInt(req.params.id, 10));
  if (!der) {
    return res.status(404).json({ error: 'DER non trouvée.' });
  }
  res.json({
    ...der,
    nom_interne: der.nom,
    nom: getDerDisplayName(der)
  });
});

export default router;
