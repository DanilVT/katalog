import React, { useEffect, useMemo, useState } from "react";

const POP = "⭐";
const VK_CHAT_URL = "https://vk.com/im?sel=-232563555&entrypoint=community_page";

function isInVkWebApp() {
  return /(^|[?&])vk_/.test(window.location.search);
}

/* helpers */
const VENEER_SLUG = { "Дуб": "oak" };
const FINISH_SLUG = { "Масло": "oil", "Краска": "paint" };
const variantDir = (item) =>
  (item?.dir || item?.code || "").toString().toLowerCase();

/* lightbox */
function useLightbox() {
  const [state, setState] = useState({ open: false, items: [], index: 0 });
  const open = (items, index = 0) => setState({ open: true, items, index });
  const close = () => setState((s) => ({ ...s, open: false }));
  const prev = () =>
    setState((s) => ({
      ...s,
      index: (s.index - 1 + s.items.length) % s.items.length,
    }));
  const next = () =>
    setState((s) => ({
      ...s,
      index: (s.index + 1) % s.items.length,
    }));
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
      <button className="absolute top-3 right-3 text-white text-xl" onClick={close}>✕</button>
    </div>
  );
}

/* data */
const DATA = {
  categories: [
    {
      key: "veneers",
      name: "Шпонированные панели",
      description: "Выбор шпона → покрытие → примеры",
    },
    {
      key: "multishpon",
      name: "Мультишпон",
      description: "Каталог панелей из мультишпона",
      status: "wip",
    },
  ],
  veneers: {
    "Дуб": {
      finishes: [
        {
          type: "Масло",
          items: [
            { name: `512 ${POP}`, code: "512" },
            { name: `Антик ${POP}`, code: "antik" },
            { name: `Бесцветное ${POP}`, code: "clear", dir: "bescvetnoe" },
            { name: `Коньяк ${POP}`, code: "cognac", dir: "konyak" },
            { name: `Рустикальный дуб ${POP}`, code: "oak-rustic", dir: "rustikalnyj-dub" },
            { name: `Табак ${POP}`, code: "tobacco", dir: "tabak" },
            { name: `Тёмный дуб ${POP}`, code: "dark-oak", dir: "tyomnyj-dub" },
            { name: `Тёплый серый ${POP}`, code: "warm-gray", dir: "tyoplyj-seryj" },
            { name: `Холодный серый ${POP}`, code: "cool-gray", dir: "holodnyj-seryj" },
            { name: `Палисандр ${POP}`, code: "palisandr" },
          ],
        },
      ],
    },
  },
};

/* app */
export default function App() {
  const [category, setCategory] = useState("");
  const [veneer, setVeneer] = useState(null);
  const [finish, setFinish] = useState(null);
  const [variant, setVariant] = useState(null);

  const [manifest, setManifest] = useState({});
  useEffect(() => {
    fetch("/images/manifest.json").then(r => r.json()).then(setManifest).catch(() => {});
  }, []);

  const lb = useLightbox();

  const handleSend = () => {
    if (isInVkWebApp() && window.vkBridge) {
      window.vkBridge.send("VKWebAppOpenLink", { url: VK_CHAT_URL });
    } else {
      window.location.href = VK_CHAT_URL;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-4 pb-28">

        {!category && (
          <div className="space-y-3 mt-4">
            <div className="text-sm text-gray-600">Шаг 0 · Выберите раздел</div>
            {DATA.categories.map(c => (
              <button
                key={c.key}
                onClick={() => setCategory(c.key)}
                className="w-full p-4 rounded-xl border text-left"
              >
                <div className="font-medium">{c.name}</div>
                <div className="text-xs text-gray-500">{c.description}</div>
              </button>
            ))}
          </div>
        )}

        {category === "multishpon" && (
          <div className="mt-6 text-sm text-gray-500">
            Раздел в разработке.
          </div>
        )}

        {category === "veneers" && !veneer && (
          <div className="mt-4 space-y-3">
            <div className="text-sm text-gray-600">Шаг 1 · Выберите шпон</div>
            {Object.keys(DATA.veneers).map(v => (
              <button key={v} onClick={() => setVeneer(v)} className="w-full p-4 border rounded-xl text-left">
                {v}
              </button>
            ))}
          </div>
        )}

        {veneer && !finish && (
          <div className="mt-4 space-y-3">
            <div className="text-sm text-gray-600">Шаг 2 · Покрытие</div>
            {DATA.veneers[veneer].finishes.map(f => (
              <button key={f.type} onClick={() => setFinish(f)} className="w-full p-4 border rounded-xl text-left">
                {f.type}
              </button>
            ))}
          </div>
        )}

        {finish && !variant && (
          <div className="mt-4 space-y-3">
            <div className="text-sm text-gray-600">Шаг 3 · Вариант</div>
            {finish.items.map(i => (
              <button key={i.code} onClick={() => setVariant(i)} className="w-full p-4 border rounded-xl text-left">
                {i.name}
              </button>
            ))}
          </div>
        )}

        {variant && (
          <div className="mt-4">
            <div className="text-sm text-gray-600 mb-2">Шаг 4 · Примеры</div>
            <div className="grid grid-cols-2 gap-3">
              {(manifest?.oak?.oil?.[variantDir(variant)] || []).map((file, idx) => {
                const src = `/images/panels-veneer/oak/oil/${variantDir(variant)}/${file}`;
                return (
                  <img
                    key={idx}
                    src={src}
                    className="rounded-xl border cursor-pointer"
                    onClick={() => lb.open([{ src }], 0)}
                  />
                );
              })}
            </div>
            <Lightbox {...lb} />
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 border-t bg-white p-3">
        <div className="max-w-md mx-auto">
          <button onClick={handleSend} className="w-full py-3 border rounded-xl">
            Нужна помощь с выбором
          </button>
        </div>
      </div>
    </div>
  );
}
