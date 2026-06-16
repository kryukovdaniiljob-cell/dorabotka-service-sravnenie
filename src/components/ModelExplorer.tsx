import { useMemo, useState } from 'react';
import type { HeaterType, RecupType } from '../engine/types';
import {
  explorerOptions,
  findAnalogsByModel,
  type ModelMatch,
  type ExplorerFilters,
} from '../engine/engine';
import { imagesForModel, imageUrl } from '../data/modelImages';

type Inst = 'приточная' | 'приточно-вытяжная';

const fieldCls =
  'w-full rounded-lg border border-sand bg-paper px-2.5 py-1.5 text-sm text-ink transition focus:border-accent focus:bg-white focus:outline-none focus:ring-2 focus:ring-accent/30';
const labelCls = 'block text-xs font-heading font-medium text-ink/60 mb-1';

const fmt = (x: number | string | undefined, dec = 2): string => {
  if (x === undefined || x === null || x === '-' || x === '') return '—';
  if (typeof x === 'string') return x;
  return Number.isInteger(x) ? String(x) : x.toFixed(dec);
};
const money = (n: number) => n.toLocaleString('ru-RU') + ' ₽';

const DIM_KEYS = ['W', 'W1', 'W2', 'W3', 'H', 'H1', 'H2', 'H3', 'H4', 'L', 'L1', 'L2', 'L3', 'L4', 'D', 'd'] as const;

