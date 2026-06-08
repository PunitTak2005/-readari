# Readari

Readari is a minimalist archive for private book records.  
It helps you keep track of what you read, along with notes and metadata, powered by the Gemini API for smart text handling and suggestions.  



---

## Features

- Minimal UI to add and manage private book records.
- Frontend built with React + Vite for fast, modern UX.
- Backend API layer to talk securely to Gemini.
- `.env`-driven configuration so secrets never live in the codebase.
- Designed to be deployable on free tiers (Vercel / Netlify / Render).

---

## Tech Stack

- **Frontend:** React, Vite, TypeScript (inside `frontend/`) [page:55]  
- **Backend:** Node/Express (inside `backend/`)  
- **Version Control:** Git + GitHub  

---

## Project Structure

```bash
-readari/
├─ frontend/        # React + Vite app
│  ├─ src/          # UI components, hooks, pages
│  ├─ index.html
│  ├─ package.json
│  └─ .env.example  # Example env vars for frontend
├─ backend/         # Backend config and server files
│  ├─ src/
│  └─ package.json
└─ README.md
```

Key config file:

- `frontend/.env.example` – documents required environment variables such as `GEMINI_API_KEY` and `APP_URL` [page:55].

---

## Getting Started (Local)

### 1. Clone the repository

```bash
git clone https://github.com/PunitTak2005/-readari.git
cd -readari
```

### 2. Install dependencies

From the repo root:

```bash
# Frontend
cd frontend
npm install

# Backend (if used)
cd ../backend
npm install
```

### 4. Run the app locally

From the repo root:

```bash
# In one terminal – frontend
cd frontend
npm run dev   # or: npm run start:frontend (if defined)
```

If the backend has a dev script:

```bash
# In another terminal – backend
cd backend
npm run dev
```

Open the URL shown in the terminal (typically `http://localhost:5173`) in your browser.

---

## Deploying (Free Options)

You can deploy the **frontend** for free using:

- **Vercel** – import this repo, set `frontend/` as the root, build with `npm run build`, output `dist` [web:62][web:65].  
- **Netlify** – similar setup with `frontend` as the publish directory [web:62].  


For the backend, you can use:

- Vercel serverless functions, or  
- Free tiers on Render/Fly.io, depending on how complex your API is [web:62].

---

## Roadmap / Ideas

- Tagging books by genre, author, or mood.
- Export/import reading history as JSON or CSV.
- Smart recommendations using more advanced Gemini prompts.
- Authentication for multi-device usage.

---

## Contributing

This is a personal project, but suggestions and issues are welcome:

1. Fork the repo.
2. Create a feature branch.
3. Open a Pull Request with a clear description.

---

## License

This project is licensed under the MIT License.  
See the `LICENSE` file for details [page:23].
