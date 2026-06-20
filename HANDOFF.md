# HANDOFF.md — my-website CRM

_Generated: 2026-06-20 | Protocol 17 — context survives the session_

## Live URLs

- **Production:** https://my-website-sepia-one-44.vercel.app
- **GitHub:** https://github.com/Anna1006-Do/my-website
- **Vercel dashboard:** https://vercel.com/annado1006/my-website
- **Supabase:** https://supabase.com/dashboard/project/beldpzvcfstyednxkaiv

## Stack

Next.js 15 · TypeScript · Tailwind CSS · Supabase · Vercel · Resend

## The 8 Agents

All installed at `~/.claude/agents/`. Trigger by name in Claude Code.

| Agent             | What it does                          | How to trigger              |
| ----------------- | ------------------------------------- | --------------------------- |
| `product-manager` | Daily plans, epic writing, standup    | "Run the daily plan"        |
| `developer`       | Implements features, Git workflow     | "Build [feature]"           |
| `qa`              | Tests before deploy (Jest/Playwright) | Auto-called by Developer    |
| `devops`          | Vercel health, CI/CD monitoring       | "Check deployment status"   |
| `designer`        | Hero images via Gemini API            | "Generate image for [post]" |
| `writer`          | One SEO blog post per run             | "Write this week's post"    |
| `web-publisher`   | Publishes post → GitHub → Vercel      | "Publish the latest post"   |
| `email-marketer`  | Newsletter drafts via Resend          | "Draft this week's email"   |

## Automated Weekly Pipeline

Runs while Claude Desktop is open. Catches up on next launch if closed.

| Time              | Routine                 | What happens                                  |
| ----------------- | ----------------------- | --------------------------------------------- |
| Mon–Fri 6:03 AM   | `devops-daily`          | Vercel health check + CI/CD review            |
| Mon–Fri 7:03 AM   | `pm-daily-plan`         | Morning plan from epics → project-status.html |
| Mon–Fri 9:03 AM   | `developer-daily`       | Picks up approved work item                   |
| Mon–Fri 6:07 PM   | `pm-standup-compile`    | Collects what each agent did today            |
| Mon–Fri 6:37 PM   | `pm-eod-summary`        | End-of-day summary → docs/plans/              |
| Friday 5:07 PM    | `pm-weekly-rag`         | RAG status report for all epics               |
| Monday 9:03 AM    | `writer-weekly`         | One blog post from content calendar           |
| Tuesday 9:03 AM   | `designer-weekly`       | Hero image for latest post                    |
| Wednesday 9:03 AM | `web-publisher-weekly`  | Publishes post → live on site                 |
| Thursday 10:03 AM | `email-marketer-weekly` | Newsletter draft (needs approval to send)     |

Manage routines: Claude Desktop → **Scheduled** in sidebar.

## Scheduled Routine IDs

All stored at: `~/.claude/scheduled-tasks/`

- `devops-daily`
- `pm-daily-plan`
- `developer-daily`
- `pm-standup-compile`
- `pm-eod-summary`
- `pm-weekly-rag`
- `writer-weekly`
- `designer-weekly`
- `web-publisher-weekly`
- `email-marketer-weekly`

## Environment Variables

Stored in `.env.local` (never committed). Also set in Vercel dashboard.

- `NEXT_PUBLIC_SUPABASE_URL` — Supabase project URL
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` — Supabase public key
- `SUPABASE_SECRET_KEY` — Supabase service role key (server-side only)
- `SUPABASE_JWKS_URL` — Supabase JWT verification URL
- `NEXT_PUBLIC_SITE_URL` — Live Vercel URL

Still needed (add when ready):

- `ANTHROPIC_API_KEY` — for AI features
- `RESEND_API_KEY` + `RESEND_FROM_EMAIL` — for email campaigns
- `GEMINI_API_KEY` — for Designer image generation

## Infrastructure Setup (done)

- [x] GitHub Actions CI/CD — lint → type-check → test → build on every PR
- [x] Branch protection on `main` — CI must pass before merge
- [x] Vercel auto-deploys on push to `main`
- [x] Pre-commit hooks — Prettier + ESLint + TypeScript on every commit
- [x] Supabase MCP connected
- [x] Infinite Leverage v1.6.0 installed

## First Actions for the Operator

1. Open `docs/product/product.md` — fill in what this CRM does and who it's for
2. Run `product-manager` agent → `pm-client-interview` skill to define the first epic
3. Add `ANTHROPIC_API_KEY` to `.env.local` and Vercel env vars
4. Add `RESEND_API_KEY` when ready to send emails
5. Add content topics to `content/content-calendar/` for the Writer to pick up

## How to Pick Up Work

1. Open Claude Desktop in the `my-website` project folder
2. The `session-start` hook runs automatically — version check + usage context
3. Ask the `product-manager` agent to run the daily plan
4. It will tell you what the developer should build today

## Sync Agents (after any template update)

```
/infiniteleverage-patch
```

This fetches the latest agents and skills from the canonical GitHub repo.
