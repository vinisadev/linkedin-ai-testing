# ADR 001: Technology Stack Selection

## Status
Accepted

## Context
We need to select a technology stack for building a LinkedIn clone that supports:
- User profiles and connections
- Activity feed with posts
- Job listings and applications
- Real-time messaging
- Self-hosted deployment

## Decision

### Frontend Framework: Next.js 14+ (App Router)
**Rationale**:
- Full-stack capabilities reduce infrastructure complexity
- Server Components improve performance
- Built-in API routes
- Excellent TypeScript support
- Large ecosystem and community

### Database: PostgreSQL + Prisma
**Rationale**:
- PostgreSQL handles complex relational data well (social graphs, etc.)
- Prisma provides type-safe queries and easy migrations
- Battle-tested at scale
- Good support for full-text search (for job search)

### Authentication: NextAuth.js
**Rationale**:
- Native Next.js integration
- Supports credentials + OAuth
- Session management out of the box
- Extensible adapter system

### Styling: Tailwind CSS
**Rationale**:
- Rapid development
- Consistent design system
- No CSS-in-JS runtime cost
- Great developer experience

### State Management: Zustand + React Query
**Rationale**:
- Zustand for client-side UI state (simple, lightweight)
- React Query for server state (caching, refetching)
- Avoids Redux complexity

### Real-time: Socket.io
**Rationale**:
- Mature, reliable library
- Good fallback mechanisms
- Works with self-hosted deployment
- Supports rooms for conversations

## Alternatives Considered

| Category | Considered | Why Not Chosen |
|----------|------------|----------------|
| Framework | Remix | Less mature, smaller ecosystem |
| Database | MongoDB | Relational data fits SQL better |
| Auth | Clerk | Adds external dependency, cost |
| Styling | Chakra UI | More opinionated, larger bundle |

## Consequences

### Positive
- Fast development velocity
- Type safety throughout the stack
- Good performance characteristics
- Easy to deploy to VPS

### Negative
- Next.js App Router still evolving
- Prisma adds some overhead vs raw SQL
- Socket.io requires separate process for scaling

## References
- Next.js docs: https://nextjs.org/docs
- Prisma docs: https://www.prisma.io/docs
- NextAuth docs: https://next-auth.js.org
