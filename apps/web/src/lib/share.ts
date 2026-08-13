/* Share & viral loop: intent links + kartu skor CV (canvas → PNG). */

export const APP_URL = "https://career-spark-engine-02.lovable.app";

export const shareIntents = {
  whatsapp: (text: string) => `https://wa.me/?text=${encodeURIComponent(text)}`,
  x: (text: string, url: string) =>
    `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
  linkedin: (url: string) =>
    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
};

export function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
  return Promise.reject(new Error("clipboard unavailable"));
}

export type ScoreCardData = {
  name: string;
  role: string;
  score: number;
  breakdown: { structure: number; keywords: number; impact: number; customization: number };
  topTips: string[];
  refCode: string;
};

const BRAND = "#0e7c86"; // teal (brand)
const CORAL = "#e07a5f";
const INK = "#1c2430";
const MUTED = "#64748b";

function rr(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

export function drawScoreCard(canvas: HTMLCanvasElement, d: ScoreCardData) {
  const W = 1080;
  const H = 1080;
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext("2d")!;

  // Latar gradien
  const bg = g.createLinearGradient(0, 0, W, H);
  bg.addColorStop(0, "#f8fafc");
  bg.addColorStop(1, "#eef4f6");
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);

  // Aksen atas
  const acc = g.createLinearGradient(0, 0, W, 0);
  acc.addColorStop(0, BRAND);
  acc.addColorStop(1, CORAL);
  g.fillStyle = acc;
  rr(g, 60, 48, W - 120, 12, 6);
  g.fill();

  // Logo
  g.fillStyle = BRAND;
  rr(g, 64, 92, 88, 88, 24);
  g.fill();
  g.fillStyle = "#fff";
  g.font = "700 52px 'Plus Jakarta Sans', 'Segoe UI', sans-serif";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillText("M+", 108, 137);

  g.fillStyle = INK;
  g.font = "800 44px 'Sora', 'Segoe UI', sans-serif";
  g.textAlign = "left";
  g.fillText("MULAI+ Career Compass", 176, 138);

  // Nama & role
  g.fillStyle = INK;
  g.font = "700 46px 'Sora', 'Segoe UI', sans-serif";
  g.textAlign = "center";
  g.fillText(d.name, W / 2, 268);
  g.fillStyle = MUTED;
  g.font = "400 32px 'Plus Jakarta Sans', sans-serif";
  g.fillText(`CV untuk target role: ${d.role}`, W / 2, 322);

  // Ring skor
  const cx = W / 2;
  const cy = 540;
  const r = 190;
  g.lineWidth = 26;
  g.strokeStyle = "#e2e8f0";
  g.beginPath();
  g.arc(cx, cy, r, 0, Math.PI * 2);
  g.stroke();

  const pct = Math.max(0, Math.min(100, d.score)) / 100;
  const grad = g.createLinearGradient(cx - r, cy, cx + r, cy);
  grad.addColorStop(0, BRAND);
  grad.addColorStop(1, CORAL);
  g.strokeStyle = grad;
  g.lineCap = "round";
  g.beginPath();
  g.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct);
  g.stroke();

  g.fillStyle = INK;
  g.font = "800 120px 'Sora', 'Segoe UI', sans-serif";
  g.fillText(String(d.score), cx, cy - 8);
  g.fillStyle = MUTED;
  g.font = "400 30px 'Plus Jakarta Sans', sans-serif";
  g.fillText("skor CV / 100", cx, cy + 52);

  // Breakdown kecil
  const items = [
    ["Struktur", d.breakdown.structure],
    ["Keyword", d.breakdown.keywords],
    ["Dampak", d.breakdown.impact],
    ["Custom", d.breakdown.customization],
  ] as const;
  const startX = 170;
  const bw = (W - 340) / 4;
  items.forEach(([label, v], i) => {
    const x = startX + i * bw;
    g.fillStyle = MUTED;
    g.font = "400 24px 'Plus Jakarta Sans', sans-serif";
    g.textAlign = "center";
    g.fillText(label, x + bw / 2, 800);
    g.fillStyle = INK;
    g.font = "700 34px 'Sora', sans-serif";
    g.fillText(String(v), x + bw / 2, 838);
  });

  // Tips teratas
  g.fillStyle = INK;
  g.font = "700 30px 'Sora', sans-serif";
  g.textAlign = "left";
  g.fillText("3 perbaikan tercepat:", 96, 916);
  g.font = "400 26px 'Plus Jakarta Sans', sans-serif";
  d.topTips.slice(0, 3).forEach((tip, i) => {
    g.fillStyle = i === 0 ? CORAL : INK;
    g.fillText(`${i + 1}. ${tip}`, 96, 962 + i * 40);
  });

  // Footer CTA + ref
  g.fillStyle = BRAND;
  g.font = "700 30px 'Sora', sans-serif";
  g.textAlign = "center";
  g.fillText("Cek skor CV kamu gratis →", W / 2, 1016);
  g.fillStyle = MUTED;
  g.font = "400 22px 'Plus Jakarta Sans', sans-serif";
  g.fillText(`Kode kamu: ${d.refCode} · mulai.plus`, W / 2, 1056);
}

export function downloadCanvas(canvas: HTMLCanvasElement, fileName: string) {
  const a = document.createElement("a");
  a.href = canvas.toDataURL("image/png");
  a.download = fileName;
  a.click();
}

/** Kartu skor vertikal 1080x1920 — untuk IG Story / TikTok / WA status. */
export function drawScoreCardStory(canvas: HTMLCanvasElement, d: ScoreCardData) {
  const W = 1080;
  const H = 1920;
  canvas.width = W;
  canvas.height = H;
  const g = canvas.getContext("2d")!;

  const bg = g.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#0e7c86");
  bg.addColorStop(1, "#e07a5f");
  g.fillStyle = bg;
  g.fillRect(0, 0, W, H);

  // Pola titik dekoratif
  g.fillStyle = "rgba(255,255,255,.08)";
  for (let y = 60; y < H; y += 130) {
    for (let x = 60; x < W; x += 130) {
      g.beginPath();
      g.arc(x, y, 4, 0, Math.PI * 2);
      g.fill();
    }
  }

  g.textAlign = "center";
  g.textBaseline = "middle";

  // Logo
  g.fillStyle = "rgba(255,255,255,.95)";
  rr(g, W / 2 - 70, 110, 140, 140, 36);
  g.fill();
  g.fillStyle = BRAND;
  g.font = "800 80px 'Sora', sans-serif";
  g.fillText("M+", W / 2, 181);

  g.fillStyle = "#fff";
  g.font = "800 54px 'Sora', sans-serif";
  g.fillText("MULAI+ Career Compass", W / 2, 330);

  // Nama & role
  g.fillStyle = "#fff";
  g.font = "700 58px 'Sora', sans-serif";
  g.fillText(d.name, W / 2, 470);
  g.fillStyle = "rgba(255,255,255,.85)";
  g.font = "400 34px 'Plus Jakarta Sans', sans-serif";
  g.fillText(`CV untuk target role: ${d.role}`, W / 2, 530);

  // Ring skor
  const cx = W / 2;
  const cy = 800;
  const r = 250;
  g.lineWidth = 34;
  g.strokeStyle = "rgba(255,255,255,.25)";
  g.beginPath();
  g.arc(cx, cy, r, 0, Math.PI * 2);
  g.stroke();
  const pct = Math.max(0, Math.min(100, d.score)) / 100;
  g.strokeStyle = "#fff";
  g.lineCap = "round";
  g.beginPath();
  g.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * pct);
  g.stroke();
  g.fillStyle = "#fff";
  g.font = "800 170px 'Sora', sans-serif";
  g.fillText(String(d.score), cx, cy - 16);
  g.font = "400 34px 'Plus Jakarta Sans', sans-serif";
  g.fillStyle = "rgba(255,255,255,.85)";
  g.fillText("skor CV / 100", cx, cy + 88);

  // Breakdown
  const items = [
    ["Struktur", d.breakdown.structure],
    ["Keyword", d.breakdown.keywords],
    ["Dampak", d.breakdown.impact],
    ["Custom", d.breakdown.customization],
  ] as const;
  const startX = 150;
  const bw = (W - 300) / 4;
  items.forEach(([label, v], i) => {
    const x = startX + i * bw;
    g.fillStyle = "rgba(255,255,255,.75)";
    g.font = "400 28px 'Plus Jakarta Sans', sans-serif";
    g.fillText(label, x + bw / 2, 1160);
    g.fillStyle = "#fff";
    g.font = "700 44px 'Sora', sans-serif";
    g.fillText(String(v), x + bw / 2, 1212);
  });

  // Tips
  g.fillStyle = "#fff";
  g.font = "700 36px 'Sora', sans-serif";
  g.textAlign = "left";
  g.fillText("3 perbaikan tercepat:", 96, 1340);
  g.font = "400 30px 'Plus Jakarta Sans', sans-serif";
  d.topTips.slice(0, 3).forEach((tip, i) => {
    g.fillText(`${i + 1}. ${tip}`, 96, 1400 + i * 52);
  });

  // CTA
  g.fillStyle = "#fff";
  g.font = "700 44px 'Sora', sans-serif";
  g.textAlign = "center";
  g.fillText("Cek skor CV kamu gratis →", W / 2, 1620);
  g.fillStyle = "rgba(255,255,255,.8)";
  g.font = "400 26px 'Plus Jakarta Sans', sans-serif";
  g.fillText(`Kode kamu: ${d.refCode} · mulai.plus`, W / 2, 1680);
}
