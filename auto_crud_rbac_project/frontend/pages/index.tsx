import React, { useEffect, useState } from "react";
const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
type Field = { name: string; type: string; required?: boolean };
type ModelDef = { name: string; fields: Field[]; ownerField?: string | null; rbac: Record<string, string[]> };

export default function AdminIndex() {
  const [message, setMessage] = useState("");
  const [models, setModels] = useState<ModelDef[]>([]);
  const [name, setName] = useState("");
  const [fields, setFields] = useState<Field[]>([{ name: "name", type: "string", required: true }]);

  useEffect(() => { fetchModels(); }, []);

  async function fetchModels() {
    const res = await fetch(`${API}/admin/models`);
    const data = await res.json();
    setModels(data);
  }

  // async function createModel() {
  //   const model: ModelDef = { name, fields, rbac: { Admin: ["all"], Manager: ["create","read","update"], Viewer: ["read"] } };
  //   await fetch(`${API}/admin/models`, { method: "POST", headers: { 'content-type': 'application/json' }, body: JSON.stringify(model) });
  //   setName(""); setFields([{ name: "name", type: "string", required: true }]);
  //   fetchModels();
  // }

  async function createModel() {
  const model: ModelDef = {
    name,
    fields,
    rbac: { Admin: ["all"], Manager: ["create", "read", "update"], Viewer: ["read"] },
  };

  try {
    const res = await fetch(`${API}/admin/models`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(model),
    });

    const data = await res.json();

    if (!res.ok) {
      // 🔸 Show clear message if backend sends one (e.g. duplicate)
       setMessage(`⚠️ ${data.error || "Something went wrong"}`);
      alert(data.error || `Failed to create model (status ${res.status})`);
      return;
    }
setMessage(`✅ Model "${data.model.name}" created successfully!`);

    alert(`✅ Model "${data.model.name}" created successfully!`);
    setName("");
    setFields([{ name: "name", type: "string", required: true }]);
    fetchModels();
  } catch (err) {
    console.error("Create model failed:", err);
    alert("❌ Network or server error while creating model");
  }
}

  async function publishModel(m: ModelDef) {
    await fetch(`${API}/admin/models/${m.name}/publish`, { method: "POST" });
    fetchModels();
  }

  return (
    
    <div style={{ padding: 20 }}>
      {message && <p>{message}</p>}

      <h1>Admin — Models</h1>
      <div style={{ marginBottom: 20 }}>
        <input value={name} onChange={e => setName(e.target.value)} placeholder="Model name (e.g. Product)" />
        <button onClick={createModel}>Create Model</button>
      </div>

      <h2>Existing models</h2>
      <ul>
        {models.map(m => (
          <li key={m.name}>
            {m.name} — <button onClick={() => publishModel(m)}>Publish</button> — <a href={`/models/${m.name}`}>Open</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
