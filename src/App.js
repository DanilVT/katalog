import React, { useEffect, useMemo, useState } from "react";

// Мини-прототип каталога с верхним уровнем
// 1) Топ-уровень: Шпонированные панели / Панели с плёнкой / Обои со шпоном
// 2) Ветку «Шпонированные панели» докручиваем по ТЗ
// 3) Возможность шарить прямую ссылку на каждый из трёх верхних пунктов через hash (#veneers, #film, #wallpaper)

// Популярные пометим ⭐
const POP = "⭐";

// ← ДОБАВЛЕНО: ссылка на чат сообщества
const VK_CHAT_URL = 'https://vk.com/im?sel=-232563555&entrypoint=community_page';

// ← ДОБАВЛЕНО: безопасное открытие ссылки даже внутри iframe
function safeOpen(url) {
  try {
    const a = document.createElement("a");
    a.href = url;
    a.target = "_top"; // выйти из iframe, если мы внутри
    a.rel = "noopener noreferrer";
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  } catch (_) {
    try { window.top.location.href = url; } catch { window.location.href = url; }
  }
}

/* ======================= СЛАГИ / ПОМОЩНИКИ ======================= */
// Сопоставление русских названий → папки (как в public/images/panels-veneer/…)
const VENEER_SLUG = { "Дуб": "oak", "Американский орех": "american-walnut" };
const FINISH_SLUG = { "Масло": "oil", "Краска": "paint" };

// Берём имя папки варианта: либо item.dir (если задан), либо item.code
function variantDir(item) {
  return (item?.dir || item?.code || "").toString().toLowerCase();
}

/* ======================= ЛАЙТБОКС (увеличение) ======================= */
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
      <button
        className="absolute left-3 top-1/2 -translate-y-1/2 text-white text-3xl"
        onClick={(e) => { e.stopPropagation(); prev(); }}
      >‹</button>

      <img
        src={item.src}
        alt={item.caption}
        className="max-h-[90vh] max-w-[90vw] object-contain"
        onClick={(e) => e.stopPropagation()}
      />

      <div className="absolute bottom-5 left-0 right-0 text-center text-white text-sm">
        {state.index + 1} / {state.items.length} — {item.caption}
      </div>

      <button
        className="absolute right-3 top-1/2 -translate-y-1/2 text-white text-3xl"
        onClick={(e) => { e.stopPropagation(); next(); }}
      >›</button>
      <button
        className="absolute top-3 right-3 text-white text-2xl"
        onClick={(e) => { e.stopPropagation(); close(); }}
      >✕</button>
    </div>
  );
}

/* ======================= ТВОИ ДАННЫЕ (c dir там, где надо) ======================= */
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
              dir: "black", // папка public/images/panels-veneer/oak/paint/black/
              // samples оставим как фолбэк, но в рендере будем брать из manifest.json
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
            { name: `512 ${POP}`,           code: "512" },
            { name: `Антик`,                 code: "antik" },
            { name: `Бесцветное ${POP}`,     code: "clear",          dir: "bescvetnoe" },
            { name: `Вишня`,                 code: "cherry",         dir: "vishnya" },
            { name: `Коньяк ${POP}`,         code: "cognac",         dir: "konyak" },
            { name: `Красный орех`,         code: "red-walnut",     dir: "krasnyj-orekh" },
            { name: `Махагон`,               code: "mahogany",       dir: "mahagon" },
            { name: `Натуральный бук`,       code: "beech-natural",  dir: "naturalnyj-buk" },
            { name: `Рустикальный дуб ${POP}`, code: "oak-rustic",   dir: "rustikalnyj-dub" },
            { name: `Табак ${POP}`,          code: "tobacco",        dir: "tabak" },
            { name: `Тёмная вишня`,          code: "dark-cherry",    dir: "tyomnaya-vishnya" },
            { name: `Тёмный дуб ${POP}`,     code: "dark-oak",       dir: "tyomnyj-dub" },
            { name: `Тёплый серый ${POP}`,   code: "warm-gray",      dir: "tyoplyj-seryj" },
            { name: `Холодный серый ${POP}`, code: "cool-gray",      dir: "holodnyj-seryj" },
            { name: "Палисандр", code: "palisandr" },
          ],
        },
      ],
    },
    "Американский орех": {
      finishes: [
        {
          type: "Масло",
          items: [
            { name: `Бесцветное ${POP}`, code: "clear", dir: "bescvetnoe" },
          ],
        },
      ],
    },
  },
};

