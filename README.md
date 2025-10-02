# Planets Pick ERP System

A modern ERP (Enterprise Resource Planning) system built with React, TypeScript, Vite, Node.js, and AI-powered financial predictions.

## Features

- **Finance Management** with AI-powered predictions and insights
- **Inventory Management**
- **Production Planning**
- **Employee Management**
- **Orders & Sales**
- **Procurement**
- **Warehouse Management**
- **Reports & Analytics**

## 🚀 Quick Start

See [QUICKSTART.md](QUICKSTART.md) for detailed setup instructions.

### Start All Services

```bash
./start-services.sh
```

This will start:
- 🤖 AI Prediction Service (Port 5001)
- 🔧 Backend Server (Port 4000)
- 🌐 Frontend (Port 5173)

### Access the Application

Open your browser and navigate to: http://localhost:5173

## AI Financial Insights

The Finance module includes AI-powered features:
- **3-Month Financial Predictions** - Machine learning predictions for income, expenses, and profit
- **Automated Insights** - AI-generated recommendations based on financial trends
- **Trend Analysis** - Visualize historical and predicted financial data

For more information, see [AI_FINANCE_PREDICTION.md](AI_FINANCE_PREDICTION.md).

---

## Original Vite + React Template Info

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

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
