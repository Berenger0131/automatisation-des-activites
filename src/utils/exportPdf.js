import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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

export function exportReportToPDF(report) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryColor = [11, 37, 69];    // #0B2545 Dark Navy
  const goldColor = [253, 184, 19];     // #FDB813 Gold
  const accentColor = [19, 64, 116];    // #134074 Accent Blue

  // Header Banner
  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 210, 32, 'F');

  // Gold accent bar below header
  doc.setFillColor(...goldColor);
  doc.rect(0, 32, 210, 3, 'F');

  // Title in Banner
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('SOCIÉTÉ NATIONALE D\'ÉLECTRICITÉ DU BURKINA FASO', 15, 14);

  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(253, 184, 19);
  doc.text('RAPPORT D\'ACTIVITÉ HEBDOMADAIRE - SONABEL', 15, 22);

  doc.setFontSize(9);
  doc.setTextColor(220, 225, 235);
  doc.text(`Émis le : ${new Date().toLocaleDateString('fr-FR')}`, 155, 22);

  let y = 43;

  // Metadata Card Block
  doc.setFillColor(245, 247, 250);
  doc.roundedRect(14, y, 182, 36, 3, 3, 'F');
  doc.setDrawColor(200, 210, 225);
  doc.roundedRect(14, y, 182, 36, 3, 3, 'D');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);

  // Left Column
  doc.text('AGENT :', 18, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 40, 40);
  const agentText = `${report.agent_nom || 'Non spécifié'} (${report.agent_email || ''})`;
  const splitAgentText = doc.splitTextToSize(agentText, 68);
  doc.text(splitAgentText[0], 60, y + 8);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('DIRECTION :', 18, y + 16);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 40, 40);
  const derText = `${report.der_nom || 'DER SONABEL'}`;
  const splitDerText = doc.splitTextToSize(derText, 68);
  doc.text(splitDerText[0], 60, y + 16);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('CONTACT / VILLE :', 18, y + 24);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 40, 40);
  const contactText = `${report.agent_telephone || 'N/A'} | ${report.der_chef_lieu || 'N/A'}`;
  const splitContactText = doc.splitTextToSize(contactText, 68);
  doc.text(splitContactText[0], 60, y + 24);

  // Right Column
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('SEMAINE :', 135, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 40, 40);
  doc.text(`${report.semaine_code || 'W-Code'}`, 160, y + 8);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('PÉRIODE :', 135, y + 16);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(40, 40, 40);
  doc.text(`${formatDateDisplay(report.date_debut)} au ${formatDateDisplay(report.date_fin)}`, 160, y + 16);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...primaryColor);
  doc.text('STATUT :', 135, y + 24);
  
  if (report.statut === 'EN_RETARD') {
    doc.setTextColor(220, 38, 38);
    doc.text('EN RETARD', 160, y + 24);
  } else {
    doc.setTextColor(16, 185, 129);
    doc.text('À JOUR', 160, y + 24);
  }

  y += 44;

  // Helper Section Header
  const renderSectionHeader = (title) => {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    doc.setFillColor(...accentColor);
    doc.rect(14, y, 182, 7, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(255, 255, 255);
    doc.text(title.toUpperCase(), 18, y + 5);
    y += 11;
  };

  // 1. Rencontres & Reunions
  renderSectionHeader('1. Rencontres & Réunions de travail');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);

  const txt = report.rencontres_texte || 'Aucune réunion spécifique enregistrée pour cette semaine.';
  const splitTxt = doc.splitTextToSize(txt, 178);
  doc.text(splitTxt, 18, y);
  y += (splitTxt.length * 4.5) + 6;

  // 2. Missions de Terrain Table
  renderSectionHeader('2. Missions de terrain réalisées');
  if (report.missions && report.missions.length > 0) {
    const tableData = report.missions.map(m => {
      const mStart = m.date_debut || m.date_mission;
      const mEnd = m.date_fin || mStart;
      const days = calculateDays(mStart, mEnd);
      const displayRange = `${formatDateDisplay(mStart)} à ${formatDateDisplay(mEnd)} (${days} jour${days > 1 ? 's' : ''})`;

      return [
        m.lieu || 'N/A',
        displayRange,
        m.objet || 'N/A'
      ];
    });

    autoTable(doc, {
      startY: y,
      head: [['Lieu de la mission', 'Période & Durée', 'Objet & Description']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillStyle: 'F', fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 8.5, cellPadding: 3, overflow: 'linebreak' },
      columnStyles: {
        0: { cellWidth: 45 },
        1: { cellWidth: 50 },
        2: { cellWidth: 87 }
      },
      margin: { left: 14, right: 14 }
    });
    y = doc.lastAutoTable.finalY + 8;
  } else {
    doc.setFont('helvetica', 'italic');
    doc.text('Aucune mission de terrain enregistrée cette semaine.', 18, y);
    y += 10;
  }

  // 3. Facturation
  renderSectionHeader('3. Facturation & Traitement des données');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(40, 40, 40);
  doc.text(`• Mois concerné : ${report.facturation_mois || 'Non précisé'}`, 18, y);
  doc.text(`• Nombre de factures traitées : ${report.facturation_nb || 0} factures`, 100, y);
  y += 12;

  // 4. Interventions Techniques (Table Summary)
  renderSectionHeader('4. Interventions informatiques et réseaux');
  const totalInt = (report.int_config_pc || 0) + (report.int_dep_pc || 0) + (report.int_config_imp || 0) + 
                   (report.int_dep_imp || 0) + (report.int_dep_reseau || 0) + (report.int_config_log || 0);

  const intData = [
    ['Configuration PC', report.int_config_pc || 0, 'Dépannage PC', report.int_dep_pc || 0],
    ['Configuration Imprimante', report.int_config_imp || 0, 'Dépannage Imprimante', report.int_dep_imp || 0],
    ['Dépannage Réseau', report.int_dep_reseau || 0, 'Configuration Logiciels', report.int_config_log || 0],
    ['', '', 'TOTAL INTERVENTIONS', totalInt]
  ];

  autoTable(doc, {
    startY: y,
    head: [['Type d\'intervention', 'Nombre', 'Type d\'intervention', 'Nombre']],
    body: intData,
    theme: 'plain',
    headStyles: { fillStyle: 'F', fillColor: [230, 235, 245], textColor: primaryColor, fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    margin: { left: 14, right: 14 }
  });

  y = doc.lastAutoTable.finalY + 8;

  // 5. DIVERS (TEXTE LIBRE)
  renderSectionHeader('5. Divers & Assistances (Texte Libre)');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(50, 50, 50);

  const diversTxt = report.divers_texte || 'Aucune observation enregistrée.';
  const splitDivers = doc.splitTextToSize(diversTxt, 178);
  doc.text(splitDivers, 18, y);
  y += (splitDivers.length * 4.5) + 6;

  // Footer / Visa Block (Agent Signature Removed)
  if (y > 245) {
    doc.addPage();
    y = 20;
  } else {
    y += 8;
  }

  doc.setDrawColor(200, 200, 200);
  doc.line(14, y, 196, y);
  y += 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...primaryColor);
  doc.text('Visa de la Direction Régionale :', 130, y);

  // Footer Page Numbering
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(120, 120, 120);
    doc.text(`SONABEL - Système Suivi des Rapports Hebdomadaires | Page ${i} sur ${pageCount}`, 105, 290, { align: 'center' });
  }

  const filename = `Rapport_SONABEL_${report.der_nom ? report.der_nom.replace(/\s+/g, '_') : 'DER'}_${report.semaine_code || 'W'}.pdf`;
  doc.save(filename);
}

