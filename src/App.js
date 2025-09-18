import React, { useEffect, useMemo, useState } from "react";

// Мини-прототип каталога с верхним уровнем
// 1) Топ-уровень: Шпонированные панели / Панели с плёнкой / Обои со шпоном
// 2) Ветку «Шпонированные панели» докручиваем по ТЗ
// 3) Возможность шарить прямую ссылку на каждый из трёх верхних пунктов через hash (#veneers, #film, #wallpaper)

// Популярные пометим ⭐

const POP = "⭐";

const DATA = {
  categories: [
    {
      key: "veneers",
      name: "Шпонированные панели",
      status: "ready",
      description: "Выбор шпона → покрытие (краска/масло) → примеры",
    },
    {
      key: "film",
      name: "Панели с плёнкой под дерево",
      status: "wip",
      description: "В разработке. Скоро добавим подбор по плёнке.",
    },
    {
      key: "wallpaper",
      name: "Обои со шпоном",
      status: "wip",
      description: "В разработке. Фото и спецификации готовим.",
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
            { name: `512 ${POP}`, code: "512", pop: true, samples: sampleGrid("Дуб", "512", 4) },
            { name: `Антик`, code: "antik", samples: sampleGrid("Дуб", "Антик", 3) },
            { name: `Бесцветное ${POP}`, code: "clear", pop: true, samples: sampleGrid("Дуб", "Бесцветное", 3) },
            { name: `Вишня`, code: "cherry", samples: sampleGrid("Дуб", "Вишня", 3) },
            { name: `Коньяк ${POP}`, code: "cognac", pop: true, samples: sampleGrid("Дуб", "Коньяк", 3) },
            { name: `Красный орех`, code: "red-walnut", samples: sampleGrid("Дуб", "Красный орех", 3) },
            { name: `Махагон`, code: "mahogany", samples: sampleGrid("Дуб", "Махагон", 3) },
            { name: `Натуральный бук`, code: "beech-natural", samples: sampleGrid("Дуб", "Натуральный бук", 3) },
            { name: `Рустикальный дуб ${POP}`, code: "oak-rustic", pop: true, samples: sampleGrid("Дуб", "Рустикальный дуб", 3) },
            { name: `Табак ${POP}`, code: "tobacco", pop: true, samples: sampleGrid("Дуб", "Табак", 3) },
            { name: `Тёмная вишня`, code: "dark-cherry", samples: sampleGrid("Дуб", "Тёмная вишня", 3) },
            { name: `Тёмный дуб ${POP}`, code: "dark-oak", pop: true, samples: sampleGrid("Дуб", "Тёмный дуб", 3) },
            { name: `Тёплый серый ${POP}`, code: "warm-gray", pop: true, samples: sampleGrid("Дуб", "Тёплый серый", 3) },
            { name: `Холодный серый ${POP}`, code: "cool-gray", pop: true, samples: sampleGrid("Дуб", "Холодный серый", 3) },
          ],
        },
      ],
    },
    "Американский орех": {
      finishes: [
        {
          type: "Масло",
          items: [
            { name: `Бесцветное ${POP}`, code: "clear", pop: true, samples: sampleGrid("Американский орех", "Бесцветное", 3) },
          ],
        },
      ],
    },
  },
};

function sampleGrid(veneer, variant, n = 3) {
  return Array.from({ length: n }).map((_, i) => ({
    id: `${veneer}-${variant}-${i + 1}`.replace(/\s+/g, "-"),
    caption: `${veneer} · ${variant} · Пример ${i + 1}`,
  }));
}

