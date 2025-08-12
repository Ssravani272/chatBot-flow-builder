# Chatbot Flow Builder

A lightweight, extensible **chatbot flow builder** built with **React + React Flow**.  
Supports drag-and-drop nodes, connecting edges with rules (✅ one outgoing per source handle, ✅ multiple incoming per target), a **Settings** panel with a back arrow to the **Nodes** panel, and **Save** with validation. New node types can be added via a simple registry.

## Live Demo
<!-- Replace with your deployed URL -->
https://your-project-name.vercel.app

---

## Features

- **Text/Message Node** (extensible)  
  - Multiple text nodes per flow  
  - Edit message text in Settings panel
- **Nodes Panel**  
  - Drag to canvas to add nodes  
  - Registry-based: add new nodes by registering once (Message, Delay, Button included)
- **Edges**
  - Connect nodes visually
  - **Rule:** Only **one** edge from a **source handle**
  - **Rule:** **Many** edges can connect to a **target handle**
  - Arrowheads on edges pointing to targets
- **Settings Panel**
  - Replaces the Nodes panel when a node is selected
  - Back arrow to return to Nodes panel
- **Save**
  - Validates before saving:
    - If there are **> 1 nodes** and **> 1 node** has **no incoming** edges → show error “Cannot save Flow”
  - Saves to `localStorage` (swap in your API later)
- **TypeScript-ready**
  - Works with `verbatimModuleSyntax` and type-only imports

---

## Tech Stack

- **React + TypeScript**
- **React Flow** (`reactflow`) for canvas, nodes, edges
- **Vite** for dev/build
- Utilities: `nanoid` (ids), `clsx` (conditional classes)

---

## Getting Started

```bash
# 1) Create the app (Vite)
npm create vite@latest chatbot-flow -- --template react-ts
cd chatbot-flow

# 2) Install deps
npm i reactflow nanoid clsx

# 3) Run
npm run dev
