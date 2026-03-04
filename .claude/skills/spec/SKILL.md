---
name: spec
description: >
  Spec-driven development: interview the user in depth to produce a comprehensive technical spec.
  Use when the user says "spec", "스펙", "스펙 작성", "기능 정의", "요구사항 정리",
  "interview me", "spec this out", "feature spec", or wants to define a feature/project
  before implementation. Also triggers when a SPEC.md file is referenced.
---

# Spec-Driven Development

Generate a comprehensive technical spec through structured interviewing.
The spec becomes the single source of truth for implementation in a separate session.

## Workflow

1. **Read existing context** - If a spec file or description exists, read it first
2. **Interview** - Ask deep, non-obvious questions using AskUserQuestion
3. **Write spec** - Synthesize answers into a structured spec document

## Interview Process

### Setup

- If a file path is provided as argument, read it as initial context
- If no file exists, ask the user to describe the feature/project in 2-3 sentences first
- Determine the output path (default: `SPEC.md` in current working directory)

### Questioning Strategy

Ask questions using `AskUserQuestion`. Group related questions (2-4 per round) to maintain flow.
Continue until all critical areas are covered - this may take 10-40+ questions depending on scope.

**Question quality rules:**
- Never ask questions Claude can answer itself (e.g., "Should we use REST or GraphQL?" without context)
- Never ask questions with obvious answers from the provided context
- Focus on decisions only the user can make: business logic, preferences, constraints, priorities
- Each question should reveal information that materially changes the implementation

**Question categories to cover (adapt based on project type):**

1. **Core intent** - What problem does this solve? Who is it for? What does success look like?
2. **Scope boundaries** - What is explicitly NOT included? What can be deferred?
3. **User flows** - Happy path, error paths, edge cases the user cares about
4. **Data & state** - What data exists? What needs to persist? Relationships?
5. **Technical constraints** - Existing stack, performance requirements, integrations
6. **UI/UX decisions** - Interaction patterns, visual hierarchy, responsive behavior
7. **Tradeoffs** - Speed vs quality, flexibility vs simplicity, build vs buy
8. **Failure modes** - What happens when things go wrong? Recovery strategies?
9. **Security & access** - Who can do what? Data sensitivity?
10. **Rollout** - Phased delivery? Feature flags? Migration needs?

Skip categories that don't apply. Dive deeper into categories where the user's answers reveal complexity or ambiguity.

### Adaptive Depth

- If the user gives a short answer, probe deeper with follow-ups
- If the user gives a detailed answer, move to the next area
- If the user says "you decide" or "up to you", make a reasonable default and note it in the spec
- If answers reveal contradictions, surface them explicitly

## Writing the Spec

After interviewing is complete:

1. Read `references/spec-template.md` for the output structure
2. Adapt sections based on the project type (not all sections apply to every project)
3. Write the spec to the agreed output path
4. Include a "Decisions made by Claude" section for any defaults chosen without explicit user input
5. Include "Open Questions" for unresolved items

**Writing rules:**
- Be specific enough that a fresh Claude session can implement without asking clarifying questions
- Include concrete examples for ambiguous requirements
- Use bullet points and tables over prose
- Keep the spec under 500 lines - link to separate docs for lengthy details
