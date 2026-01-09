import React, { useEffect, useMemo, useState } from "react";

// Популярные пометим ⭐
const POP = "⭐";

// Ссылка на чат сообщества
const VK_CHAT_URL = 'https://vk.com/im?sel=-232563555&entrypoint=community_page';

// простая проверка: мы запущены внутри VK (в URL присутствуют vk_* параметры)
function isInVkWebApp() {
  return /(^|[?&])vk_/.test(window.location.search);
}

/* ======================= СЛАГИ / ПОМОЩНИКИ ======================= */
const VENEER_SLUG = { "Дуб": "oak", "Американский орех": "american-walnut" };
const FINISH_SLUG = { "Масло": "oil", "Краска": "paint" };
function variantDir(item) {
  return (item?.dir || item?.code || "").toString().toLowerCase();
}

/* ======================= ЛАЙТБОКС ======================= */
function useLightbox() {
  const [state, setState] = useState({ open: false, items: [], index: 0 });
  const open  = (items, index = 0) => setState({ open: true, items, index });
  const close = () => setState(s => ({ ...s, open: false }));
  const prev  = () => setState(s => ({ ...s, index: (s.index - 1 + s.items.length) % s.items.length }));
  const next  = () => setState(s => ({ ...s, index: (s.index + 1) % s.items.length }));
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
      <button className="absolute left-3 top-1/2 -translate-y-1/2 text-white text-3xl" onClick={(e) => { e.stopPropagation(); prev(); }}>‹</button>
      <img src={item.src} alt={item.caption} className="max-h-[90vh] max-w-[90vw] object-contain" onClick={(e) => e.stopPropagation()} />
      <div className="absolute bottom-5 left-0 right-0 text-center text-white text-sm">
        {state.index + 1} / {state.items.length} — {item.caption}
      </div>
      <button className="absolute right-3 top-1/2 -translate-y-1/2 text-white text-3xl" onClick={(e) => { e.stopPropagation(); next(); }}>›</button>
      <button className="absolute top-3 right-3 text-white text-2xl" onClick={(e) => { e.stopPropagation(); close(); }}>✕</button>
    </div>
  );
}

/* ======================= ДАННЫЕ ======================= */
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
            { name: `Красный орех`, code: "red-walnut", dir: "krasnyj-orekh" },
            { name: `Махагон`, code: "mahogany", dir: "mahagon" },
            { name: `Натуральный бук`, code: "beech-natural", dir: "naturalnyj-buk" },
            { name: `Рустикальный дуб ${POP}`, code: "oak-rustic", dir: "rustikalnyj-dub" },
            { name: `Табак ${POP}`, code: "tobacco", dir: "tabak" },
            { name: `Тёмная вишня`, code: "dark-cherry", dir: "tyomnaya-vishnya" },
            { name: `Тёмный дуб ${POP}`, code: "dark-oak", dir: "tyomnyj-dub" },
            { name: `Тёплый серый ${POP}`, code: "warm-gray", dir: "tyoplyj-seryj" },
            { name: `Холодный серый ${POP}`, code: "cool-gray", dir: "holodnyj-seryj" },
            { name: `Палисандр ${POP}`, code: "palisandr" }
          ]
        }
      ]
    },
    "Американский орех": {
      finishes: [
        {
          type: "Масло",
          items: [
            { name: `Бесцветное ${POP}`, code: "clear", dir: "bescvetnoe" }
          ]
        }
      ]
    }
  }
};

