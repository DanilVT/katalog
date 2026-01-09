import React, { useEffect, useMemo, useState } from "react";

const POP = "⭐";
const VK_CHAT_URL = "https://vk.com/im?sel=-232563555&entrypoint=community_page";

function isInVkWebApp() {
  return /(^|[?&])vk_/.test(window.location.search);
}

const VENEER_SLUG = { "Дуб": "oak", "Американский орех": "american-walnut" };
const FINISH_SLUG = { "Масло": "oil", "Краска": "paint" };

function variantDir(item) {
  return (item?.dir || item?.code || "").toLowerCase();
}

/* ======================= LIGHTBOX ======================= */
function useLightbox() {
  const [state, setState] = useState({ open: false, items: [], index: 0 });
  return {
    state,
    open: (items, index = 0) => setState({ open: true, items, index }),
    close: () => setState(s => ({ ...s, open: false })),
    prev: () =>
      setState(s => ({ ...s, index: (s.index - 1 + s.items.length) % s.items.length })),
    next: () =>
      setState(s => ({ ...s, index: (s.index + 1) % s.items.length }))
  };
}

function Lightbox({ lb }) {
  if (!lb.state.open) return null;
  const item = lb.state.items[lb.state.index];

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={lb.close}>
      <img
        src={item.src}
        alt=""
        className="max-h-[90vh] max-w-[90vw]"
        onClick={e => e.stopPropagation()}
      />
    </div>
  );
}

/* ======================= DATA ======================= */
const DATA = {
  categories: [
    { key: "veneers", name: "Шпонированные панели" },
    { key: "multishpon", name: "Мультишпон" }
  ],
  veneers: {
    "Дуб": {
      finishes: [
        {
          type: "Масло",
          items: [
            { name: `Табак ${POP}`, code: "tobacco", dir: "tabak" },
            { name: `Тёмный дуб ${POP}`, code: "dark-oak", dir: "tyomnyj-dub" }
          ]
        }
      ]
    }
  }
};

/* ======================= UI ======================= */
function Tile({ title, onClick }) {
  return (
    <button
      onClick={onClick}
      className="w-full p-4 rounded-2xl border shadow-sm text-left"
    >
      <div className="text-base font-medium">{title}</div>
    </button>
  );
}

/* ======================= APP ======================= */
export default function App() {
  const [category, setCategory] = useState("");
  const [selectedVeneer, setSelectedVeneer] = useState(null);
  const [selectedFinish, setSelectedFinish] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [manifest, setManifest] = useState({});
  const lb = useLightbox();

  useEffect(() => {
    fetch("/images/manifest.json").then(r => r.json()).then(setManifest);
  }, []);

  const reset = () => {
    setCategory("");
    setSelectedVeneer(null);
    setSelectedFinish(null);
    setSelectedVariant(null);
  };

  const openChat = () => {
    window.location.href = VK_CHAT_URL;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-4 pb-28">
        <div className="py-4 border-b">
          <div className="text-xl font-semibold">Каталог</div>
          {category && (
            <div className="text-sm mt-1">
              <button onClick={reset} className="underline">Каталог</button>
              {" › "}
              {DATA.categories.find(c => c.key === category)?.name}
            </div>
          )}
        </div>

        {/* STEP 0 */}
        {!category && (
          <div className="space-y-3 mt-4">
            {DATA.categories.map(c => (
              <Tile key={c.key} title={c.name} onClick={() => setCategory(c.key)} />
            ))}
          </div>
        )}

        {/* VENEERS */}
        {category === "veneers" && !selectedVeneer && (
          <div className="mt-4 space-y-3">
            <div className="text-sm text-gray-600">Шаг 1 · Выберите шпон</div>
            {Object.keys(DATA.veneers).map(v => (
              <Tile key={v} title={v} onClick={() => setSelectedVeneer(v)} />
            ))}
          </div>
        )}

        {category === "veneers" && selectedVeneer && !selectedFinish && (
          <div className="mt-4 space-y-3">
            <div className="text-sm text-gray-600">Шаг 2 · Покрытие</div>
            {DATA.veneers[selectedVeneer].finishes.map(f => (
              <Tile key={f.type} title={f.type} onClick={() => setSelectedFinish(f)} />
            ))}
          </div>
        )}

        {category === "veneers" && selectedFinish && !selectedVariant && (
          <div className="mt-4 space-y-3">
            <div className="text-sm text-gray-600">Шаг 3 · Вариант</div>
            {selectedFinish.items.map(v => (
              <Tile key={v.code} title={v.name} onClick={() => setSelectedVariant(v)} />
            ))}
          </div>
        )}

        {category === "veneers" && selectedVariant && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {(manifest?.[VENEER_SLUG[selectedVeneer]]?.[FINISH_SLUG[selectedFinish.type]]?.[variantDir(selectedVariant)] || [])
              .map((file, i) => {
                const src = `/images/panels-veneer/${VENEER_SLUG[selectedVeneer]}/${FINISH_SLUG[selectedFinish.type]}/${variantDir(selectedVariant)}/${file}`;
                return (
                  <img
                    key={i}
                    src={src}
                    className="rounded-xl border cursor-zoom-in"
                    onClick={() => lb.open([{ src }])}
                  />
                );
              })}
          </div>
        )}

        {/* MULTISHPON */}
        {category === "multishpon" && (
          <div className="mt-4 grid grid-cols-2 gap-3">
            {(manifest.multishpon || []).map((file, i) => {
              const src = `/images/multishpon/${file}`;
              return (
                <img
                  key={i}
                  src={src}
                  className="rounded-xl border cursor-zoom-in"
                  onClick={() => lb.open([{ src }])}
                />
              );
            })}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-3">
        <button
          onClick={openChat}
          className="w-full py-3 rounded-xl border font-medium"
        >
          Нужна помощь с выбором
        </button>
      </div>

      <Lightbox lb={lb} />
    </div>
  );
}
