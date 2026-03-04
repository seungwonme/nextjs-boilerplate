---
name: vibe-coding
description: AI-assisted development workflow with TDD, context management, and incremental implementation. Use when developing features with AI assistance, managing code context for AI tools, implementing features step-by-step, or when encountering repeated errors needing web search for resolution.
---

# Vibe Coding Workflow

## General Coding

- Write clear, concise, maintainable code
- Avoid unnecessary abstraction
- Add JSDoc/docstrings for public APIs and complex logic
- Handle errors explicitly with user-friendly messages
- Consider security (SQL injection, XSS, API key exposure)
- Choose efficient algorithms and data structures

## Test-Driven Development

1. Write comprehensive tests first (positive, negative, edge cases)
2. Implement minimum code to pass tests
3. On failure: **web search or official docs before each fix attempt**
4. Max 3 attempts on same error - ask user for help if stuck

## Feature Implementation Workflow

### 1. Planning
- Analyze requirements
- Present implementation plan to user
- Get approval before proceeding

### 2. Step-by-Step Implementation
- Break into logical small units
- Add logging (console.group/log) for debugging
- Test each step before proceeding
- Remove debug logs after stabilization

## Context Management

### File Documentation (First 100 Lines)
```tsx
/**
 * @file UserProfile.tsx
 * @description User profile page component
 *
 * Main features:
 * 1. Display user info (name, email, avatar)
 * 2. Edit profile
 * 3. Upload profile image
 *
 * Core logic:
 * - Supabase Auth for user authentication
 * - React Query for data fetching/caching
 * - React Hook Form for form validation
 *
 * @dependencies
 * - @supabase/ssr
 * - @tanstack/react-query
 * - react-hook-form
 */
```

### Organization
- Keep files under 500 lines
- Follow existing directory structure and naming conventions

## Refactoring

- Incremental, small changes
- Get user approval for large refactors
- Maintain existing code style
- Run tests before and after

## Error Resolution Loop

```
1. Encounter error
2. WebSearchTool / context7 MCP for solution
3. Apply fix
4. Test
5. If same error after 3 attempts -> ask user for help
```

## Quality Automation

When linter/static analyzer shows errors:
1. Search for solution (web/docs)
2. Apply fix
3. Repeat until clean
4. Max 3 attempts per error type
