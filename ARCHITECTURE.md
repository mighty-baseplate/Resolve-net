# CivicEngage Architecture

This document describes the architecture and design decisions of CivicEngage.

## Overview

CivicEngage is a full-stack web application built with modern technologies:

- **Frontend**: React 18 with TypeScript, Vite, Tailwind CSS, and Radix UI
- **Backend**: Express.js with Node.js and TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with local strategy
- **Real-time**: WebSocket support for live updates

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        User Browser                          │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
        ▼            ▼            ▼
    HTTP/REST    WebSocket    Static Assets
        │            │            │
┌───────┴────────────┴────────────┴──────────────┐
│                                                 │
│          Express.js Server (Node.js)           │
│                                                 │
│  ├─ Authentication (Passport.js)               │
│  ├─ API Routes                                 │
│  ├─ WebSocket Handler                         │
│  ├─ File Upload Handler                       │
│  └─ Vite Dev Server (development only)        │
│                                                 │
└────────────────┬────────────────────────────────┘
                 │
                 ▼
         ┌───────────────┐
         │ PostgreSQL    │
         │ Database      │
         │ (Neon)        │
         └───────────────┘
```

## Project Structure

### `/client` - Frontend Application

```
client/
├── src/
│   ├── components/       # Reusable React components
│   │   ├── ui/          # Radix UI wrapper components
│   │   ├── forms/       # Form components
│   │   └── ...
│   ├── pages/           # Full page components
│   ├── hooks/           # Custom React hooks
│   │   ├── use-auth.tsx     # Authentication hook
│   │   ├── use-mobile.tsx   # Mobile detection
│   │   └── use-toast.ts     # Toast notifications
│   ├── lib/             # Utilities
│   │   ├── queryClient.ts   # React Query setup
│   │   ├── protected-route.tsx
│   │   └── utils.ts
│   ├── index.css        # Global styles
│   └── main.tsx         # React entry point
├── vite.config.ts
└── tsconfig.json
```

### `/server` - Backend Application

```
server/
├── index.ts             # Server entry point
├── routes.ts            # API route definitions
├── auth.ts              # Authentication logic
├── db.ts                # Database configuration
├── storage.ts           # File storage handling
└── vite.ts              # Vite integration utilities
```

### `/shared` - Shared Code

```
shared/
└── schema.ts            # Shared types and Zod schemas
```

## Data Flow

### User Authentication Flow

1. User submits login form
2. Frontend sends credentials to `/api/auth/login`
3. Backend validates against database using Passport.js
4. Session is created and stored
5. Client receives session cookie
6. Subsequent requests include cookie automatically
7. Backend validates session on protected routes

### Issue Reporting Flow

1. User fills issue form with location, description, and images
2. Frontend uploads images via multipart/form-data
3. Backend stores images in `/uploads` directory
4. Backend creates issue record in database
5. WebSocket notifies connected clients of new issue
6. Client receives update and refreshes issue list

### Real-time Updates

- WebSocket connection established on page load
- Server broadcasts issue updates to all connected clients
- Clients update UI without requiring page refresh

## Technology Decisions

### React + TypeScript
- Strong type safety prevents runtime errors
- Better IDE support and developer experience
- Self-documenting code through types

### Vite
- Fast development server with Hot Module Replacement (HMR)
- Optimized production builds
- Better than Create React App for modern development

### Drizzle ORM
- Type-safe SQL queries
- Better than other ORMs for small-to-medium projects
- Less runtime overhead

### Tailwind CSS
- Utility-first CSS for rapid UI development
- Consistent design system
- Optimized for production builds

### Express.js
- Lightweight and flexible
- Excellent ecosystem
- Perfect for server-side rendering and static file serving

### Passport.js
- Industry-standard authentication library
- Extensible strategy system
- Good for local and OAuth authentication

## Database Schema

The database is managed with Drizzle ORM migrations. Key tables include:

- `users` - User accounts and authentication
- `issues` - Reported civic issues
- `votes` - Community votes on issues
- `comments` - User comments on issues
- `attachments` - File attachments for issues

See `shared/schema.ts` for complete schema definition.

## Build Process

### Development

```bash
npm run dev
```

- Vite dev server runs on client with HMR
- Express server restarts on file changes
- Browser automatically refreshes on updates

### Production Build

```bash
npm run build
```

1. Vite bundles React application to `dist/public`
2. esbuild bundles Express server to `dist/index.js`
3. Both are optimized and minified
4. Single `npm start` command runs production server

## Performance Considerations

- Client-side code splitting with Vite
- Database query optimization with Drizzle
- WebSocket for real-time updates instead of polling
- Lazy loading of components with React
- Responsive image handling with proper formats

## Security Considerations

- Input validation using Zod schemas
- SQL injection prevention via Drizzle ORM
- CSRF protection via sessions
- File upload validation
- Environment variable management
- Secure session storage

## Future Improvements

- Add unit and integration tests
- Implement caching strategies
- Add monitoring and logging
- Scale WebSocket with Redis adapter
- Implement email notifications
- Add admin dashboard features
