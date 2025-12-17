# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Client Layer                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Browser   │  │   Mobile    │  │   Desktop (Future)  │  │
│  └──────┬──────┘  └──────┬──────┘  └──────────┬──────────┘  │
└─────────┼────────────────┼─────────────────────┼────────────┘
          │                │                     │
          ▼                ▼                     ▼
┌─────────────────────────────────────────────────────────────┐
│                     Next.js Application                      │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                    App Router                        │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │    │
│  │  │  Pages   │  │   API    │  │  Server Actions  │   │    │
│  │  │ (RSC)    │  │  Routes  │  │   (Future)       │   │    │
│  │  └──────────┘  └──────────┘  └──────────────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐    │
│  │                   Shared Layer                       │    │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────────────┐   │    │
│  │  │  Auth    │  │   DB     │  │    Utilities     │   │    │
│  │  │(NextAuth)│  │ (Prisma) │  │                  │   │    │
│  │  └──────────┘  └──────────┘  └──────────────────┘   │    │
│  └─────────────────────────────────────────────────────┘    │
└──────────────────────────────┬──────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                      Data Layer                              │
│  ┌─────────────────────┐  ┌─────────────────────────────┐   │
│  │    PostgreSQL       │  │      File Storage           │   │
│  │   (via Prisma)      │  │     (UploadThing)           │   │
│  └─────────────────────┘  └─────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                               │
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   Real-time Layer                            │
│  ┌─────────────────────────────────────────────────────┐    │
│  │               Socket.io Server                       │    │
│  │         (Messaging, Notifications)                   │    │
│  └─────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
```

## Component Architecture

### Page Structure
```
app/
├── (auth)/                 # Unauthenticated routes
│   ├── login/
│   └── register/
├── (main)/                 # Authenticated routes
│   ├── layout.tsx          # Shared navbar, sidebar
│   ├── feed/
│   ├── profile/
│   ├── jobs/
│   ├── messaging/
│   ├── network/
│   └── notifications/
└── api/                    # API routes
    ├── auth/
    ├── posts/
    ├── users/
    ├── jobs/
    ├── messages/
    └── connections/
```

### Component Hierarchy
```
Layout
├── Navbar
│   ├── Logo
│   ├── SearchBar
│   ├── NavLinks
│   └── UserMenu
├── Sidebar
│   ├── ProfileCard
│   └── QuickLinks
└── MainContent
    └── [Page-specific content]
```

## Data Flow

### Read Operations (Server Components)
```
Page Component (RSC)
    │
    ▼
Prisma Query
    │
    ▼
PostgreSQL
    │
    ▼
Data returned to component
    │
    ▼
Rendered HTML sent to client
```

### Write Operations (API Routes)
```
Client Component
    │
    ▼
fetch() / React Query mutation
    │
    ▼
API Route Handler
    │
    ├─► Auth Check (NextAuth)
    │
    ├─► Validation (Zod)
    │
    ▼
Prisma Mutation
    │
    ▼
PostgreSQL
    │
    ▼
Response to client
    │
    ▼
UI Update (optimistic or refetch)
```

## Database Schema (High-Level)

```
┌──────────────┐     ┌──────────────┐
│    User      │────<│   Profile    │
└──────────────┘     └──────────────┘
       │                    │
       │              ┌─────┴─────┐
       │              ▼           ▼
       │        Experience   Education
       │
       ├────────<│ Post │>────────┤
       │         └──────┘         │
       │              │           │
       │         ┌────┴────┐      │
       │         ▼         ▼      │
       │      Comment    Like     │
       │                          │
       ├──────────<│ Connection │>┘
       │
       ├────────<│ Job │
       │              │
       │         Application
       │
       └────────<│ Message │>─────┘
```

## Key Design Decisions

### 1. Server Components Default
- All pages and components are Server Components by default
- Client Components only for interactivity (forms, state, effects)
- Better performance, simpler data fetching

### 2. API Routes for Mutations
- All write operations go through API routes
- Enables:
  - Rate limiting
  - Validation
  - Audit logging
  - Easy testing

### 3. Prisma for Database
- Type-safe queries
- Easy migrations
- Great developer experience
- Connection pooling in production

### 4. JWT Session Strategy
- Stateless authentication
- Works with credentials + OAuth
- No database lookup per request

## Security Considerations

1. **Authentication**: NextAuth handles session management
2. **Authorization**: Check ownership in API routes
3. **Input Validation**: Zod schemas on all endpoints
4. **SQL Injection**: Prisma parameterizes all queries
5. **XSS**: React escapes output by default
6. **CSRF**: Next.js API routes check origin
