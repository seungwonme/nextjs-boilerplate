---
name: gemini-cli
description: Use Gemini CLI for large codebase analysis when context limits are exceeded. Use `gemini -p` with @ syntax to include files/directories when analyzing entire codebases, comparing multiple large files, understanding project-wide patterns, or verifying implementation across files exceeding 100KB total.
---

# Gemini CLI for Large Context Analysis

Use `gemini -p` when current context window is insufficient for the task.

## File and Directory Inclusion Syntax

Use `@` syntax with paths relative to current working directory:

```bash
# Single file
gemini -p "@src/main.py Explain this file's purpose"

# Multiple files
gemini -p "@package.json @src/index.js Analyze dependencies"

# Entire directory
gemini -p "@src/ Summarize the architecture"

# Multiple directories
gemini -p "@src/ @tests/ Analyze test coverage"

# Current directory
gemini -p "@./ Give me an overview of this project"
# Or use --all_files flag:
gemini --all_files -p "Analyze the project structure"
```

## Implementation Verification Examples

```bash
# Check if feature is implemented
gemini -p "@src/ @lib/ Has dark mode been implemented? Show relevant files"

# Verify authentication
gemini -p "@src/ @middleware/ Is JWT authentication implemented?"

# Check for patterns
gemini -p "@src/ Are there React hooks handling WebSocket connections?"

# Verify error handling
gemini -p "@src/ @api/ Is proper error handling implemented for all API endpoints?"

# Check security measures
gemini -p "@src/ @api/ Are SQL injection protections implemented?"

# Verify test coverage
gemini -p "@src/payment/ @tests/ Is the payment module fully tested?"
```

## When to Use

- Analyzing entire codebases or large directories
- Comparing multiple large files
- Understanding project-wide patterns or architecture
- Working with files totaling more than 100KB
- Verifying implementation across the entire codebase
