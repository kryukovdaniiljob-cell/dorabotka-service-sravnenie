// Сопоставление подобранной позиции с карточкой каталога b2b.rusklimat.com:
// розничная цена и ссылка на товар. Источник — выгрузка номенклатуры
// (catalog_data.json), ключ — НС-код (только цифры) для устойчивого джойна
// со складскими кодами вида «НС-0006037».
import catalogRaw from '../data/catalog_data.json';

export interface CatalogInfo {
  price: number;
  url: string;
  name: string;
}

const CATALOG = catalogRaw as Record<string, CatalogInfo>;

/** Нормализация НС-кода к цифрам: «НС-0006037» → «0006037». */
function keycode(code: string | undefined | null): string {
  return (code ?? '').replace(/\D/g, '');
}

/** Карточка каталога по НС-коду (цена + ссылка) или null, если не найдена. */
export function findCatalog(code: string | undefined | null): CatalogInfo | null {
  const k = keycode(code);
  if (!k) return null;
  return CATALOG[k] ?? null;
}
