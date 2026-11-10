import jwt from 'jsonwebtoken';
import { dbStore } from '../config/db.js';

export const JWT_SECRET = process.env.JWT_SECRET || 'sonabel_sec_jwt_key_2026_bf';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Accès refusé. Aucun jeton d\'authentification fourni.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Format de jeton invalide.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ error: 'Jeton expiré ou invalide.' });
  }
};

export const verifyReportOwnership = (req, res, next) => {
  const reportId = parseInt(req.params.id, 10);
  const report = dbStore.reports.find(r => r.id === reportId);

  if (!report) {
    return res.status(404).json({ error: 'Rapport non trouvé.' });
  }

  const isOwner = parseInt(report.user_id, 10) === parseInt(req.user.id, 10);
  const isAdmin = req.user.role === 'ADMINISTRATEUR';

  if (!isOwner && !isAdmin) {
    return res.status(403).json({ 
      error: 'Action non autorisée. Seul l\'auteur de ce rapport peut le modifier ou le supprimer.' 
    });
  }

  req.report = report;
  next();
};

export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: 'Accès restreint. Droits insuffisants.' });
    }
    next();
  };
};
