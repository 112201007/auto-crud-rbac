import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import styles from "./ModelPage.module.css";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export default function ModelPage() {
  const router = useRouter();
  const { name } = router.query as { name?: string };
  const [model, setModel] = useState<any>(null);
  const [records, setRecords] = useState<any[]>([]);
  const [form, setForm] = useState<Record<string, any>>({});

  useEffect(() => {
    if (name) load();
  }, [name]);

  async function load() {
    const res = await fetch(`${API}/admin/models`);
    const models = await res.json();
    const m = models.find((x: any) => x.name === name);
    setModel(m);

    if (m) {
      const recRes = await fetch(`${API}/api/${m.name.toLowerCase()}`);
      const recs = await recRes.json();
      setRecords(recs);
    }
  }

  async function createRecord() {
    await fetch(`${API}/api/${model.name.toLowerCase()}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(form),
    });
    setForm({});
    load();
  }

  const copy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied!");
  };

  if (!model) return <div>Loading...</div>;

  const base = `/api/${model.name.toLowerCase()}`;
  const endpoints = [
    { method: "GET", url: `${base}`, desc: "List all records" },
    { method: "POST", url: `${base}`, desc: "Create new record" },
    { method: "PUT", url: `${base}/:id`, desc: "Update record" },
    { method: "DELETE", url: `${base}/:id`, desc: "Delete record" },
  ];

  return (
    <div className={styles.container}>
      <h1>{model.name}</h1>

      <div className={styles.card}>
        <h3>📡 API Endpoints</h3>
        {endpoints.map((ep) => (
          <div key={ep.url} className={styles.endpoint}>
            <code>
              <b>{ep.method}</b> {API}
              {ep.url}
            </code>
            <button className={styles.copyBtn} onClick={() => copy(`${API}${ep.url}`)}>
              Copy
            </button>
            <p>{ep.desc}</p>
          </div>
        ))}
      </div>

      <div className={styles.card}>
        <h3>Create Record</h3>
        {model.fields.map((f: any) => (
          <div key={f.name} className={styles.field}>
            <label>{f.name}</label>
            <input
              value={form[f.name] || ""}
              onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
            />
          </div>
        ))}
        <button className={styles.primaryBtn} onClick={createRecord}>
          Create
        </button>
      </div>

      <h3>Existing Records</h3>
      {records.length > 0 ? (
        <table className={styles.table}>
          <thead>
            <tr>
              <th>ID</th>
              {Object.keys(records[0].data || {}).map((k) => (
                <th key={k}>{k}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {records.map((r) => (
              <tr key={r.id}>
                <td>{r.id}</td>
                {Object.keys(r.data || {}).map((k) => (
                  <td key={k}>{r.data[k]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>No records found</p>
      )}
    </div>
  );
}
