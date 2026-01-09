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
    },
    {
      key: "multishpon",
      name: "Мультишпон",
      status: "wip",
      description: "Каталог панелей из мультишпона. В разработке."
    },
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
                { id: "oak-paint-black-2", caption: "Дуб · Чёрная краска · Пример 2" },
              ],
            },
          ],
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
            { name: `Тёплый серый ${POP}`, code: "warm-gray", dir: "tyoplyj-seryj" },
            { name: `Холодный серый ${POP}`, code: "cool-gray", dir: "holodnyj-seryj" },
            { name: `Палисандр ${POP}`, code: "palisandr" },
          ],
        },
      ],
    },
  },
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

function Tile({ title, subtitle, onClick, badge }) {
  return (
    <button onClick={onClick} className="w-full p-4 rounded-2xl border shadow-sm text-left relative">
      {badge && <span className="absolute right-3 top-3 text-xs px-2 py-1 rounded-full border">{badge}</span>}
      <div className="text-base font-medium">{title}</div>
      <div className="text-xs mt-1 text-gray-500">{subtitle}</div>
    </button>
  );
}

/* ======================= APP ======================= */
export default function App() {
  const [category, setCategoryState] = useState("");
  const { current, setCategory } = useHashRoute(DATA.categories.map(c => c.key));

  useEffect(() => { if (current) setCategoryState(current); }, [current]);

  const handleSend = () => {
    window.location.href = VK_CHAT_URL;
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-4 pb-28">
        {!category && (
          <div className="space-y-3 mt-4">
            <div className="text-sm text-gray-600">Шаг 0 · Выберите раздел</div>
            {DATA.categories.map(c => (
              <Tile
                key={c.key}
                title={c.name}
                subtitle={c.description}
                badge={c.status === "wip" ? "В разработке" : undefined}
                onClick={() => setCategory(c.key)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white p-3">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleSend}
            className="w-full py-3 rounded-xl font-medium border"
          >
            Нужна помощь с выбором
          </button>
        </div>
      </div>
    </div>
  );
}
