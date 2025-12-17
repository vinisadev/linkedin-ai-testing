# Code Style Rules

## TypeScript

- **Strict mode**: Always enabled, no `any` types
- **Explicit return types**: Required for exported functions
- **Interfaces over types**: For object shapes
- **Readonly**: Use for immutable data

```typescript
// Good
interface User {
  readonly id: string;
  name: string;
  email: string;
}

export function getUser(id: string): Promise<User | null> {
  // ...
}

// Bad
type User = { id: any; name: string; }
export function getUser(id) { ... }
```

## React Components

### File Naming
- Components: `PascalCase.tsx` (e.g., `PostCard.tsx`)
- Hooks: `use-kebab-case.ts` (e.g., `use-posts.ts`)
- Utilities: `kebab-case.ts` (e.g., `format-date.ts`)

### Component Structure
```tsx
// 1. Imports
import { useState } from "react";
import { cn } from "@/lib/utils";

// 2. Types
interface PostCardProps {
  post: Post;
  onLike?: () => void;
}

// 3. Component
export function PostCard({ post, onLike }: PostCardProps) {
  // 4. Hooks
  const [isLiked, setIsLiked] = useState(false);

  // 5. Handlers
  const handleLike = () => {
    setIsLiked(true);
    onLike?.();
  };

  // 6. Render
  return (
    <article className="card">
      {/* ... */}
    </article>
  );
}
```

### Server vs Client Components
- Default to Server Components
- Use "use client" only for:
  - useState, useEffect, other hooks
  - Event handlers (onClick, onChange)
  - Browser APIs

## Tailwind CSS

### Class Ordering
Handled by prettier-plugin-tailwindcss automatically.

### Custom Classes
Use component classes defined in `globals.css`:
- `.btn-primary` - Primary button
- `.btn-secondary` - Secondary button
- `.card` - Card container
- `.input` - Form input

### Conditional Classes
```tsx
import { cn } from "@/lib/utils";

<button className={cn(
  "btn-primary",
  isDisabled && "opacity-50 cursor-not-allowed",
  size === "large" && "py-4 px-6"
)}>
```

## Imports

### Order
1. React/Next.js
2. External libraries
3. Internal modules (@/)
4. Relative imports
5. Types

```tsx
import { useState } from "react";
import Link from "next/link";

import { formatDate } from "date-fns";
import { z } from "zod";

import { db } from "@/lib/db";
import { cn } from "@/lib/utils";

import { PostCard } from "./post-card";

import type { Post } from "@prisma/client";
```

### Path Aliases
Always use `@/` for imports from `src/`:
```tsx
// Good
import { db } from "@/lib/db";

// Bad
import { db } from "../../../lib/db";
```

## Error Handling

```tsx
// API Routes
try {
  const result = await db.post.create({ ... });
  return NextResponse.json(result, { status: 201 });
} catch (error) {
  if (error instanceof z.ZodError) {
    return NextResponse.json({ error: error.errors }, { status: 400 });
  }
  console.error("Failed to create post:", error);
  return NextResponse.json({ error: "Internal error" }, { status: 500 });
}
```

## Comments

- Avoid obvious comments
- Use JSDoc for complex functions
- TODO format: `// TODO: description`

```tsx
/**
 * Calculates mutual connections between two users.
 * Uses recursive CTE for efficient graph traversal.
 */
export async function getMutualConnections(
  userId1: string,
  userId2: string
): Promise<User[]> {
  // ...
}
```
