---
name: session-wrap
description: "Session wrap-up with multi-agent analysis. Use when the user says 'wrap', '/wrap', 'session wrap', 'end session', 'what should I commit', or wants to analyze completed work before ending a coding session. Suggests documentation updates, automation opportunities, and follow-up tasks."
---

# Session Wrap-up

Comprehensive session wrap-up workflow with multi-agent analysis.

## Quick Usage

- `/wrap` - Interactive session wrap-up (full workflow)
- `/wrap [message]` - Quick commit with provided message

## Execution Flow

```
1. Check Git Status
2. Phase 1: 4 Analysis Agents (Parallel)
   ┌─────────────┬──────────────┐
   │ doc-updater  │ automation-  │
   │              │ scout        │
   ├─────────────┼──────────────┤
   │ learning-    │ followup-    │
   │ extractor    │ suggester    │
   └─────────────┴──────────────┘
3. Phase 2: duplicate-checker (Sequential)
4. Integrate Results & AskUserQuestion
5. Execute Selected Actions
```

## Step 1: Check Git Status

```bash
git status --short
git diff --stat HEAD~3 2>/dev/null || git diff --stat
```

## Step 2: Phase 1 - Analysis Agents (Parallel)

Prepare a session summary, then execute 4 agents in parallel (single message with 4 Task calls).

### Session Summary (provide to all agents)

```
Session Summary:
- Work: [Main tasks performed]
- Files: [Created/modified files]
- Decisions: [Key decisions made]
```

### Agent Roles

| Agent | Role | Output |
|-------|------|--------|
| **doc-updater** | Analyze CLAUDE.md/context.md updates | Specific content to add |
| **automation-scout** | Detect automation patterns | Skill/command/agent suggestions |
| **learning-extractor** | Extract learning points | TIL format summary |
| **followup-suggester** | Suggest follow-up tasks | Prioritized task list |

## Step 3: Phase 2 - Validation Agent (Sequential)

Run after Phase 1 completes. Feed all Phase 1 results to **duplicate-checker**:

1. Complete duplicate → Recommend skip
2. Partial duplicate → Suggest merge approach
3. No duplicate → Approve for addition

## Step 4: Integrate Results

Present combined analysis:

```markdown
## Wrap Analysis Results

### Documentation Updates
[doc-updater summary + duplicate-checker feedback]

### Automation Suggestions
[automation-scout summary + duplicate-checker feedback]

### Learning Points
[learning-extractor summary]

### Follow-up Tasks
[followup-suggester summary]
```

## Step 5: Action Selection

```
AskUserQuestion(
    question: "Which actions would you like to perform?",
    multiSelect: true,
    options: [
        "Create commit (Recommended)",
        "Update CLAUDE.md",
        "Create automation",
        "Skip"
    ]
)
```

## Step 6: Execute Selected Actions

Execute only the actions selected by user.

## When to Skip

- Very short session with trivial changes
- Only reading/exploring code
- Quick one-off question answered

## Additional Resources

- See `references/multi-agent-patterns.md` for detailed orchestration patterns
- Agent definitions in `agents/` directory
