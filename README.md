# Planets Pick ERP

A comprehensive ERP system built with React, TypeScript, and Node.js.

## Quick Start

### Prerequisites
- Node.js 18+ 
- MongoDB (optional, uses mock data if unavailable)
- Python 3.12+ (for AI features)

### Installation

1. **Install Frontend Dependencies**
   ```bash
   npm install
   ```

2. **Install Backend Dependencies**
   ```bash
   cd backend
   npm install
   cd ..
   ```

3. **Install AI Service Dependencies** (optional)
   ```bash
   cd ai-service
   pip install -r requirements.txt
   cd ..
   ```

### Running the Application

1. **Start Backend** (in one terminal)
   ```bash
   cd backend
   npm start
   # API starts on http://localhost:4000
   ```

2. **Start Frontend** (in another terminal)
   ```bash
   npm run dev
   # App starts on http://localhost:5173
   ```

3. **Start AI Service** (optional, in another terminal)
   ```bash
   cd ai-service
   python app.py
   # Service starts on http://localhost:5001
   ```

## Development

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

### Troubleshooting

#### "Cannot find module 'puppeteer'" Error
If you encounter this error when starting the backend:
1. Make sure you've installed backend dependencies: `cd backend && npm install`
2. If you're in a restricted environment, use: `PUPPETEER_SKIP_DOWNLOAD=true npm install`
3. The puppeteer package is used for PDF generation in the reports module

### Available Plugins

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      ...tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      ...tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      ...tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default tseslint.config([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
