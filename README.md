# Personal Finance Tracker

A modern, offline-first personal finance tracker built with SvelteKit 2.x and TypeScript. Track your income, expenses, wallets, and financial goals with beautiful charts and insights.

## Features

- **Transaction Management**: Create, edit, delete, and filter transactions with ease
- **Wallet Management**: Organize finances across multiple wallets (Cash, Bank Account, etc.)
- **Category Management**: Track spending by category with custom and predefined categories
- **Financial Insights Dashboard**:
  - Current month summary with income, expenses, and net savings
  - Spending breakdown by category with visual charts
  - 12-month trend visualization
  - Savings rate tracking with 10% goal indicator
- **Transaction Filtering**: Filter by wallet, category, type, date range, and search notes
- **Offline-First**: All data stored locally in browser LocalStorage
- **Mobile-Responsive**: Optimized for mobile devices with 44px touch targets
- **Dark Mode Ready**: Clean, modern UI with Tailwind CSS

## Tech Stack

- **Frontend Framework**: SvelteKit 2.x with Svelte 5 (runes mode)
- **Language**: TypeScript with strict mode
- **Styling**: Tailwind CSS
- **Charts**: Layerchart (D3-based charting library)
- **Date Handling**: date-fns
- **Data Validation**: Zod
- **Storage**: LocalStorage (offline-first)
- **Build Tool**: Vite

## Quick Start

### Prerequisites

- Node.js 18.x or higher
- npm 9.x or higher

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd diegomauriciof
   ```

2. **Install dependencies**:
   ```bash
   cd frontend
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. **Open in browser**:
   Navigate to `http://localhost:5173`

### Building for Production

1. **Build the application**:
   ```bash
   npm run build
   ```

2. **Preview production build**:
   ```bash
   npm run preview
   ```

3. **Deploy**:
   The built files are in `frontend/build/` directory. Deploy to any static hosting service (Netlify, Vercel, GitHub Pages, etc.)

## Usage Guide

### Initial Setup

1. **Create Wallets**: Go to "Wallets" and create your first wallet (e.g., "Cash", "Bank Account")
2. **Review Categories**: Check "Categories" page for predefined categories, add custom ones if needed
3. **Add Transactions**: Go to "Transactions" → "New Transaction" to record income/expenses

### Managing Transactions

- **Create**: Click "New Transaction" button, fill in date, amount, type, wallet, category, and optional notes
- **Edit**: Click "Edit" on any transaction (feature coming soon)
- **Delete**: Click "Delete" on any transaction (confirmation required)
- **Filter**: Use the "Show Filters" button to filter by wallet, category, type, date range, or search notes

### Understanding the Dashboard

The Dashboard provides a comprehensive overview of your finances:

- **Current Month Summary**: Total income, expenses, and net savings for the current month
- **Category Breakdown**: Visual bar chart showing spending/income by category with percentages
- **Monthly Trends**: 12-month line chart tracking income, expenses, and savings over time
- **Savings Rate**: Percentage of income saved with a 10% target indicator

### Managing Wallets

- **Create**: Add new wallets for different accounts (Cash, Bank, Credit Card, etc.)
- **Edit**: Click "Edit" to rename a wallet inline
- **Delete**: Remove wallets (only if no transactions are linked)
- **View Balance**: See calculated balance based on all transactions

### Managing Categories

- **Predefined Categories**: Food, Transportation, Shopping, etc. (cannot be edited or deleted)
- **Custom Categories**: Create your own categories for specific tracking needs
- **Edit Custom**: Modify custom category names
- **Delete Custom**: Remove custom categories (only if no transactions use them)

## Data Storage

All data is stored locally in your browser's LocalStorage:

- **Offline-First**: Works without internet connection
- **Privacy**: Data never leaves your device
- **Backup**: Export/import features coming soon
- **Persistence**: Data persists across browser sessions
- **Clearing**: Clearing browser data will delete all financial records

## Development

### Project Structure

```
diegomauriciof/
├── frontend/
│   ├── src/
│   │   ├── lib/
│   │   │   ├── components/     # Svelte components
│   │   │   ├── models/         # Data models and schemas
│   │   │   ├── services/       # Business logic services
│   │   │   ├── stores/         # Svelte stores
│   │   │   └── utils/          # Utility functions
│   │   ├── routes/             # SvelteKit pages
│   │   └── app.html            # HTML template
│   ├── static/                 # Static assets
│   ├── tests/                  # Test files
│   └── package.json
├── specs/                      # Feature specifications
└── README.md
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run check` - Run TypeScript and Svelte checks
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier

### Code Style

- **TypeScript**: Strict mode enabled
- **Svelte 5**: Using runes ($state, $derived, $effect)
- **Formatting**: Prettier with Tailwind CSS plugin
- **Linting**: ESLint with TypeScript and Svelte support

## Testing

Run tests with:
```bash
npm test
```

Run linting:
```bash
npm run lint
```

Run type checking:
```bash
npm run check
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Built with [SvelteKit](https://kit.svelte.dev/)
- Charts powered by [Layerchart](https://www.layerchart.com/)
- Styled with [Tailwind CSS](https://tailwindcss.com/)
- Icons from Unicode emoji

## Support

For issues, questions, or suggestions:
- Open an issue on GitHub
- Check existing issues for solutions
- Review the specification docs in `/specs/`

---

**Note**: This is a client-side only application. All data is stored locally in your browser. For production use with multiple devices or data backup, consider implementing cloud storage or export/import functionality.