export function exportGlobalReportToPDF(globalReport) {
  if (!globalReport || !globalReport.ders) return;

  const doc = new jsPDF({
    orientation: 'landscape',
    unit: 'mm',
    format: 'a4'
  });

  const primaryColor = [11, 37, 69];
  const goldColor = [253, 184, 19];

  doc.setFillColor(...primaryColor);
  doc.rect(0, 0, 297, 28, 'F');
  doc.setFillColor(...goldColor);
  doc.rect(0, 28, 297, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('SONABEL - RAPPORT GLOBAL CONSOLIDÉ DES 17 DIRECTIONS RÉGIONALES (DER)', 14, 14);

  doc.setFontSize(10);
  doc.setTextColor(253, 184, 19);
  doc.text(`Période : ${globalReport.period_type || 'Global'} - ${globalReport.period_value || ''} | Généré le : ${new Date().toLocaleDateString('fr-FR')}`, 14, 22);

  const tableData = globalReport.ders.map(d => [
    d.der_nom,
    d.reports_count,
    d.totalFactures,
    d.totalMissions,
    d.totalInterventions,
    d.totalSites,
    d.totalProg,
    d.totalEff,
    `${d.tauxRealisation}%`
  ]);

  tableData.push([
    'TOTAL CONSOLIDÉ',
    globalReport.total_reports_submitted,
    globalReport.total_factures,
    globalReport.total_missions,
    globalReport.total_interventions,
    globalReport.grand_total_sites,
    globalReport.grand_total_prog,
    globalReport.grand_total_eff,
    `${globalReport.grand_taux_realisation}%`
  ]);

  autoTable(doc, {
    startY: 36,
    head: [['DER', 'Rapports', 'Factures', 'Missions', 'Interventions', 'Nb Sites', 'Maint. Prog.', 'Maint. Eff.', 'Taux Réal.']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillStyle: 'F', fillColor: primaryColor, textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 8.5, cellPadding: 2.5 },
    margin: { left: 14, right: 14 }
  });

  const filename = `Rapport_Global_SONABEL_${globalReport.period_value || 'Consolide'}.pdf`;
  doc.save(filename);
}
