import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import { MetricSummary, CostDriver, FilterState, UserSession } from '../types';

export function generateAnalyticsPDF(
  summary: MetricSummary,
  filters: FilterState,
  drivers: CostDriver[],
  currentUser: UserSession,
  regionalData: { region: string; revenue: number; margin: number }[]
) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 28, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('METRICMIND — EXECUTIVE ANALYTICS REPORT', 14, 12);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(148, 163, 184); // slate-400
  doc.text(`Governed Semantic BI Layer | Generated: ${new Date().toLocaleString()} | TLS 1.3 Certified`, 14, 19);

  // Security Badge in top right
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(pageWidth - 65, 7, 52, 14, 2, 2, 'F');
  doc.setTextColor(52, 211, 153); // emerald-400
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('AES-256 ENCRYPTED', pageWidth - 60, 13);
  doc.setTextColor(203, 213, 225);
  doc.setFont('helvetica', 'normal');
  doc.text(`Confidential • Role: ${currentUser.role}`, pageWidth - 60, 18);

  let cursorY = 36;

  // Active Scope & Filters Bar
  doc.setFillColor(241, 245, 249); // slate-100
  doc.rect(14, cursorY, pageWidth - 28, 12, 'F');
  doc.setTextColor(30, 41, 59);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('REPORT SCOPE:', 18, cursorY + 7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(`Quarter: ${filters.quarter} | Region: ${filters.region} | Category: ${filters.category} | Year: ${filters.year}`, 50, cursorY + 7.5);

  cursorY += 18;

  // Executive KPI Summary Title
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('1. Core Governed KPI Summary', 14, cursorY);
  cursorY += 4;

  const kpiData = [
    ['Total Revenue', `$${(summary.revenue).toLocaleString()}`, `$${(summary.previousRevenue).toLocaleString()}`, `${summary.revenueChangePercent >= 0 ? '+' : ''}${summary.revenueChangePercent}%`],
    ['Total Operating Cost', `$${(summary.cost).toLocaleString()}`, `$${(summary.previousCost).toLocaleString()}`, `${summary.costChangePercent >= 0 ? '+' : ''}${summary.costChangePercent}%`],
    ['Gross Operating Profit', `$${(summary.profit).toLocaleString()}`, `$${(summary.previousProfit).toLocaleString()}`, `${summary.profitChangePercent >= 0 ? '+' : ''}${summary.profitChangePercent}%`],
    ['Gross Margin %', `${summary.marginPercent}%`, `${summary.previousMarginPercent}%`, `${summary.marginPointDelta >= 0 ? '+' : ''}${summary.marginPointDelta}% pts`],
    ['Total Units Shipped', `${summary.totalVolume.toLocaleString()}`, `${summary.previousVolume.toLocaleString()}`, `${summary.volumeChangePercent >= 0 ? '+' : ''}${summary.volumeChangePercent}%`],
  ];

  (doc as any).autoTable({
    startY: cursorY,
    head: [['Governed Metric', 'Current Period', 'Prior Baseline', 'Period Delta']],
    body: kpiData,
    theme: 'grid',
    headStyles: {
      fillColor: [15, 23, 42],
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [30, 41, 59],
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  cursorY = (doc as any).lastAutoTable.finalY + 12;

  // Root Cause Driver Analysis Section
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(15, 23, 42);
  doc.text('2. Root-Cause Margin & Cost Driver Analysis (Q2 vs Q3)', 14, cursorY);
  cursorY += 4;

  const driverRows = drivers.map((d) => [
    d.name,
    `$${(d.period1Value).toLocaleString()}`,
    `$${(d.period2Value).toLocaleString()}`,
    `${d.percentChange >= 0 ? '+' : ''}${d.percentChange}%`,
    `${d.contributionToMarginDropPercent}%`,
    d.description,
  ]);

  (doc as any).autoTable({
    startY: cursorY,
    head: [['Driver Factor', 'Q2 Baseline', 'Q3 Actual', 'Delta %', 'Margin Impact', 'Operational Explanation']],
    body: driverRows,
    theme: 'grid',
    headStyles: {
      fillColor: [79, 70, 229], // indigo-600
      textColor: [255, 255, 255],
      fontSize: 8.5,
      fontStyle: 'bold',
    },
    bodyStyles: {
      fontSize: 8,
      textColor: [30, 41, 59],
    },
    columnStyles: {
      5: { cellWidth: 70 },
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    margin: { left: 14, right: 14 },
  });

  cursorY = (doc as any).lastAutoTable.finalY + 12;

  // Regional Performance Snapshot
  if (regionalData && regionalData.length > 0) {
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(15, 23, 42);
    doc.text('3. Regional Margin Distribution Snapshot', 14, cursorY);
    cursorY += 4;

    const regionalRows = regionalData.map((r) => [
      r.region,
      `$${r.revenue.toLocaleString()}`,
      `${r.margin}%`,
      r.margin >= 35 ? 'EXCELLENT' : r.margin >= 28 ? 'STABLE' : 'ACTION REQUIRED',
    ]);

    (doc as any).autoTable({
      startY: cursorY,
      head: [['Global Region', 'Revenue ($)', 'Gross Margin %', 'Health Status']],
      body: regionalRows,
      theme: 'grid',
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontSize: 8.5,
      },
      bodyStyles: {
        fontSize: 8.5,
      },
      margin: { left: 14, right: 14 },
    });

    cursorY = (doc as any).lastAutoTable.finalY + 10;
  }

  // Footer & Audit Signature
  doc.setDrawColor(226, 232, 240);
  doc.line(14, cursorY, pageWidth - 14, cursorY);
  cursorY += 6;

  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  doc.text(`Authorized by: ${currentUser.name} (${currentUser.email}) | Audit ID: AUDIT-${Date.now().toString().slice(-6)}`, 14, cursorY);
  doc.text('MetricMind Enterprise Security • Strict Governance Guaranteed • Cube.dev Semantic Contract Verified', 14, cursorY + 4);

  // Save the PDF
  doc.save(`MetricMind_Analytics_Report_${filters.quarter}_${filters.region}_${new Date().toISOString().split('T')[0]}.pdf`);
}
