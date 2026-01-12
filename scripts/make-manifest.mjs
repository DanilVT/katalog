import fs from "node:fs";
import { promises as fsp } from "node:fs";
import path from "node:path";

const root = process.cwd();
const imagesRoot = path.join(root, "public", "images");

// безопасное чтение каталога
function lsDir(p) {
  try {
    return fs.readdirSync(p, { withFileTypes: true });
  } catch {
    return [];
  }
}

const isImg = (name) => /\.(jpe?g|png|webp|avif)$/i.test(name);

const manifest = {};

/* =========================================================
   PANELS-VENEER (иерархия: veneer → finish → variant)
========================================================= */

const panelsRoot = path.join(imagesRoot, "panels-veneer");

for (const vDir of lsDir(panelsRoot).filter((d) => d.isDirectory())) {
  const veneer = vDir.name;
  manifest[veneer] = {};

  const veneerPath = path.join(panelsRoot, veneer);

  for (const fDir of lsDir(veneerPath).filter((d) => d.isDirectory())) {
    const finish = fDir.name;
    manifest[veneer][finish] = {};

    const finishPath = path.join(veneerPath, finish);

    for (const varDir of lsDir(finishPath).filter((d) => d.isDirectory())) {
      const variant = varDir.name;
      const variantPath = path.join(finishPath, variant);

      const files = lsDir(variantPath)
        .filter((d) => d.isFile())
        .map((d) => d.name)
        .filter(isImg)
        .sort();

      manifest[veneer][finish][variant] = files;
    }
  }
}

/* =========================================================
   MULTIVENEER (плоская папка)
========================================================= */

const multiveneerDir = path.join(imagesRoot, "multiveneer");

if (fs.existsSync(multiveneerDir)) {
  manifest.multiveneer = lsDir(multiveneerDir)
    .filter((d) => d.isFile())
    .map((d) => d.name)
    .filter(isImg)
    .sort();
}

/* =========================================================
   WRITE MANIFEST
========================================================= */

await fsp.mkdir(imagesRoot, { recursive: true });

const outFile = path.join(imagesRoot, "manifest.json");
await fsp.writeFile(outFile, JSON.stringify(manifest, null, 2), "utf8");

console.log("✅ images manifest generated at", outFile);
