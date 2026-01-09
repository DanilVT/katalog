import React, { useEffect, useMemo, useState } from "react";

const POP = "⭐";
const VK_CHAT_URL = "https://vk.com/im?sel=-232563555&entrypoint=community_page";

function isInVkWebApp() {
  return /(^|[?&])vk_/.test(window.location.search);
}

/* ======================= СЛАГИ ======================= */
const VENEER_SLUG = { "Дуб": "oak", "Американский орех": "american-walnut" };
const FINISH_SLUG = { "Масло": "oil", "Краска": "paint" };
const variantDir = (item) =>
  (item?.dir || item?.code || "").toLowerCase();

/* ======================= LIGHTBOX ======================= */
function useLightbox() {
  const [state, setState] = useState({ open: false, items: [], index: 0 });
  const open = (items, index = 0) => setState({ open: true, items, index });
  const close = () => setState(s => ({ ...s, open: false }));
  const prev = () => setState(s => ({ ...s, index: (s.index - 1 + s.items.length) % s.items.length }));
  const next = () => setState(s => ({ ...s, index: (s.index + 1) % s.items.length }));

  return { state, open, close, prev, next };
}

function Lightbox({ state, close, prev, next }) {
  if (!state.open) return null;
  const item = state.items[state.index];
  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center" onClick={close}>
      <button className="absolute left-3 text-white text-3xl" onClick={(e) => { e.stopPropagation(); prev(); }}>‹</button>
      <img src={item.src} alt="" className="max-h-[90vh] max-w-[90vw]" />
      <button className="absolute right-3 text-white text-3xl" onClick={(e) => { e.stopPropagation(); next(); }}>›</button>
      <button className="absolute top-3 right-3 text-white" onClick={(e) => { e.stopPropagation(); close(); }}>✕</button>
    </div>
  );
}

/* ======================= DATA ======================= */
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
      description: "Панели из мультишпона"
    }
  ],
  veneers: {
    "Дуб": {
      finishes: [
        {
          type: "Масло",
          items: [
            { name: `Табак ${POP}`, code: "tobacco", dir: "tabak" }
          ]
        }
      ]
    }
  }
};

/* ======================= ROUTER ======================= */
function useHashRoute(keys) {
  const [route, setRoute] = useState(() => window.location.hash.replace("#", ""));
  useEffect(() => {
    const fn = () => setRoute(window.location.hash.replace("#", ""));
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);
  return {
    current: keys.includes(route) ? route : "",
    setCategory: (k) => (window.location.hash = k)
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

function Breadcrumbs({ onReset, current }) {
  return (
    <div className="text-sm text-gray-600 flex gap-2">
      <button className="underline" onClick={onReset}>Каталог</button>
      {current && (
        <>
          <span>›</span>
          <span>{current}</span>
        </>
      )}
    </div>
  );
}

/* ======================= APP ======================= */
export default function App() {
  const { current, setCategory } = useHashRoute(DATA.categories.map(c => c.key));
  const [category, setCategoryState] = useState("");
  const [manifest, setManifest] = useState({});
  const lb = useLightbox();

  useEffect(() => {
    fetch("/images/manifest.json")
      .then(r => r.json())
      .then(setManifest)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (current) setCategoryState(current);
  }, [current]);

  const resetAll = () => {
    setCategoryState("");
    window.location.hash = "";
  };

  const handleSend = () => {
    if (isInVkWebApp() && window?.vkBridge?.send) {
      window.vkBridge.send("VKWebAppOpenLink", { url: VK_CHAT_URL });
    } else {
      window.location.href = VK_CHAT_URL;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-4 pb-28">
        <div className="py-3 border-b space-y-1">
          <div className="text-lg font-semibold">Каталог</div>
          <Breadcrumbs
            onReset={resetAll}
            current={DATA.categories.find(c => c.key === category)?.name}
          />
        </div>

        {/* Главная */}
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

        {/* МУЛЬТИШПОН */}
        {category === "multishpon" && (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              {(manifest.multishpon || []).map((file, idx) => {
                const src = `/images/multishpon/${file}`;
                return (
                  <img
                    key={file}
                    src={src}
                    className="aspect-[4/3] rounded-xl object-cover border cursor-zoom-in"
                    onClick={() =>
                      lb.open(
                        (manifest.multishpon || []).map(f => ({ src: `/images/multishpon/${f}` })),
                        idx
                      )
                    }
                  />
                );
              })}
            </div>
            <Lightbox {...lb} />
          </div>
        )}
      </div>

      {/* CTA */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-3">
        <button
          className="w-full py-3 rounded-xl border"
          onClick={handleSend}
        >
          Нужна помощь с выбором
        </button>
      </div>
    </div>
  );
}
