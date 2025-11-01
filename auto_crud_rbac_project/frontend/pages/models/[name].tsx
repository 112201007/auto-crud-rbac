import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function ModelPage() {
  const router = useRouter();
  const { name } = router.query as { name?: string };
  const [model, setModel] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [form, setForm] = useState<Record<string, any>>({});

  useEffect(() => { if (name) load(); }, [name]);

  async function load() {
    const modelsRes = await fetch(`${API}/admin/models`);
    const models = await modelsRes.json();
    const m = models.find((x:any)=>x.name===name);
    setModel(m);
    if (m) {
      const recRes = await fetch(`${API}/api/${(m?.tableName||m?.name).toLowerCase()}`);
      const recs = await recRes.json();
      setRecords(recs);
    }
  }

  async function createRecord() {
    await fetch(`${API}/api/${(model.tableName||model.name).toLowerCase()}`, { method: 'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(form) });
    setForm({});
    load();
  }

  if (!model) return <div>Loading...</div>;

  return (
    <div style={{ padding: 20 }}>
      <h1>{model.name} — Records</h1>
      <div>
        <h3>Create</h3>
        {model.fields.map((f:any) => (
          <div key={f.name}>
            <label>{f.name}</label>
            <input value={form[f.name] || ''} onChange={e=>setForm({...form, [f.name]: e.target.value})} />
          </div>
        ))}
        <button onClick={createRecord}>Create</button>
      </div>

      <h3>Existing</h3>
      <ul>
        {Array.isArray(records) && records.length > 0 ? (
          records.map((r: any) => <li key={r.id}>{JSON.stringify(r.data)}</li>)
        ) : (
          <li>No records found</li>
        )}

      </ul>
    </div>
  );
}
