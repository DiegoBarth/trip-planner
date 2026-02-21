# 🗾 Trip Planner - Japan & South Korea

Web application for planning trips to Japan and South Korea, with budget control, attractions, and expenses management.

## ✨ Features

### 💰 Budget Control
- **3 Separate Budgets**: Diego, Pamela, and Couple
- Total and per-person balance visualization
- Expense graphs and usage percentage

### 🎯 Attractions Management
- Complete tourist attraction registration
- Organization by Country → City → Day → Order
- Detailed information:
  - Name, type, location
  - Opening hours
  - Prices (with automatic JPY/KRW → BRL conversion)
  - Reservation status
  - Links to tickets and location
  - Images
- Advanced filters (country, city, day, type, visited)
- Mark attractions as visited
- Drag-and-drop sorting

### 💸 Expenses Control
- Expense registration by category
- Optional linking with attractions
- Automatic currency conversion
- Filters by category, origin, and date

### 📊 Dashboard
- Complete financial summary
- Upcoming attractions of the day
- Expense statistics
- Quick actions

## 🛠️ Technologies

- **React 19** + **TypeScript**
- **Vite** (Rolldown) - Build tool
- **TailwindCSS** - Styling
- **@tanstack/react-query** - State management
- **@dnd-kit** - Drag and drop
- **date-fns** - Date manipulation
- **lucide-react** - Icons

## 📁 Project Structure

```
src/
├── types/               # TypeScript types
│   ├── Attraction.ts    # Attraction types
│   ├── Expense.ts       # Expense types
│   └── Budget.ts        # Budget types
│
├── config/
│   └── constants.ts     # Constants (currencies, countries, categories)
│
├── utils/
│   └── formatters.ts    # Formatting and conversion functions
│
├── components/
│   ├── attractions/     # Attraction components
│   │   ├── AttractionCard.tsx
│   │   ├── AttractionsList.tsx
│   │   └── ModalAttraction.tsx
│   │
│   ├── home/           # Home components
│   │   └── BudgetCard.tsx
│   │
│   ├── budget/         # Budget components
│   ├── expenses/       # Expense components
│   └── ui/            # Reusable components
│
└── pages/
    └── HomePage.tsx    # Home page
```

## 💱 Currency Conversion

Exchange rates (JPY/KRW → BRL) are fetched from the backend API and cached by the app. Configuration for countries and categories lives in `src/config/constants.ts`.

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Production build (GitHub Pages)
npm run build

# Preview build
npm run preview
```

### Configuration

1. Copy `.env.example` to `.env` and set:
   - `VITE_API_URL` – backend API URL (e.g. Google Apps Script deploy URL)
   - `VITE_GOOGLE_CLIENT_ID` – Google OAuth client ID for login
2. Adjust countries and categories in `src/config/constants.ts` if needed.

## 🌐 Deploy (GitHub Pages)

The project is configured for GitHub Pages deployment:

```json
{
  "base": "/trip-planner/",
  "build": {
    "outDir": "docs"
  }
}
```

To deploy:

```bash
npm run build
git add docs
git commit -m "Deploy"
git push
```

In the repository settings, enable GitHub Pages pointing to the `/docs` folder.

## 📱 Upcoming Features

- [ ] Offline mode
- [ ] Pending reservation notifications
- [ ] Multi-language (PT/EN/JP/KR)

## 📝 License

MIT

---

**Have a great trip! 🇯🇵🇰🇷✈️**

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

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

export default defineConfig([
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
