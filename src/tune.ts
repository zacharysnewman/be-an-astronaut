import { tuning } from './tuning';

const KW_ROWS  = [1, 2, 5, 10, 20];
const P_COLS   = [0, 1, 2, 3, 4];

function readInputs() {
  const v = (id: string) => parseFloat((document.getElementById(id) as HTMLInputElement).value);
  return {
    rateBase:         isNaN(v('tune-rate-base'))          ? tuning.screeningRateBase      : v('tune-rate-base'),
    keywordPenalty:   isNaN(v('tune-keyword-penalty'))    ? tuning.keywordPenalty         : v('tune-keyword-penalty'),
    qualityBase:      isNaN(v('tune-quality-base'))       ? tuning.qualityBase            : v('tune-quality-base'),
    prettinessBoost:  isNaN(v('tune-prettiness-boost'))   ? tuning.prettinessQualityBoost : v('tune-prettiness-boost'),
  };
}

function calcRates(kw: number, p: number, t: ReturnType<typeof readInputs>) {
  const speed   = t.rateBase * kw * t.keywordPenalty;
  const quality = Math.min(1, Math.max(0, t.qualityBase + p * t.prettinessBoost));
  return { pass: speed * quality, reject: speed * (1 - quality) };
}

function updatePreview(): void {
  const tbody = document.getElementById('tune-preview-body') as HTMLTableSectionElement;
  if (!tbody) return;
  const t = readInputs();
  tbody.innerHTML = '';
  for (const kw of KW_ROWS) {
    const tr = document.createElement('tr');
    const th = document.createElement('th');
    th.textContent = `${kw} kw`;
    tr.appendChild(th);
    for (const p of P_COLS) {
      const { pass, reject } = calcRates(kw, p, t);
      const td = document.createElement('td');
      td.innerHTML = `<span class="good">+${pass.toFixed(3)}</span> <span class="bad">-${reject.toFixed(3)}</span>`;
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
}

export function initTunePanel(): void {
  if (!new URLSearchParams(location.search).has('tune')) return;

  const panel = document.getElementById('tune-panel');
  if (!panel) return;
  panel.classList.remove('hidden');

  const ids = ['tune-rate-base', 'tune-keyword-penalty', 'tune-quality-base', 'tune-prettiness-boost'];
  const vals = [tuning.screeningRateBase, tuning.keywordPenalty, tuning.qualityBase, tuning.prettinessQualityBoost];
  ids.forEach((id, i) => {
    (document.getElementById(id) as HTMLInputElement).value = String(vals[i]);
    document.getElementById(id)!.addEventListener('input', updatePreview);
  });

  document.getElementById('btn-tune-apply')!.addEventListener('click', () => {
    const t = readInputs();
    tuning.screeningRateBase      = t.rateBase;
    tuning.keywordPenalty         = t.keywordPenalty;
    tuning.qualityBase            = t.qualityBase;
    tuning.prettinessQualityBoost = t.prettinessBoost;
    updatePreview();
  });

  document.getElementById('btn-tune-copy')!.addEventListener('click', () => {
    const t = readInputs();
    const text = [
      `SCREENING_RATE_BASE = ${t.rateBase}`,
      `KEYWORD_PENALTY = ${t.keywordPenalty}`,
      `QUALITY_BASE = ${t.qualityBase}`,
      `PRETTINESS_QUALITY_BOOST = ${t.prettinessBoost}`,
    ].join('\n');
    navigator.clipboard.writeText(text).then(() => {
      const btn = document.getElementById('btn-tune-copy')!;
      btn.textContent = 'Copied!';
      setTimeout(() => { btn.textContent = 'Copy Formula'; }, 1500);
    });
  });

  updatePreview();
}