/* ======================= Роутинг ======================= */
function useHashRoute(categoryKeys) {
  const [route, setRoute] = useState(() => window.location.hash.replace("#", ""));
  useEffect(() => {
    const onHash = () => setRoute(window.location.hash.replace("#", ""));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const setCategory = (key) => { if (key) window.location.hash = key; };
  const current = categoryKeys.includes(route) ? route : "";
  return { current, setCategory };
}

/* ======================= UI ======================= */
function Tile({ title, subtitle, onClick }) {
  return (
    <button onClick={onClick} className="w-full p-4 rounded-2xl border shadow-sm text-left">
      <div className="text-base font-medium">{title}</div>
      {subtitle && <div className="text-xs mt-1 text-gray-500">{subtitle}</div>}
    </button>
  );
}

function Breadcrumbs({ onReset, path }) {
  return (
    <div className="text-sm text-gray-600 flex items-center gap-2">
      <button className="underline" onClick={onReset}>Каталог</button>
      {path.map((p, i) => (
        <React.Fragment key={i}>
          <span>›</span>
          <button className="underline" onClick={p.onClick}>{p.label}</button>
        </React.Fragment>
      ))}
    </div>
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
    fetch("/images/manifest.json", { cache: "no-cache" })
      .then(r => r.json())
      .then(setManifest)
      .catch(() => setManifest({}));
  }, []);

  useEffect(() => { if (current) setCategoryState(current); }, [current]);

  const lb = useLightbox();

  const resetAll = () => {
    setSelectedVariant(null);
    setSelectedFinishType(null);
    setSelectedVeneer(null);
    setCategoryState("");
    window.location.hash = "";
  };

  const path = [];
  if (category) path.push({ label: "Шпонированные панели", onClick: () => resetAll() });
  if (selectedVeneer) path.push({ label: selectedVeneer, onClick: () => { setSelectedFinishType(null); setSelectedVariant(null); } });
  if (selectedFinishType) path.push({ label: selectedFinishType, onClick: () => setSelectedVariant(null) });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-4 pb-28">
        <div className="py-3 border-b">
          <div className="text-lg font-semibold">Каталог</div>
          <Breadcrumbs onReset={resetAll} path={path} />
        </div>

        {!category && (
          <div className="mt-4">
            <Tile
              title="Шпонированные панели"
              subtitle="Выбор шпона → покрытие → примеры"
              onClick={() => { setCategory("veneers"); setCategoryState("veneers"); }}
            />
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

        {category === "veneers" && selectedVeneer && !selectedFinishType && (
          <div className="mt-4 space-y-3">
            <div className="text-sm text-gray-600">Шаг 2 · Покрытие</div>
            {DATA.veneers[selectedVeneer].finishes.map(f => (
              <Tile key={f.type} title={f.type} onClick={() => setSelectedFinishType(f.type)} />
            ))}
          </div>
        )}

        {category === "veneers" && selectedFinishType && !selectedVariant && (
          <div className="mt-4 space-y-3">
            <div className="text-sm text-gray-600">Шаг 3 · Вариант</div>
            {DATA.veneers[selectedVeneer].finishes
              .find(f => f.type === selectedFinishType)
              .items.map(i => (
                <Tile key={i.code} title={i.name} onClick={() => setSelectedVariant(i)} />
              ))}
          </div>
        )}

        {category === "veneers" && selectedVariant && (
          <div className="mt-4">
            <div className="text-sm text-gray-600 mb-3">Шаг 4 · Примеры</div>
            <div className="grid grid-cols-2 gap-3">
              {(manifest?.[VENEER_SLUG[selectedVeneer]]?.[FINISH_SLUG[selectedFinishType]]?.[variantDir(selectedVariant)] || [])
                .map((file, i, arr) => {
                  const src = `/images/panels-veneer/${VENEER_SLUG[selectedVeneer]}/${FINISH_SLUG[selectedFinishType]}/${variantDir(selectedVariant)}/${file}`;
                  const images = arr.map(f => ({
                    src: `/images/panels-veneer/${VENEER_SLUG[selectedVeneer]}/${FINISH_SLUG[selectedFinishType]}/${variantDir(selectedVariant)}/${f}`,
                    caption: f
                  }));
                  return (
                    <img
                      key={file}
                      src={src}
                      className="rounded-xl border cursor-zoom-in"
                      onClick={() => lb.open(images, i)}
                    />
                  );
                })}
            </div>
            <Lightbox {...lb} />
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
