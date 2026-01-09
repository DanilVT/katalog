import React, { useEffect, useMemo, useState } from "react";

/* ======================= КОНСТАНТЫ ======================= */

// Популярные пометим ⭐
const POP = "⭐";

// Ссылка на чат сообщества
const VK_CHAT_URL = "https://vk.com/im?sel=-232563555&entrypoint=community_page";

// Проверка запуска внутри VK
function isInVkWebApp() {
  return /(^|[?&])vk_/.test(window.location.search);
}

/* ======================= СЛАГИ ======================= */

const VENEER_SLUG = { "Дуб": "oak", "Американский орех": "american-walnut" };
const FINISH_SLUG = { "Масло": "oil", "Краска": "paint" };

function variantDir(item) {
  return (item?.dir || item?.code || "").toLowerCase();
}

/* ======================= ЛАЙТБОКС ======================= */

function useLightbox() {
  const [state, setState] = useState({ open: false, items: [], index: 0 });

  const open = (items, index = 0) => setState({ open: true, items, index });
  const close = () => setState(s => ({ ...s, open: false }));
  const prev = () => setState(s => ({ ...s, index: (s.index - 1 + s.items.length) % s.items.length }));
  const next = () => setState(s => ({ ...s, index: (s.index + 1) % s.items.length }));

  useEffect(() => {
    if (!state.open) return;
    const onKey = e => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [state.open]);

  return { state, open, close, prev, next };
}

function Lightbox({ state, close, prev, next }) {
  if (!state.open) return null;
  const item = state.items[state.index];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center" onClick={close}>
      <button className="absolute left-3 text-white text-3xl" onClick={e => { e.stopPropagation(); prev(); }}>‹</button>
      <img src={item.src} alt={item.caption} className="max-h-[90vh] max-w-[90vw] object-contain" />
      <button className="absolute right-3 text-white text-3xl" onClick={e => { e.stopPropagation(); next(); }}>›</button>
      <button className="absolute top-3 right-3 text-white text-2xl" onClick={close}>✕</button>
    </div>
  );
}

/* ======================= ДАННЫЕ (ИЗМЕНЕНО ТОЛЬКО ЗДЕСЬ) ======================= */

const DATA = {
  categories: [
    {
      key: "veneers",
      name: "Шпонированные панели",
      status: "ready",
      description: "Выбор шпона → покрытие (краска/масло) → примеры"
    }
  ],
  veneers: {
    "Дуб": {
      finishes: [
        {
          type: "Краска",
          items: [
            {
              name: "Чёрная краска",
              code: "paint-black",
              dir: "black",
              samples: [
                { id: "oak-paint-black-1", caption: "Дуб · Чёрная краска · Пример 1" },
                { id: "oak-paint-black-2", caption: "Дуб · Чёрная краска · Пример 2" }
              ]
            }
          ]
        },
        {
          type: "Масло",
          items: [
            { name: `512 ${POP}`, code: "512" },
            { name: `Антик ${POP}`, code: "antik" },
            { name: `Бесцветное ${POP}`, code: "clear", dir: "bescvetnoe" },
            { name: `Вишня`, code: "cherry", dir: "vishnya" },
            { name: `Коньяк ${POP}`, code: "cognac", dir: "konyak" },
            { name: `Рустикальный дуб ${POP}`, code: "oak-rustic", dir: "rustikalnyj-dub" },
            { name: `Табак ${POP}`, code: "tobacco", dir: "tabak" },
            { name: `Тёмный дуб ${POP}`, code: "dark-oak", dir: "tyomnyj-dub" },
            { name: `Палисандр ${POP}`, code: "palisandr" }
          ]
        }
      ]
    }
  }
};

/* ======================= APP ======================= */

export default function App() {
  const [category, setCategory] = useState("veneers");
  const [veneer, setVeneer] = useState(null);
  const [finish, setFinish] = useState(null);
  const [variant, setVariant] = useState(null);
  const [manifest, setManifest] = useState({});
  const lb = useLightbox();

  useEffect(() => {
    fetch("/images/manifest.json")
      .then(r => r.json())
      .then(setManifest)
      .catch(() => setManifest({}));
  }, []);

  return (
    <div className="max-w-md mx-auto px-4 pb-24">
      {!veneer && (
        <>
          <h2 className="mt-4 mb-2">Выберите шпон</h2>
          {Object.keys(DATA.veneers).map(v => (
            <button key={v} className="block w-full border p-3 mb-2" onClick={() => setVeneer(v)}>
              {v}
            </button>
          ))}
        </>
      )}

      {veneer && !finish && (
        <>
          <h2 className="mt-4 mb-2">Покрытие</h2>
          {DATA.veneers[veneer].finishes.map(f => (
            <button key={f.type} className="block w-full border p-3 mb-2" onClick={() => setFinish(f)}>
              {f.type}
            </button>
          ))}
        </>
      )}

      {finish && !variant && (
        <>
          <h2 className="mt-4 mb-2">Вариант</h2>
          {finish.items.map(i => (
            <button key={i.code} className="block w-full border p-3 mb-2" onClick={() => setVariant(i)}>
              {i.name}
            </button>
          ))}
        </>
      )}

      {variant && (
        <>
          <h2 className="mt-4 mb-2">Примеры</h2>
          <div className="grid grid-cols-2 gap-3">
            {(manifest?.[VENEER_SLUG[veneer]]?.[FINISH_SLUG[finish.type]]?.[variantDir(variant)] || []).map((file, idx) => {
              const src = `/images/panels-veneer/${VENEER_SLUG[veneer]}/${FINISH_SLUG[finish.type]}/${variantDir(variant)}/${file}`;
              return (
                <img
                  key={idx}
                  src={src}
                  className="aspect-[4/3] object-cover border cursor-pointer"
                  onClick={() => lb.open([{ src }], 0)}
                />
              );
            })}
          </div>
          <Lightbox {...lb} />
        </>
      )}
    </div>
  );
}
