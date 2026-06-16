// §3 Автоматический выбор модели (имя листа B26 = Q30/R30)
import type { HeaterType, RecupType, SelectorInput } from './types';

// ---- Синхронизация «Тип рекуператора» ↔ модель Unimax (ручной режим) ----
// Имя Unimax кодирует тип рекуператора: P = пластинчатый, R = роторный.
// Формат: Unimax_<P|R>_<S|V|C><W|E>[_EC]
//   S — вбок-напольная, V — вверх, C — вбок-подвесная; W — водяной, E — электр.;
//   суффикс _EC — EC-двигатель (только у пластинчатых).
const UNIMAX_RE = /^Unimax_(P|R)_([SVC])([WE])(_EC)?$/;

/** Тип рекуператора, зашитый в имени модели; null — если модель не Unimax (напр. Nova). */
export function recupTypeOfModel(modelName: string): RecupType | null {
  const m = UNIMAX_RE.exec(modelName);
  if (!m) return null;
  return m[1] === 'P' ? 'пластинчатый' : 'роторный';
}

/**
 * Подобрать парную модель Unimax для другого типа рекуператора, сохраняя по
 * возможности направление выброса (S/V/C), нагрев (W/E) и EC.
 * Если точного варианта нет (у роторных нет C-исполнения и нет _EC) — берётся
 * ближайший существующий. modelExists — проверка наличия модели в базе.
 */
export function modelForRecupType(
  modelName: string,
  target: RecupType,
  modelExists: (name: string) => boolean,
): string {
  const m = UNIMAX_RE.exec(modelName);
  if (!m) return modelName; // не Unimax (например Nova) — не трогаем
  const targetKind = target === 'пластинчатый' ? 'P' : 'R';
  if (m[1] === targetKind) return modelName; // уже нужный тип

  let orient = m[2];
  let ec = m[4] ?? '';
  if (targetKind === 'R') {
    // у роторных нет вбок-подвесного (C) и нет EC-исполнения
    if (orient === 'C') orient = 'S';
    ec = '';
  }
  const heater = m[3];

  const candidates = [
    `Unimax_${targetKind}_${orient}${heater}${ec}`,
    `Unimax_${targetKind}_${orient}${heater}`,
    `Unimax_${targetKind}_S${heater}${ec}`,
    `Unimax_${targetKind}_S${heater}`,
    `Unimax_${targetKind}_V${heater}`,
  ];
  for (const c of candidates) if (modelExists(c)) return c;
  return modelName; // на крайний случай не падаем
}

// ---- Синхронизация «Тип нагревателя» ↔ модель (ручной режим) ----
// У Unimax нагрев зашит буквой W/E в имени. У приточных пары задаются таблицей.
const SUPPLY_HEATER: Record<string, HeaterType> = {
  CAU_F: 'электрический', ECO_A: 'электрический', ECO_Slim: 'электрический',
  Airtube: 'электрический', Swift: 'электрический',
  CAU_W: 'водяной', ECO_Slim_W: 'водяной',
};
// приточные: электрический → водяной (для моделей без прямой водяной пары — CAU_W)
const SUPPLY_TO_WATER: Record<string, string> = {
  CAU_F: 'CAU_W', ECO_A: 'CAU_W', ECO_Slim: 'ECO_Slim_W', Airtube: 'CAU_W', Swift: 'CAU_W',
};
// приточные: водяной → электрический
const SUPPLY_TO_ELECTRIC: Record<string, string> = {
  CAU_W: 'CAU_F', ECO_Slim_W: 'ECO_Slim',
};

/** Тип нагревателя, соответствующий модели; null — если определить нельзя. */
export function heaterTypeOfModel(modelName: string): HeaterType | null {
  if (modelName === 'Nova') return 'без нагревателя';
  const m = UNIMAX_RE.exec(modelName);
  if (m) return m[3] === 'W' ? 'водяной' : 'электрический';
  return SUPPLY_HEATER[modelName] ?? null;
}

/**
 * Подобрать парную модель для другого типа нагревателя, сохраняя по возможности
 * исполнение. Unimax: меняем W↔E (рекуператор P/R, направление и EC сохраняются),
 * «без нагревателя» → Nova. Приточные — по таблицам соответствий. Без падений.
 */
export function modelForHeaterType(
  modelName: string,
  target: HeaterType,
  modelExists: (name: string) => boolean,
): string {
  if (heaterTypeOfModel(modelName) === target) return modelName;

  // ---- Приточно-вытяжные ----
  const m = UNIMAX_RE.exec(modelName);
  if (m || modelName === 'Nova') {
    if (target === 'без нагревателя') return 'Nova';
    const newHeater = target === 'водяной' ? 'W' : 'E';
    // от Nova переходим к разумному дефолту пластинчатого вбок-напольного
    const base = m ?? /^Unimax_(P|R)_([SVC])([WE])(_EC)?$/.exec('Unimax_P_SE')!;
    const kind = base[1];
    const orient = base[2];
    const ec = base[4] ?? '';
    const candidates = [
      `Unimax_${kind}_${orient}${newHeater}${ec}`,
      `Unimax_${kind}_${orient}${newHeater}`,
      `Unimax_${kind}_S${newHeater}${ec}`,
      `Unimax_${kind}_S${newHeater}`,
      `Unimax_P_S${newHeater}`,
    ];
    for (const c of candidates) if (modelExists(c)) return c;
    return modelName;
  }

  // ---- Приточные ----
  if (target === 'без нагревателя') return 'CAU_F';
  const mapped = target === 'водяной' ? SUPPLY_TO_WATER[modelName] : SUPPLY_TO_ELECTRIC[modelName];
  if (mapped && modelExists(mapped)) return mapped;
  // фолбэк: типовая модель нужного нагрева
  const fallback = target === 'водяной' ? 'CAU_W' : 'CAU_F';
  return modelExists(fallback) ? fallback : modelName;
}

export function selectModelName(inp: SelectorInput): string {
  if (inp.installation_type === 'приточная') return selectSupply(inp);
  return selectSupplyExhaust(inp);
}

function selectSupply(inp: SelectorInput): string {
  if (inp.selection_mode === 'вручную') return inp.manual_model_supply || 'CAU_F';

  if (inp.heater_type === 'водяной') {
    return inp.automation === 'встроенная' ? 'ECO_Slim_W' : 'CAU_W';
  }
  if (inp.heater_type === 'без нагревателя') return 'CAU_F';

  if (inp.case_type === 'изолированный') {
    if (inp.automation === 'встроенная') {
      if (inp.motor_type === 'ЕС') return 'Swift';
      return inp.wall_thickness === 'стандартная' ? 'ECO_A' : 'ECO_Slim';
    }
    return 'CAU_F';
  }
  // не изолированный
  return 'Airtube';
}

function selectSupplyExhaust(inp: SelectorInput): string {
  if (inp.selection_mode === 'вручную') return inp.manual_model_se || 'Nova';
  if (inp.heater_type === 'без нагревателя') return 'Nova';

  let p = 'Unimax_';
  p += inp.recup_type === 'пластинчатый' ? 'P_' : 'R_';

  if (inp.recup_type === 'пластинчатый') {
    if (inp.air_outlet === 'вбок') p += inp.mounting === 'напольная' ? 'S' : 'C';
    else p += 'V';
  } else {
    p += inp.air_outlet === 'вбок' ? 'S' : 'V';
  }

  p += inp.heater_type === 'водяной' ? 'W' : 'E';
  if (inp.recup_type === 'пластинчатый' && inp.motor_type === 'ЕС') p += '_EC';
  return p;
}
