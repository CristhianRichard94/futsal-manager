# Canchitapp

Plataforma de reserva de canchas de futbol sala: los jugadores reservan canchas, los dueños de canchas gestionan las reservas y (opcionalmente) cobran una seña vía Mercado Pago.

## Stack

- **Backend**: FastAPI + SQLAlchemy 2.0 + Postgres (`backend/`)
- **Frontend**: Next.js (`frontend/`)
- **Auth**: Inicio de sesión con Google vía NextAuth, JWT bearer al backend
- **Pagos**: Mercado Pago Checkout Pro (opcional, activable por cancha)

## Configuración local

Requiere Docker, Python 3.11+, Node 18+.

```
docker-compose up -d db
```

**Backend**
```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
Copiar `backend/.env.example` a `backend/.env` y completar `NEXTAUTH_SECRET` (debe coincidir con el del frontend), `MERCADOPAGO_ACCESS_TOKEN` si se van a probar pagos.

**Frontend**
```
cd frontend
npm install
npm run dev
```
Copiar `.env.example` a `.env.local`, completar `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` y `NEXTAUTH_SECRET`.

O levantar los tres servicios juntos desde la raíz del repo con `dev.ps1` (ignorado por git, solo local).

Backend → http://localhost:8000, frontend → http://localhost:3000.

## Notas

- No hay Alembic — el esquema se gestiona con `Base.metadata.create_all`. Cambios de esquema sobre una DB local existente requieren `DROP`/recrear manualmente.
- Los webhooks de Mercado Pago necesitan una URL pública alcanzable por MP — usar `ngrok` para pruebas locales.
- Configuración de agentes y flujo de trabajo: `AGENTS.md`, `CLAUDE.md`.
- Notas de producto/negocio: `docs/`.

---

# Canchitapp (English)

Futsal court booking platform: players book courts, venue owners manage bookings and (optionally) collect deposits via Mercado Pago.

## Stack

- **Backend**: FastAPI + SQLAlchemy 2.0 + Postgres (`backend/`)
- **Frontend**: Next.js (`frontend/`)
- **Auth**: Google sign-in via NextAuth, JWT bearer to backend
- **Payments**: Mercado Pago Checkout Pro (optional, per-venue toggle)

## Local setup

Requires Docker, Python 3.11+, Node 18+.

```
docker-compose up -d db
```

**Backend**
```
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```
Copy `backend/.env.example` to `backend/.env` and fill in `NEXTAUTH_SECRET` (must match frontend), `MERCADOPAGO_ACCESS_TOKEN` if testing payments.

**Frontend**
```
cd frontend
npm install
npm run dev
```
Copy `.env.example` to `.env.local`, fill in `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` and `NEXTAUTH_SECRET`.

Or run all three at once from repo root with `dev.ps1` (gitignored, local only).

Backend → http://localhost:8000, frontend → http://localhost:3000.

## Notes

- No Alembic — schema managed via `Base.metadata.create_all`. Schema changes to an existing local DB need manual `DROP`/recreate.
- Mercado Pago webhooks need a public URL reachable from MP — use `ngrok` for local testing.
- Agent configs and workflow: `AGENTS.md`, `CLAUDE.md`.
- Product/business notes: `docs/`.
