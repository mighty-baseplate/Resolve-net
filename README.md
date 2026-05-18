# CivicEngage

A full-stack web application for community issue reporting and resolution. Users can report civic issues, track their status, and collaborate with their community to improve local spaces.

## Features

- User authentication and authorization
- Issue reporting and tracking
- Real-time status updates
- Community voting and engagement
- Location-based issue mapping
- Image uploads for issue documentation
- Admin dashboard for issue management

## Tech Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Radix UI components
- TanStack Query (React Query)
- Wouter routing
- Framer Motion for animations

### Backend
- Express.js
- Node.js
- TypeScript
- Drizzle ORM
- PostgreSQL (Neon)
- Passport.js authentication
- WebSocket support

### Development
- Vite for bundling
- esbuild for production builds
- TSX for Node.js TypeScript support
- Drizzle Kit for database migrations

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- PostgreSQL database (Neon or local)

### Installation

1. Clone the repository
```bash
git clone https://github.com/mighty-baseplate/Resolve-net.git
cd resolve-net
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
```

Configure the `.env` file with your database URL and other required credentials.

4. Set up the database
```bash
npm run db:push
```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Building

Build for production:
```bash
npm run build
```

Start the production server:
```bash
npm start
```

### Type Checking

Run TypeScript type checker:
```bash
npm run check
```

## Project Structure

```
├── client/                 # React frontend
│   └── src/
│       ├── components/    # Reusable UI components
│       ├── pages/         # Page components
│       ├── hooks/         # Custom React hooks
│       ├── lib/           # Utilities and helpers
│       └── main.tsx       # Entry point
├── server/                # Express backend
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── auth.ts           # Authentication logic
│   ├── db.ts             # Database configuration
│   └── storage.ts        # File storage handling
├── shared/               # Shared types and utilities
├── drizzle.config.ts     # Database configuration
├── vite.config.ts        # Vite configuration
├── tailwind.config.ts    # Tailwind CSS configuration
└── tsconfig.json         # TypeScript configuration
```

## API Documentation

The API follows RESTful conventions. Key endpoints include:

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/issues` - List all issues
- `POST /api/issues` - Create new issue
- `GET /api/issues/:id` - Get issue details
- `PUT /api/issues/:id` - Update issue
- `DELETE /api/issues/:id` - Delete issue

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Create a feature branch from `main`
2. Make your changes with clear, descriptive commit messages
3. Ensure code passes type checking with `npm run check`
4. Submit a pull request with a description of your changes

## License

MIT License - see LICENSE file for details

## Support

For issues and questions, please open an issue on GitHub.
