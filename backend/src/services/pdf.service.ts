import PDFDocument from 'pdfkit';
import { ScoreResult } from '@prisma/client';
import { ActionPlanItem } from '../types';

// ── Palette ──────────────────────────────────────────────────────────────────
const C = {
  navy:        '#0F172A',
  navyLight:   '#1E293B',
  navyMid:     '#162032',
  amber:       '#F59E0B',
  amberLight:  '#FCD34D',
  emerald:     '#10B981',
  white:       '#FFFFFF',
  muted:       '#94A3B8',
  mutedLight:  '#CBD5E1',
  border:      '#1E293B',
  poor:        '#EF4444',
  fair:        '#F97316',
  good:        '#10B981',
  excellent:   '#6366F1',
};

const DIMENSION_LABELS: Record<string, string> = {
  emergency:   'Emergency Fund',
  insurance:   'Insurance',
  investments: 'Investments',
  debt:        'Debt',
  tax:         'Tax Planning',
  retirement:  'Retirement',
};

const scoreColor = (s: number) =>
  s >= 80 ? C.excellent : s >= 60 ? C.good : s >= 40 ? C.fair : C.poor;

const scoreLabel = (s: number) =>
  s >= 80 ? 'EXCELLENT' : s >= 60 ? 'GOOD' : s >= 40 ? 'FAIR' : 'POOR';

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

// ── Helpers ───────────────────────────────────────────────────────────────────
const drawRect = (
  doc: InstanceType<typeof PDFDocument>,
  x: number, y: number, w: number, h: number,
  fill: string, radius = 0
) => {
  doc.roundedRect(x, y, w, h, radius).fill(fill);
};

const drawScoreRing = (
  doc: InstanceType<typeof PDFDocument>,
  cx: number, cy: number, score: number
) => {
  const R = 42;
  const track = 9;
  const color = scoreColor(score);
  const pct = score / 100;
  const TWO_PI = 2 * Math.PI;
  const START = -Math.PI / 2;

  // Track ring
  doc.circle(cx, cy, R).lineWidth(track).strokeColor('#1E293B').stroke();

  // Progress arc (approximate with many small line segments)
  const steps = Math.max(4, Math.round(pct * 60));
  const end = START + pct * TWO_PI;
  const pts: [number, number][] = [];
  for (let i = 0; i <= steps; i++) {
    const angle = START + (i / steps) * (end - START);
    pts.push([cx + R * Math.cos(angle), cy + R * Math.sin(angle)]);
  }
  if (pts.length > 1) {
    doc.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) doc.lineTo(pts[i][0], pts[i][1]);
    doc.lineWidth(track).strokeColor(color).stroke();
  }

  // Inner circle
  doc.circle(cx, cy, R - track / 2 - 1).fill(C.navyMid);

  // Score text
  doc.fillColor(color).font('Helvetica-Bold').fontSize(22)
    .text(score.toFixed(1), cx - 24, cy - 15, { width: 48, align: 'center' });
  doc.fillColor(C.muted).font('Helvetica').fontSize(8)
    .text('/ 100', cx - 24, cy + 9, { width: 48, align: 'center' });
};

const drawDimensionBar = (
  doc: InstanceType<typeof PDFDocument>,
  x: number, y: number, w: number,
  label: string, score: number
) => {
  const barH = 7;
  const barW = w - 120;
  const color = scoreColor(score);

  // Label
  doc.fillColor(C.mutedLight).font('Helvetica').fontSize(9)
    .text(label, x, y + 1, { width: 100 });

  // Track
  drawRect(doc, x + 108, y, barW, barH, '#1E293B', 4);

  // Fill
  const filled = Math.max(4, (score / 100) * barW);
  drawRect(doc, x + 108, y, filled, barH, color, 4);

  // Score badge
  doc.fillColor(color).font('Helvetica-Bold').fontSize(8)
    .text(`${score.toFixed(0)}`, x + w - 8, y, { width: 20, align: 'right' });

  // Label badge
  doc.fillColor(color).font('Helvetica').fontSize(7)
    .text(scoreLabel(score), x + w - 52, y, { width: 40, align: 'right' });
};

