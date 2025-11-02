import React, { useEffect, useState } from "react";
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

  // ✅ RBAC permissions state
  const [permissions, setPermissions] = useState<Record<string, string[]>>({
    Admin: ["create", "read", "update", "delete"],
    Manager: ["create", "read", "update"],
    Viewer: ["read"],
  });

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

  // ✅ Toggle permission per role/action
  const togglePermission = (role: string, action: string) => {
    setPermissions((prev) => {
      const rolePerms = new Set(prev[role] || []);
      if (rolePerms.has(action)) {
        rolePerms.delete(action);
      } else {
        rolePerms.add(action);
      }
      return { ...prev, [role]: Array.from(rolePerms) };
    });
  };

  async function createModel() {
    const model: ModelDef = {
      name,
      fields,
      rbac: permissions,
    };

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
    } catch (err) {
      console.error("Create model failed:", err);
      alert("❌ Network or server error");
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

      <div
        style={{
          marginBottom: 20,
          border: "1px solid #ddd",
          padding: 15,
          borderRadius: 8,
        }}
      >
        <h3>Create New Model</h3>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Model name (e.g. Product)"
        />

        <h4>Fields</h4>
        {fields.map((f, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 10,
              marginBottom: 6,
              alignItems: "center",
            }}
          >
            <input
              placeholder="Field name"
              value={f.name}
              onChange={(e) => updateField(i, "name", e.target.value)}
            />
            <select
              value={f.type}
              onChange={(e) => updateField(i, "type", e.target.value)}
            >
              <option value="string">string</option>
              <option value="number">number</option>
              <option value="boolean">boolean</option>
            </select>
            <label>
              <input
                type="checkbox"
                checked={f.required || false}
                onChange={(e) => updateField(i, "required", e.target.checked)}
              />
              required
            </label>
            <label>
              <input
                type="checkbox"
                checked={f.unique || false}
                onChange={(e) => updateField(i, "unique", e.target.checked)}
              />
              unique
            </label>
            <button onClick={() => removeField(i)}>🗑</button>
          </div>
        ))}
        <button onClick={addField}>+ Add Field</button>

        <h4 style={{ marginTop: 20 }}>Role Permissions</h4>
        <table border={1} cellPadding={5} style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Role</th>
              {ACTIONS.map((action) => (
                <th key={action}>{action}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROLES.map((role) => (
              <tr key={role}>
                <td>{role}</td>
                {ACTIONS.map((action) => (
                  <td key={action} style={{ textAlign: "center" }}>
                    <input
                      type="checkbox"
                      checked={permissions[role]?.includes(action) || false}
                      onChange={() => togglePermission(role, action)}
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>

        <br />
        <button style={{ marginTop: 10 }} onClick={createModel}>
          Create Model
        </button>
      </div>

      <h2>Existing models</h2>
      <ul>
        {models.map((m) => (
          <li key={m.name}>
            {m.name} —{" "}
            <button onClick={() => publishModel(m)}>Publish</button> —{" "}
            <a href={`/models/${m.name}`}>Open</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
