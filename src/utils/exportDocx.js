import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, HeadingLevel } from 'docx';
import { saveAs } from 'file-saver';

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

export async function exportReportToDocx(report) {
  const primaryColor = '0B2545';
  const goldColor = 'FDB813';
  const headerBg = 'EEF4F8';

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Banner Title Block
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 120 },
            children: [
              new TextRun({
                text: "SOCIÉTÉ NATIONALE D'ÉLECTRICITÉ DU BURKINA FASO",
                bold: true,
                size: 26,
                color: primaryColor,
                font: "Calibri"
              })
            ]
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
            children: [
              new TextRun({
                text: "RAPPORT D'ACTIVITÉ HEBDOMADAIRE (SONABEL)",
                bold: true,
                size: 22,
                color: goldColor,
                font: "Calibri"
              })
            ]
          }),

          // Metadata Table
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    shading: { fill: headerBg },
                    children: [
                      new Paragraph({ children: [new TextRun({ text: "AGENT : ", bold: true, color: primaryColor }), new TextRun(report.agent_nom || 'N/A')] }),
                      new Paragraph({ children: [new TextRun({ text: "EMAIL : ", bold: true, color: primaryColor }), new TextRun(report.agent_email || 'N/A')] }),
                      new Paragraph({ children: [new TextRun({ text: "TÉLÉPHONE : ", bold: true, color: primaryColor }), new TextRun(report.agent_telephone || 'N/A')] })
                    ]
                  }),
                  new TableCell({
                    width: { size: 50, type: WidthType.PERCENTAGE },
                    shading: { fill: headerBg },
                    children: [
                      new Paragraph({ children: [new TextRun({ text: "DER : ", bold: true, color: primaryColor }), new TextRun(`${report.der_nom || 'N/A'}`)] }),
                      new Paragraph({ children: [new TextRun({ text: "SEMAINE : ", bold: true, color: primaryColor }), new TextRun(report.semaine_code || 'N/A')] }),
                      new Paragraph({ children: [new TextRun({ text: "PÉRIODE : ", bold: true, color: primaryColor }), new TextRun(`${formatDateDisplay(report.date_debut)} au ${formatDateDisplay(report.date_fin)}`)] })
                    ]
                  })
                ]
              })
            ]
          }),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          // Section 1: Rencontres
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({ text: "1. RENCONTRES ET RÉUNIONS DE TRAVAIL", bold: true, color: primaryColor, size: 22 })
            ]
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({ text: report.rencontres_texte || "Aucune réunion spécifique enregistrée pour cette semaine.", size: 20 })
            ]
          }),

          // Section 2: Missions (REQUIREMENT 5: « 10/10/2026 à 13/10/2026 (3 jours) »)
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({ text: "2. MISSIONS DE TERRAIN RÉALISÉES", bold: true, color: primaryColor, size: 22 })
            ]
          }),

          ...(report.missions && report.missions.length > 0
            ? [
                new Table({
                  width: { size: 100, type: WidthType.PERCENTAGE },
                  rows: [
                    new TableRow({
                      children: [
                        new TableCell({ shading: { fill: primaryColor }, children: [new Paragraph({ children: [new TextRun({ text: "Lieu", bold: true, color: "FFFFFF" })] })] }),
                        new TableCell({ shading: { fill: primaryColor }, children: [new Paragraph({ children: [new TextRun({ text: "Période & Durée", bold: true, color: "FFFFFF" })] })] }),
                        new TableCell({ shading: { fill: primaryColor }, children: [new Paragraph({ children: [new TextRun({ text: "Objet & Description", bold: true, color: "FFFFFF" })] })] })
                      ]
                    }),
                    ...report.missions.map(m => {
                      const mStart = m.date_debut || m.date_mission;
                      const mEnd = m.date_fin || mStart;
                      const days = calculateDays(mStart, mEnd);
                      const displayRange = `${formatDateDisplay(mStart)} à ${formatDateDisplay(mEnd)} (${days} jour${days > 1 ? 's' : ''})`;

                      return new TableRow({
                        children: [
                          new TableCell({ children: [new Paragraph(m.lieu || '')] }),
                          new TableCell({ children: [new Paragraph(displayRange)] }),
                          new TableCell({ children: [new Paragraph(m.objet || '')] })
                        ]
                      });
                    })
                  ]
                })
              ]
            : [
                new Paragraph({ children: [new TextRun({ text: "Aucune mission de terrain enregistrée cette semaine.", italic: true, size: 20 })] })
              ]),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          // Section 3: Facturation
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({ text: "3. FACTURATION & DONNÉES", bold: true, color: primaryColor, size: 22 })
            ]
          }),
          new Paragraph({
            spacing: { after: 150 },
            children: [
              new TextRun({ text: `Mois concerné : `, bold: true }),
              new TextRun(report.facturation_mois || 'Non précisé'),
              new TextRun({ text: `   |   Nombre de factures traitées : `, bold: true }),
              new TextRun(String(report.facturation_nb || 0))
            ]
          }),

          // Section 4: Interventions
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({ text: "4. INTERVENTIONS TECHNIQUES (COMPTEURS)", bold: true, color: primaryColor, size: 22 })
            ]
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: headerBg }, children: [new Paragraph({ children: [new TextRun({ text: "Configuration PC", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph(String(report.int_config_pc || 0))] }),
                  new TableCell({ shading: { fill: headerBg }, children: [new Paragraph({ children: [new TextRun({ text: "Dépannage PC", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph(String(report.int_dep_pc || 0))] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: headerBg }, children: [new Paragraph({ children: [new TextRun({ text: "Config Imprimante", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph(String(report.int_config_imp || 0))] }),
                  new TableCell({ shading: { fill: headerBg }, children: [new Paragraph({ children: [new TextRun({ text: "Dépannage Imprimante", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph(String(report.int_dep_imp || 0))] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: headerBg }, children: [new Paragraph({ children: [new TextRun({ text: "Dépannage Réseau", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph(String(report.int_dep_reseau || 0))] }),
                  new TableCell({ shading: { fill: headerBg }, children: [new Paragraph({ children: [new TextRun({ text: "Config Logiciels", bold: true })] })] }),
                  new TableCell({ children: [new Paragraph(String(report.int_config_log || 0))] })
                ]
              }),
              new TableRow({
                children: [
                  new TableCell({ shading: { fill: headerBg }, children: [new Paragraph({ children: [new TextRun({ text: "TOTAL INTERVENTIONS", bold: true })] })] }),
                  new TableCell({ shading: { fill: primaryColor }, children: [new Paragraph({ children: [new TextRun({ text: String(
                    (report.int_config_pc || 0) + (report.int_dep_pc || 0) + (report.int_config_imp || 0) + 
                    (report.int_dep_imp || 0) + (report.int_dep_reseau || 0) + (report.int_config_log || 0)
                  ), bold: true, color: "FFFFFF" })] })] }),
                  new TableCell({ children: [new Paragraph("")] }),
                  new TableCell({ children: [new Paragraph("")] })
                ]
              })
            ]
          }),

          new Paragraph({ text: "", spacing: { after: 200 } }),

          // REQUIREMENT 4: DIVERS (TEXTE LIBRE)
          new Paragraph({
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 },
            children: [
              new TextRun({ text: "5. DIVERS & ASSISTANCES (TEXTE LIBRE)", bold: true, color: primaryColor, size: 22 })
            ]
          }),
          new Paragraph({
            spacing: { after: 200 },
            children: [
              new TextRun({ text: report.divers_texte || "Aucune observation enregistrée.", size: 20 })
            ]
          })
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const filename = `Rapport_SONABEL_${report.der_nom ? report.der_nom.replace(/\s+/g, '_') : 'DER'}_${report.semaine_code || 'W'}.docx`;
  saveAs(blob, filename);
}

export async function exportGlobalReportToDocx(globalReport) {
  if (!globalReport || !globalReport.ders) return;

  const primaryColor = '0B2545';
  const goldColor = 'FDB813';

  const rows = [
    new TableRow({
      children: [
        new TableCell({ shading: { fill: primaryColor }, children: [new Paragraph({ children: [new TextRun({ text: "DER", bold: true, color: "FFFFFF" })] })] }),
        new TableCell({ shading: { fill: primaryColor }, children: [new Paragraph({ children: [new TextRun({ text: "Rapports", bold: true, color: "FFFFFF" })] })] }),
        new TableCell({ shading: { fill: primaryColor }, children: [new Paragraph({ children: [new TextRun({ text: "Factures", bold: true, color: "FFFFFF" })] })] }),
        new TableCell({ shading: { fill: primaryColor }, children: [new Paragraph({ children: [new TextRun({ text: "Missions", bold: true, color: "FFFFFF" })] })] }),
        new TableCell({ shading: { fill: primaryColor }, children: [new Paragraph({ children: [new TextRun({ text: "Interventions", bold: true, color: "FFFFFF" })] })] }),
        new TableCell({ shading: { fill: primaryColor }, children: [new Paragraph({ children: [new TextRun({ text: "Sites", bold: true, color: "FFFFFF" })] })] }),
        new TableCell({ shading: { fill: primaryColor }, children: [new Paragraph({ children: [new TextRun({ text: "Prog.", bold: true, color: "FFFFFF" })] })] }),
        new TableCell({ shading: { fill: primaryColor }, children: [new Paragraph({ children: [new TextRun({ text: "Eff.", bold: true, color: "FFFFFF" })] })] }),
        new TableCell({ shading: { fill: primaryColor }, children: [new Paragraph({ children: [new TextRun({ text: "Taux", bold: true, color: "FFFFFF" })] })] }),
      ]
    }),
    ...globalReport.ders.map(d => new TableRow({
      children: [
        new TableCell({ children: [new Paragraph(d.der_nom)] }),
        new TableCell({ children: [new Paragraph(String(d.reports_count))] }),
        new TableCell({ children: [new Paragraph(String(d.totalFactures))] }),
        new TableCell({ children: [new Paragraph(String(d.totalMissions))] }),
        new TableCell({ children: [new Paragraph(String(d.totalInterventions))] }),
        new TableCell({ children: [new Paragraph(String(d.totalSites))] }),
        new TableCell({ children: [new Paragraph(String(d.totalProg))] }),
        new TableCell({ children: [new Paragraph(String(d.totalEff))] }),
        new TableCell({ children: [new Paragraph(`${d.tauxRealisation}%`)] }),
      ]
    })),
    new TableRow({
      children: [
        new TableCell({ shading: { fill: primaryColor }, children: [new Paragraph({ children: [new TextRun({ text: "TOTAL CONSOLIDÉ", bold: true, color: "FFFFFF" })] })] }),
        new TableCell({ shading: { fill: primaryColor }, children: [new Paragraph({ children: [new TextRun({ text: String(globalReport.total_reports_submitted), bold: true, color: "FFFFFF" })] })] }),
        new TableCell({ shading: { fill: primaryColor }, children: [new Paragraph({ children: [new TextRun({ text: String(globalReport.total_factures), bold: true, color: "FFFFFF" })] })] }),
        new TableCell({ shading: { fill: primaryColor }, children: [new Paragraph({ children: [new TextRun({ text: String(globalReport.total_missions), bold: true, color: "FFFFFF" })] })] }),
        new TableCell({ shading: { fill: primaryColor }, children: [new Paragraph({ children: [new TextRun({ text: String(globalReport.total_interventions), bold: true, color: "FFFFFF" })] })] }),
        new TableCell({ shading: { fill: primaryColor }, children: [new Paragraph({ children: [new TextRun({ text: String(globalReport.grand_total_sites), bold: true, color: "FFFFFF" })] })] }),
        new TableCell({ shading: { fill: primaryColor }, children: [new Paragraph({ children: [new TextRun({ text: String(globalReport.grand_total_prog), bold: true, color: "FFFFFF" })] })] }),
        new TableCell({ shading: { fill: primaryColor }, children: [new Paragraph({ children: [new TextRun({ text: String(globalReport.grand_total_eff), bold: true, color: "FFFFFF" })] })] }),
        new TableCell({ shading: { fill: goldColor }, children: [new Paragraph({ children: [new TextRun({ text: `${globalReport.grand_taux_realisation}%`, bold: true, color: "000000" })] })] }),
      ]
    })
  ];

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 120 },
          children: [
            new TextRun({ text: "SOCIÉTÉ NATIONALE D'ÉLECTRICITÉ DU BURKINA FASO", bold: true, size: 24, color: primaryColor })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
          children: [
            new TextRun({ text: "RAPPORT GLOBAL CONSOLIDÉ (17 DERs)", bold: true, size: 20, color: goldColor })
          ]
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [
            new TextRun({ text: `Période : ${globalReport.period_type || 'Global'} - ${globalReport.period_value || ''}`, bold: true, size: 18 })
          ]
        }),
        new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows })
      ]
    }]
  });

  const blob = await Packer.toBlob(doc);
  const filename = `Rapport_Global_SONABEL_${globalReport.period_value || 'Consolide'}.docx`;
  saveAs(blob, filename);
}
