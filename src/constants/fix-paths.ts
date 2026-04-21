import * as fs from "fs";
import * as path from "path";

const docsDir = path.resolve(process.cwd(), "docs");
const basePath = "/app";

function walk(dir: string): void {
  if (!fs.existsSync(dir)) {
    console.warn(`Directory not found: ${dir}`);
    return;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      walk(fullPath);
    } else if (/\.(html|json|js|css)$/.test(entry.name)) {
      const content = fs.readFileSync(fullPath, "utf8");
      let newContent = content;

      if (entry.name.endsWith(".html")) {
        newContent = newContent.replace(/(src|href)="\/((?!app\/|https?|ftp)[^"]+)"/g, `$1="${basePath}/$2"`);
      }

      if (/\.(js|json)$/.test(entry.name)) {
        newContent = newContent.replace(
          /(["'])\/(?!(?:app|https?|ftp)\/)([^"']+\.(?:png|jpg|jpeg|svg|gif|webp|json|js))(["'])/g,
          `$1${basePath}/$2$3`,
        );
      }

      if (entry.name.endsWith(".css")) {
        newContent = newContent.replace(/url\(\s*["']?\/([^"'>)]+)["']?\s*\)/g, (match, p1) => {
          if (p1.startsWith("app/") || p1.startsWith("/app/")) return match;
          const cleanPath = p1.startsWith("/") ? p1.slice(1) : p1;
          return `url("${basePath}/${cleanPath}")`;
        });
      }

      if (newContent !== content) {
        fs.writeFileSync(fullPath, newContent, "utf8");
        console.log(`Enforced ${basePath} in: ${path.relative(docsDir, fullPath)}`);
      }
    }
  }
}

console.log(`Target directory: ${docsDir}`);
walk(docsDir);
console.log("Finished updating paths.");
