"use client";
import React, { useState } from "react";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Checkbox } from "../components/ui/checkbox";
import { Button } from "../components/ui/button";
import styles from "./CreateModel.module.css";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

type Field = {
  name: string;
  type: string;
  required: boolean;
};

type Role = "Admin" | "Manager" | "Viewer";

export default function CreateModel() {
  const [modelName, setModelName] = useState("");
  const [fields, setFields] = useState<Field[]>([{ name: "name", type: "string", required: true }]);
  const [permissions, setPermissions] = useState<Record<Role, string[]>>({
    Admin: ["create", "read", "update", "delete"],
    Manager: ["create", "read", "update"],
    Viewer: ["read"],
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("");

  const handleAddField = () => setFields([...fields, { name: "", type: "string", required: false }]);
  const handleRemoveField = (index: number) => setFields(fields.filter((_, i) => i !== index));
  const handleFieldChange = (i: number, key: keyof Field, v: string | boolean) => {
    const updated = [...fields];
    updated[i][key] = v as any;
    setFields(updated);
  };

  const togglePermission = (role: Role, perm: string) => {
    const updated = { ...permissions };
    updated[role] = updated[role].includes(perm)
      ? updated[role].filter((p) => p !== perm)
      : [...updated[role], perm];
    setPermissions(updated);
  };

  const handleSubmit = async () => {
    if (!modelName.trim()) return setStatus("⚠️ Please enter a model name");
    setLoading(true);
    setStatus("Creating model...");

    try {
      const res = await fetch(`${API}/admin/models`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: modelName, fields, rbac: permissions }),
      });
      const data = await res.json();
      setStatus(res.ok ? `✅ Model "${modelName}" created!` : `❌ Error: ${data.error}`);
    } catch {
      setStatus("❌ Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.createModelContainer}>
      <div className={styles.card}>
        <div className={styles.header}>
          <h2>Create New Model</h2>
          <p>Define your data structure and CRUD permissions</p>
        </div>

        <div className={styles.section}>
          <h3>Basic Information</h3>
          <Label>Model Name *</Label>
          <Input placeholder="e.g., Product" value={modelName} onChange={(e) => setModelName(e.target.value)} />
        </div>

        <div className={styles.section}>
          <h3>Fields</h3>
          {fields.map((f, i) => (
            <div key={i} className={styles.fieldRow}>
              <Input
                placeholder="Field name"
                value={f.name}
                onChange={(e) => handleFieldChange(i, "name", e.target.value)}
              />
              <Select value={f.type} onValueChange={(v) => handleFieldChange(i, "type", v)}>
                <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="string">String</SelectItem>
                  <SelectItem value="number">Number</SelectItem>
                  <SelectItem value="boolean">Boolean</SelectItem>
                  <SelectItem value="date">Date</SelectItem>
                </SelectContent>
              </Select>
              <div className={styles.fieldActions}>
                <Checkbox
                  checked={f.required}
                  onCheckedChange={(v) => handleFieldChange(i, "required", !!v)}
                />
                <Label>Required</Label>
                <Button onClick={() => handleRemoveField(i)}>Remove</Button>
              </div>
            </div>
          ))}
          <Button onClick={handleAddField} className={styles.addFieldBtn}>+ Add Field</Button>
        </div>

        <div className={styles.section}>
          <h3>Role Permissions</h3>
          <div className={styles.permissionsTable}>
            <div className={styles.permissionsHeader}>
              <div></div>
              {["create", "read", "update", "delete"].map((p) => <div key={p}>{p}</div>)}
            </div>
            {(["Admin", "Manager", "Viewer"] as Role[]).map((role) => (
              <div className={styles.permissionsRow} key={role}>
                <div className={styles.roleName}>{role}</div>
                {["create", "read", "update", "delete"].map((perm) => (
                  <div key={perm}>
                    <Checkbox
                      checked={permissions[role].includes(perm)}
                      onCheckedChange={() => togglePermission(role, perm)}
                    />
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.submitRow}>
          <Button onClick={handleSubmit} disabled={loading}>
            {loading ? "Creating..." : "Publish Model"}
          </Button>
        </div>

        {status && <p className={styles.statusText}>{status}</p>}
      </div>
    </div>
  );
}
