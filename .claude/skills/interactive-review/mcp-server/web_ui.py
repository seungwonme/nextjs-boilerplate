"""
Web UI Generator for Interactive Review

Generates a self-contained HTML file with embedded CSS and JavaScript
for reviewing markdown content with line-level comments (GitHub-style).
Uses marked.js for markdown rendering.
"""

import json
from typing import List, Dict, Any
from dataclasses import dataclass, asdict


@dataclass
class Block:
    """Represents a reviewable block in the markdown content."""
    id: str
    type: str  # heading, list-item, paragraph, code
    text: str
    level: int = 0  # for headings
    raw: str = ""  # original markdown


def parse_markdown(content: str) -> List[Block]:
    """
    Parse markdown content into lines for line-level commenting.
    Returns list of Block objects, one per line.
    """
    blocks = []
    lines = content.split('\n')

    for i, line in enumerate(lines):
        blocks.append(Block(
            id=f"line-{i}",
            type="line",
            text=line,
            level=0,
            raw=line
        ))

    return blocks


def generate_html(title: str, content: str, blocks: List[Block], server_port: int) -> str:
    """Generate the complete HTML for the review UI with marked.js and line comments."""

    # Escape content for JSON embedding
    content_json = json.dumps(content)
    lines_json = json.dumps([{"id": b.id, "text": b.text, "lineNum": i} for i, b in enumerate(blocks)])

    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - Interactive Review</title>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/lib/highlight.min.js"></script>
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/highlight.js@11.9.0/styles/github-dark.min.css">
    <style>
        :root {{
            --bg-primary: #0d1117;
            --bg-secondary: #161b22;
            --bg-tertiary: #21262d;
            --bg-card: #1c2128;
            --text-primary: #e6edf3;
            --text-secondary: #8b949e;
            --text-muted: #6e7681;
            --accent: #58a6ff;
            --accent-hover: #79b8ff;
            --success: #3fb950;
            --warning: #d29922;
            --danger: #f85149;
            --border: #30363d;
            --border-accent: #388bfd;
            --highlight-bg: rgba(56, 139, 253, 0.15);
            --comment-bg: #2d333b;
            --selection-bg: rgba(56, 139, 253, 0.3);
        }}

        * {{
            box-sizing: border-box;
            margin: 0;
            padding: 0;
        }}

        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
            background: var(--bg-primary);
            color: var(--text-primary);
            line-height: 1.6;
            min-height: 100vh;
        }}

        .layout {{
            display: flex;
            min-height: 100vh;
        }}

        .main-content {{
            flex: 1;
            max-width: 900px;
            padding: 2rem;
            overflow-y: auto;
        }}

        .comments-sidebar {{
            width: 350px;
            background: var(--bg-secondary);
            border-left: 1px solid var(--border);
            padding: 1rem;
            overflow-y: auto;
            position: sticky;
            top: 0;
            height: 100vh;
        }}

        header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid var(--border);
        }}

        h1 {{
            font-size: 1.5rem;
            font-weight: 600;
        }}

        .summary {{
            font-size: 0.875rem;
            color: var(--text-secondary);
        }}

        .summary .count {{
            background: var(--bg-tertiary);
            padding: 0.25rem 0.5rem;
            border-radius: 12px;
            margin-left: 0.5rem;
        }}

        /* Markdown content area */
        .markdown-container {{
            background: var(--bg-secondary);
            border: 1px solid var(--border);
            border-radius: 8px;
            overflow: hidden;
        }}

        .line-wrapper {{
            display: flex;
            position: relative;
            border-bottom: 1px solid transparent;
        }}

        .line-wrapper:hover {{
            background: var(--bg-tertiary);
        }}

        .line-wrapper.has-comment {{
            background: var(--highlight-bg);
            border-left: 3px solid var(--accent);
        }}

        .line-wrapper.selecting {{
            background: var(--selection-bg);
        }}

        .line-number {{
            flex-shrink: 0;
            width: 50px;
            padding: 0 12px;
            text-align: right;
            color: var(--text-muted);
            font-family: 'SF Mono', Monaco, 'Consolas', monospace;
            font-size: 12px;
            user-select: none;
            cursor: pointer;
            border-right: 1px solid var(--border);
        }}

        .line-number:hover {{
            color: var(--accent);
        }}

        .add-comment-btn {{
            position: absolute;
            left: 4px;
            top: 50%;
            transform: translateY(-50%);
            width: 20px;
            height: 20px;
            background: var(--accent);
            border: none;
            border-radius: 50%;
            color: white;
            font-size: 14px;
            font-weight: bold;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.2s;
            display: flex;
            align-items: center;
            justify-content: center;
        }}

        .line-wrapper:hover .add-comment-btn {{
            opacity: 1;
        }}

        .line-content {{
            flex: 1;
            padding: 0 16px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif;
            font-size: 14px;
            white-space: pre-wrap;
            word-wrap: break-word;
        }}

        /* Rendered markdown styling */
        .rendered-markdown {{
            padding: 24px;
        }}

        .rendered-markdown h1,
        .rendered-markdown h2,
        .rendered-markdown h3,
        .rendered-markdown h4,
        .rendered-markdown h5,
        .rendered-markdown h6 {{
            margin-top: 24px;
            margin-bottom: 16px;
            font-weight: 600;
            line-height: 1.25;
            border-bottom: 1px solid var(--border);
            padding-bottom: 0.3em;
        }}

        .rendered-markdown h1 {{ font-size: 2em; }}
        .rendered-markdown h2 {{ font-size: 1.5em; }}
        .rendered-markdown h3 {{ font-size: 1.25em; border-bottom: none; }}
        .rendered-markdown h4 {{ font-size: 1em; border-bottom: none; }}

        .rendered-markdown p {{
            margin-bottom: 16px;
        }}

        .rendered-markdown ul,
        .rendered-markdown ol {{
            margin-bottom: 16px;
            padding-left: 2em;
        }}

        .rendered-markdown li {{
            margin-bottom: 4px;
        }}

        .rendered-markdown code {{
            background: var(--bg-tertiary);
            padding: 0.2em 0.4em;
            border-radius: 6px;
            font-family: 'SF Mono', Monaco, 'Consolas', monospace;
            font-size: 85%;
        }}

        .rendered-markdown pre {{
            background: var(--bg-tertiary);
            padding: 16px;
            border-radius: 6px;
            overflow-x: auto;
            margin-bottom: 16px;
        }}

        .rendered-markdown pre code {{
            background: none;
            padding: 0;
            font-size: 14px;
        }}

        .rendered-markdown table {{
            border-collapse: collapse;
            width: 100%;
            margin-bottom: 16px;
        }}

        .rendered-markdown th,
        .rendered-markdown td {{
            border: 1px solid var(--border);
            padding: 6px 13px;
        }}

        .rendered-markdown th {{
            background: var(--bg-tertiary);
            font-weight: 600;
        }}

        .rendered-markdown blockquote {{
            border-left: 4px solid var(--border);
            padding-left: 16px;
            color: var(--text-secondary);
            margin-bottom: 16px;
        }}

        /* Source view with line numbers */
        .source-view {{
            display: none;
        }}

        .source-view.active {{
            display: block;
        }}

        .rendered-view {{
            display: block;
        }}

        .rendered-view.hidden {{
            display: none;
        }}

        /* View toggle */
        .view-toggle {{
            display: flex;
            gap: 0;
            margin-bottom: 1rem;
            border: 1px solid var(--border);
            border-radius: 6px;
            overflow: hidden;
            width: fit-content;
        }}

        .view-toggle button {{
            padding: 0.5rem 1rem;
            background: var(--bg-secondary);
            border: none;
            color: var(--text-secondary);
            cursor: pointer;
            font-size: 0.875rem;
            transition: all 0.2s;
        }}

        .view-toggle button:not(:last-child) {{
            border-right: 1px solid var(--border);
        }}

        .view-toggle button.active {{
            background: var(--accent);
            color: white;
        }}

        .view-toggle button:hover:not(.active) {{
            background: var(--bg-tertiary);
        }}

        /* Comments sidebar */
        .sidebar-header {{
            font-size: 0.875rem;
            font-weight: 600;
            color: var(--text-secondary);
            margin-bottom: 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid var(--border);
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}

        .comment-card {{
            background: var(--bg-card);
            border: 1px solid var(--border);
            border-radius: 8px;
            margin-bottom: 1rem;
            overflow: hidden;
        }}

        .comment-card.editing {{
            border-color: var(--accent);
        }}

        .comment-header {{
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem;
            background: var(--bg-tertiary);
            font-size: 0.75rem;
            color: var(--text-secondary);
        }}

        .comment-lines {{
            font-family: 'SF Mono', Monaco, monospace;
            color: var(--accent);
        }}

        .comment-preview {{
            padding: 0.75rem;
            font-size: 0.875rem;
            background: var(--bg-primary);
            border-bottom: 1px solid var(--border);
            color: var(--text-muted);
            font-family: 'SF Mono', Monaco, monospace;
            max-height: 60px;
            overflow: hidden;
            white-space: pre-wrap;
        }}

        .comment-body {{
            padding: 0.75rem;
        }}

        .comment-textarea {{
            width: 100%;
            min-height: 80px;
            padding: 0.75rem;
            background: var(--bg-primary);
            border: 1px solid var(--border);
            border-radius: 6px;
            color: var(--text-primary);
            font-size: 0.875rem;
            resize: vertical;
            font-family: inherit;
        }}

        .comment-textarea:focus {{
            outline: none;
            border-color: var(--accent);
        }}

        .comment-textarea::placeholder {{
            color: var(--text-muted);
        }}

        .comment-textarea.saved {{
            border-color: var(--success);
            transition: border-color 0.3s;
        }}

        .save-indicator {{
            font-size: 0.7rem;
            color: var(--success);
            opacity: 0;
            transition: opacity 0.2s;
            margin-top: 0.25rem;
        }}

        .save-indicator.visible {{
            opacity: 1;
        }}

        .comment-actions {{
            display: flex;
            justify-content: flex-end;
            gap: 0.5rem;
            margin-top: 0.5rem;
        }}

        .comment-text {{
            font-size: 0.875rem;
            line-height: 1.5;
            white-space: pre-wrap;
        }}

        .comment-text.empty {{
            color: var(--text-muted);
            font-style: italic;
        }}

        .no-comments {{
            text-align: center;
            color: var(--text-muted);
            padding: 2rem;
            font-size: 0.875rem;
        }}

        /* Inline comment box (appears when selecting lines) */
        .inline-comment-box {{
            display: none;
            background: var(--bg-card);
            border: 1px solid var(--accent);
            border-radius: 8px;
            margin: 0.5rem 0;
            overflow: hidden;
        }}

        .inline-comment-box.visible {{
            display: block;
        }}

        .inline-comment-header {{
            padding: 0.5rem 0.75rem;
            background: var(--bg-tertiary);
            font-size: 0.75rem;
            color: var(--text-secondary);
            border-bottom: 1px solid var(--border);
        }}

        .inline-comment-body {{
            padding: 0.75rem;
        }}

        /* Actions bar */
        .actions {{
            display: flex;
            gap: 1rem;
            justify-content: space-between;
            align-items: center;
            margin-top: 1.5rem;
            padding-top: 1rem;
            border-top: 1px solid var(--border);
        }}

        .action-group {{
            display: flex;
            gap: 0.5rem;
        }}

        button {{
            padding: 0.5rem 1rem;
            border: none;
            border-radius: 6px;
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
        }}

        .btn-sm {{
            padding: 0.25rem 0.5rem;
            font-size: 0.75rem;
        }}

        .btn-secondary {{
            background: var(--bg-tertiary);
            color: var(--text-primary);
            border: 1px solid var(--border);
        }}

        .btn-secondary:hover {{
            background: var(--border);
        }}

        .btn-success {{
            background: var(--success);
            color: white;
        }}

        .btn-success:hover {{
            opacity: 0.9;
        }}

        .btn-danger {{
            background: transparent;
            color: var(--danger);
            border: 1px solid var(--danger);
        }}

        .btn-danger:hover {{
            background: var(--danger);
            color: white;
        }}

        .btn-primary {{
            background: var(--accent);
            color: white;
        }}

        .btn-primary:hover {{
            background: var(--accent-hover);
        }}

        .keyboard-hint {{
            font-size: 0.75rem;
            color: var(--text-muted);
        }}

        kbd {{
            background: var(--bg-tertiary);
            padding: 0.2rem 0.4rem;
            border-radius: 4px;
            font-family: inherit;
            border: 1px solid var(--border);
            font-size: 0.7rem;
        }}

        /* Selection highlight */
        .selection-indicator {{
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--accent);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: 8px;
            display: none;
            align-items: center;
            gap: 1rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 1000;
        }}

        .selection-indicator.visible {{
            display: flex;
        }}

        /* Delete button for comments */
        .delete-comment {{
            background: none;
            border: none;
            color: var(--text-muted);
            cursor: pointer;
            padding: 0.25rem;
            font-size: 1rem;
            line-height: 1;
        }}

        .delete-comment:hover {{
            color: var(--danger);
        }}

        /* Floating comment toolbar for text selection */
        .floating-toolbar {{
            position: fixed;
            background: var(--bg-card);
            border: 1px solid var(--accent);
            border-radius: 8px;
            padding: 0.5rem;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
            z-index: 1000;
            display: none;
            align-items: center;
            gap: 0.5rem;
            animation: fadeIn 0.15s ease-out;
        }}

        @keyframes fadeIn {{
            from {{ opacity: 0; transform: translateY(-4px); }}
            to {{ opacity: 1; transform: translateY(0); }}
        }}

        .floating-toolbar.visible {{
            display: flex;
        }}

        .floating-toolbar button {{
            padding: 0.4rem 0.75rem;
            font-size: 0.8rem;
        }}

        /* Inline comment popup */
        .inline-comment-popup {{
            position: fixed;
            background: var(--bg-card);
            border: 1px solid var(--accent);
            border-radius: 8px;
            padding: 0.5rem;
            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.5);
            z-index: 1001;
            display: none;
            min-width: 300px;
        }}

        .inline-comment-popup.visible {{
            display: block;
        }}

        .inline-comment-popup input {{
            width: 100%;
            padding: 0.5rem 0.75rem;
            background: var(--bg-primary);
            border: 1px solid var(--border);
            border-radius: 6px;
            color: var(--text-primary);
            font-size: 0.875rem;
            outline: none;
        }}

        .inline-comment-popup input:focus {{
            border-color: var(--accent);
        }}

        .inline-comment-popup input::placeholder {{
            color: var(--text-muted);
        }}

        /* Highlighted text in preview */
        .commented-text {{
            background: var(--highlight-bg);
            border-bottom: 2px solid var(--accent);
            cursor: pointer;
            padding: 0 2px;
            border-radius: 2px;
        }}

        .commented-text:hover {{
            background: var(--selection-bg);
        }}

        /* Responsive */
        @media (max-width: 1200px) {{
            .comments-sidebar {{
                width: 300px;
            }}
        }}

        @media (max-width: 900px) {{
            .layout {{
                flex-direction: column;
            }}

            .comments-sidebar {{
                width: 100%;
                height: auto;
                position: static;
                border-left: none;
                border-top: 1px solid var(--border);
            }}
        }}
    </style>
