# Task Manager – AI-Powered, Real-Time

A **full-stack** task management system built with **Golang (Fiber)**, **Next.js (TypeScript)**, and **Tailwind CSS**, featuring **real-time** updates via **WebSockets**, **JWT authentication**, and **AI-powered** suggestions (Gemini/OpenAI).

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Environment Variables](#environment-variables)
- [Running with Docker](#running-with-docker)
- [Deployment](#deployment)
- [Usage](#usage)
- [AI Integration](#ai-integration)
- [Real-Time Updates](#real-time-updates)
- [License](#license)

---

## Features
1. **User Authentication** – Sign up and log in via **JWT** tokens.  
2. **Task Management** – Create, update, and delete tasks, each with a title, description, status, and optional due date.  
3. **AI Suggestions** – A chat interface calls a Gemini/OpenAI endpoint to provide suggestions for tasks.  
4. **Real-Time Updates** – WebSocket broadcasting triggers instant UI refresh on new or updated tasks.  
5. **Calendar View** – See tasks on specific dates, with pending tasks highlighted.  
6. **Dockerized** – Multi-stage Dockerfile for minimal final image.

---

## Tech Stack
- **Backend**: Golang (Fiber), GORM, PostgreSQL  
- **Frontend**: Next.js (TypeScript), Tailwind CSS, react-calendar, react-use-websocket  
- **AI**: Gemini/OpenAI (HTTP calls from the backend)  
- **Authentication**: JWT-based  
- **Deployment**: Vercel (frontend), Render/Fly.io/Heroku (backend)  
- **Docker**: Multi-stage build for the backend

---

## Architecture
```
├── backend/
│   ├── main.go          # Fiber app initialization, routes, AI endpoint
│   ├── tasks.go         # Task CRUD logic, GORM calls, WebSocket broadcast
│   ├── database.go      # GORM DB connection
│   ├── middleware.go    # JWT authentication middleware
│   ├── Dockerfile       # Multi-stage Dockerfile for the backend
│   └── ...
└── frontend/
    ├── pages/
    │   ├── login.tsx
    │   ├── signup.tsx
    │   └── dashboard.tsx
    ├── components/
    │   ├── ChatInterface.tsx
    │   ├── TaskList.tsx
    │   └── ...
    ├── styles/
    │   └── globals.css
    ├── package.json
    ├── tailwind.config.js
    └── ...
```

---

## Prerequisites
1. **Go** (≥1.19)  
2. **Node.js** (≥16), **npm** or **yarn**  
3. **PostgreSQL** (if running locally)  
4. (Optional) **Docker** if you plan to run via containers.

---

## Local Setup

### Backend Setup
1. **Clone** the repo:
   ```bash
   git clone https://github.com/YourUsername/Task_Manager_Zocket.git
   cd Task_Manager_Zocket/backend
   ```
2. **Create `.env`**:
   ```env
   DB_DSN="host=localhost user=postgres dbname=taskmanager password=... sslmode=disable"
   JWT_SECRET="your_jwt_secret"
   GEMINI_API_KEY="your_gemini_api_key"
   ```
3. **Install dependencies & run**:
   ```bash
   go mod tidy
   go run main.go
   ```
4. **Check**: API listens on `http://localhost:3000`.

### Frontend Setup
1. In another terminal, go to `frontend` folder:
   ```bash
   cd ../frontend
   ```
2. **Install** dependencies:
   ```bash
   npm install
   ```
3. **Start** development server:
   ```bash
   npm run dev
   ```
4. **Open** `http://localhost:3001` (or whichever port Next.js suggests).

---

## Environment Variables
| Variable           | Description                          | Example                                 |
|--------------------|--------------------------------------|-----------------------------------------|
| `DB_DSN`           | PostgreSQL connection string         | `host=localhost user=postgres ...`      |
| `JWT_SECRET`       | Secret key for signing JWT tokens    | `your_jwt_secret`                       |
| `GEMINI_API_KEY`   | Gemini API key for AI suggestions    | `sk-...`                                |
| `NEXT_PUBLIC_API_URL` | Frontend usage for backend URL   | `http://localhost:3000` or deployed URL |

---

## Running with Docker
1. **Navigate** to the `backend` folder containing `Dockerfile`.
2. **Build** the image:
   ```bash
   docker build -t taskmanager-backend .
   ```
3. **Run** the container:
   ```bash
   docker run -p 3000:3000 taskmanager-backend
   ```
4. **Check** the logs and ensure `http://localhost:3000` is up.

*(For the frontend, you can similarly containerize with a separate Dockerfile or use Vercel for quick deployment.)*

---

## Deployment
- **Backend**:  
  - [Render](https://render.com/) / [Fly.io](https://fly.io/) / [Heroku](https://heroku.com/)  
  - Set environment variables in the platform’s dashboard.  
- **Frontend**:  
  - [Vercel](https://vercel.com/) recommended for Next.js.  
  - Add `NEXT_PUBLIC_API_URL` in **Vercel’s** environment settings, pointing to your deployed backend.

---

## Usage
1. **Sign Up** at `/signup`.
2. **Log In** at `/login`, store the JWT token automatically.
3. **Dashboard** at `/dashboard`:
   - **Create Task** with a due date.
   - **WebSocket** auto-updates tasks on creation/update.
   - **AI Chat**: Click “Get AI Help” to pre-fill the prompt, then ask for suggestions.

---

## AI Integration
- **`/api/ai/suggest`** (backend) calls Gemini/OpenAI with the user’s prompt.
- **ChatInterface** uses `axios` to POST to `/api/ai/suggest`.
- **`initialPrompt`** auto-fills the text area for quick AI queries.

---

## Real-Time Updates
- **WebSocket** endpoint: `/ws`
- **Broadcast** a message in `CreateTask` / `UpdateTask`.
- **Frontend** uses `react-use-websocket` to listen for changes and re-fetch tasks.

---

## License
This project is licensed under the **MIT License** – feel free to modify and distribute!

---

