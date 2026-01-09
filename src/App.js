import React, { useEffect, useMemo, useState } from "react";

// Популярные пометим ⭐
const POP = "⭐";

// Ссылка на чат сообщества
const VK_CHAT_URL = 'https://vk.com/im?sel=-232563555&entrypoint=community_page';

function isInVkWebApp() {
  return /(^|[?&])vk_/.test(window.location.search);
}

/* ======================= СЛАГИ ======================= */
const VENEER_SLUG = { "Дуб": "oak", "Американский орех": "american-walnut" };
const FINISH_SLUG = { "Масло": "oil", "Краска": "paint" };
function variantDir(item) {
  return (item?.dir || item?.code || "").toString().toLowerCase();
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
    const onKey = (e) => {
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
      <button className="absolute left-3 text-white text-3xl" onClick={(e) => { e.stopPropagation(); prev(); }}>‹</button>
      <img src={item.src} alt={item.caption} className="max-h-[90vh] max-w-[90vw]" />
      <button className="absolute right-3 text-white text-3xl" onClick={(e) => { e.stopPropagation(); next(); }}>›</button>
      <button className="absolute top-3 right-3 text-white" onClick={(e) => { e.stopPropagation(); close(); }}>✕</button>
    </div>
  );
}

/* ======================= ДАННЫЕ ======================= */
const DATA = {
  categories: [
    {
      key: "veneers",
      name: "Шпонированные панели",
      description: "Выбор шпона → покрытие → примеры"
    },
    {
      key: "multishpon",
      name: "Мультишпон",
      description: "Панели из мультишпона. В разработке"
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
                { id: "1", caption: "Пример 1" },
                { id: "2", caption: "Пример 2" }
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
            { name: `Коньяк ${POP}`, code: "cognac", dir: "konyak" },
            { name: `Табак ${POP}`, code: "tobacco", dir: "tabak" }
          ]
        }
      ]
    }
  }
};

/* ======================= РОУТИНГ ======================= */
function useHashRoute(keys) {
  const [route, setRoute] = useState(() => window.location.hash.replace("#", ""));
  useEffect(() => {
    const fn = () => setRoute(window.location.hash.replace("#", ""));
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);
  return {
    current: keys.includes(route) ? route : "",
    setCategory: (k) => window.location.hash = k
  };
}

/* ======================= UI ======================= */
function Tile({ title, subtitle, onClick }) {
  return (
    <button onClick={onClick} className="w-full p-4 rounded-2xl border shadow-sm text-left">
      <div className="font-medium">{title}</div>
      {subtitle && <div className="text-xs text-gray-500">{subtitle}</div>}
    </button>
  );
}

/* ======================= APP ======================= */
export default function App() {
  const { current, setCategory } = useHashRoute(DATA.categories.map(c => c.key));
  const [category, setCategoryState] = useState("");

  const [selectedVeneer, setSelectedVeneer] = useState(null);
  const [selectedFinishType, setSelectedFinishType] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const [manifest, setManifest] = useState({});
  useEffect(() => {
    fetch("/images/manifest.json").then(r => r.json()).then(setManifest).catch(() => {});
  }, []);

  useEffect(() => { if (current) setCategoryState(current); }, [current]);

  const lb = useLightbox();

  const resetAll = () => {
    setSelectedVeneer(null);
    setSelectedFinishType(null);
    setSelectedVariant(null);
    setCategoryState("");
    window.location.hash = "";
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-4 pb-28">
        <div className="py-3 border-b">
          <div className="text-lg font-semibold">Каталог</div>
        </div>

        {!category && (
          <div className="mt-4 space-y-3">
            {DATA.categories.map(c => (
              <Tile
                key={c.key}
                title={c.name}
                subtitle={c.description}
                onClick={() => { setCategory(c.key); setCategoryState(c.key); }}
              />
            ))}
          </div>
        )}

        {category === "multishpon" && (
          <div className="mt-6 text-sm text-gray-600">
            Раздел «Мультишпон» находится в разработке.
          </div>
        )}

        {category === "veneers" && !selectedVeneer && (
          <div className="mt-4 space-y-3">
            <div className="text-sm text-gray-600">Шаг 1 · Выберите шпон</div>
            {Object.keys(DATA.veneers).map(v => (
              <Tile key={v} title={v} onClick={() => setSelectedVeneer(v)} />
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-3">
        <button
          className="w-full py-3 rounded-xl border"
          onClick={() => window.location.href = VK_CHAT_URL}
        >
          Нужна помощь с выбором
        </button>
      </div>
    </div>
  );
}
