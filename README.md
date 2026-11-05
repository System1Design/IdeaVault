# 💡 IdeaVault – Voice-Based Idea Organizer

**Capture it. Organize it. Never lose it.**

IdeaVault is a web application designed to help users capture and organize their spontaneous ideas. The goal is to make sure that no creative thought gets lost. Users can write down their ideas, save them, and access them whenever needed.

The application is currently under development. The initial dashboard, basic idea management functionality, and Docker integration have been implemented.

## ✨ Features Implemented

- **Idea Dashboard:** A clean and simple interface to manage personal ideas.
- **Manual Idea Capture:** Write down ideas in a text area.
- **Save Ideas:** Save ideas and display them in the My Ideas section.
- **Local Storage:** Automatically persist saved ideas in the browser.
- **Search Ideas:** Search saved ideas using keywords.
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
| LocalStorage | Browser-based data persistence |
| Docker | Application containerization |
| Node.js | JavaScript runtime |
| Git & GitHub | Version control and collaboration |

## 📁 Project Structure

```text
ideavault/
│
├── .github/
│   └── workflows/       # GitHub Actions (planned)
│
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── public/
│
├── .dockerignore
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
- Docker Desktop (for containerized execution)
- VS Code (recommended)

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

### 4. Start the Development Server

```bash
npm run dev
```

### 5. Open in Browser

Visit:

```text
http://localhost:3000
```

The IdeaVault application should now be running locally.

## 🐳 Docker Setup

IdeaVault is configured to run inside a Docker container using a multi-stage production build.

### 1. Build Docker Image

```bash
docker build -t ideavault .
```

### 2. Run Docker Container

```bash
docker run -d --name ideavault-container -p 3000:3000 ideavault
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

**Docker Verification Status:**
- Docker image built successfully.
- Production build completed inside Docker.
- Container started successfully.
- Next.js production server reported ready.
- Port mapping configured: `3000:3000`.

## 🧩 Current Application Workflow

1. Open the IdeaVault dashboard.
2. Enter an idea in the text area.
3. Click the **Save Idea** button.
4. Your idea appears in the My Ideas section.
5. Search for previously saved ideas.
6. Delete ideas when required.

## 🗺️ Upcoming Features

The following features are planned or under development:

- **Voice-Based Idea Capture:** Capture ideas directly through a microphone.
- **Speech-to-Text:** Convert spoken thoughts into text.
- **AI-Powered Organization:** Use an AI model to organize raw ideas into structured information.
- **Structured Idea Format:** Automatically generate:
  - Idea Title
  - Problem Statement
  - Proposed Solution
  - Target Audience
  - Category
  - Next Steps
- **Edit Ideas:** Modify previously saved ideas.
- **GitHub Actions CI/CD:** Automate linting, production builds, and Docker image builds.
- **Vercel Deployment:** Deploy the application online.

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
| ESLint Check | ✅ Passed |
| TypeScript Check | ✅ Passed |
| Next.js Production Build | ✅ Passed |
| Dockerfile | ✅ Completed |
| .dockerignore | ✅ Completed |
| Docker Image Build | ✅ Successful |
| Docker Container Execution | ✅ Successful |
| Voice Recognition | ⏳ Pending Team Integration |
| AI Integration | ⏳ Planned |
| Edit Ideas | ⏳ Planned |
| GitHub Actions CI/CD | ⏳ Pending |
| Vercel Deployment | ⏳ Pending |

## 🎯 Project Objective

The main objective of IdeaVault is to create a simple and accessible platform where people can capture their spontaneous thoughts and eventually transform them into structured, actionable ideas using voice recognition and AI.

---

**IdeaVault – Because every great idea deserves to be remembered.** 💡