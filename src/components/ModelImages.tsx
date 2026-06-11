import { useState } from 'react';
import { imagesForModel, imageUrl } from '../data/modelImages';

interface Props {
  modelName: string;
}

/**
 * Блок изображений изделия: фото-рендер + галерея размерных чертежей.
 * Клик по изображению открывает лайтбокс (зум). Если для модели картинок нет —
 * компонент ничего не рендерит. В печать изображения выводятся.
 */
export default function ModelImages({ modelName }: Props) {
  const set = imagesForModel(modelName);
  const [zoom, setZoom] = useState<string | null>(null);
  if (!set) return null;

  return (
    <div className="rounded-xl border border-sand bg-paper/60 p-4">
      <h4 className="font-heading text-xs font-semibold uppercase tracking-wide text-accent-dark mb-3 flex items-center gap-2">
        <span className="h-1 w-1 rounded-full bg-accent" />
        Внешний вид и габаритный чертёж
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] gap-4">
        {/* Фото изделия */}
        <figure className="m-0">
          <button
            type="button"
            onClick={() => setZoom(imageUrl(set.photo))}
            className="block w-full rounded-lg border border-sand bg-white p-3 transition hover:border-accent"
          >
            <img
              src={imageUrl(set.photo)}
              alt={`Внешний вид ${modelName}`}
              loading="lazy"
              className="mx-auto max-h-48 w-auto object-contain"
            />
          </button>
          <figcaption className="mt-1 text-center text-xs text-stone">Внешний вид</figcaption>
        </figure>

        {/* Чертежи */}
        {set.drawings.length > 0 && (
          <div className="grid grid-cols-2 gap-2 self-start">
            {set.drawings.map((d, i) => (
              <figure key={d} className="m-0">
                <button
                  type="button"
                  onClick={() => setZoom(imageUrl(d))}
                  className="block w-full rounded-lg border border-sand bg-white p-2 transition hover:border-accent"
                >
                  <img
                    src={imageUrl(d)}
                    alt={`Габаритный чертёж ${modelName} (${i + 1})`}
                    loading="lazy"
                    className="mx-auto h-20 w-auto object-contain"
                  />
                </button>
                <figcaption className="mt-1 text-center text-[11px] text-stone">
                  Чертёж {set.drawings.length > 1 ? i + 1 : ''}
                </figcaption>
              </figure>
            ))}
          </div>
        )}
      </div>

      {/* Лайтбокс */}
      {zoom && (
        <div
          className="no-print fixed inset-0 z-[60] flex items-center justify-center bg-ink/70 p-6"
          onClick={() => setZoom(null)}
        >
          <img
            src={zoom}
            alt="Увеличенное изображение"
            className="max-h-[90vh] max-w-[90vw] rounded-lg bg-white object-contain p-2 shadow-xl"
          />
          <button
            onClick={() => setZoom(null)}
            className="absolute right-6 top-6 rounded-lg bg-white/90 px-3 py-1.5 text-sm font-heading text-ink"
          >
            ✕ Закрыть
          </button>
        </div>
      )}
    </div>
  );
}
