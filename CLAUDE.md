# LinkedIn Clone - Project Configuration

## Project Overview

A full-featured LinkedIn clone built with modern web technologies. This is a professional networking platform with user profiles, connections, feed posts, job listings, and real-time messaging.

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js (credentials + OAuth)
- **Styling**: Tailwind CSS
- **State Management**: Zustand + React Query
- **Real-time**: Socket.io (messaging)
- **File Uploads**: UploadThing
- **Testing**: Vitest + Testing Library + Playwright

## Project Structure

```
linkedin-clone/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages (login, register)
│   │   ├── (main)/            # Authenticated pages
│   │   │   ├── feed/          # Home feed
│   │   │   ├── profile/       # User profiles
│   │   │   ├── jobs/          # Job listings
│   │   │   ├── messaging/     # Direct messages
│   │   │   ├── network/       # Connections
│   │   │   └── notifications/ # Notifications
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── ui/               # Reusable UI components
│   │   ├── layout/           # Layout components
│   │   ├── feed/             # Feed components
│   │   ├── profile/          # Profile components
│   │   ├── jobs/             # Jobs components
│   │   ├── messaging/        # Messaging components
│   │   └── network/          # Network components
│   ├── lib/                  # Utilities and config
│   ├── hooks/                # Custom React hooks
│   ├── store/                # Zustand stores
│   └── types/                # TypeScript types
├── prisma/
│   └── schema.prisma         # Database schema
├── docs/                     # Documentation
└── .claude/                  # Claude AI configuration
```

## Key Files

- `src/lib/db.ts` - Prisma client singleton
- `src/lib/auth.ts` - NextAuth configuration
- `src/lib/utils.ts` - Utility functions
- `prisma/schema.prisma` - Database schema

## Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Production build
npm run start            # Start production server

# Database
npm run db:generate      # Generate Prisma client
npm run db:push          # Push schema to database
npm run db:migrate       # Run migrations
npm run db:studio        # Open Prisma Studio
npm run db:seed          # Seed database

# Testing
npm run test             # Run tests
npm run test:ui          # Tests with UI
npm run test:coverage    # Coverage report

# Code Quality
npm run lint             # Run ESLint
npm run lint:fix         # Fix lint issues
npm run format           # Format with Prettier
npm run typecheck        # TypeScript check
```

## Development Guidelines

### Code Style

- Use functional components with hooks
- Prefer server components; use "use client" only when necessary
- Use TypeScript strict mode - no `any` types
- Follow Tailwind CSS class ordering (prettier-plugin-tailwindcss)
- Use absolute imports with `@/` prefix

### Component Patterns

```tsx
// Server Component (default)
export default async function Page() {
  const data = await fetchData();
  return <div>{/* ... */}</div>;
}

// Client Component (when needed)
"use client";
export function InteractiveComponent() {
  const [state, setState] = useState();
  return <div>{/* ... */}</div>;
}
```

### API Routes

- Use route handlers in `app/api/`
- Validate input with Zod schemas
- Return appropriate HTTP status codes
- Handle errors consistently

### Database Access

- Always use the shared Prisma client from `@/lib/db`
- Use transactions for multi-step operations
- Include appropriate indexes for query performance

## Environment Variables

Required environment variables (see `.env.example`):

```
DATABASE_URL           # PostgreSQL connection string
NEXTAUTH_URL          # App URL (http://localhost:3000)
NEXTAUTH_SECRET       # Session encryption key
```

Optional:

```
GOOGLE_CLIENT_ID      # Google OAuth
GOOGLE_CLIENT_SECRET
GITHUB_CLIENT_ID      # GitHub OAuth
GITHUB_CLIENT_SECRET
UPLOADTHING_SECRET    # File uploads
UPLOADTHING_APP_ID
```

## Feature Modules

### 1. Profiles & Connections
- User profiles with experience, education, skills
- Connection requests (pending/accepted/rejected)
- Network graph visualization

### 2. Feed & Posts
- Text posts with optional images
- Likes and comments
- Infinite scroll pagination

### 3. Jobs & Applications
- Job listings with filters
- Job applications with cover letters
- Saved jobs

### 4. Messaging
- Real-time direct messaging
- Conversation threads
- Unread message indicators

## Off-Limits

Do not modify without explicit discussion:

- `prisma/schema.prisma` - Schema changes require migration planning
- `src/lib/auth.ts` - Auth config is security-critical
- `.env` files - Never commit secrets

## Current Status

- [x] Project scaffolding
- [x] Authentication setup
- [x] Database schema
- [x] Basic UI components
- [ ] Feed functionality
- [ ] Profile management
- [ ] Connections system
- [ ] Job listings
- [ ] Messaging system
- [ ] Notifications

## Agent Instructions

When working on this codebase:

1. **Read before writing** - Always understand existing patterns first
2. **Type safety** - No `any` types, use proper TypeScript
3. **Existing patterns** - Follow established component and API patterns
4. **Test coverage** - Write tests for new features
5. **Small PRs** - Keep changes focused and reviewable
