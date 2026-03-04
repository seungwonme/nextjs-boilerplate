---
name: tdd
description: Test-Driven Development following Kent Beck's TDD and Tidy First principles. Use when implementing features with test-first approach, following Red-Green-Refactor cycle, or separating structural changes from behavioral changes in commits.
---

# Test-Driven Development

Follow the TDD cycle: **Red -> Green -> Refactor**

## Core Principles

1. Write the simplest failing test first
2. Implement minimum code to make tests pass
3. Refactor only after tests are passing
4. Separate structural changes from behavioral changes

## TDD Workflow

1. Write a failing test (Red)
2. Write just enough code to pass (Green)
3. Refactor while keeping tests green
4. Repeat

```typescript
// 1. Write failing test
test('shouldSumTwoPositiveNumbers', () => {
  expect(sum(2, 3)).toBe(5);
});

// 2. Write minimum code to pass
function sum(a: number, b: number): number {
  return a + b;
}

// 3. Refactor if needed (tests still pass)
```

## Tidy First Approach

Separate commits into two types:

### Structural Changes (First)
- Renaming, extracting methods, moving code
- No behavior change
- Run tests before AND after

### Behavioral Changes (Second)
- Adding or modifying functionality
- Commit separately from structural changes

## Commit Discipline

Only commit when:
1. ALL tests pass
2. ALL linter warnings resolved
3. Single logical unit of work
4. Message states if structural or behavioral

## Code Quality Standards

- Eliminate duplication ruthlessly
- Express intent through naming
- Make dependencies explicit
- Keep methods small (single responsibility)
- Minimize state and side effects
- Use simplest solution that works

## Refactoring Guidelines

- Only refactor in Green phase
- Use established refactoring patterns
- One refactoring at a time
- Run tests after each step
