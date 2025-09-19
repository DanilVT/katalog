import fs from "node:fs";
import { promises as fsp } from "node:fs";
import path from "node:path";

const root = process.cwd();
const imagesRoot = path.join(root, "public", "images", "panels-veneer");

// безопасное чтение каталога (не падаем, если нет)
function lsDir(p) {
  try {
    return fs.readdirSync(p, { withFileTypes: true });
  } catch {
    return [];
  }
}
const isImg = (name) => /\.(jpe?g|png|webp|avif)$/i.test(name);

const manifest = {};

// veneer level
for (const vDir of lsDir(imagesRoot).filter((d) => d.isDirectory())) {
  const veneer = vDir.name;
  manifest[veneer] = {};
  const veneerPath = path.join(imagesRoot, veneer);

  // finish level
  for (const fDir of lsDir(veneerPath).filter((d) => d.isDirectory())) {
    const finish = fDir.name;
    manifest[veneer][finish] = {};
    const finishPath = path.join(veneerPath, finish);

    // variant level
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

// гарантируем, что папка существует
await fsp.mkdir(path.join(root, "public", "images"), { recursive: true });

// сохраняем
const outFile = path.join(root, "public", "images", "manifest.json");
await fsp.writeFile(outFile, JSON.stringify(manifest, null, 2), "utf8");

console.log("✅ images manifest generated at", outFile);
