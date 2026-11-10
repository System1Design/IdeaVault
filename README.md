# 💡 IdeaVault – Voice-Based Idea Organizer

**Capture it. Organize it. Never lose it.**

IdeaVault is a web application designed to help users capture and organize their spontaneous ideas. Users can type or speak an idea, let an AI model turn it into a structured plan, edit it later, and search through everything they have saved.

The application is currently under development. Voice capture, AI-powered organization, idea editing and Docker integration have been implemented. GitHub Actions CI is set up and passing. Online deployment on Vercel is the remaining step.

## ✨ Features Implemented

- **Idea Dashboard:** A clean and simple interface to manage personal ideas.
- **Manual Idea Capture:** Write down ideas in a text area.
- **Voice-Based Idea Capture:** Speak an idea using the microphone. Supports English (India) and Hindi, with live text shown while speaking.
- **Speech-to-Text:** Spoken thoughts are converted into text using the browser's Web Speech API.
- **AI-Powered Organization:** One click on **Organize with AI** turns a raw idea into a structured format.
- **Structured Idea Format:** The AI generates:
  - Idea Title
  - Problem Statement
  - Proposed Solution
  - Target Audience
  - Category
  - Next Steps
- **Edit Ideas:** Modify the title, description and all AI-generated fields of a saved idea.
- **Save Ideas:** Save ideas and display them in the My Ideas section.
- **Local Storage:** Automatically persist saved ideas in the browser.
- **Search Ideas:** Search saved ideas by keyword (title, description, category and more).
- **Delete Ideas:** Remove ideas that are no longer needed.
- **Responsive UI:** Interface designed using Tailwind CSS.
- **Docker Integration:** Application containerized using Docker with a multi-stage production build.
- **Standalone Production Build:** Optimized Next.js standalone output configured for Docker deployment.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Next.js | React-based web application framework |
| React | Frontend development |
| TypeScript | Type-safe development |
| Tailwind CSS | Styling and UI design |
| Web Speech API | Browser-based speech-to-text |
| Next.js API Route | Server-side endpoint that calls the AI service (keeps the API key private) |
| Groq API (OpenAI-compatible) | AI model used to organize ideas (can be swapped via `.env`) |
| LocalStorage | Browser-based data persistence |
| Docker | Application containerization |
| Node.js | JavaScript runtime |
| Git & GitHub | Version control and collaboration |

## 📁 Project Structure

```text
ideavault/
│
├── .github/
│   └── workflows/
│       └── ci.yml           # GitHub Actions CI (lint, build, Docker build)
│
├── app/
│   ├── api/
│   │   └── organize/
│   │       └── route.ts     # AI organization endpoint
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx             # Main dashboard (voice, AI, edit, search)
│
├── public/
│
├── .dockerignore
├── .env.example             # Template for required environment variables
├── .gitignore
├── Dockerfile
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── package-lock.json
├── README.md
└── tsconfig.json
```

## 🚀 Getting Started

Follow these instructions to run IdeaVault locally.

### Prerequisites

Make sure you have installed:

- Node.js (20.9 or later)
- npm
- Git
- Docker Desktop (only for containerized execution)
- VS Code (recommended)
- Google Chrome or Microsoft Edge (required for voice capture)

### 1. Clone the Repository

```bash
git clone https://github.com/System1Design/IdeaVault.git
```

### 2. Navigate to the Project Directory

