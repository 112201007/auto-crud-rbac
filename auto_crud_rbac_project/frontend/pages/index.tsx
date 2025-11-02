import React, { useEffect, useState } from "react";
import styles from "./AdminIndex.module.css";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Field = {
  name: string;
  type: string;
  required?: boolean;
  default?: any;
  unique?: boolean;
};

type ModelDef = {
  name: string;
  tableName,
  description,
  ownerField?: string;
  fields: Field[];
  rbac: Record<string, string[]>;
};

const ROLES = ["Admin", "Manager", "Viewer"];
const ACTIONS = ["create", "read", "update", "delete"];

export default function AdminIndex() {
  const [message, setMessage] = useState("");
  const [models, setModels] = useState<ModelDef[]>([]);
  const [name, setName] = useState("");
  const [fields, setFields] = useState<Field[]>([
    { name: "name", type: "string", required: true },
  ]);
  const [permissions, setPermissions] = useState<Record<string, string[]>>({
    Admin: ["create", "read", "update", "delete"],
    Manager: ["create", "read", "update"],
    Viewer: ["read"],
  });

  const [tableName, setTableName] = useState("");
  const [description, setDescription] = useState("");
  const [ownerField, setOwnerField] = useState("ownerId");

  // When model name changes, update tableName if empty
  useEffect(() => {
    if (name && !tableName) {
      setTableName(name.toLowerCase() + "s");
    }
  }, [name]);
useEffect(() => {
  if (!ownerField && name) {
    setOwnerField("ownerId");
  }
}, [name]);


  useEffect(() => {
    fetchModels();
  }, []);

  async function fetchModels() {
    const res = await fetch(`${API}/admin/models`);
    const data = await res.json();
    setModels(data);
  }

  const addField = () => {
    setFields([...fields, { name: "", type: "string", required: false }]);
  };

  const updateField = (index: number, key: keyof Field, value: any) => {
    const updated = [...fields];
    updated[index][key] = value;
    setFields(updated);
  };

  const removeField = (index: number) => {
    setFields(fields.filter((_, i) => i !== index));
  };

  const togglePermission = (role: string, action: string) => {
    setPermissions((prev) => {
      const rolePerms = new Set(prev[role] || []);
      rolePerms.has(action) ? rolePerms.delete(action) : rolePerms.add(action);
      return { ...prev, [role]: Array.from(rolePerms) };
    });
  };

  async function createModel() {
    // const model: ModelDef = { name, fields, rbac: permissions };
      const model: ModelDef = { name, tableName, description, ownerField, fields, rbac: permissions };

    try {
      const res = await fetch(`${API}/admin/models`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(model),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Model creation failed");
        return;
      }
      setMessage(`✅ Model "${data.model.name}" created successfully!`);
      setName("");
      setFields([{ name: "name", type: "string", required: true }]);
      setPermissions({
        Admin: ["create", "read", "update", "delete"],
        Manager: ["create", "read", "update"],
        Viewer: ["read"],
      });
      fetchModels();
    } catch {
      alert("❌ Network or server error");
    }
  }

  async function publishModel(m: ModelDef) {
    await fetch(`${API}/admin/models/${m.name}/publish`, { method: "POST" });
    fetchModels();
  }

  return (
    <div className={styles.container}>
      {message && <p className={styles.message}>{message}</p>}
      <h1 className={styles.heading}>Admin — Models</h1>

      <div className={styles.card}>
        <h3>Create New Model</h3>
          <div className={styles.card}>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "20px",
                alignItems: "flex-start",
                marginBottom: "24px",
              }}
            >
              <input
                className={styles.input}
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Model name (e.g. Product)"
                style={{
                  flex: "1",
                  minWidth: "250px",
                  padding: "10px 12px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                }}
              />

              <input
                className={styles.input}
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                placeholder="Table name (e.g. products)"
                style={{
                  flex: "1",
                  minWidth: "250px",
                  padding: "10px 12px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                }}
              />

              <textarea
                className={styles.textarea}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Model description (optional)"
                style={{
                  flexBasis: "100%",
                  minHeight: "80px",
                  padding: "10px 12px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  marginTop: "10px",
                }}
              />

              <input
  className={styles.input}
  value={ownerField}
  onChange={(e) => setOwnerField(e.target.value)}
  placeholder="Owner field name (optional)"
  style={{
    flex: "1",
    minWidth: "250px",
    padding: "10px 12px",
    border: "1px solid #ccc",
    borderRadius: "6px",
  }}
/>
            </div>
          </div>

        <h4>Fields</h4>
        {fields.map((f, i) => (
          <div key={i} className={styles.fieldRow}>
            <input
              className={styles.input}
              placeholder="Field name"
              value={f.name}
              onChange={(e) => updateField(i, "name", e.target.value)}
            />
            <select
              className={styles.select}
              value={f.type}
              onChange={(e) => updateField(i, "type", e.target.value)}
            >
              <optgroup label="Text">
                <option value="text">text</option>
                <option value="varchar">varchar</option>
              </optgroup>

              <optgroup label="Numbers">
                <option value="integer">integer</option>
                <option value="bigint">bigint</option>
                <option value="decimal">decimal</option>
                <option value="numeric">numeric</option>
                <option value="real">real</option>
                <option value="double precision">double precision</option>
              </optgroup>

              <optgroup label="Boolean">
                <option value="boolean">boolean</option>
              </optgroup>

              <optgroup label="Date & Time">
                <option value="date">date</option>
                <option value="timestamp">timestamp</option>
                <option value="timestamptz">timestamptz</option>
              </optgroup>

              <optgroup label="Identifiers / Relations">
                <option value="serial">serial</option>
                <option value="bigserial">bigserial</option>
                <option value="uuid">uuid</option>
              </optgroup>

              <optgroup label="Structured">
                <option value="json">json</option>
                <option value="jsonb">jsonb</option>
              </optgroup>

              <optgroup label="Array">
                <option value="text[]">text[]</option>
                <option value="integer[]">integer[]</option>
              </optgroup>

              <optgroup label="Other">
                <option value="bytea">bytea (binary)</option>
                <option value="enum">enum</option>
              </optgroup>
            </select>


            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={f.required || false}
                onChange={(e) => updateField(i, "required", e.target.checked)}
              />
              required
            </label>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={f.unique || false}
                onChange={(e) => updateField(i, "unique", e.target.checked)}
              />
              unique
            </label>
            <button className={styles.deleteBtn} onClick={() => removeField(i)}>
              🗑
            </button>
          </div>
        ))}
        <button className={styles.addBtn} onClick={addField}>
          + Add Field
        </button>

        <h4 className={styles.subHeading}>Role Permissions</h4>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Role</th>
              {ACTIONS.map((a) => (
                <th key={a}>{a}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROLES.map((r) => (
              <tr key={r}>
                <td>{r}</td>
                {ACTIONS.map((a) => (
                  <td key={a}>
                    <input
                      type="checkbox"
                      checked={permissions[r]?.includes(a) || false}
                      onChange={() => togglePermission(r, a)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <button className={styles.primaryBtn} onClick={createModel}>
          Create Model
        </button>
      </div>

      <h2>Existing Models</h2>
      <ul className={styles.modelList}>
        {models.map((m) => (
        <li key={m.name} className={styles.modelItem}>
          <span className={styles.modelName}>{m.name}</span>
          <div className={styles.modelActions}>
            <button
              className={`${styles.publishBtn} ${
                m.published ? styles.published : ""
              }`}
              onClick={() => publishModel(m)}
            >
              {m.published ? "Published" : "Publish"}
            </button>
            <a className={styles.linkBtn} href={`/models/${m.name}`}>
              Open
            </a>
          </div>
        </li>

        ))}
      </ul>
    </div>
  );
}
