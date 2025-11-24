# Workflow Builder

A web-based workflow builder application similar to n8n, built with React, TypeScript, and React Flow. Create, manage, and execute complex workflows entirely in your browser - no backend required!

## Features

- 🎨 Visual workflow builder with drag-and-drop nodes
- 🔄 Create and connect workflow nodes (Trigger, API Call, JavaScript, File, AI Chat, AI Asset)
- 💾 Save and load workflows as JSON
- 🚀 Execute workflows and see real-time data flow
- 🤖 AI-powered nodes for OpenAI (Chat, TTS, STT, Images, Video, Embeddings)
- 📊 View input/output data for each node
- 🔐 Environment variables for secure API key management
- 💡 Data references: `$json.property`, `$env.VARIABLE_NAME`, `$node.key`
- 🎯 Type-safe with TypeScript
- 🎨 Modern UI with Tailwind CSS

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **React Flow** - Node-based workflow UI
- **Zustand** - State management
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Deployment

This project is configured to deploy to GitHub Pages at `/workflow-builder/` subdirectory.

### Quick Deploy

1. Enable GitHub Pages in repository settings (Source: GitHub Actions)
2. Push to main branch - the GitHub Action will automatically build and deploy
3. Access at: `https://mohmedvaid.github.io/workflow-builder/`

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

## Project Structure

```
src/
  ├── components/     # React components
  │   ├── nodes/      # Node components
  │   └── configs/    # Node configuration components
  ├── store/         # Zustand state management
  ├── types/         # TypeScript type definitions
  ├── utils/          # Utility functions
  └── App.tsx        # Main app component
```

## License

MIT