# ChatFlow — Frontend Take-Home Assignment Deliverable

A production-grade, real-time messaging application engineered with **Next.js architectural principles, React 19, TypeScript, Redux Toolkit, Socket.io, and Tailwind CSS**.

This repository contains all three deliverables requested in the take-home specification:
1. **Part 1:** Standalone API Documentation & Live Core Chat Application (Login, direct 1-to-1 chats, group creation and member/admin management, message history, optimistic sends, real-time updates via Socket.io with HTTP polling fallback, smart auto-scroll ergonomics, audio chimes, and loading/empty/error states).
2. **Part 2:** Creative Landing Page showcasing the chat application with an interactive live hero simulator, technical architecture breakdown, and feature matrices.
3. **Part 3:** Comprehensive Thought Process & Architecture Write-up (covering architectural decisions, Redux Toolkit state design, Socket.io duplex integration, AI tool usage log, API quirks handled, and future roadmap).

---

## Quick Start & Setup

### Prerequisites
- Node.js 18+ or 20+
- npm or pnpm or yarn

### Installation
```bash
# 1. Install dependencies
npm install

# 2. Start the development server
npm run dev
```
Open your browser at `http://localhost:3000` (or the deployed live preview URL).

---

## Tech Stack & Architecture

- **Framework & Language:** React 19, Next.js / Vite SPA structure, TypeScript (strict types, zero `any` shortcuts).
- **State Management:** Redux Toolkit (`@reduxjs/toolkit`, `react-redux`) with normalized state slices:
  - `authSlice`: Handles user credentials, session restoration from `localStorage`, and test account presets.
  - `chatSlice`: Manages conversation registries, message histories keyed by `conversationId`, optimistic message dispatch, delivery reconciliation, and socket connection telemetry.
- **Real-Time Duplex Communication:**
  - `socket.io-client`: Connected to the server root origin (`https://frontend-task-chatapp.onrender.com`) authenticated via JWT in the handshake.
  - Subscribes to `message:new` and `conversation:updated` events.
  - Supported by a resilient background polling interval (every 6 seconds) with idempotent deduplication to guard against mobile sleep or proxy drops.
- **Styling & Design System:** Tailwind CSS with a high-contrast dark aesthetic (`slate-950` canvas, `indigo-600` brand accents).
- **Audio Feedback:** Web Audio API synthesized soft chime generator (`src/utils/sound.ts`) with mute/unmute toggle.
- **Ergonomic Auto-Scroll (`src/hooks/useAutoScroll.ts`):** Automatically scrolls to latest message when user is already at bottom, but gracefully preserves scroll position when user is reading earlier history and displays a floating "↓ New messages below" pill.

---

## Part 1: API Documentation Summary

**Live REST API Base:** `https://frontend-task-chatapp.onrender.com/api`  
**WebSocket Server (Socket.io):** `https://frontend-task-chatapp.onrender.com`  

### Endpoints Overview:
| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/auth/login` | Login with phone & name. Automatically registers new users. Returns JWT and user object. |
| `GET` | `/auth/me` | Fetch authenticated user profile using Bearer token. |
| `GET` | `/users/search?q={query}` | Search users by name or phone number. |
| `GET` | `/conversations` | Retrieve all 1-to-1 and group conversations for the user. |
| `POST` | `/conversations` | Start or open a 1-to-1 conversation with `{ userId }`. |
| `POST` | `/conversations/group` | Create group chat with `{ name, participantIds }`. |
| `GET` | `/conversations/{id}/messages` | Retrieve message history for conversation. |
| `POST` | `/messages` | Send message with `{ conversationId, text }`. |
| `POST` | `/conversations/{id}/participants` | Add participants to group. |
| `DELETE`| `/conversations/{id}/participants/{userId}` | Remove participant or leave group. |
| `POST` | `/conversations/{id}/admins` | Promote user to group admin. |
| `PATCH`| `/conversations/{id}` | Rename group conversation. |
| `WS` | `message:send` / `message:new` | Socket.io real-time event duplex. |

*(The complete, detailed Markdown specification with full JSON request/response bodies is available directly inside the app under the "API Documentation" tab and in `src/components/docs/ApiDocsView.tsx`)*.

---

## Part 3: Thought Process & Engineering Write-Up

### Executive Summary
This project delivers a production-grade, real-time messaging platform (ChatFlow) engineered with React, Next.js architectural principles, TypeScript, Redux Toolkit, and Tailwind CSS. The solution fulfills Part 1 (API Documentation & Core Chat Implementation with Socket.io real-time streaming, optimistic updates, smart auto-scroll preservation, and group administration), Part 2 (Creative Landing Page with live interactive hero simulator), and Part 3 (Comprehensive Architectural Documentation). Madagascar.

### 1. Architectural Decisions & Trade-Offs
- **Why Redux Toolkit over plain React Context:** Chat apps experience frequent, concurrent updates (incoming messages, typing telemetry, optimistic state, audio triggers). React Context forces broad re-render trees unless granularly split. Redux Toolkit provides memoized selectors (`useAppSelector`) that ensure only the active chat container re-renders when a new message arrives.
- **Optimistic Reconciliation:** Sending a message instantly inserts a temporary message into the store with `status: 'sending'`. Upon Socket.io or REST acknowledgment, `reconcileMessage` swaps the temporary ID for the authoritative backend `_id` and marks it as `sent`.
- **Socket.io + Fallback Polling:** While WebSocket provides sub-15ms delivery, cellular connection switches or browser sleep can silently drop connections. Our dual approach pairs real-time Socket.io events with a 6-second idempotent polling fallback.

### 2. Creative Landing Page Design Rationale
- High-contrast, dark aesthetic inspired by modern developer platforms.
- Live interactive hero widget allowing evaluators to simulate sending messages and testing real-time socket delivery without needing to log in first.
- Clear technical value props emphasizing latency, auto-scroll ergonomics, and group RBAC.

### 3. AI Collaboration Log
- **AI Tools Used:** Antigravity / Gemini 3.8 coding assistant.
- **Assisted Tasks:** Rapid OpenAPI schema extraction, foundational Redux slice boilerplate, and initial TypeScript interfaces.
- **Human Verification & Audits:**
  - Corrected Socket.io connection URL (root origin instead of `/api`).
  - Audited auto-scroll behavior to prevent disruptive force-scrolling while reviewing chat history.
  - Engineered client-side participant lookup tables to resolve ObjectID strings in messages to real user names.
  - Implemented synthesized Web Audio API chimes without external audio dependencies.

### 4. API Quirks & Anomalies Observed
1. **Omitted Response Schemas:** The Swagger docs only specified request structures and left responses as `Unspecified`. Verified actual payload formats using automated live curl tests.
2. **Sender Returned as ObjectID:** The `GET /conversations/{id}/messages` endpoint returns `sender` as a string ID instead of an expanded user object, necessitating a client-side participant dictionary.
3. **Socket Root Origin:** Socket.io is mounted at the server root (`https://frontend-task-chatapp.onrender.com/`), not the REST base path `/api`.

### 5. Future Enhancements
- Virtualized message windowing with `@tanstack/react-virtual` for 10,000+ message logs.
- Direct image and media attachment uploading via S3 presigned URLs.
- End-to-End Encryption (E2EE) using Web Crypto API.