```bash
cd IdeaVault
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Set Up Environment Variables

The AI feature needs an API key. Create a file named `.env` in the project root (you can copy `.env.example`):

```env
AI_BASE_URL=https://api.groq.com/openai/v1
AI_API_KEY=your_api_key_here
AI_MODEL=openai/gpt-oss-120b
```

How to get the key:

1. Create a free account at [console.groq.com](https://console.groq.com).
2. Open the [API Keys page](https://console.groq.com/keys) and create a key.
3. Paste it as `AI_API_KEY` in your `.env` file.

Notes:

- **Never commit your `.env` file.** It is already listed in `.gitignore`.
- Available model names depend on your account and can change over time. If you see a "model not found" error, check the model list for your key and update `AI_MODEL`.
- Any OpenAI-compatible service can be used by changing `AI_BASE_URL`, `AI_API_KEY` and `AI_MODEL`.
- For UI testing without calling any AI, add `AI_MOCK=true` to `.env`. This returns clearly marked demo data. Remove it for real AI results.
- Restart the dev server after changing `.env`.

### 5. Start the Development Server

```bash
npm run dev
```

### 6. Open in Browser

Visit:

```text
http://localhost:3000
```

The IdeaVault application should now be running locally.

> **Voice capture requirements:** use Chrome or Edge, allow microphone access, keep an internet connection on, and open the app on `localhost` or an HTTPS address.

## 🐳 Docker Setup

IdeaVault is configured to run inside a Docker container using a multi-stage production build.

### 1. Build Docker Image

```bash
docker build -t ideavault .
```

### 2. Run Docker Container

The container needs the AI settings at runtime, so pass your `.env` file:

```bash
docker run -d --name ideavault-container -p 3000:3000 --env-file .env ideavault
```

### 3. Check Running Container

```bash
docker ps
```

### 4. View Container Logs

```bash
docker logs ideavault-container
```

### 5. Stop Container

```bash
docker stop ideavault-container
```

Docker Verification Status:

- Docker image built successfully.
- Production build completed inside Docker.
- Container started successfully.
- Next.js production server reported ready.
- Port mapping configured: 3000:3000.

## 🔄 CI/CD (GitHub Actions)

A GitHub Actions workflow (`.github/workflows/ci.yml`) runs automatically on every push to `main` and on every pull request into `main`.

| Job | What it does |
|---|---|
| **build** | Installs dependencies with `npm ci`, runs ESLint, and runs the Next.js production build (which also type-checks the code) |
| **docker** | Builds the Docker image after the `build` job succeeds |

The workflow does not need any API key, because the AI service is only called when a user clicks **Organize with AI**.

Check the results in the **Actions** tab of the GitHub repository, or in the **Checks** section of any pull request. Merge a pull request only after both jobs show a green tick.

## 🧩 Current Application Workflow

1. Open the IdeaVault dashboard.
2. Type an idea, or click **Speak your idea** and say it aloud.
3. Click **Organize with AI** to get a structured idea, or **Save Idea** to save it as it is.
4. Your idea appears in the My Ideas section.
5. Click **Edit** on any idea to change its details.
6. Search for previously saved ideas.
7. Delete ideas when required.

## ⚠️ Current Limitations

- Ideas are stored in the browser's LocalStorage, so they stay on that browser and device only. They are not shared between users or devices.
- Voice capture depends on the browser's speech service and works best in Chrome and Edge.
- AI results depend on the selected model and the availability of the AI service.

## 🗺️ Upcoming Work

- **Vercel Deployment:** Deploy the application online. The three AI variables (`AI_BASE_URL`, `AI_API_KEY`, `AI_MODEL`) must be added in the Vercel project's Environment Variables.

## 🏗️ Development Status

| Component | Status |
|---|---|
| Next.js Project Setup | ✅ Completed |
| Basic Dashboard UI | ✅ Completed |
| Manual Idea Capture | ✅ Completed |
| Save and Display Ideas | ✅ Implemented |
| LocalStorage Integration | ✅ Implemented |
| Search Ideas | ✅ Implemented |
| Delete Ideas | ✅ Implemented |
| Voice Recognition (Speech-to-Text) | ✅ Implemented |
| AI Integration (Idea Organization) | ✅ Implemented |
| Structured Idea Format | ✅ Implemented |
| Edit Ideas | ✅ Implemented |
| ESLint Check | ✅ Passed |
| TypeScript Check | ✅ Passed |
| Next.js Production Build | ✅ Passed |
| Dockerfile | ✅ Completed |
| .dockerignore | ✅ Completed |
| Docker Image Build | ✅ Successful |
| Docker Container Execution | ✅ Successful |
| Merge of voice, AI and edit work into `main` | ✅ Merged |
| GitHub Actions CI (lint, build, Docker build) | ✅ Completed |
| Vercel Deployment | ⏳ Pending |

## 🎯 Project Objective

The main objective of IdeaVault is to create a simple and accessible platform where people can capture their spontaneous thoughts by typing or speaking, and transform them into structured, actionable ideas using AI.

---

**IdeaVault – Because every great idea deserves to be remembered.** 💡