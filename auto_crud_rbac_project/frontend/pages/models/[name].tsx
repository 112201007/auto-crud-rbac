// import React, { useEffect, useState } from "react";
// import { useRouter } from "next/router";

// const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

// export default function ModelPage() {
//   const router = useRouter();
//   const { name } = router.query as { name?: string };
//   const [model, setModel] = useState<any>(null);
//   const [records, setRecords] = useState<any[]>([]);
//   const [form, setForm] = useState<Record<string, any>>({});

//   useEffect(() => {
//     if (name) load();
//   }, [name]);

//   async function load() {
//     const modelsRes = await fetch(`${API}/admin/models`);
//     const models = await modelsRes.json();
//     const m = models.find((x: any) => x.name === name);
//     setModel(m);

//     if (m) {
//       const recRes = await fetch(
//         `${API}/api/${(m?.tableName || m?.name).toLowerCase()}`
//       );
//       const recs = await recRes.json();
//       setRecords(recs);
//     }
//   }

//   async function createRecord() {
//     await fetch(`${API}/api/${(model.tableName || model.name).toLowerCase()}`, {
//       method: "POST",
//       headers: { "content-type": "application/json" },
//       body: JSON.stringify(form),
//     });
//     setForm({});
//     load();
//   }

//   if (!model) return <div>Loading...</div>;

//   const base = `/api/${(model.tableName || model.name).toLowerCase()}`;

//   // 🧩 CRUD endpoints with examples
//   const endpoints = [
//     {
//       method: "POST",
//       url: `${base}`,
//       desc: "Create new record",
//       headers: { "Content-Type": "application/json" },
//       body: model.fields.reduce(
//         (acc: any, f: any) => ({ ...acc, [f.name]: `Sample ${f.name}` }),
//         {}
//       ),
//       response: {
//         id: "auto-generated-id",
//         modelName: model.name,
//         data: model.fields.reduce(
//           (acc: any, f: any) => ({ ...acc, [f.name]: `Sample ${f.name}` }),
//           {}
//         ),
//       },
//     },
//     {
//       method: "GET",
//       url: `${base}`,
//       desc: "List all records",
//       headers: {},
//       body: null,
//       response: [{ id: "uuid", data: { name: "Sample Record" } }],
//     },
//     {
//       method: "GET",
//       url: `${base}/:id`,
//       desc: "Get record by ID",
//       headers: {},
//       body: null,
//       response: {
//         id: "uuid",
//         data: { name: "Sample Record" },
//       },
//     },
//     {
//       method: "PUT",
//       url: `${base}/:id`,
//       desc: "Update record by ID",
//       headers: { "Content-Type": "application/json" },
//       body: model.fields.reduce(
//         (acc: any, f: any) => ({ ...acc, [f.name]: `Updated ${f.name}` }),
//         {}
//       ),
//       response: {
//         id: "uuid",
//         data: model.fields.reduce(
//           (acc: any, f: any) => ({ ...acc, [f.name]: `Updated ${f.name}` }),
//           {}
//         ),
//       },
//     },
//     {
//       method: "DELETE",
//       url: `${base}/:id`,
//       desc: "Delete record by ID",
//       headers: {},
//       body: null,
//       response: { success: true },
//     },
//   ];

//   const copy = (text: string) => {
//     navigator.clipboard.writeText(text);
//     alert("Copied to clipboard!");
//   };

//   return (
//     <div style={{ padding: 20 }}>
//       <h1>{model.name} — Records</h1>

//       {/* 📡 CRUD ENDPOINTS SECTION */}
//       <div
//         style={{
//           background: "#f6f6f6",
//           padding: "10px 15px",
//           borderRadius: 8,
//           marginBottom: 20,
//         }}
//       >
//         <h3>📡 Generated API Endpoints (with Test Examples)</h3>
//         {endpoints.map((ep) => (
//           <div
//             key={ep.url}
//             style={{
//               border: "1px solid #ccc",
//               borderRadius: 6,
//               padding: "10px 12px",
//               marginBottom: 10,
//               background: "white",
//             }}
//           >
//             <p>
//               <code>
//                 <b>{ep.method}</b> {API}
//                 {ep.url}
//               </code>
//               <button
//                 onClick={() => copy(`${API}${ep.url}`)}
//                 style={{
//                   marginLeft: 8,
//                   fontSize: "0.8em",
//                   padding: "2px 6px",
//                   cursor: "pointer",
//                 }}
//               >
//                 Copy URL
//               </button>
//             </p>
//             <p>{ep.desc}</p>

//             {Object.keys(ep.headers).length > 0 && (
//               <details>
//                 <summary><b>Headers</b></summary>
//                 <pre>{JSON.stringify(ep.headers, null, 2)}</pre>
//               </details>
//             )}

//             {ep.body && (
//               <details>
//                 <summary><b>Body (raw JSON)</b></summary>
//                 <pre>{JSON.stringify(ep.body, null, 2)}</pre>
//               </details>
//             )}

//             <details>
//               <summary><b>✅ Expected Response</b></summary>
//               <pre>{JSON.stringify(ep.response, null, 2)}</pre>
//             </details>
//           </div>
//         ))}
//       </div>

//       {/* 🧾 CREATE NEW RECORD */}
//       <div style={{ marginBottom: 20 }}>
//         <h3>Create Record</h3>
//         {model.fields.map((f: any) => (
//           <div key={f.name} style={{ marginBottom: 8 }}>
//             <label style={{ display: "block" }}>{f.name}</label>
//             <input
//               value={form[f.name] || ""}
//               onChange={(e) => setForm({ ...form, [f.name]: e.target.value })}
//               style={{ padding: 4, width: 200 }}
//             />
//           </div>
//         ))}
//         <button onClick={createRecord}>Create</button>
//       </div>

//       {/* 📄 EXISTING RECORDS */}
//       <h3>Existing Records</h3>
//       {Array.isArray(records) && records.length > 0 ? (
//         <table border={1} cellPadding={6}>
//           <thead>
//             <tr>
//               <th>ID</th>
//               {Object.keys(records[0].data || {}).map((k) => (
//                 <th key={k}>{k}</th>
//               ))}
//             </tr>
//           </thead>
//           <tbody>
//             {records.map((r: any) => (
//               <tr key={r.id}>
//                 <td>{r.id}</td>
//                 {Object.keys(r.data || {}).map((k) => (
//                   <td key={k}>{r.data[k]}</td>
//                 ))}
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       ) : (
//         <p>No records found</p>
//       )}
//     </div>
//   );
// }

































































































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
      <h1>{model.name} — Records</h1>

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
