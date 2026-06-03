import { useMemo, useState } from 'react';
import type { SelectorInput } from './engine/types';
import { runSelection } from './engine/engine';
import InputForm from './components/InputForm';
import Warnings from './components/Warnings';
import AeroChart from './components/AeroChart';
import SpecSheet from './components/SpecSheet';

const DEFAULT_INPUT: SelectorInput = {
  installation_type: 'приточно-вытяжная',
  selection_mode: 'вручную',
  manual_model_se: 'Unimax_P_CE',
  manual_size_no: 4,
  flow: 500,
  head: 150,
  t_outdoor: -30,
  rh_outdoor: 80,
  t_supply: 21,
  t_indoor: 18,
  rh_indoor: 40,
  recup_type: 'пластинчатый',
  heater_type: 'электрический',
  case_type: 'изолированный',
  automation: 'встроенная',
  motor_type: 'асинхронный',
  wall_thickness: 'стандартная',
  air_outlet: 'вбок',
  mounting: 'подвесная',
};

export default function App() {
  const [input, setInput] = useState<SelectorInput>(DEFAULT_INPUT);
  const result = useMemo(() => runSelection(input), [input]);

  return (
    <div className="min-h-full bg-paper">
      <header className="bg-ink text-paper no-print">
        <div className="mx-auto max-w-7xl px-6 py-5 flex items-center gap-3">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-paper font-heading font-semibold text-lg">К</span>
          <div>
            <h1 className="font-heading text-xl font-semibold tracking-tight">Сервис подбора КПВУ</h1>
            <p className="text-xs text-stone">Компактные приточные и приточно-вытяжные установки</p>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl p-4 sm:p-6 grid lg:grid-cols-[360px_1fr] gap-6">
        <aside className="bg-white rounded-2xl border border-sand shadow-sm p-5 no-print self-start lg:sticky lg:top-6">
          <InputForm value={input} onChange={setInput} />
        </aside>

        <main className="space-y-6 print-full">
          <div className="flex items-center justify-between gap-3 no-print">
            <div className="text-sm">
              {result.ok ? (
                <span className="text-ink/70">
                  Подобрана модель{' '}
                  <b className="font-heading font-semibold text-accent-dark">{result.modelName}</b>
                  , типоразмер №{result.m61?.size_no}
                </span>
              ) : (
                <span className="font-medium text-accent-dark">Подбор не выполнен</span>
              )}
            </div>
            <button
              onClick={() => window.print()}
              className="rounded-lg bg-accent px-4 py-2 text-sm font-heading font-medium text-paper shadow-sm transition hover:bg-accent-dark"
            >
              🖨 Печать / PDF
            </button>
          </div>

          <Warnings error={result.error} warnings={result.warnings} />

          <section className="bg-white rounded-2xl border border-sand shadow-sm p-5 sm:p-6">
            <h2 className="font-heading text-base font-semibold text-ink mb-3">
              Аэродинамические характеристики
            </h2>
            <AeroChart result={result} input={input} />
          </section>

          <section className="bg-white rounded-2xl border border-sand shadow-sm p-5 sm:p-6">
            <SpecSheet result={result} input={input} />
          </section>
        </main>
      </div>

      <footer className="no-print mx-auto max-w-7xl px-6 pb-8 pt-2 text-xs text-stone">
        Расчёт воспроизводит движок Excel-калькулятора MiniAHU. Все данные — из models_data.json.
      </footer>
    </div>
  );
}
