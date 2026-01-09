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

/* ======================= ЛАЙТБОКС ======================= */
function useLightbox() {
  const [state, setState] = useState({ open: false, items: [], index: 0 });
  return {
    state,
    open: (items, index = 0) => setState({ open: true, items, index }),
    close: () => setState((s) => ({ ...s, open: false })),
    prev: () =>
      setState((s) => ({
        ...s,
        index: (s.index - 1 + s.items.length) % s.items.length,
      })),
    next: () =>
      setState((s) => ({
        ...s,
        index: (s.index + 1) % s.items.length,
      })),
  };
}

function Lightbox({ state, close, prev, next }) {
  if (!state.open) return null;
  const item = state.items[state.index];
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" onClick={close}>
      <img src={item.src} alt="" className="max-h-[90vh] max-w-[90vw]" />
      <button className="absolute left-4 text-white text-3xl" onClick={(e)=>{e.stopPropagation();prev();}}>‹</button>
      <button className="absolute right-4 text-white text-3xl" onClick={(e)=>{e.stopPropagation();next();}}>›</button>
      <button className="absolute top-4 right-4 text-white text-xl" onClick={(e)=>{e.stopPropagation();close();}}>✕</button>
    </div>
  );
}

/* ======================= ДАННЫЕ ======================= */
const DATA = {
  categories: [
    { key: "veneers", name: "Шпонированные панели" },
    { key: "multishpon", name: "Мультишпон" },
  ],
  veneers: {
    "Дуб": {
      finishes: [
        {
          type: "Масло",
          items: [
            { name: `Табак ${POP}`, code: "tobacco", dir: "tabak" },
            { name: `Тёмный дуб ${POP}`, code: "dark-oak", dir: "tyomnyj-dub" },
          ],
        },
      ],
    },
    "Американский орех": {
      finishes: [{ type: "Масло", items: [{ name: `Бесцветное ${POP}`, code: "clear", dir: "bescvetnoe" }] }],
    },
  },
};

/* ======================= ROUTE ======================= */
function useHashRoute(keys) {
  const [route, setRoute] = useState(() => window.location.hash.replace("#", ""));
  useEffect(() => {
    const fn = () => setRoute(window.location.hash.replace("#", ""));
    window.addEventListener("hashchange", fn);
    return () => window.removeEventListener("hashchange", fn);
  }, []);
  return {
    current: keys.includes(route) ? route : "",
    set: (k) => (window.location.hash = k),
  };
}

/* ======================= UI ======================= */
function Tile({ title, onClick }) {
  return (
    <button onClick={onClick} className="w-full p-4 border rounded-xl text-left">
      <div className="font-medium">{title}</div>
    </button>
  );
}

/* ======================= APP ======================= */
export default function App() {
  const { current, set } = useHashRoute(DATA.categories.map((c) => c.key));
  const [category, setCategory] = useState("");
  const [veneer, setVeneer] = useState(null);
  const [finish, setFinish] = useState(null);
  const [variant, setVariant] = useState(null);
  const [manifest, setManifest] = useState({});
  const lb = useLightbox();

  useEffect(() => {
    fetch("/images/manifest.json").then(r=>r.json()).then(setManifest);
  }, []);

  useEffect(() => { if (current) setCategory(current); }, [current]);

  const reset = () => {
    setCategory("");
    setVeneer(null);
    setFinish(null);
    setVariant(null);
    window.location.hash = "";
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-md mx-auto px-4 pb-28">

        <div className="py-3 border-b">
          <div className="text-lg font-semibold">Каталог</div>
          <div className="text-sm text-gray-600 mt-1">
            <button onClick={reset}>Каталог</button>
            {category && <> › {DATA.categories.find(c=>c.key===category)?.name}</>}
          </div>
        </div>

        {!category && (
          <div className="mt-4 space-y-3">
            {DATA.categories.map(c=>(
              <Tile key={c.key} title={c.name} onClick={()=>{set(c.key);setCategory(c.key);}}/>
            ))}
          </div>
        )}

        {/* ===== МУЛЬТИШПОН ===== */}
        {category==="multishpon" && (
          <div className="grid grid-cols-2 gap-3 mt-4">
            {(manifest.multishpon||[]).map((f,i)=>(
              <img key={i} src={`/images/multishpon/${f}`} className="rounded-xl border cursor-zoom-in"
                   onClick={()=>lb.open(
                     manifest.multishpon.map(x=>({src:`/images/multishpon/${x}`})),
                     i
                   )}/>
            ))}
          </div>
        )}

        {/* ===== ШПОН ===== */}
        {category==="veneers" && !veneer && (
          <div className="mt-4 space-y-3">
            {Object.keys(DATA.veneers).map(v=>(
              <Tile key={v} title={v} onClick={()=>setVeneer(v)}/>
            ))}
          </div>
        )}

        {category==="veneers" && veneer && !finish && (
          <div className="mt-4 space-y-3">
            {DATA.veneers[veneer].finishes.map(f=>(
              <Tile key={f.type} title={f.type} onClick={()=>setFinish(f.type)}/>
            ))}
          </div>
        )}

        {category==="veneers" && veneer && finish && !variant && (
          <div className="mt-4 space-y-3">
            {DATA.veneers[veneer].finishes.find(f=>f.type===finish).items.map(i=>(
              <Tile key={i.code} title={i.name} onClick={()=>setVariant(i)}/>
            ))}
          </div>
        )}

        {category==="veneers" && veneer && finish && variant && (
          <div className="grid grid-cols-2 gap-3 mt-4">
            {(manifest?.[VENEER_SLUG[veneer]]?.[FINISH_SLUG[finish]]?.[variantDir(variant)]||[])
              .map((f,i)=>{
                const src=`/images/panels-veneer/${VENEER_SLUG[veneer]}/${FINISH_SLUG[finish]}/${variantDir(variant)}/${f}`;
                return <img key={i} src={src} className="rounded-xl border cursor-zoom-in"
                            onClick={()=>lb.open(
                              (manifest[VENEER_SLUG[veneer]][FINISH_SLUG[finish]][variantDir(variant)]
                                .map(x=>({src:`/images/panels-veneer/${VENEER_SLUG[veneer]}/${FINISH_SLUG[finish]}/${variantDir(variant)}/${x}`}))),
                              i
                            )}/>
              })}
          </div>
        )}

      </div>

      <div className="fixed bottom-0 left-0 right-0 p-3 border-t bg-white">
        <button className="w-full py-3 border rounded-xl">Нужна помощь с выбором</button>
      </div>

      <Lightbox {...lb} />
    </div>
  );
}
