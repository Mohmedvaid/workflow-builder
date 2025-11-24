# Workflow Builder

A web-based workflow builder application similar to n8n, built with React, TypeScript, and React Flow.

## Features

- 🎨 Visual workflow builder with drag-and-drop nodes
- 🔄 Create and connect workflow nodes
- 💾 Save and load workflows as JSON
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

## Project Structure

```
src/
  ├── components/     # React components
  ├── store/         # Zustand state management
  ├── types/         # TypeScript type definitions
  ├── utils/         # Utility functions
  └── App.tsx        # Main app component
```

## Development Roadmap

- [x] Project setup and configuration
- [ ] Basic UI layout and structure
- [ ] React Flow integration
- [ ] Node system implementation
- [ ] State management setup
- [ ] JSON import/export functionality
- [ ] Node palette and drag-and-drop

## License

MIT