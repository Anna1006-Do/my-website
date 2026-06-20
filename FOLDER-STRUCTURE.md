# Canonical Folder Structure — Infinite Leverage

```
my-website/
├── src/                          # Next.js app source
│   └── app/                      # App Router pages & layouts
├── docs/
│   ├── product/
│   │   ├── product.md            # Strategy source of truth (FIXED NAME)
│   │   ├── epics.md              # Feature backlog (FIXED NAME)
│   │   └── epic-status.md        # Epic progress tracker
│   ├── brand/
│   │   └── style-guide.md        # Brand voice, colors, fonts
│   ├── plans/                    # Daily plans & session notes
│   └── decisions/                # Architecture decision records
├── content/
│   ├── topics/                   # Blog posts: content/topics/{slug}/blog.md
│   └── content-calendar/         # Editorial calendar files
├── context/
│   └── source-material/          # Research, interviews, reference docs
│       └── research/             # Operator-curated research selections
├── agents/                       # Project-specific agent overrides
│   ├── {role}/
│   │   ├── context/
│   │   │   └── persona.md        # Project-specific agent rules
│   │   └── skills/               # Project-specific skill overrides
│   └── web-publisher/
│       └── output/               # Staging area (NEVER committed)
├── .specify/                     # Speckit output (never edit manually)
│   ├── features/{slug}/
│   │   ├── spec.md
│   │   ├── impl-plan.md
│   │   └── tasks.md
│   └── memory/
│       └── constitution.md
├── public/                       # Static assets
├── CLAUDE.md                     # (FIXED NAME) Agent instructions
├── FOLDER-STRUCTURE.md           # (FIXED NAME) This file
├── README.md                     # (FIXED NAME) Project overview
├── .env.example                  # (FIXED NAME) Env var template
├── .env.local                    # Local secrets (gitignored)
├── project-status.html           # (FIXED NAME) Dashboard
├── package.json
└── tsconfig.json
```

## Rules
1. Never create new top-level folders
2. Never rename FIXED NAME files
3. `agents/web-publisher/output/` is never committed
4. Speckit output goes only in `.specify/`
