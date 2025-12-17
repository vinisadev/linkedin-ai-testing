# Testing Standards

## Testing Stack

- **Unit/Integration**: Vitest + Testing Library
- **E2E**: Playwright (when needed)
- **Mocking**: vitest built-in mocks

## Test File Location

Place tests next to the code they test:

```
src/
├── components/
│   └── feed/
│       ├── post-card.tsx
│       └── post-card.test.tsx
├── lib/
│   ├── utils.ts
│   └── utils.test.ts
└── app/
    └── api/
        └── posts/
            ├── route.ts
            └── route.test.ts
```

## Test Structure

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

describe("ComponentName", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("when condition", () => {
    it("should do expected behavior", async () => {
      // Arrange
      const props = { ... };

      // Act
      render(<Component {...props} />);
      await userEvent.click(screen.getByRole("button"));

      // Assert
      expect(screen.getByText("Expected")).toBeInTheDocument();
    });
  });
});
```

## Component Testing

### Basic Render Test
```tsx
import { render, screen } from "@testing-library/react";
import { PostCard } from "./post-card";

const mockPost = {
  id: "1",
  content: "Test post content",
  createdAt: new Date("2024-01-01"),
  author: { name: "John Doe", headline: "Developer" },
  _count: { likes: 5, comments: 2 },
};

describe("PostCard", () => {
  it("renders post content", () => {
    render(<PostCard post={mockPost} />);

    expect(screen.getByText("Test post content")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("5 likes")).toBeInTheDocument();
  });

  it("calls onLike when like button clicked", async () => {
    const onLike = vi.fn();
    render(<PostCard post={mockPost} onLike={onLike} />);

    await userEvent.click(screen.getByRole("button", { name: /like/i }));

    expect(onLike).toHaveBeenCalledTimes(1);
  });
});
```

### Testing with Providers
```tsx
import { SessionProvider } from "next-auth/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });

  return render(
    <SessionProvider session={null}>
      <QueryClientProvider client={queryClient}>
        {ui}
      </QueryClientProvider>
    </SessionProvider>
  );
}
```

## API Route Testing

```tsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { POST, GET } from "./route";
import { db } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  db: {
    post: {
      create: vi.fn(),
      findMany: vi.fn(),
    },
  },
}));

vi.mock("next-auth", () => ({
  getServerSession: vi.fn(),
}));

describe("POST /api/posts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("creates a post when authenticated", async () => {
    const { getServerSession } = await import("next-auth");
    vi.mocked(getServerSession).mockResolvedValue({
      user: { id: "user-1", name: "Test" },
    });

    vi.mocked(db.post.create).mockResolvedValue({
      id: "post-1",
      content: "Hello",
      authorId: "user-1",
      createdAt: new Date(),
      updatedAt: new Date(),
      image: null,
    });

    const req = new Request("http://localhost/api/posts", {
      method: "POST",
      body: JSON.stringify({ content: "Hello" }),
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data.content).toBe("Hello");
  });

  it("returns 401 when not authenticated", async () => {
    const { getServerSession } = await import("next-auth");
    vi.mocked(getServerSession).mockResolvedValue(null);

    const req = new Request("http://localhost/api/posts", {
      method: "POST",
      body: JSON.stringify({ content: "Hello" }),
    });

    const response = await POST(req);

    expect(response.status).toBe(401);
  });
});
```

## Utility Function Testing

```tsx
import { describe, it, expect } from "vitest";
import { cn, formatDate, getInitials } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-2", "py-2")).toBe("px-2 py-2");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden")).toBe("base");
    expect(cn("base", true && "visible")).toBe("base visible");
  });
});

describe("getInitials", () => {
  it("returns initials from full name", () => {
    expect(getInitials("John Doe")).toBe("JD");
    expect(getInitials("Jane")).toBe("J");
  });
});
```

## Running Tests

```bash
# Run all tests
npm run test

# Run in watch mode
npm run test -- --watch

# Run specific file
npm run test -- post-card.test.tsx

# Run with coverage
npm run test:coverage
```

## Coverage Requirements

Aim for these minimums:

- **Utilities**: 90%+
- **Components**: 80%+
- **API Routes**: 80%+
- **Hooks**: 80%+

## What to Test

### DO Test
- User interactions
- Conditional rendering
- Error states
- Loading states
- API response handling
- Business logic in utilities

### DON'T Test
- Implementation details
- Third-party library internals
- Static markup
- CSS classes