function useHashRoute(categoryKeys) {
  const [route, setRoute] = useState(() => (typeof window !== "undefined" ? window.location.hash.replace("#", "") : ""));
  useEffect(() => {
    const onHash = () => setRoute(window.location.hash.replace("#", ""));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const setCategory = (key) => {
    if (!key) return;
    window.location.hash = key;
  };
  const current = categoryKeys.includes(route) ? route : "";
  return { current, setCategory };
}

function Breadcrumbs({ onReset, path }) {
  return (
    <div className="w-full text-sm text-gray-600 flex flex-wrap items-center gap-2">
      <button className="underline underline-offset-2" onClick={onReset}>Каталог</button>
      {path.map((p, idx) => (
        <React.Fragment key={idx}>
          <span>›</span>
          <button className="underline underline-offset-2" onClick={p.onClick}>{p.label}</button>
        </React.Fragment>
      ))}
    </div>
  );
}

function Tile({ title, subtitle, onClick, badge }) {
  return (
    <button onClick={onClick} className="w-full p-4 rounded-2xl border shadow-sm hover:shadow-md transition text-left relative">
      {badge && (
        <span className="absolute right-3 top-3 text-xs px-2 py-1 rounded-full border bg-white/80">{badge}</span>
      )}
      <div className="text-base font-medium">{title}</div>
      {subtitle && <div className="text-xs mt-1 text-gray-500">{subtitle}</div>}
    </button>
  );
}

function PlaceholderThumb({ label }) {
  return (
    <div className="aspect-[4/3] w-full rounded-xl border flex items-center justify-center text-xs text-gray-500">
      {label}
    </div>
  );
}

export default function App() {
  const [category, setCategoryState] = useState(""); // top-level: veneers/film/wallpaper
  const { current, setCategory } = useHashRoute(DATA.categories.map((c) => c.key));

  // для кликов и инициализации
  useEffect(() => {
    if (current) setCategoryState(current);
  }, [current]);

  const [selectedVeneer, setSelectedVeneer] = useState(null);
  const [selectedFinishType, setSelectedFinishType] = useState(null); // Краска/Масло
  const [selectedVariant, setSelectedVariant] = useState(null); // конкретное масло или краска

  const resetAll = () => {
    setSelectedVariant(null);
    setSelectedFinishType(null);
    setSelectedVeneer(null);
    setCategoryState("");
    window.location.hash = "";
  };

  const shareLink = useMemo(() => {
    if (!category) return "";
    const url = new URL(window.location.href);
    url.hash = category;
    return url.toString();
  }, [category]);

  const copyShare = async () => {
    if (!shareLink) return;
    try {
      await navigator.clipboard.writeText(shareLink);
      alert("Ссылка скопирована: " + shareLink);
    } catch (e) {
      alert("Не удалось скопировать ссылку");
    }
  };

  const openCategory = (key) => {
    setCategory(key);
    setCategoryState(key);
  };

  const handleSend = () => {
    const text = (() => {
      if (category === "veneers" && selectedVeneer && selectedFinishType && selectedVariant) {
        return `Хочу панели: категория «Шпонированные панели», шпон «${selectedVeneer}», покрытие «${selectedFinishType}», вариант «${selectedVariant.name}». Пришлите стоимость и сроки.`;
      }
      if (category && !selectedVeneer) return `Интересует: ${DATA.categories.find(c=>c.key===category)?.name}`;
      return "Нужна консультация по выбору панелей.";
    })();
    alert(text);
  };

  const path = [];
  if (category) path.push({ label: DATA.categories.find(c=>c.key===category)?.name, onClick: () => openCategory(category) });
  if (selectedVeneer) path.push({ label: selectedVeneer, onClick: () => { setSelectedFinishType(null); setSelectedVariant(null); } });
  if (selectedFinishType) path.push({ label: selectedFinishType, onClick: () => { setSelectedVariant(null); } });

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-4 pb-28">
        {/* Header */}
        <div className="sticky top-0 bg-white/90 backdrop-blur z-10 py-3 border-b">
          <div className="flex items-center justify-between gap-3">
            <div className="text-lg font-semibold">Каталог</div>
            {category && (
              <div className="flex items-center gap-2">
                <button className="text-xs underline underline-offset-2" onClick={copyShare}>Скопировать ссылку</button>
                <button className="text-xs underline underline-offset-2" onClick={() => openCategory(category)}>Обновить</button>
                <button className="text-xs underline underline-offset-2" onClick={resetAll}>Сбросить</button>
              </div>
            )}
          </div>
          <div className="mt-2">
            <Breadcrumbs onReset={resetAll} path={path} />
          </div>
        </div>

        {/* Step 0: top-level categories */}
        {!category && (
          <div className="space-y-3 mt-4">
            <div className="text-sm text-gray-600">Шаг 0 · Выберите раздел</div>
            {DATA.categories.map((c) => (
              <Tile
                key={c.key}
                title={c.name}
                subtitle={c.description}
                onClick={() => openCategory(c.key)}
                badge={c.status === "wip" ? "В разработке" : undefined}
              />
            ))}
          </div>
        )}

        {/* Category content */}
        {category === "film" && (
          <div className="mt-6 text-sm text-gray-600">
            Раздел «Панели с плёнкой под дерево» — в разработке. Оставьте заявку, подберём по каталогу плёнок.
          </div>
        )}
        {category === "wallpaper" && (
          <div className="mt-6 text-sm text-gray-600">
            Раздел «Обои со шпоном» — в разработке. Готовим образцы и фото примеров.
          </div>
        )}

        {/* Veneers flow */}
        {category === "veneers" && !selectedVeneer && (
          <div className="space-y-3 mt-4">
            <div className="text-sm text-gray-600">Шаг 1 · Выберите шпон</div>
            {Object.keys(DATA.veneers).map((veneer) => (
              <Tile key={veneer} title={veneer} subtitle="Перейти к покрытию" onClick={() => setSelectedVeneer(veneer)} />
            ))}
          </div>
        )}

        {category === "veneers" && selectedVeneer && !selectedFinishType && (
          <div className="space-y-3 mt-4">
            <div className="text-sm text-gray-600">Шаг 2 · Покрытие для «{selectedVeneer}»</div>
            {DATA.veneers[selectedVeneer].finishes.map((f) => (
              <Tile key={f.type} title={f.type} subtitle={`${f.items.length} вариант(а)`} onClick={() => setSelectedFinishType(f.type)} />
            ))}
          </div>
        )}

        {category === "veneers" && selectedVeneer && selectedFinishType && !selectedVariant && (
          <div className="space-y-3 mt-4">
            <div className="text-sm text-gray-600">Шаг 3 · Варианты «{selectedFinishType}»</div>
            {DATA.veneers[selectedVeneer].finishes
              .find((f) => f.type === selectedFinishType)
              ?.items.map((item) => (
                <Tile key={item.code} title={item.name} subtitle="Примеры работ внутри" onClick={() => setSelectedVariant(item)} />
              ))}
          </div>
        )}

        {category === "veneers" && selectedVeneer && selectedFinishType && selectedVariant && (
          <div className="mt-4 space-y-3">
            <div className="text-sm text-gray-600">
              Шаг 4 · Примеры: «{selectedVeneer}» × «{selectedVariant.name}»
            </div>
            <div className="grid grid-cols-2 gap-3">
              {selectedVariant.samples.map((s) => (
                <div key={s.id} className="flex flex-col gap-1">
                  <PlaceholderThumb label={s.caption} />
                  <div className="text-[11px] text-gray-500">{s.caption}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky CTA */}
      <div className="fixed bottom-0 left-0 right-0 border-t bg-white/95 backdrop-blur p-3">
        <div className="max-w-md mx-auto flex gap-3">
          <button onClick={handleSend} className="flex-1 py-3 rounded-xl font-medium shadow-sm border hover:shadow-md transition">
            {category === "veneers" && selectedVeneer && selectedFinishType && selectedVariant
              ? "Оставить заявку"
              : "Нужна помощь с выбором"}
          </button>
        </div>
      </div>
    </div>
  );
}
