# Job Recommender System - Frontend

A Vite-based React application for intelligent job recommendations with AI-powered role matching and tech stack suggestions.

## Features

- **Guest Mode**: Browse all available job postings without signing up
- **Authenticated Access**:
  - Resume-based job role recommendations
  - Role-based tech stack recommendations
  - Personalized job listings filtered by your profile
- **User Profile**: Manage your tech stack and project portfolio
- **Job Listings**: Search and filter through available positions

## Tech Stack

- **Framework**: React 19 + Vite 7
- **State Management**: Zustand 5
- **Styling**: Tailwind CSS 4
- **Routing**: React Router 7
- **Forms**: React Hook Form
- **UI Components**: Headless UI + Heroicons
- **HTTP Client**: Axios

## Getting Started

### Prerequisites

- Node.js 20.19+ or 22.12+
- npm or yarn

### Installation

```bash
# Install dependencies
npm install
```

### Development

```bash
# Start development server
npm run dev
```

The application will be available at `http://localhost:5173`

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## Project Structure

```
src/
├── components/
│   ├── common/          # Shared components (Navbar, ProtectedRoute, etc.)
│   ├── jobs/            # Job-related components
│   └── ui/              # Reusable UI components
├── layouts/             # Page layouts
├── pages/
│   ├── auth/            # Authentication pages
│   ├── recommender/     # Recommendation pages
│   └── ...              # Other pages
├── services/            # API services and mock data
├── stores/              # Zustand state stores
└── utils/               # Utility functions
```

## Demo Credentials

For testing purposes, use these credentials:

- **Email**: test@example.com
- **Password**: password

## API Integration

Currently using mock APIs for development. When the backend is ready:

1. Update the `VITE_API_URL` in your `.env` file
2. Replace mock API calls in `src/services/` with actual API endpoints
3. Update axios interceptor in `src/services/api.js` as needed

## Available Routes

- `/` - Home page with feature showcase
- `/jobs` - Browse job listings (public)
- `/auth/login` - Sign in
- `/auth/register` - Sign up
- `/recommend-role` - Get job role recommendations (requires auth)
- `/recommend-stack` - Get tech stack recommendations (requires auth)
- `/profile` - User profile management (requires auth)

## Features in Detail

### Resume-Based Role Recommendations

Upload your resume (PDF, DOC, DOCX) to receive AI-powered job role suggestions with confidence scores.

### Tech Stack Recommendations

Enter your desired job role to get a curated list of technologies to learn, prioritized by importance.

### Personalized Job Listings

Authenticated users receive job recommendations filtered by their tech stack and experience level.

## License

MIT
