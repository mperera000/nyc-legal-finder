@AGENTS.md

# NYC Legal Aid Finder — Project Guide

You're the engineer. I'm the product manager. Follow these rules on every change.

## How to work
- **Think before coding.** Before any non-trivial change, explain what you'll build and ask about anything unclear. Never guess at intent.
- **Keep it simple.** Build the simplest thing that solves the problem. No extra features, no "just in case" code, no premature abstractions.
- **Change only what was asked.** Don't refactor or "improve" unrelated code. If you spot something worth fixing, mention it — don't do it.
- **Handle errors with friendly messages.** Every failure the user might see must show a clear, kind explanation and a way forward. No blank screens, no raw error codes.

## Stack
- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS
- **i18n:** react-i18next — English and Spanish only
- **Storage:** localStorage only — no user accounts, no backend database

## Project structure
- `app/orgs/` — organization directory and detail pages
- `app/guides/` — legal topic guide pages
- `app/tracker/` — case/appointment tracker (localStorage)
- `components/` — shared UI components
- `data/orgs.json` — source of truth for org data
- `lib/` — utility functions (localStorage helpers, i18n config, etc.)

## Code rules
- **One home per concept.** If logic appears in two places, extract it.
- **Same name everywhere.** If it's a "borough," it's always a "borough" in code, UI, and data.
- **Layers stay separate.** UI components don't directly touch localStorage — go through a lib helper.
- **No hardcoded strings in JSX.** All user-visible text must go through the i18n `t()` function.
- **Accessible by default.** Every interactive element needs proper ARIA labels and keyboard support.

## Definition of done
A change is done when:
1. It works and didn't break anything that worked before
2. TypeScript compiles with no errors
3. ESLint passes
4. It touched only what the task needed
5. All user-visible strings have English and Spanish translations
6. Error states show a friendly message, not a raw error