export default function ModelExplorer() {
  const [inst, setInst] = useState<Inst>('приточно-вытяжная');
  const isSE = inst === 'приточно-вытяжная';

  const options = useMemo(
    () => explorerOptions(isSE ? 'supply_exhaust' : 'supply'),
    [isSE],
  );
  const optionKey = (o: { modelName: string; size_no: number }) => `${o.modelName}#${o.size_no}`;

  const [selected, setSelected] = useState<string>(() => (options[0] ? optionKey(options[0]) : ''));
  const [heaterFilter, setHeaterFilter] = useState<'любой' | HeaterType>('любой');
  const [recupFilter, setRecupFilter] = useState<'любой' | RecupType>('любой');
  const [expanded, setExpanded] = useState<string | null>(null);

  // при смене типа установки сбросить выбор на первую позицию
  const effectiveSelected = options.some((o) => optionKey(o) === selected)
    ? selected
    : options[0] ? optionKey(options[0]) : '';

  const result = useMemo(() => {
    if (!effectiveSelected) return null;
    const [modelName, sizeNo] = effectiveSelected.split('#');
    const filters: ExplorerFilters = {};
    if (heaterFilter !== 'любой') filters.heater = heaterFilter;
    if (isSE && recupFilter !== 'любой') filters.recup = recupFilter;
    return findAnalogsByModel(modelName, Number(sizeNo), filters, 3);
  }, [effectiveSelected, heaterFilter, recupFilter, isSE]);

  return (
    <section className="bg-white rounded-xl border border-sand shadow-card p-5 sm:p-6">
      <h2 className="text-base font-semibold text-ink">Подбор по моделям</h2>
      <p className="text-xs text-stone mt-0.5 mb-4">
        Выберите установку по наименованию — подберём 1–3 аналога того же класса, доступных как замена.
      </p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <div>
          <label className={labelCls}>Тип установки</label>
          <select
            className={fieldCls}
            value={inst}
            onChange={(e) => {
              setInst(e.target.value as Inst);
              setExpanded(null);
            }}
          >
            <option>приточная</option>
            <option>приточно-вытяжная</option>
          </select>
        </div>
        <div className="sm:col-span-1 lg:col-span-1">
          <label className={labelCls}>Модель / типоразмер</label>
          <select className={fieldCls} value={effectiveSelected} onChange={(e) => setSelected(e.target.value)}>
            {options.map((o) => (
              <option key={optionKey(o)} value={optionKey(o)}>
                {o.cleanName}{o.status ? ' — архив' : ''}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className={labelCls}>Нагреватель</label>
          <select className={fieldCls} value={heaterFilter} onChange={(e) => setHeaterFilter(e.target.value as any)}>
            <option>любой</option>
            <option>электрический</option>
            <option>водяной</option>
          </select>
        </div>
        {isSE && (
          <div>
            <label className={labelCls}>Рекуператор</label>
            <select className={fieldCls} value={recupFilter} onChange={(e) => setRecupFilter(e.target.value as any)}>
              <option>любой</option>
              <option>пластинчатый</option>
              <option>роторный</option>
            </select>
          </div>
        )}
      </div>

      {result?.base && (
        <div className="mt-5">
          <div className="text-xs font-heading font-semibold uppercase tracking-wide text-stone mb-2">
            Исходная установка
          </div>
          <Card m={result.base} highlight expanded={expanded === 'base'} onToggle={() => setExpanded(expanded === 'base' ? null : 'base')} />

          <div className="text-xs font-heading font-semibold uppercase tracking-wide text-accent-dark mt-5 mb-2">
            Аналоги{result.analogs.length ? ` (${result.analogs.length})` : ''}
          </div>
          {result.analogs.length === 0 ? (
            <div className="rounded-xl border border-sand bg-paper px-4 py-3 text-sm text-stone">
              Подходящих аналогов под выбранные фильтры не найдено.
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-3">
              {result.analogs.map((m) => {
                const key = `${m.modelName}#${m.size.size_no}`;
                return (
                  <Card key={key} m={m} expanded={expanded === key} onToggle={() => setExpanded(expanded === key ? null : key)} />
                );
              })}
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function Card({
  m,
  highlight,
  expanded,
  onToggle,
}: {
  m: ModelMatch;
  highlight?: boolean;
  expanded: boolean;
  onToggle: () => void;
}) {
  const imgs = imagesForModel(m.modelName);
  return (
    <div className={'rounded-xl border p-4 ' + (highlight ? 'border-ink/15 bg-paper' : 'border-sand bg-white')}>
      <div className="flex gap-3">
        {imgs && (
          <img src={imageUrl(imgs.photo)} alt="" className="h-16 w-20 object-contain rounded border border-sand bg-white p-1" loading="lazy" />
        )}
        <div className="min-w-0">
          <div className="font-heading font-medium text-ink text-sm leading-tight">{m.cleanName}</div>
          <div className="text-xs text-stone">{m.modelName}</div>
          {m.catalog && <div className="mt-1 font-heading font-semibold text-accent-dark">{money(m.catalog.price)}</div>}
        </div>
      </div>

      <dl className="mt-2 space-y-0.5 text-sm">
        <Line label="Нагреватель" value={m.heater ?? '—'} />
        {m.recup && <Line label="Рекуператор" value={m.recup} />}
        <Line label="Мощность нагрев." value={`${fmt(m.size.heater_power_kW)} кВт`} />
        <Line label="Наличие" value={m.stock.qty > 0 ? `${m.stock.qty} шт.` : 'нет'} />
        <Line label="НС-код" value={m.stock.code !== '—' ? m.stock.code : '—'} />
      </dl>

      <div className="mt-2 flex items-center gap-3">
        <button onClick={onToggle} className="text-sm font-heading font-medium text-accent-dark hover:underline">
          {expanded ? 'Скрыть характеристики' : 'Характеристики'}
        </button>
        {m.catalog?.url && (
          <a href={m.catalog.url} target="_blank" rel="noopener noreferrer" className="text-sm font-heading font-medium text-accent-dark hover:underline">
            Карточка товара ↗
          </a>
        )}
      </div>

      {expanded && (
        <div className="mt-3 border-t border-sand pt-3 text-sm">
          <Line label="Фильтр приток" value={fmt(m.size.filter_supply)} />
          {m.modelType === 'supply_exhaust' && <Line label="Фильтр вытяжка" value={fmt(m.size.filter_exhaust)} />}
          <Line label="Потребляемая мощность" value={`${fmt(m.size.power_kW)} кВт`} />
          <Line label="Рабочий ток" value={`${fmt(m.size.current_A)} А`} />
          <Line label="Напряжение вентилятора" value={`${fmt(m.size.voltage_fan)} В`} />
          <Line label="Частота вращения" value={`${fmt(m.size.rpm, 0)} об/мин`} />
          {m.modelType === 'supply_exhaust' && m.size.recup_eff_T != null && (
            <Line label="КПД рекуператора (t)" value={`${fmt((m.size.recup_eff_T ?? 0) * 100, 0)} %`} />
          )}
          <div className="mt-2 grid grid-cols-2 gap-x-6">
            {DIM_KEYS.map((k) => (
              <Line key={k} label={k} value={fmt(m.size.dims?.[k])} />
            ))}
          </div>
          <Line label="Вес" value={`${fmt(m.size.dims?.weight_kg, 0)} кг`} />
          {imgs && imgs.drawings.length > 0 && (
            <div className="mt-2 flex gap-2 flex-wrap">
              {imgs.drawings.map((d) => (
                <img key={d} src={imageUrl(d)} alt="" className="h-16 w-auto rounded border border-sand bg-white p-1" loading="lazy" />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Line({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-2 border-b border-sand/60 py-0.5">
      <span className="text-ink/60">{label}</span>
      <span className="font-heading font-medium text-ink text-right tabular-nums">{value}</span>
    </div>
  );
}
