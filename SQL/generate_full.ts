import fs from "fs";
import path from "path";

const SQL_DIR = "./SQL";
const DATA_DIR = "./public/data";
const OUTPUT_FILE = path.join(SQL_DIR, "Full.sql");

function generateFullSql() {
  console.log("Generating Full.sql...");

  let adminEmail = "admin@example.com";
  const envPath = path.join(process.cwd(), ".env");
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, "utf8");
    const match = envContent.match(/NEXT_PUBLIC_ADMIN_EMAIL\s*=\s*(.*)/);
    if (match && match[1]) {
      adminEmail = match[1].trim().replace(/['"]/g, "");
    }
  }
  console.log(`Using Admin Email: ${adminEmail}`);

  const baseFiles = [
    "00_storage.sql",
    "01_schema.sql",
    "02_functions.sql",
    "03_security.sql",
    "04_seed_data.sql",
    "05_realtime.sql",
    "06_generate_votejson.sql",
  ];

  let content = "-- Supabase Setup SQL\n";
  content += `-- Generated at: ${new Date().toLocaleString()}\n\n\n`;

  for (const file of baseFiles) {
    const filePath = path.join(SQL_DIR, file);
    if (fs.existsSync(filePath)) {
      content += `-- From ${file}\n`;
      let fileContent = fs.readFileSync(filePath, "utf8");
      fileContent = fileContent.replace(/{{ADMIN_EMAIL}}/g, adminEmail);
      content += fileContent + "\n\n";
    }
  }

  content += "-- JSON Data (Auto-generated from booth.json and exhibitions.json)\n";

  const boothJsonPath = path.join(DATA_DIR, "booth.json");
  if (fs.existsSync(boothJsonPath)) {
    const boothsRaw = JSON.parse(fs.readFileSync(boothJsonPath, "utf8"));
    const allBooths = Object.values(boothsRaw).flat() as any[];

    content += "-- Stalls Status (Master Names)\n";
    const stallValues = allBooths.map((b) => `(${b.id}, '${b.name.replace(/'/g, "''")}')`).join(", ");
    content += `INSERT INTO stalls_status (id, stall_name) VALUES ${stallValues}\n`;
    content += `ON CONFLICT (id) DO UPDATE SET stall_name = EXCLUDED.stall_name;\n\n`;

    content += `-- Reset stalls_status sequence (suppressing output)\n`;
    content += `DO $$\nBEGIN\n  PERFORM setval(pg_get_serial_sequence('stalls_status', 'id'), COALESCE(MAX(id), 1)) FROM stalls_status;\nEND $$;\n\n`;

    content += "-- Vote Targets (Booths)\n";
    const voteBoothValues = allBooths
      .map((b, i) => {
        const id = String(b.id).padStart(2, "0");
        return `('${id}', '${b.name.replace(/'/g, "''")}', 's', ${i + 1})`;
      })
      .join(", ");
    content += `INSERT INTO vote_targets (id, name, category, display_order) VALUES ${voteBoothValues}\n`;
    content += `ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category = EXCLUDED.category, display_order = EXCLUDED.display_order;\n\n`;
  }

  const exhibitionJsonPath = path.join(DATA_DIR, "exhibitions.json");
  if (fs.existsSync(exhibitionJsonPath)) {
    const exhibitions = JSON.parse(fs.readFileSync(exhibitionJsonPath, "utf8")) as any[];

    content += "-- Vote Targets (Exhibitions)\n";
    const voteExhibitionValues = exhibitions
      .map((e, i) => {
        const id = String(e.id + 30);
        return `('${id}', '${e.name.replace(/'/g, "''")}', 'e', ${i + 1})`;
      })
      .join(", ");
    content += `INSERT INTO vote_targets (id, name, category, display_order) VALUES ${voteExhibitionValues}\n`;
    content += `ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, category = EXCLUDED.category, display_order = EXCLUDED.display_order;\n\n`;
  }

  fs.writeFileSync(OUTPUT_FILE, content);
  console.log(`Successfully generated: ${OUTPUT_FILE}`);
}

generateFullSql();
