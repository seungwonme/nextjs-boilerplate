# Interactive Review Plugin

Interactive markdown review with web UI for Claude Code.

## Features

- **Visual Review UI**: Opens a web browser with an interactive review interface
- **Checkbox Approvals**: Approve or reject each section of your plan/document
- **Inline Comments**: Add comments to any item
- **Keyboard Shortcuts**: `Cmd+Enter` to submit, `Esc` to cancel

## Installation

### From Marketplace

```bash
/plugin marketplace add team-attention/agents
/plugin install interactive-review@team-attention-plugins
```

### Local Development

```bash
claude --plugin-dir /path/to/plugins/interactive-review
```

## Requirements

- Python 3.9+
- `mcp` package (`pip install mcp`)

## Usage

After Claude generates a plan or document:

1. Say "review this" or "/review"
2. A browser window opens with the review UI
3. Check/uncheck items to approve or reject
4. Add comments where needed
5. Click "Submit Review" or press `Cmd+Enter`
6. Claude processes your feedback

## Review Result Format

```json
{
  "status": "submitted",
  "items": [
    {"id": "block-0", "text": "Step 1", "checked": true, "comment": "LGTM"},
    {"id": "block-1", "text": "Step 2", "checked": false, "comment": "Use different approach"}
  ],
  "summary": {
    "total": 2,
    "approved": 1,
    "rejected": 1,
    "has_comments": 2
  }
}
```

## How Feedback is Processed

| checked | comment | Meaning |
|---------|---------|---------|
| true | empty | Approved - proceed as planned |
| true | has text | Approved with note |
| false | has text | Rejected - modify per comment |
| false | empty | Rejected - remove or reconsider |
