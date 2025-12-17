# Agent Handoff Protocol

## When to Create a Handoff

Create a handoff document when:

1. **Completing a significant feature** - New functionality that others need context on
2. **Hitting a blocker** - Need different expertise to continue
3. **Switching focus** - Moving to a different part of the codebase
4. **End of session** - Work is paused but not complete

## Handoff Document Structure

Create files in `docs/handoffs/` with format: `YYYY-MM-DD-description.md`

```markdown
# Handoff: [Brief Description]

**Date**: YYYY-MM-DD
**From**: [Agent/Role]
**To**: [Target Agent/Role]
**Status**: [In Progress | Blocked | Ready for Review | Complete]

## Summary
One paragraph describing what was done.

## Changes Made
- List of files created/modified
- New dependencies added
- Environment variables added

## Current State
- What works
- What doesn't work yet
- Known issues

## Next Steps
1. Specific task to do next
2. Another specific task
3. ...

## Blockers (if any)
- Description of what's blocking progress
- What's needed to unblock

## Context for Continuation
- Key decisions made and why
- Patterns to follow
- Files to reference

## Testing Notes
- How to test the changes
- What test coverage exists
- What needs manual testing
```

## Example Handoffs

### Build → Verify Handoff

```markdown
# Handoff: Feed Feature Implementation

**Date**: 2024-01-15
**From**: Build Agent
**To**: Verify Agent
**Status**: Ready for Review

## Summary
Implemented the main feed functionality including post creation,
display, likes, and comments.

## Changes Made
- `src/app/(main)/feed/page.tsx` - Feed page with infinite scroll
- `src/components/feed/*` - Feed components
- `src/app/api/posts/route.ts` - Posts CRUD API
- `src/app/api/posts/[postId]/like/route.ts` - Like toggling

## Current State
- Feed displays posts with pagination
- Users can create text posts
- Like functionality works
- Comments not yet implemented

## Next Steps for Verify Agent
1. Run full test suite
2. Check type coverage
3. Verify pagination edge cases
4. Test like/unlike toggling
5. Check mobile responsiveness

## Testing Notes
- Use `npm run test -- feed` to run feed tests
- Create test user with `npm run db:seed`
- Test with empty state (new user)
```

### Verify → Build Handoff

```markdown
# Handoff: Verification Issues Found

**Date**: 2024-01-15
**From**: Verify Agent
**To**: Build Agent
**Status**: Blocked

## Summary
Found 3 issues during verification that need fixes.

## Issues Found

### 1. Type Error in PostCard
**File**: `src/components/feed/post-card.tsx:45`
**Error**: `Type 'undefined' is not assignable to type 'string'`
**Fix**: Add null check for `post.author.headline`

### 2. Failing Test
**File**: `src/app/api/posts/route.test.ts`
**Test**: "returns 400 for empty content"
**Error**: Returns 500 instead of 400
**Fix**: Add validation before database call

### 3. Lint Warning
**File**: `src/components/feed/create-post.tsx`
**Warning**: React Hook useEffect has missing dependency
**Fix**: Add `userId` to dependency array

## Verification Results
- TypeScript: 1 error
- Tests: 14 passed, 1 failed
- Lint: 1 warning
- Build: Blocked by type error
```

## Status Definitions

| Status | Meaning |
|--------|---------|
| In Progress | Work is ongoing |
| Blocked | Cannot continue without help |
| Ready for Review | Needs verification/review |
| Complete | Work is finished |

## Handoff Best Practices

1. **Be specific** - Include file paths and line numbers
2. **Document decisions** - Explain why, not just what
3. **List dependencies** - What needs to work for this to work
4. **Include test instructions** - How to verify the work
5. **Note edge cases** - Things that might break
6. **Link related issues** - GitHub issues, prior handoffs
