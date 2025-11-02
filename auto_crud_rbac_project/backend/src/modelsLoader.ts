import fs from "fs";
import path from "path";

export type FieldDef = {
  name: string;
  type: "string" | "number" | "boolean" | "date" | "relation";
  required?: boolean;
  default?: any;
  unique?: boolean;
  relation?: { model: string; field: string };
};

export type ModelDef = {
  name: string;
  tableName: string;
  description: string;
  ownerField?: string;
  fields: Field[];
  rbac: Record<string, string[]>;
  published?: boolean;  // optional because new models won't have this until published
};


const MODELS_DIR = path.join(process.cwd(), "models");

if (!fs.existsSync(MODELS_DIR)) fs.mkdirSync(MODELS_DIR);

export function listModelFiles(): string[] {
  return fs.readdirSync(MODELS_DIR).filter((f) => f.endsWith(".json"));
}

export function loadModels(): ModelDef[] {
  return listModelFiles().map((fn) => {
    const content = fs.readFileSync(path.join(MODELS_DIR, fn), "utf8");
    return JSON.parse(content) as ModelDef;
  });
}

export function writeModelFile(model: ModelDef) {
  const filePath = path.join(MODELS_DIR, `${model.name}.json`);
  fs.writeFileSync(filePath, JSON.stringify(model, null, 2), "utf8");
  return filePath;
}