// ── Main export ───────────────────────────────────────────────────────────────
export const generateScorePdf = (
  score: ScoreResult & { userName?: string }
): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 0, bufferPages: true });
    const chunks: Buffer[] = [];
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const PW = doc.page.width;   // 595
    const PH = doc.page.height;  // 842
    const M = 36;                 // margin

    const actionPlan = Array.isArray(score.actionPlan)
      ? (score.actionPlan as unknown as ActionPlanItem[])
      : [];

    // ── PAGE 1 ────────────────────────────────────────────────────────────────

    // Full-page background
    drawRect(doc, 0, 0, PW, PH, C.navy);

    // Top accent strip
    drawRect(doc, 0, 0, PW, 4, C.amber);

    // Header band
    drawRect(doc, 0, 4, PW, 70, C.navyMid);

    // Brand text
    doc.fillColor(C.amber).font('Helvetica-Bold').fontSize(18)
      .text('Money Health Score', M, 20);
    doc.fillColor(C.muted).font('Helvetica').fontSize(9)
      .text('AI FINANCIAL CHECKUP  ·  CONFIDENTIAL REPORT', M, 42);

    // Date + name
    const headerRight = PW - M;
    doc.fillColor(C.mutedLight).font('Helvetica').fontSize(9)
      .text(new Date(score.createdAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }),
        M, 28, { width: PW - M * 2, align: 'right' });
    if (score.userName) {
      doc.fillColor(C.white).font('Helvetica-Bold').fontSize(10)
        .text(score.userName, M, 42, { width: PW - M * 2, align: 'right' });
    }

    // ── Score hero section ───────────────────────────────────────────────────
    const heroY = 90;
    const heroH = 170;
    drawRect(doc, M, heroY, PW - M * 2, heroH, C.navyLight, 12);
    // left amber accent
    drawRect(doc, M, heroY, 4, heroH, C.amber, 2);

    // Score ring (left)
    const ringCX = M + 80;
    const ringCY = heroY + heroH / 2;
    drawScoreRing(doc, ringCX, ringCY, score.totalScore);

    // Score label
    const labelCol = scoreColor(score.totalScore);
    doc.fillColor(labelCol).font('Helvetica-Bold').fontSize(11)
      .text(scoreLabel(score.totalScore), ringCX - 30, ringCY + 34, { width: 60, align: 'center' });

    // Divider
    doc.moveTo(ringCX + 58, heroY + 20).lineTo(ringCX + 58, heroY + heroH - 20)
      .lineWidth(1).strokeColor(C.border).stroke();

    // AI insights
    const insightX = ringCX + 72;
    const insightW = PW - M - insightX - 10;
    doc.fillColor(C.amberLight).font('Helvetica-Bold').fontSize(10)
      .text('AI HEALTH SUMMARY', insightX, heroY + 18);
    doc.fillColor(C.white).font('Helvetica').fontSize(10).lineGap(3)
      .text(`"${score.aiInsights}"`, insightX, heroY + 34, { width: insightW });

    // ── Dimension Breakdown ──────────────────────────────────────────────────
    const dimStartY = heroY + heroH + 24;
    doc.fillColor(C.amber).font('Helvetica-Bold').fontSize(13)
      .text('DIMENSION BREAKDOWN', M, dimStartY);
    doc.moveTo(M, dimStartY + 18).lineTo(PW - M, dimStartY + 18)
      .lineWidth(0.5).strokeColor('#1E293B').stroke();

    const dims: [string, number][] = [
      ['emergency',   score.emergency],
      ['insurance',   score.insurance],
      ['investments', score.investments],
      ['debt',        score.debt],
      ['tax',         score.tax],
      ['retirement',  score.retirement],
    ];

    const colW = (PW - M * 2 - 20) / 2;
    dims.forEach(([key, val], i) => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const bx = M + col * (colW + 20);
      const by = dimStartY + 28 + row * 36;

      // card bg
      drawRect(doc, bx, by - 4, colW, 28, C.navyLight, 6);
      drawDimensionBar(doc, bx + 10, by + 4, colW - 20, DIMENSION_LABELS[key] ?? key, val);
    });

    // ── Motivational insight ─────────────────────────────────────────────────
    const motY = dimStartY + 28 + 3 * 36 + 20;
    if (score.geminiInsight) {
      drawRect(doc, M, motY, PW - M * 2, 2, C.amber);
      drawRect(doc, M, motY + 2, PW - M * 2, 72, '#1A2640', 8);
      doc.fillColor(C.amber).font('Helvetica-Bold').fontSize(9)
        .text('✦  MOTIVATIONAL INSIGHT', M + 12, motY + 14);
      doc.fillColor(C.mutedLight).font('Helvetica').fontSize(9).lineGap(3)
        .text(score.geminiInsight, M + 12, motY + 28, { width: PW - M * 2 - 24 });
    }

    // ── Footer p1 ────────────────────────────────────────────────────────────
    drawRect(doc, 0, PH - 32, PW, 32, C.navyMid);
    doc.fillColor(C.muted).font('Helvetica').fontSize(8)
      .text('Generated by Money Health Score  ·  finscore-ai.netlify.app  ·  For personal use only', M, PH - 20, { width: PW - M * 2, align: 'center' });
    doc.fillColor(C.muted).font('Helvetica').fontSize(8)
      .text('1 / 2', PW - M - 20, PH - 20);

    // ── PAGE 2 — Action Plan ─────────────────────────────────────────────────
    doc.addPage({ size: 'A4', margin: 0 });
    drawRect(doc, 0, 0, PW, PH, C.navy);
    drawRect(doc, 0, 0, PW, 4, C.amber);
    drawRect(doc, 0, 4, PW, 50, C.navyMid);

    doc.fillColor(C.amber).font('Helvetica-Bold').fontSize(16)
      .text('12-MONTH ACTION PLAN', M, 18);
    doc.fillColor(C.muted).font('Helvetica').fontSize(9)
      .text('Personalised steps to improve your Money Health Score', M, 38);

    // Table header
    const tY = 70;
    const tCols = { mo: M, title: M + 28, dim: M + 200, goal: M + 290, amt: PW - M - 60 };
    drawRect(doc, M, tY, PW - M * 2, 22, C.navyLight, 6);
    doc.fillColor(C.amber).font('Helvetica-Bold').fontSize(8);
    doc.text('MO', tCols.mo + 4, tY + 7);
    doc.text('STEP', tCols.title, tY + 7);
    doc.text('AREA', tCols.dim, tY + 7);
    doc.text('GOAL', tCols.goal, tY + 7);
    doc.text('AMOUNT', tCols.amt, tY + 7);

    let rowY = tY + 28;
    actionPlan.forEach((item, idx) => {
      const rowH = 34;
      const bg = idx % 2 === 0 ? C.navyLight : C.navyMid;
      drawRect(doc, M, rowY, PW - M * 2, rowH, bg, 4);

      // Month badge
      const mColor = scoreColor((item.month / 12) * 40 + 60);
      drawRect(doc, tCols.mo + 2, rowY + 9, 18, 14, mColor, 3);
      doc.fillColor(C.navy).font('Helvetica-Bold').fontSize(8)
        .text(String(item.month), tCols.mo + 2, rowY + 12, { width: 18, align: 'center' });

      // Title
      doc.fillColor(C.white).font('Helvetica-Bold').fontSize(8)
        .text(item.title ?? '', tCols.title, rowY + 5, { width: 165, lineBreak: false, ellipsis: true });

      // Goal (smaller)
      doc.fillColor(C.muted).font('Helvetica').fontSize(7)
        .text(item.goal ?? '', tCols.title, rowY + 18, { width: 165, lineBreak: false, ellipsis: true });

      // Dimension pill
      const dimLabel = DIMENSION_LABELS[item.dimension] ?? item.dimension ?? '';
      doc.fillColor(C.mutedLight).font('Helvetica').fontSize(7)
        .text(dimLabel, tCols.dim, rowY + 13, { width: 80, lineBreak: false, ellipsis: true });

      // Goal text
      doc.fillColor(C.mutedLight).font('Helvetica').fontSize(7)
        .text(item.action ?? '', tCols.goal, rowY + 13, { width: 80, lineBreak: false, ellipsis: true });

      // Amount
      if (item.amount) {
        doc.fillColor(C.emerald).font('Helvetica-Bold').fontSize(8)
          .text(formatCurrency(item.amount), tCols.amt, rowY + 13, { width: 55, align: 'right' });
      }

      rowY += rowH + 3;
    });

    // Footer p2
    drawRect(doc, 0, PH - 32, PW, 32, C.navyMid);
    doc.fillColor(C.muted).font('Helvetica').fontSize(8)
      .text('Generated by Money Health Score  ·  finscore-ai.netlify.app  ·  For personal use only', M, PH - 20, { width: PW - M * 2, align: 'center' });
    doc.fillColor(C.muted).font('Helvetica').fontSize(8)
      .text('2 / 2', PW - M - 20, PH - 20);

    doc.end();
  });
};
