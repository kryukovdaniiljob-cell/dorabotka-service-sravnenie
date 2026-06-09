// Карта: модель → изображения изделия (фото-рендер + размерные чертежи).
// Источник — Excel MiniAHU_Selector_v.2.3 (PNG/JPEG, EMF-схемы потоков пропущены).
// Пути относительные (без ведущего слэша) — резолвятся через import.meta.env.BASE_URL
// в компоненте ModelImages, чтобы корректно работать на GitHub Pages (подпапка).
// Несколько моделей могут делить одно изображение — это нормально.

export interface ModelImageSet {
  photo: string;
  drawings: string[];
}

const DIR = 'images/models/';

export const MODEL_IMAGES: Record<string, ModelImageSet> = {
  CAU_F: {
    photo: DIR + 'cau-photo.png',
    drawings: ['cau-f-dim1.png', 'cau-dim-a.png', 'cau-f-dim3.png', 'cau-f-dim4.png', 'cau-f-dim5.jpeg'].map((f) => DIR + f),
  },
  CAU_W: {
    photo: DIR + 'cau-photo.png',
    drawings: ['cau-dim-a.png', 'cau-w-dim2.png', 'cau-w-dim3.png'].map((f) => DIR + f),
  },
  ECO_A: {
    photo: DIR + 'eco-a-photo.png',
    drawings: [DIR + 'eco-a-dim1.png'],
  },
  ECO_Slim: {
    photo: DIR + 'eco-slim-photo.png',
    drawings: ['eco-slim-dim1.png', 'eco-slim-dim2.png'].map((f) => DIR + f),
  },
  ECO_Slim_W: {
    photo: DIR + 'eco-slim-photo.png',
    drawings: [DIR + 'eco-slim-dim1.png'],
  },
  Airtube: {
    photo: DIR + 'airtube-photo.png',
    drawings: [DIR + 'airtube-dim1.png'],
  },
  Swift: {
    photo: DIR + 'swift-photo.png',
    drawings: [DIR + 'swift-dim1.png'],
  },
  Nova: {
    photo: DIR + 'nova-photo.png',
    drawings: [DIR + 'nova-dim1.png'],
  },

  // Роторные
  Unimax_R_SW: { photo: DIR + 'unimax-horizontal-photo.png', drawings: [DIR + 'unimax-r-horizontal-dim.png'] },
  Unimax_R_SE: { photo: DIR + 'unimax-horizontal-photo.png', drawings: [DIR + 'unimax-r-horizontal-dim.png'] },
  Unimax_R_VW: { photo: DIR + 'unimax-vertical-photo.png', drawings: [DIR + 'unimax-r-vertical-dim.png'] },
  Unimax_R_VE: { photo: DIR + 'unimax-vertical-photo.png', drawings: [DIR + 'unimax-r-vertical-dim.png'] },

  // Пластинчатые — вбок-напольные (S)
  Unimax_P_SW: { photo: DIR + 'unimax-horizontal-photo.png', drawings: [DIR + 'unimax-p-horizontal-dim.png'] },
  Unimax_P_SW_EC: { photo: DIR + 'unimax-horizontal-photo.png', drawings: [DIR + 'unimax-p-horizontal-dim.png'] },
  Unimax_P_SE: { photo: DIR + 'unimax-horizontal-photo.png', drawings: [DIR + 'unimax-p-horizontal-dim.png'] },
  Unimax_P_SE_EC: { photo: DIR + 'unimax-horizontal-photo.png', drawings: [DIR + 'unimax-p-horizontal-dim.png'] },

  // Пластинчатые — вверх (V)
  Unimax_P_VW: { photo: DIR + 'unimax-vertical-photo.png', drawings: [DIR + 'unimax-p-vertical-dim.png'] },
  Unimax_P_VW_EC: { photo: DIR + 'unimax-vertical-photo.png', drawings: [DIR + 'unimax-p-vertical-dim.png'] },
  Unimax_P_VE: { photo: DIR + 'unimax-vertical-photo.png', drawings: [DIR + 'unimax-p-vertical-dim.png'] },
  Unimax_P_VE_EC: { photo: DIR + 'unimax-vertical-photo.png', drawings: [DIR + 'unimax-p-vertical-dim.png'] },

  // Пластинчатые — вбок-подвесные (C)
  Unimax_P_CW: { photo: DIR + 'unimax-compact-photo.png', drawings: ['unimax-compact-dim1.png', 'unimax-compact-dim2.png'].map((f) => DIR + f) },
  Unimax_P_CW_EC: { photo: DIR + 'unimax-compact-photo.png', drawings: ['unimax-compact-dim1.png', 'unimax-compact-dim2.png'].map((f) => DIR + f) },
  Unimax_P_CE: { photo: DIR + 'unimax-compact-photo.png', drawings: ['unimax-compact-dim1.png', 'unimax-compact-dim2.png'].map((f) => DIR + f) },
  Unimax_P_CE_EC: { photo: DIR + 'unimax-compact-photo.png', drawings: ['unimax-compact-dim1.png', 'unimax-compact-dim2.png'].map((f) => DIR + f) },
};

/** Полный URL изображения с учётом базового пути сайта (GitHub Pages). */
export function imageUrl(relPath: string): string {
  return import.meta.env.BASE_URL + relPath;
}

export function imagesForModel(modelName: string): ModelImageSet | null {
  return MODEL_IMAGES[modelName] ?? null;
}
