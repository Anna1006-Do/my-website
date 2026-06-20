@AGENTS.md

# my-website — CRM Project

## Stack
- **Framework**: Next.js 15 (App Router), TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Supabase (database, auth, storage)
- **Deploy**: Vercel (auto-deploy from `main`)
- **Email**: Resend

## Agents
8 specialist agents are installed in `~/.claude/agents/`. Use them:
- `product-manager` — planning, daily standups, feature specs
- `developer` — implementation, Git workflow
- `qa` — testing (Jest, Playwright)
- `devops` — CI/CD, Vercel ops
- `designer` — images, design system
- `writer` — blog posts, SEO content
- `web-publisher` — publish pipeline
- `email-marketer` — email campaigns via Resend

## Skills
75+ skills available in `~/.claude/skills/`. See individual agent docs for which skills each role uses.

## Folder Structure
See `FOLDER-STRUCTURE.md` for canonical layout. Never invent new top-level folders.

## Git Workflow
- Always branch from `main`
- Never `git add .` — stage files by name
- Vercel auto-deploys `main`

## Fixed Files (never rename)
`product.md`, `epics.md`, `project-status.html`, `CLAUDE.md`, `README.md`, `.env.example`, `.gitignore`
