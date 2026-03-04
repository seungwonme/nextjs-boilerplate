---
name: interactive-review
description: "Interactive markdown review with web UI. Use when user says 'review this', 'check this plan', '피드백', '검토해줘', 'review', or specifies a file path to review. Opens a browser-based review interface with checkboxes and inline comments."
---

# Interactive Review Skill

Open an interactive web UI where users review content with checkboxes and comments.

## How It Works

1. Determine the content source:
   - **File path specified**: Use `Read` tool to get file contents
   - **Content provided directly**: Use that content as-is
   - **Otherwise**: Collect the most recent relevant content from the conversation
2. Call `mcp__interactive_review__start_review` with the content
3. Browser window opens automatically with the review UI
4. User reviews each item (check/uncheck, add comments)
5. User clicks Submit
6. Process the feedback and respond accordingly

## Content Sources (Priority Order)

1. **Explicit file path**: "review /path/to/file.md" or "이 파일 리뷰해줘: README.md"
2. **Direct content**: User provides or references specific content
3. **Conversation context**: Extract relevant content from recent conversation

## Usage

```
# If file path is specified, read it first:
Read({ "file_path": "/path/to/file.md" })

# Then start the review:
mcp__interactive_review__start_review({
  "content": "<content from file or conversation>",
  "title": "<descriptive title>"
})
```

## Processing Results

The tool returns JSON with review items:

| checked | comment | Action |
|---------|---------|--------|
| true | empty | Approved - proceed as planned |
| true | has text | Approved with note - consider the feedback |
| false | has text | Rejected - modify according to comment |
| false | empty | Rejected - remove or reconsider this item |

## Response Template

After receiving feedback:

```
## Review Summary

**Approved**: X items
**Needs revision**: Y items

### Items requiring changes:
- [Item]: [User's comment]

Would you like me to:
1. Proceed with approved items
2. Revise the rejected items based on feedback
3. Both - revise then proceed
```
