import express from 'express';
import { dbStore, saveStore, getDerDisplayName } from '../config/db.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/', verifyToken, (req, res) => {
  const user = dbStore.users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ error: 'Utilisateur non trouvé.' });
  }

  const der = user.role === 'ADMINISTRATEUR' ? null : dbStore.ders.find(d => d.id === user.der_id);

  res.json({
    id: user.id,
    nom: user.nom,
    prenom: user.prenom,
    email: user.email,
    telephone: user.telephone,
    province: user.role === 'ADMINISTRATEUR' ? 'Siège National' : user.province,
    der_id: user.role === 'ADMINISTRATEUR' ? null : user.der_id,
    der_nom: getDerDisplayName(der, user.role),
    der_code: der ? der.code : 'SIEGE',
    role: user.role
  });
});

router.put('/', verifyToken, (req, res) => {
  try {
    const user = dbStore.users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé.' });
    }

    const { nom, prenom, email, telephone, province, der_id, role } = req.body;

    if (email && email.trim()) {
      const cleanEmail = email.toLowerCase().trim();
      if (!cleanEmail.endsWith('@gmail.com') && !cleanEmail.endsWith('@sonabel.bf')) {
        return res.status(400).json({ error: 'Seules les adresses Gmail (@gmail.com) ou SONABEL (@sonabel.bf) sont autorisées.' });
      }

      const existingUser = dbStore.users.find(u => u.id !== user.id && u.email.toLowerCase() === cleanEmail);
      if (existingUser) {
        return res.status(400).json({ error: 'Cette adresse email est déjà utilisée par un autre utilisateur.' });
      }
      user.email = cleanEmail;
    }

    if (nom) user.nom = nom.trim();
    if (prenom) user.prenom = prenom.trim();
    if (telephone) user.telephone = telephone.trim();

    // Allow role change if the current user is an admin or if role is specified
    if (role && role !== user.role && req.user.role === 'ADMINISTRATEUR') {
      if (role === 'ADMINISTRATEUR') {
        const currentAdminCount = dbStore.users.filter(u => u.role === 'ADMINISTRATEUR').length;
        if (currentAdminCount >= 2) {
          return res.status(400).json({ error: 'Le nombre maximum de 2 comptes administrateurs a déjà été atteint.' });
        }
      }
      user.role = role;
    }

    if (user.role === 'ADMINISTRATEUR') {
      user.der_id = null;
      user.province = 'Siège National';
    } else {
      if (province) user.province = province.trim();
      if (der_id !== undefined && der_id !== '' && der_id !== null) {
        const parsedDerId = parseInt(der_id, 10);
        if (isNaN(parsedDerId) || Array.isArray(der_id)) {
          return res.status(400).json({ error: 'Un utilisateur ne peut être rattaché qu\'à une seule Direction Régionale (DER).' });
        }
        const der = dbStore.ders.find(d => d.id === parsedDerId);
        if (!der) {
          return res.status(400).json({ error: 'Direction Régionale invalide.' });
        }
        user.der_id = parsedDerId;
      }
    }

    saveStore();

    const der = user.role === 'ADMINISTRATEUR' ? null : dbStore.ders.find(d => d.id === user.der_id);

    res.json({
      message: 'Profil mis à jour avec succès.',
      user: {
        id: user.id,
        nom: user.nom,
        prenom: user.prenom,
        email: user.email,
        telephone: user.telephone,
        province: user.province,
        der_id: user.der_id,
        der_nom: getDerDisplayName(der, user.role),
        der_code: der ? der.code : 'SIEGE',
        role: user.role
      }
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Erreur lors de la mise à jour du profil.' });
  }
});

export default router;
