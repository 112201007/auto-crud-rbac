# Auto-Generated CRUD + RBAC Platform

## Objective

This project is a mini internal developer platform that allows users to define data models from a web UI. Once a model is defined and published, the system automatically generates:

1. **CRUD APIs** (Create, Read, Update, Delete)
2. **Admin Interface** for managing models
3. **Role-Based Access Control (RBAC)**

Additionally, every published model is saved as a file in the project (`/models/<modelName>.json`) for **persistence, versioning, and dynamic route registration**.

---

## Problem Statement

Build a low-code CRUD platform:

* Admin users define models (e.g., Product, Employee, Student) via a web UI.
* Upon publishing a model:

  * The model definition is written to `/models/<modelName>.json`.
  * CRUD REST APIs for the model are registered dynamically.
  * Admin UI updates to allow data management.
  * RBAC rules are enforced for all operations.

---

## Key Features

### 1️⃣ Model Definition via UI

* Form-based model editor allows defining:

  * **Model Name**
  * **Table name** (optional; default = lowercase plural)
  * **Fields**: `{ name, type, required, default, unique, relation (optional) }`
  * **Owner Field** (optional, for ownership rules)
  * **RBAC permissions** per role (`create`, `read`, `update`, `delete`)
* **Example Model JSON:**

```json
{
  "name": "Employee",
  "fields": [
    { "name": "name", "type": "string", "required": true },
    { "name": "age", "type": "number" },
    { "name": "isActive", "type": "boolean", "default": true }
  ],
  "ownerField": "ownerId",
  "rbac": {
    "Admin": ["all"],
    "Manager": ["create", "read", "update"],
    "Viewer": ["read"]
  }
}
```

---

### 2️⃣ File-Based Model Persistence

* Publishing a model writes the model JSON to `/models/<ModelName>.json`.
* The file acts as the **source of truth** for:

  * CRUD route registration
  * Admin UI generation
  * RBAC enforcement
* Optional: scaffold ORM entities or migrations.

---

### 3️⃣ Dynamic CRUD API Generation

Automatically generated endpoints per model:

| HTTP Method | Endpoint               | Description         |
| ----------- | ---------------------- | ------------------- |
| POST        | `/api/<modelName>`     | Create a new record |
| GET         | `/api/<modelName>`     | List all records    |
| PUT         | `/api/<modelName>/:id` | Update a record     |
| DELETE      | `/api/<modelName>/:id` | Delete a record     |

* Enforces RBAC rules defined in the model.
* Owner field enforcement: only owners or Admin can update/delete records.

---

### 4️⃣ Admin Interface

* Lists all models
* Displays records for a selected model

---

### 5️⃣ RBAC

* Predefined roles: **Admin**, **Manager**, **Viewer** (extendable)
* Permissions configured per model

---

## Tech Stack

* **Backend:** Node.js + TypeScript + Express
* **Frontend:** Next.js
* **Database:** PostgreSQL
* **ORM:** Prisma

---

## Installation & Running the App

### Backend

1. Clone the repo and navigate to backend:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Configure environment variables (`.env`):

```
DATABASE_URL=postgresql://username:password@localhost:5432/autocrud
JWT_SECRET=your_jwt_secret
PORT=4000
```

4. Run the backend:

```bash
npm run dev
```

### Frontend

1. Navigate to frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Run frontend:

```bash
npm run dev
```

4. Open your browser at `http://localhost:3000` (or the port configured)

---

## How to Create & Publish a Model

1. Login to the **Admin UI**.
2. Define a new model with fields, owner field, and RBAC permissions.
3. Click **Publish**:

   * SQL table is created automatically in PostgreSQL.
   * CRUD endpoints are registered dynamically.

---

## How Dynamic CRUD Endpoints Are Registered

* `createTableForModel(model)` ensures the table exists.
* CRUD routes (`POST/GET/PUT/DELETE`) are registered per model with RBAC middleware.
* Owner field enforcement is applied where specified.
* Published model files are reloaded on server restart to restore dynamic endpoints.

---

## Sample Model Files

* `/models/Employee.json`
* `/models/Product.json`

Each file contains the fields, owner field, and RBAC rules defined by the admin.
