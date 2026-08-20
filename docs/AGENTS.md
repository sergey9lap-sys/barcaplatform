# AGENTS GUIDE — Barca Fan Platform

This file is the main entry point for any AI coding agent working on this project.

---

## Project Context

This is a fan engagement platform for football clubs (starting with FC Barcelona).

The product is NOT:
- a stats website
- a news portal

The product IS:
- a competitive fan game
- an interactive content tool for Telegram channels
- a gamified football prediction platform

---

## Core Product Loop

1. User predicts match outcome
2. User selects lineup
3. Match happens
4. System calculates points
5. User compares with others
6. User shares results
7. Repeat

---

## Documentation Structure

All documentation is inside the Docs folder.

Read files in this order:

1. Docs/product/PRD.md  
→ defines product logic and features

2. Docs/design/DESIGN_SYSTEM.md  
→ defines visual style and UI rules

3. Docs/plan/ROADMAP.md  
→ defines development phases

4. Docs/architecture/STACK.md  
→ defines tech stack

5. Docs/architecture/DATA_MODEL.md  
→ defines database structure

6. Docs/tasks/TASKS.md  
→ defines implementation steps

7. Docs/quality/QUALITY_GATES.md  
→ defines MVP completion criteria

---

## Current Goal

Implement Phase 1 (MVP) only.

Do NOT implement:
- tactical board (yet)
- transfers
- duels
- fan DNA
- advanced analytics

Focus only on MVP scope.

---

## MVP Scope

You must implement:

- basic app layout (mobile-first)
- authentication (Supabase)
- matches list
- match prediction (win/draw/lose + optional score)
- lineup prediction (simple selection, no drag)
- points system (basic)
- leaderboard

---

## Design Rules (CRITICAL)

You MUST follow design system strictly:

- dark UI
- blue + garnet palette
- gradient accents
- premium sports feel
- mobile-first layout

Do NOT:
- use random colors
- build generic admin UI
- create white/light UI
- overcomplicate design

---

## Tech Stack Rules

- Next.js (App Router)
- TypeScript (strict)
- Tailwind CSS
- shadcn/ui (for components)
- Supabase (DB + Auth)

---

## Architecture Rules

- keep components reusable
- avoid overengineering
- keep logic simple for MVP
- structure project clearly

---

## Execution Rules

When working:

1. First read ALL docs
2. Then create a clear implementation plan
3. Then implement step by step
4. After implementation:
   - list created/modified files
   - explain what is done
   - explain what remains

If something is unclear:
→ choose the simplest solution aligned with docs

---

## Priority

1. Functionality
2. Simplicity
3. Design consistency
4. Speed of delivery

NOT:
1. Perfection
2. Overengineering
3. Extra features

---

## Final Rule

Build fast, clean MVP first.
Then iterate.

Do not try to build the full product at once.