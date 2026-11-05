# 💡 IdeaVault – Voice-Based Idea Organizer

**Capture it. Organize it. Never lose it.**

IdeaVault is a web application designed to help users capture and organize their spontaneous ideas. The goal is to make sure that no creative thought gets lost. Users can write down their ideas, save them, and access them whenever needed.

The application is currently under development. The initial dashboard and basic idea management functionality have been implemented.

## ✨ Features Implemented

- **Idea Dashboard:** A clean and simple interface to manage personal ideas.
- **Manual Idea Capture:** Write down ideas in a text area.
- **Save Ideas:** Save ideas and display them in the My Ideas section.
- **Local Storage:** Automatically persist saved ideas in the browser.
- **Search Ideas:** Search saved ideas using keywords.
- **Delete Ideas:** Remove ideas that are no longer needed.
- **Responsive UI:** Interface designed using Tailwind CSS.

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Next.js | React-based web application framework |
| React | Frontend development |
| TypeScript | Type-safe development |
| Tailwind CSS | Styling and UI design |
| LocalStorage | Browser-based data persistence |

## 📁 Project Structure

```text
ideavault/
│
├── app/
│   ├── favicon.ico
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
│
├── public/
│
├── node_modules/
│
├── .gitignore
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── package-lock.json
├── postcss.config.mjs
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
- VS Code (recommended)

### 1. Clone the Repository

```bash
git clone https://github.com/System1Design/IdeaVault.git
```

### 2. Navigate to the Project Directory

```bash
cd ideavault
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

## 🧩 Current Application Workflow

1. Open the IdeaVault dashboard.
2. Enter an idea in the text area.
3. Click the **Save Idea** button.
4. Your idea appears in the My Ideas section.
5. Search for previously saved ideas.
6. Delete ideas when required.

## 🗺️ Upcoming Features

The following features are planned for future development:

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
- **Docker Integration:** Containerize the application.
- **CI/CD Pipeline:** Automate testing and builds using GitHub Actions.
- **Deployment:** Deploy the application on Vercel.

## 🏗️ Development Status

| Component | Status |
|---|---|
| Next.js Project Setup | ✅ Completed |
| Basic Dashboard UI | ✅ Completed |
| Manual Idea Capture | ✅ Completed |
| Save and Display Ideas | ✅ Completed |
| LocalStorage Integration | ✅ Implemented |
| Search Ideas | ✅ Implemented |
| Delete Ideas | ✅ Implemented |
| Voice Recognition | ⏳ Planned |
| AI Integration | ⏳ Planned |
| Docker | ⏳ Planned |
| GitHub Actions CI/CD | ⏳ Planned |
| Vercel Deployment | ⏳ Planned |

## 🎯 Project Objective

The main objective of IdeaVault is to create a simple and accessible platform where people can capture their spontaneous thoughts and eventually transform them into structured, actionable ideas using voice recognition and AI.

---

**IdeaVault – Because every great idea deserves to be remembered.** 💡
