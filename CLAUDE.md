# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Personal portfolio site for Nick Bohmer (nickbohmer.com). Next.js 16 App Router with React 19, TypeScript, Tailwind CSS 4, and an AI chat assistant powered by a RAG pipeline (Gemini + Supabase pgvector).

## Commands

```bash
npm run dev          # Start dev server (localhost:3000)
npm run build        # Production build
npm run lint         # ESLint check
npm run lint:fix     # Auto-fix lint issues
npm run preview      # Build and preview Cloudflare deployment locally
npm run deploy       # Build and deploy to Cloudflare Pages
npx tsx scripts/seed-knowledge.ts    # Seed AI knowledge base from nick-info.md
npx tsx scripts/verify-knowledge.ts  # Verify knowledge base entries
```

## Architecture

### Rendering & Routing
- **App Router** (`src/app/`): File-based routing with layouts
- **Server Components** by default; `"use client"` directive for interactive components (chat, navbar, animations)
- **Blog**: MDX files in `/content/` compiled via content-collections; schema defined in `content-collections.ts`
- **Static data**: All portfolio content (work, projects, contact) centralized in `src/data/resume.tsx`

### AI Chat System (RAG)
- **API endpoint**: `src/app/api/chat/route.ts` — POST, returns streaming SSE
- **Flow**: User message → Gemini embedding → Supabase pgvector cosine similarity search (threshold 0.5, top 5) → context assembly → Gemini streaming response
- **Client state**: React Context via `AIChatProvider` (`src/components/ui/ai-chat/ai-chat-provider.tsx`)
- **Knowledge base**: Seeded from `nick-info.md` via `scripts/seed-knowledge.ts`
- **Feature flag**: `NEXT_PUBLIC_ENABLE_AI_CHAT=true` enables the chat UI

### Component Organization
- `src/components/ui/` — shadcn/ui components (Radix primitives + Tailwind). Config in `components.json` (style: "new-york")
- `src/components/magicui/` — Custom animation components (blur-fade, dock, flickering-grid)
- `src/components/section/` — Page sections (projects, work, contact, use-cases)
- `src/components/mdx/` — MDX rendering components (code-block, media-container)

### Styling
- **Tailwind CSS 4** with `@tailwindcss/postcss` plugin (not the legacy config approach)
- **Dark mode**: next-themes with CSS variable overrides in `src/app/globals.css`
- **Class merging**: Use `cn()` from `src/lib/utils.ts` (clsx + tailwind-merge)
- **Chat-specific CSS variables**: `--chat-bg`, `--chat-surface`, `--chat-border`, etc.

### Deployment
- **Cloudflare Pages** via OpenNext (`@opennextjs/cloudflare`)
- **Wrangler config**: `wrangler.jsonc` with `nodejs_compat` compatibility flag
- Build output goes through `.open-next/` (worker.js + static assets)
- Do not use `export const runtime = 'edge'` — OpenNext handles the runtime

### Key Path Aliases
- `@/*` → `./src/*`
- `content-collections` → `./.content-collections/generated`

## Environment Variables

Required in `.env.local` (see `.env.local.example`):
- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `GEMINI_API_KEY` (for AI chat)
- `NEXT_PUBLIC_ENABLE_AI_CHAT` (feature flag)

## Conventions

- shadcn/ui components are added/modified in `src/components/ui/` — do not create parallel component systems
- Animation components live in `src/components/magicui/` using the `motion` library (framer-motion alternative)
- Portfolio data changes go in `src/data/resume.tsx`, not in individual page files
- Blog posts are `.mdx` files in `/content/` with frontmatter: `title`, `publishedAt`, `summary`, `image`, `author`
- Supabase client is initialized in `src/lib/supabase.ts`
