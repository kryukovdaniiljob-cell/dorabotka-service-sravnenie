// Сопоставление подобранного типоразмера с остатками на складе (НС-код + наличие).
// Наименования на складе отличаются (префиксы «Установка приточная SHUFT …»,
// иной порядок, кириллические буквы в маркировке) — используется нормализация
// и взвешенное сопоставление по серии + типоразмеру + варианту исполнения.
import stockRaw from '../data/stock_data.json';

export interface StockItem {
  name: string;
  code: string;
  qty: number;
}

export interface StockMatch {
  code: string;
  qty: number;
  matchedName: string;
  score: number;
}

const STOCK = stockRaw as StockItem[];

// Кириллические буквы, визуально совпадающие с латиницей в маркировке
const TRANSLIT: Record<string, string> = {
  А: 'A', В: 'B', Е: 'E', К: 'K', М: 'M', О: 'O', Р: 'P',
  С: 'C', Т: 'T', Х: 'X', Н: 'H', У: 'U',
};

const FILLER = [
  'установка', 'приточно-вытяжная', 'приточная', 'приточно', 'вытяжная',
  'компактная', 'моноблочная', 'shuft', 'модулем', 'модуль', 'ethernet',
  'em-lan', 'комплекте', 'блок', 'вентиляторный', 'дополнительный',
  'силовой', 'части', 'пульт', 'управления', 'silent', 'sea', 'wifi',
];

const VARIANTS = new Set(['CE', 'CW', 'SE', 'SW', 'VE', 'VW']);

function translit(s: string): string {
  let out = '';
  for (const ch of s) out += TRANSLIT[ch] ?? ch;
  return out;
}

function normTokens(input: string): string[] {
  let low = input.toLowerCase();
  for (const f of FILLER) low = low.split(f).join(' ');
  let up = translit(low).toUpperCase();
  // разделить слипшиеся цифры/буквы: 2800SW → 2800 SW, 450VE → 450 VE
  up = up.replace(/(\d)(?=[A-Z])/g, '$1 ').replace(/([A-Z])(?=\d)/g, '$1 ');
  const toks = up.split(/[^A-Z0-9,]+/);
  const out: string[] = [];
  for (let t of toks) {
    if (!t) continue;
    const m = /^(VE|VW)[LR]$/.exec(t);
    if (m) t = m[1];
    out.push(t);
  }
  return out;
}

function seriesNumber(toks: string[]): { series: string | null; num: string | null } {
  const s = new Set(toks);
  let series: string | null = null;
  if (s.has('UNIMAX') && s.has('P')) series = 'UNIMAX-P';
  else if (s.has('UNIMAX') && s.has('R')) series = 'UNIMAX-R';
  else if ((s.has('ECO') && s.has('SLIM')) || s.has('ECOSLIM')) series = 'ECO-SLIM';
  else if (s.has('CAUF')) series = 'CAUF';
  else if (s.has('ECO')) series = 'ECO';
  else if (s.has('CAU')) series = 'CAU';
  else if (s.has('AIRTUBE')) series = 'AIRTUBE';
  else if (s.has('SWIFT')) series = 'SWIFT';
  else if (s.has('NOVA')) series = 'NOVA';
  const num = toks.find((t) => /^\d+$/.test(t)) ?? null;
  return { series, num };
}

interface Parsed {
  ts: Set<string>;
  variant: string | null;
  ec: boolean;
  caps: string[];
}

function parse(toks: string[]): Parsed {
  const ts = new Set(toks);
  const variant = toks.find((t) => VARIANTS.has(t)) ?? null;
  const caps = toks.filter((t) => /^\d+,\d+$/.test(t));
  return { ts, variant, ec: ts.has('EC'), caps };
}

function capNum(c: string): number {
  return parseFloat(c.replace(',', '.'));
}

function scorePair(q: Parsed, c: Parsed): number {
  // жёсткий отсев: разные варианты исполнения (SW vs CE …) — не аналог
  if (q.variant && c.variant && q.variant !== c.variant) return -1;
  let s = 0;
  if (q.variant && c.variant && q.variant === c.variant) s += 100;
  const qcap = new Set(q.caps);
  const ccap = new Set(c.caps);
  const common = [...qcap].filter((x) => ccap.has(x));
  s += 40 * common.length;
  if (qcap.size && ccap.size && common.length === 0) {
    let best = Infinity;
    for (const a of qcap) for (const b of ccap) best = Math.min(best, Math.abs(capNum(a) - capNum(b)));
    if (isFinite(best)) s += Math.max(0, 15 - best * 3);
  }
  if (q.ts.has('W') && c.ts.has('W')) s += 40;
  if (q.ec === c.ec) s += 6;
  let inter = 0;
  for (const t of q.ts) if (c.ts.has(t)) inter += 1;
  s += inter;
  return s;
}

interface PreparedWh extends StockItem {
  series: string | null;
  num: string | null;
  parsed: Parsed;
}

// предрасчёт по складу (только установки, не блоки/датчики/пульты)
const WH: PreparedWh[] = STOCK.filter((it) => it.name.toLowerCase().includes('станов'))
  .map((it) => {
    const toks = normTokens(it.name);
    const { series, num } = seriesNumber(toks);
    return { ...it, series, num, parsed: parse(toks) };
  })
  .filter((w) => w.series !== null);

/**
 * Найти позицию склада для наименования типоразмера из калькулятора.
 * Возвращает НС-код и наличие; если совпадения нет — qty: 0, code: null.
 */
export function findStock(name: string): StockMatch {
  const toks = normTokens(name);
  const { series, num } = seriesNumber(toks);
  const q = parse(toks);
  const cands = WH.filter((w) => w.series === series && w.num === num);
  let best: { w: PreparedWh; sc: number } | null = null;
  for (const w of cands) {
    const sc = scorePair(q, w.parsed);
    if (sc <= 0) continue;
    if (
      !best ||
      sc > best.sc ||
      (sc === best.sc && w.qty > best.w.qty) ||
      (sc === best.sc && w.qty === best.w.qty && w.name.length < best.w.name.length)
    ) {
      best = { w, sc };
    }
  }
  if (!best) return { code: '—', qty: 0, matchedName: '', score: 0 };
  return { code: best.w.code, qty: best.w.qty, matchedName: best.w.name, score: Math.round(best.sc * 10) / 10 };
}
