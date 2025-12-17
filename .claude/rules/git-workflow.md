# Git Workflow

## Branch Naming

```
feature/   - New features       (feature/user-profiles)
fix/       - Bug fixes          (fix/login-redirect)
refactor/  - Code refactoring   (refactor/api-structure)
docs/      - Documentation      (docs/api-reference)
test/      - Test additions     (test/auth-coverage)
```

## Commit Messages

Follow conventional commits:

```
type(scope): description

[optional body]

[optional footer]
```

### Types
- `feat` - New feature
- `fix` - Bug fix
- `refactor` - Code change that neither fixes bug nor adds feature
- `docs` - Documentation only
- `test` - Adding tests
- `chore` - Maintenance tasks
- `style` - Formatting, missing semicolons, etc.

### Examples

```bash
# Feature
feat(feed): add infinite scroll to post feed

# Bug fix
fix(auth): resolve session expiration redirect loop

# Refactor
refactor(api): extract pagination logic to shared utility

# With body
feat(jobs): implement job search filters

Add support for filtering jobs by:
- Job type (full-time, part-time, contract)
- Remote work preference
- Experience level

Closes #42
```

## Workflow

### 1. Start New Work

```bash
# Update main branch
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/description
```

### 2. Make Changes

```bash
# Stage changes
git add .

# Commit with message
git commit -m "feat(scope): description"
```

### 3. Keep Branch Updated

```bash
# Rebase on main periodically
git fetch origin
git rebase origin/main
```

### 4. Push and Create PR

```bash
# Push branch
git push -u origin feature/description

# Create PR via GitHub CLI
gh pr create --title "feat: description" --body "..."
```

## Pre-Commit Checks

Before committing, ensure:

```bash
# No type errors
npm run typecheck

# No lint errors
npm run lint

# Tests pass
npm run test

# Code is formatted
npm run format
```

## PR Guidelines

### Title
- Use conventional commit format
- Be descriptive but concise

### Description
Include:
- What changed and why
- How to test
- Screenshots (for UI changes)
- Related issues

### Template

```markdown
## Summary
Brief description of changes.

## Changes
- Added X
- Fixed Y
- Refactored Z

## Test Plan
- [ ] Manual testing steps
- [ ] Automated tests added/updated

## Screenshots
(If applicable)

## Related Issues
Closes #123
```

## Code Review

### Reviewer Checklist
- [ ] Code follows project style
- [ ] Tests are adequate
- [ ] No security issues
- [ ] Performance is acceptable
- [ ] Documentation updated if needed

### Addressing Feedback
- Push new commits, don't force push during review
- Mark conversations as resolved when addressed
- Re-request review when ready

## Merging

1. Squash and merge for feature branches
2. Use meaningful commit message
3. Delete branch after merge

## Hotfixes

For urgent production fixes:

```bash
# Branch from main
git checkout main
git checkout -b fix/critical-issue

# Make fix, test, commit
git push -u origin fix/critical-issue

# Create PR with "hotfix" label
gh pr create --label hotfix
```
