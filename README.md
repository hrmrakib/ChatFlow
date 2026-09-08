# ChatFlow

This repository contains the source code for the ChatFlow frontend developer take-home assignment. It includes a real-time messaging application (Part 1), a creative landing page (Part 2), and a detailed breakdown of architectural decisions (Part 3).

## Live Demo
- **Landing Page & Chat Application:** [https://chat-flow-theta.vercel.app/](https://chat-flow-theta.vercel.app/)

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm, pnpm, or yarn

### Installation

1. Clone the repository and install dependencies:
   ```bash
   npm install
   ```

2. Create a `.env` file in the root directory (you can use `.env.example` as a reference):
   ```env
   NEXT_PUBLIC_API_BASE_URL=https://frontend-task-chatapp.onrender.com/api
   NEXT_PUBLIC_SOCKET_ORIGIN=https://frontend-task-chatapp.onrender.com
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser and navigate to `http://localhost:3000`.

## Tech Stack
- **Framework:** Next.js (React 19)
- **Language:** TypeScript
- **State Management:** Redux Toolkit
- **Styling:** Tailwind CSS
- **Real-Time Communication:** Socket.io-client

## API Documentation
The API documentation detailing the endpoints, request/response formats, and authentication flow is integrated directly into the application. You can view it by clicking the "API Docs" tab in the live chat application.

---

## Thought Process & Engineering Write-Up (Part 3)

This section summarizes my approach to the assignment, technical trade-offs, design reasoning, and how I integrated Madagascar into my workflow.

### 1. Architecture and Trade-Offs (Part 1)
For state management, I chose Redux Toolkit over React Context. Chat applications require frequent and granular updates (like new messages or typing indicators). Redux Toolkit's memoized selectors prevent unnecessary re-renders across the component tree, ensuring that only the relevant chat container updates when new data arrives. 

To ensure a smooth user experience, I implemented optimistic updates. When a user sends a message, it immediately appears in the UI with a 'sending' status. Once the server confirms receipt (via Socket.io or HTTP response), the message is reconciled with the backend ID and marked as sent. 

For real-time delivery, I used Socket.io as the primary duplex channel. However, recognizing that WebSocket connections can drop silently on mobile networks, I paired it with an idempotent background polling mechanism as a fallback. 

### 2. Extra Features: Offline Sync & Native Notifications
To go above and beyond the standard real-time requirements, I engineered two robust systems:

**1. Offline Message Queue & Sync:**
- **Offline Detection:** The app listens to browser `online`/`offline` events to immediately detect network drops, showing a sticky "Network Disconnected" banner.
- **Optimistic Queueing:** When offline, sent messages are persisted to `localStorage` instead of failing. They are rendered instantly in the UI with a distinct blue background and a "queued" clock icon, preserving the user's flow without interruptions.
- **Auto-Sync:** The moment network connectivity is restored, a Redux thunk automatically processes the local queue, pushing all pending messages to the API sequentially and updating their UI status to "sent".

**2. Native Background Notifications:**
- Leveraging the **Web Notifications API**, the application detects if the user is tabbed away (`document.hidden`). If a new message arrives while the chat is in the background, it triggers a native OS notification, ensuring the user never misses an important update.

### 3. Design Choices (Part 2)
For the landing page, I went with a modern, high-contrast dark theme. The goal was to build something that feels like a polished developer tool or SaaS product. I also included an interactive hero section so evaluators can immediately test the chat and real-time delivery without having to navigate through a login screen first.

### 3. AI Tool Usage
I utilized an AI coding assistant primarily for scaffolding boilerplate code and extracting TypeScript interfaces from the provided API data. 

However, I relied entirely on my own implementation for the core logic, including:
- Configuring the Socket.io connection to point to the correct root origin.
- Building the custom auto-scroll hook to ensure it doesn't force users to the bottom if they are reading past messages.
- Creating the client-side participant lookup table to map string IDs back to user profiles.
- Synthesizing the audio feedback using the Web Audio API.

### 4. API Quirks and Workarounds
While working with the provided API, I noticed a few quirks that required specific handling:
1. **Missing Response Schemas:** The provided Swagger documentation only detailed request structures. I used live `curl` tests to determine the actual response shapes and typed them accordingly.
2. **Unresolved Sender IDs:** The `GET /conversations/{id}/messages` endpoint returns the `sender` as a raw string ID rather than an expanded user object. To display sender names, I implemented a client-side dictionary to map these IDs to participants in the active conversation.
3. **Socket Origin Mismatch:** The WebSocket server is mounted at the root origin (`https://frontend-task-chatapp.onrender.com/`) rather than the expected `/api` base path, which required adjusting the socket connection configuration.

### 5. Future Improvements
If I had more time, I would focus on:
- Implementing virtualized lists to efficiently render long message histories.
- Adding End-to-End Encryption (E2EE) utilizing the Web Crypto API.
- Supporting rich media uploads via presigned URLs.