</head>
<body>
    <div class="layout">
        <div class="main-content">
            <header>
                <h1>{title}</h1>
                <div class="summary">
                    Comments: <span class="count" id="comment-count">0</span>
                </div>
            </header>

            <div class="view-toggle">
                <button class="active" onclick="switchView('rendered')">Preview</button>
                <button onclick="switchView('source')">Source</button>
            </div>

            <div class="markdown-container">
                <div class="rendered-view" id="rendered-view">
                    <div class="rendered-markdown" id="rendered-content"></div>
                </div>
                <div class="source-view" id="source-view"></div>
            </div>

            <div class="actions">
                <div class="keyboard-hint">
                    <kbd>Cmd</kbd>+<kbd>Enter</kbd> submit | <kbd>Esc</kbd> cancel
                </div>
                <div class="action-group">
                    <button class="btn-secondary" onclick="cancelReview()">Cancel</button>
                    <button class="btn-primary" onclick="submitReview()">Submit Review</button>
                </div>
            </div>
        </div>

        <div class="comments-sidebar">
            <div class="sidebar-header">
                <span>Comments</span>
                <button class="btn-sm btn-secondary" onclick="clearAllComments()">Clear All</button>
            </div>
            <div id="comments-list">
                <div class="no-comments">
                    Click on a line number or select text to add comments
                </div>
            </div>
        </div>
    </div>

    <div class="selection-indicator" id="selection-indicator">
        <span id="selection-text">Lines 1-3 selected</span>
        <button class="btn-sm btn-primary" onclick="addCommentForSelection()">Add Comment</button>
        <button class="btn-sm btn-secondary" onclick="clearSelection()">Cancel</button>
    </div>

    <div class="floating-toolbar" id="floating-toolbar">
        <span style="color: var(--text-secondary); font-size: 0.75rem; margin-right: 0.5rem;">💬</span>
        <button class="btn-sm btn-primary" onclick="showInlineCommentInput()">Comment</button>
    </div>

    <div class="inline-comment-popup" id="inline-comment-popup">
        <input type="text" id="inline-comment-input" placeholder="Add comment... (Enter to save, Esc to cancel)">
    </div>

    <script>
        const rawContent = {content_json};
        const lines = {lines_json};
        const serverPort = {server_port};

        // State
        let comments = []; // {{ id, startLine, endLine, text, linePreview, type }}
        let selectionStart = null;
        let selectionEnd = null;
        let currentView = 'rendered';
        let commentIdCounter = 0;
        let selectedText = '';
        let selectionRange = null;

        // Initialize marked
        marked.setOptions({{
            highlight: function(code, lang) {{
                if (lang && hljs.getLanguage(lang)) {{
                    return hljs.highlight(code, {{ language: lang }}).value;
                }}
                return hljs.highlightAuto(code).value;
            }},
            breaks: false,
            gfm: true
        }});

        function init() {{
            // Render markdown preview
            document.getElementById('rendered-content').innerHTML = marked.parse(rawContent);

            // Render source view with line numbers
            renderSourceView();

            // Apply syntax highlighting to rendered code blocks
            document.querySelectorAll('.rendered-markdown pre code').forEach(block => {{
                hljs.highlightElement(block);
            }});

            // Setup text selection handler for preview
            setupTextSelectionHandler();
        }}

        // Text selection in Preview view
        function setupTextSelectionHandler() {{
            const renderedContent = document.getElementById('rendered-content');
            const floatingToolbar = document.getElementById('floating-toolbar');

            console.log('Setting up text selection handler...', {{ renderedContent: !!renderedContent, floatingToolbar: !!floatingToolbar }});

            renderedContent.addEventListener('mouseup', (e) => {{
                // Delay to let selection finalize
                setTimeout(() => {{
                    const selection = window.getSelection();
                    const text = selection.toString().trim();

                    console.log('Selection detected:', text ? `"${{text.substring(0, 30)}}..."` : '(empty)');

                    if (text && text.length > 0) {{
                        selectedText = text;
                        try {{
                            selectionRange = selection.getRangeAt(0).cloneRange();

                            // Position floating toolbar near selection (fixed positioning)
                            const rect = selection.getRangeAt(0).getBoundingClientRect();
                            const top = rect.bottom + 8;
                            const left = Math.max(10, rect.left + (rect.width / 2) - 50);

                            console.log('Showing toolbar at:', top, left);

                            floatingToolbar.style.top = `${{top}}px`;
                            floatingToolbar.style.left = `${{left}}px`;
                            floatingToolbar.classList.add('visible');
                        }} catch (err) {{
                            console.log('Selection error:', err);
                        }}
                    }} else {{
                        hideFloatingToolbar();
                    }}
                }}, 50);
            }});

            // Hide toolbar when clicking elsewhere
            document.addEventListener('mousedown', (e) => {{
                if (!floatingToolbar.contains(e.target) && !renderedContent.contains(e.target)) {{
                    hideFloatingToolbar();
                }}
            }});
        }}

        function hideFloatingToolbar() {{
            const floatingToolbar = document.getElementById('floating-toolbar');
            floatingToolbar.classList.remove('visible');
        }}

        function hideInlineCommentPopup() {{
            const popup = document.getElementById('inline-comment-popup');
            popup.classList.remove('visible');
            document.getElementById('inline-comment-input').value = '';
        }}

        function showInlineCommentInput() {{
            if (!selectedText) return;

            const floatingToolbar = document.getElementById('floating-toolbar');
            const popup = document.getElementById('inline-comment-popup');
            const input = document.getElementById('inline-comment-input');

            // Position popup below the floating toolbar
            const toolbarRect = floatingToolbar.getBoundingClientRect();
            popup.style.top = `${{toolbarRect.bottom + 8}}px`;
            popup.style.left = `${{Math.max(10, toolbarRect.left)}}px`;

            // Hide toolbar, show popup
            hideFloatingToolbar();
            popup.classList.add('visible');
            input.value = '';
            input.focus();
        }}

        function confirmInlineComment() {{
            const input = document.getElementById('inline-comment-input');
            const commentText = input.value.trim();

            if (!selectedText) {{
                hideInlineCommentPopup();
                return;
            }}

            const preview = selectedText.length > 100 ? selectedText.substring(0, 100) + '...' : selectedText;

            const comment = {{
                id: `comment-${{commentIdCounter++}}`,
                type: 'text',
                startLine: null,
                endLine: null,
                text: commentText,
                linePreview: preview,
                selectedText: selectedText
            }};

            comments.push(comment);

            // Highlight the selected text in the preview
            highlightTextInPreview(selectionRange, comment.id);

            // Clear state
            hideInlineCommentPopup();
            window.getSelection().removeAllRanges();
            selectedText = '';
            selectionRange = null;

            renderComments();

            console.log('Comment added:', comment);
        }}

        // Setup inline comment input handlers
        document.getElementById('inline-comment-input').addEventListener('keydown', (e) => {{
            if (e.key === 'Enter') {{
                e.preventDefault();
                e.stopPropagation();
                confirmInlineComment();
            }} else if (e.key === 'Escape') {{
                e.preventDefault();
                e.stopPropagation();
                hideInlineCommentPopup();
                selectedText = '';
                selectionRange = null;
            }}
        }});

        function addCommentForTextSelection() {{
            // Legacy function - now uses inline input
            showInlineCommentInput();
        }}

        function highlightTextInPreview(range, commentId) {{
            if (!range) return;

            try {{
                const span = document.createElement('span');
                span.className = 'commented-text';
                span.dataset.commentId = commentId;
                span.onclick = () => scrollToComment(commentId);
                range.surroundContents(span);
            }} catch (e) {{
                // If surroundContents fails (crosses element boundaries), skip highlighting
                console.log('Could not highlight selection:', e);
            }}
        }}

        function scrollToComment(commentId) {{
            const commentCard = document.querySelector(`[data-comment-id="${{commentId}}"]`);
            if (commentCard) {{
                commentCard.scrollIntoView({{ behavior: 'smooth', block: 'center' }});
                commentCard.style.borderColor = 'var(--accent)';
                setTimeout(() => commentCard.style.borderColor = '', 1500);
            }}
        }}

        function renderSourceView() {{
            const container = document.getElementById('source-view');
            container.innerHTML = lines.map((line, index) => {{
                const hasComment = comments.some(c => index >= c.startLine && index <= c.endLine);
                const isSelecting = selectionStart !== null &&
                    index >= Math.min(selectionStart, selectionEnd || selectionStart) &&
                    index <= Math.max(selectionStart, selectionEnd || selectionStart);

                return `
                    <div class="line-wrapper ${{hasComment ? 'has-comment' : ''}} ${{isSelecting ? 'selecting' : ''}}"
                         data-line="${{index}}"
                         onmousedown="startLineSelection(${{index}})"
                         onmouseenter="extendLineSelection(${{index}})">
                        <button class="add-comment-btn" onclick="event.stopPropagation(); quickAddComment(${{index}})" title="Add comment">+</button>
                        <div class="line-number" data-line="${{index}}">${{index + 1}}</div>
                        <div class="line-content">${{escapeHtml(line.text) || '&nbsp;'}}</div>
                    </div>
                `;
            }}).join('');
        }}

        function escapeHtml(text) {{
            const div = document.createElement('div');
            div.textContent = text;
            return div.innerHTML;
        }}

        function switchView(view) {{
            currentView = view;
            document.querySelectorAll('.view-toggle button').forEach(btn => btn.classList.remove('active'));
            document.querySelector(`.view-toggle button[onclick="switchView('${{view}}')"]`).classList.add('active');

            if (view === 'rendered') {{
                document.getElementById('rendered-view').classList.remove('hidden');
                document.getElementById('source-view').classList.remove('active');
            }} else {{
                document.getElementById('rendered-view').classList.add('hidden');
                document.getElementById('source-view').classList.add('active');
            }}
        }}

        // Line selection
        let isSelecting = false;

        function startLineSelection(lineNum) {{
            isSelecting = true;
            selectionStart = lineNum;
            selectionEnd = lineNum;
            renderSourceView();
        }}

        function extendLineSelection(lineNum) {{
            if (isSelecting && selectionStart !== null) {{
                selectionEnd = lineNum;
                renderSourceView();
                updateSelectionIndicator();
            }}
        }}

        document.addEventListener('mouseup', () => {{
            if (isSelecting && selectionStart !== null) {{
                isSelecting = false;
                if (selectionEnd === null) selectionEnd = selectionStart;
                updateSelectionIndicator();
            }}
        }});

        function updateSelectionIndicator() {{
            const indicator = document.getElementById('selection-indicator');
            if (selectionStart !== null) {{
                const start = Math.min(selectionStart, selectionEnd || selectionStart);
                const end = Math.max(selectionStart, selectionEnd || selectionStart);
                document.getElementById('selection-text').textContent =
                    start === end ? `Line ${{start + 1}} selected` : `Lines ${{start + 1}}-${{end + 1}} selected`;
                indicator.classList.add('visible');
            }} else {{
                indicator.classList.remove('visible');
            }}
        }}

        function clearSelection() {{
            selectionStart = null;
            selectionEnd = null;
            document.getElementById('selection-indicator').classList.remove('visible');
            renderSourceView();
        }}

        function quickAddComment(lineNum) {{
            selectionStart = lineNum;
            selectionEnd = lineNum;
            addCommentForSelection();
        }}

        function addCommentForSelection() {{
            if (selectionStart === null) return;

            const start = Math.min(selectionStart, selectionEnd || selectionStart);
            const end = Math.max(selectionStart, selectionEnd || selectionStart);

            // Get preview text
            const previewLines = lines.slice(start, end + 1).map(l => l.text);
            const preview = previewLines.join('\\n').substring(0, 100) + (previewLines.join('\\n').length > 100 ? '...' : '');

            const comment = {{
                id: `comment-${{commentIdCounter++}}`,
                type: 'line',
                startLine: start,
                endLine: end,
                text: '',
                linePreview: preview
            }};

            comments.push(comment);
            clearSelection();
            renderComments();
            renderSourceView();

            // Focus the new comment textarea
            setTimeout(() => {{
                const textarea = document.querySelector(`[data-comment-id="${{comment.id}}"] textarea`);
                if (textarea) textarea.focus();
            }}, 50);
        }}

        function renderComments() {{
            const container = document.getElementById('comments-list');

            if (comments.length === 0) {{
                container.innerHTML = '<div class="no-comments">Select text in Preview or click lines in Source to add comments</div>';
            }} else {{
                container.innerHTML = comments.map(comment => {{
                    const headerLabel = comment.type === 'text'
                        ? 'Selected text'
                        : (comment.startLine === comment.endLine
                            ? `Line ${{comment.startLine + 1}}`
                            : `Lines ${{comment.startLine + 1}}-${{comment.endLine + 1}}`);

                    return `
                        <div class="comment-card" data-comment-id="${{comment.id}}">
                            <div class="comment-header">
                                <span class="comment-lines">${{headerLabel}}</span>
                                <button class="delete-comment" onclick="deleteComment('${{comment.id}}')" title="Delete comment">&times;</button>
                            </div>
                            <div class="comment-preview">${{escapeHtml(comment.linePreview)}}</div>
                            <div class="comment-body">
                                ${{comment.text
                                    ? `<div class="comment-text">${{escapeHtml(comment.text)}}</div>`
                                    : `<div class="comment-text empty">(no comment)</div>`
                                }}
                            </div>
                        </div>
                    `;
                }}).join('');
            }}

            updateCommentCount();
        }}

        function updateCommentText(commentId, text) {{
            const comment = comments.find(c => c.id === commentId);
            if (comment) {{
                comment.text = text;
            }}
        }}

        let saveTimeout = null;
        function handleCommentInput(commentId, textarea) {{
            updateCommentText(commentId, textarea.value);

            // Show "Saved" indicator with debounce
            clearTimeout(saveTimeout);
            const indicator = document.getElementById(`save-${{commentId}}`);
            if (indicator && textarea.value.trim()) {{
                saveTimeout = setTimeout(() => {{
                    indicator.classList.add('visible');
                    setTimeout(() => indicator.classList.remove('visible'), 1500);
                }}, 500);
            }}
        }}

        function handleCommentKeydown(e, commentId) {{
            // Cmd/Ctrl + Enter to submit
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {{
                e.preventDefault();
                submitReview();
            }}
        }}

        function deleteComment(commentId) {{
            // Remove highlight from preview if it's a text comment
            const highlightedSpan = document.querySelector(`.commented-text[data-comment-id="${{commentId}}"]`);
            if (highlightedSpan) {{
                const parent = highlightedSpan.parentNode;
                while (highlightedSpan.firstChild) {{
                    parent.insertBefore(highlightedSpan.firstChild, highlightedSpan);
                }}
                parent.removeChild(highlightedSpan);
            }}

            comments = comments.filter(c => c.id !== commentId);
            renderComments();
            renderSourceView();
        }}

        function clearAllComments() {{
            if (comments.length > 0 && confirm('Delete all comments?')) {{
                // Remove all highlights from preview
                document.querySelectorAll('.commented-text').forEach(span => {{
                    const parent = span.parentNode;
                    while (span.firstChild) {{
                        parent.insertBefore(span.firstChild, span);
                    }}
                    parent.removeChild(span);
                }});

                comments = [];
                renderComments();
                renderSourceView();
            }}
        }}

        function updateCommentCount() {{
            document.getElementById('comment-count').textContent = comments.length;
        }}

        function scrollToLine(lineNum) {{
            switchView('source');
            const lineEl = document.querySelector(`[data-line="${{lineNum}}"]`);
            if (lineEl) {{
                lineEl.scrollIntoView({{ behavior: 'smooth', block: 'center' }});
                lineEl.style.background = 'var(--selection-bg)';
                setTimeout(() => lineEl.style.background = '', 1000);
            }}
        }}

        async function submitReview() {{
            const result = {{
                status: 'submitted',
                timestamp: new Date().toISOString(),
                items: comments.map(c => ({{
                    id: c.id,
                    startLine: c.startLine,
                    endLine: c.endLine,
                    text: c.text,
                    linePreview: c.linePreview,
                    checked: true,
                    comment: c.text
                }}))
            }};

            try {{
                await fetch(`http://localhost:${{serverPort}}/submit`, {{
                    method: 'POST',
                    headers: {{ 'Content-Type': 'application/json' }},
                    body: JSON.stringify(result)
                }});
                window.close();
            }} catch (e) {{
                alert('Failed to submit review. Please try again.');
                console.error(e);
            }}
        }}

        async function cancelReview() {{
            try {{
                await fetch(`http://localhost:${{serverPort}}/submit`, {{
                    method: 'POST',
                    headers: {{ 'Content-Type': 'application/json' }},
                    body: JSON.stringify({{ status: 'cancelled', items: [] }})
                }});
                window.close();
            }} catch (e) {{
                window.close();
            }}
        }}

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {{
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {{
                e.preventDefault();
                submitReview();
            }}
            if (e.key === 'Escape') {{
                // Don't cancel review if inline comment popup is open
                const inlinePopup = document.getElementById('inline-comment-popup');
                if (inlinePopup && inlinePopup.classList.contains('visible')) {{
                    return; // Let the inline input handler deal with it
                }}

                if (selectionStart !== null) {{
                    clearSelection();
                }} else {{
                    cancelReview();
                }}
            }}
        }});

        // Initialize
        init();
    </script>
</body>
</html>'''