/* ===== (оставил как было) временный фолбэк-семплер, если манифеста нет ===== */
function sampleGrid(veneer, variant, n = 3) {
  return Array.from({ length: n }).map((_, i) => ({
    id: `${veneer}-${variant}-${i + 1}`.replace(/\s+/g, "-"),
    caption: `${veneer} · ${variant} · Пример ${i + 1}`,
  }));
}

/* ======================= Роутинг по hash ======================= */
function useHashRoute(categoryKeys) {
  const [route, setRoute] = useState(() => (typeof window !== "undefined" ? window.location.hash.replace("#", "") : ""));
  useEffect(() => {
    const onHash = () => setRoute(window.location.hash.replace("#", ""));
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);
  const setCategory = (key) => { if (key) window.location.hash = key; };
  const current = categoryKeys.includes(route) ? route : "";
  return { current, setCategory };
}

/* ======================= UI-штучки ======================= */
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

/* ======================= ГЛАВНЫЙ КОМПОНЕНТ ======================= */
export default function App() {
  const [category, setCategoryState] = useState(""); // top-level: veneers/film/wallpaper
  const { current, setCategory } = useHashRoute(DATA.categories.map((c) => c.key));

  // Инициализация VK Bridge при запуске мини-приложения
  useEffect(() => {
    if (window.vkBridge && window.vkBridge.send) {
      window.vkBridge.send('VKWebAppInit');
    }
  }, []);

  // для кликов и инициализации
  useEffect(() => {
    if (current) setCategoryState(current);
  }, [current]);

  const [selectedVeneer, setSelectedVeneer] = useState(null);
  const [selectedFinishType, setSelectedFinishType] = useState(null); // Краска/Масло
  const [selectedVariant, setSelectedVariant] = useState(null); // конкретное масло или краска

  // 🔽 МАНИФЕСТ: грузим один раз
  const [manifest, setManifest] = useState(null);
  useEffect(() => {
    fetch("/images/manifest.json", { cache: "no-cache" })
      .then(r => r.json())
      .then(setManifest)
      .catch(() => setManifest({}));
  }, []);

  const lb = useLightbox(); // лайтбокс

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

  // ← ДОБАВЛЕНО: открытие чата VK по кнопке (bridge + фолбэк)
  const openVkChat = async () => {
    try {
      if (window?.vkBridge?.send) {
        await window.vkBridge.send('VKWebAppOpenLink', {
          url: VK_CHAT_URL,
          open_in_external_browser: false
        });
        return;
      }
    } catch (_) {
      // упадём в фолбэк
    }
    safeOpen(VK_CHAT_URL);
  };

  // ← ИЗМЕНЕНО: вместо alert открываем чат
  const handleSend = () => {
    openVkChat();
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

            {(() => {
              // Если манифест есть — берём из него. Иначе фолбэк на samples из DATA.
              const veneerSlug  = VENEER_SLUG[selectedVeneer];
              const finishSlug  = FINISH_SLUG[selectedFinishType];
              const variantSlug = variantDir(selectedVariant);

              const files = manifest?.[veneerSlug]?.[finishSlug]?.[variantSlug] || [];
              if (files.length === 0 && selectedVariant.samples) {
                // фолбэк на старые "заглушки"
                return (
                  <div className="grid grid-cols-2 gap-3">
                    {selectedVariant.samples.map((s) => (
                      <div key={s.id} className="flex flex-col gap-1">
                        <PlaceholderThumb label={s.caption} />
                        <div className="text-[11px] text-gray-500">{s.caption}</div>
                      </div>
                    ))}
                  </div>
                );
              }

              const images = files.map(file => {
                const sku = file.replace(/\.(jpg|jpeg|png|webp|avif)$/i, "");
                return {
                  id: sku,
                  caption: sku,
                  src: `/images/panels-veneer/${veneerSlug}/${finishSlug}/${variantSlug}/${file}`,
                };
              });

              return images.length ? (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    {images.map((img, idx) => (
                      <div
                        key={img.id}
                        className="flex flex-col gap-1 cursor-zoom-in"
                        onClick={() => lb.open(images, idx)}
                      >
                        <img
                          src={img.src}
                          alt={img.caption}
                          loading="lazy"
                          className="aspect-[4/3] w-full rounded-xl object-cover border"
                        />
                        <div className="text-[11px] text-gray-500">{img.caption}</div>
                      </div>
                    ))}
                  </div>
                  <Lightbox state={lb.state} close={lb.close} prev={lb.prev} next={lb.next} />
                </>
              ) : (
                <div className="text-sm text-gray-500">Пока нет фотографий.</div>
              );
            })()}
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
