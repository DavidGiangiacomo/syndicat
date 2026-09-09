// Règle structurante n°1 : la Population n'est jamais scientifique.
// Les Pièces le deviennent au-delà de 10⁹ (acte III dans le doc ; ici, garde-fou).

const NNBSP = ' '; // espace fine insécable, séparateur de milliers français

export function fmtInt(n) {
  if (!Number.isFinite(n)) return '—';
  if (n >= 1e15) return fmtSci(n);
  n = Math.floor(Math.max(0, n));
  const s = String(n);
  let out = '';
  for (let i = 0; i < s.length; i++) {
    const fromEnd = s.length - i;
    out += s[i];
    if (fromEnd > 1 && (fromEnd - 1) % 3 === 0) out += NNBSP;
  }
  return out;
}

const SUP = { '-': '⁻', 0: '⁰', 1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹' };
function sup(n) {
  return String(n).split('').map((c) => SUP[c] ?? c).join('');
}

export function fmtSci(n) {
  const e = Math.floor(Math.log10(n));
  const m = n / 10 ** e;
  return `${m.toFixed(1).replace('.', ',')}·10${sup(e)}`;
}

export function fmtPieces(n) {
  if (n < 1e9) return fmtInt(n);
  return fmtSci(n);
}

export function fmtRate(n) {
  if (n < 10) return n.toFixed(2).replace('.', ',');
  if (n < 100) return n.toFixed(1).replace('.', ',');
  return fmtPieces(n);
}

// Population : toujours en clair, toujours entière.
export function fmtPop(n) {
  return fmtInt(n);
}

export function fmtPct(x, digits = 0) {
  return `${(x * 100).toFixed(digits).replace('.', ',')}${NNBSP}%`;
}

export function fmtMult(x) {
  return `×${x.toFixed(2).replace('.', ',')}`;
}

export function fmtDuration(sec) {
  sec = Math.floor(sec);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h >= 48) return `${Math.floor(h / 24)} jours`;
  if (h > 0) return m > 0 ? `${h}${NNBSP}h${NNBSP}${String(m).padStart(2, '0')}` : `${h}${NNBSP}h`;
  if (m > 0) return `${m}${NNBSP}min`;
  return `${sec}${NNBSP}s`;
}

// Horodatage du journal : « 1 h 07 » / « 52 min »
export function fmtClock(sec) {
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return `${h}${NNBSP}h${NNBSP}${String(m).padStart(2, '0')}`;
  return `${m}${NNBSP}min`;
}
