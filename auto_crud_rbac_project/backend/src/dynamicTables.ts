import { Pool } from "pg";
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export async function createTableForModel(model: any) {
  const tableName = (model.tableName || model.name).toLowerCase();

  const columns = (model.fields || [])
    .map((f: any) => {
      let type;
      switch (f.type) {
        case "string": type = "TEXT"; break;
        case "number": type = "INTEGER"; break;
        case "boolean": type = "BOOLEAN"; break;
        default: type = "TEXT";
      }

      const constraints = [
        f.required ? "NOT NULL" : "",
        f.unique ? "UNIQUE" : "",
        f.default != null
          ? `DEFAULT ${
              typeof f.default === "string" ? `'${f.default}'` : f.default
            }`
          : "",
      ].join(" ");

      return `"${f.name}" ${type} ${constraints}`;
    })
    .join(", ");

  const ownerColumnSql = model.ownerField
    ? `, "${model.ownerField}" TEXT`
    : "";

  const sql = `CREATE TABLE IF NOT EXISTS "${tableName}" (
    id SERIAL PRIMARY KEY,
    ${columns}
    ${ownerColumnSql}
  );`;

  await pool.query(sql);
  console.log(`✅ Created/verified table: ${tableName}`);
}
