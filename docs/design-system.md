# TrustLoop Design System

> For frontend engineers joining the project.  
> Live reference: `/style-guide`

---

## Overview

TrustLoop uses a **component-driven design system** built on:

- **shadcn/ui** (Base UI primitives + Tailwind CSS v4)
- **Semantic design tokens** (CSS variables)
- **Composable layout primitives**
- **Typography components** (no hardcoded heading styles in pages)

The visual direction is **modern, minimal, and trustworthy** — inspired by Linear, Stripe, Notion, and Vercel. No flashy gradients or heavy animation.

---

## Design Principles

1. **Reuse over reinvention** — Every page uses shared components from `src/components/ui`, `src/components/layout`, and `src/components/typography`.
2. **Semantic tokens over raw colors** — Use `text-foreground`, `bg-primary`, `text-muted-foreground`, not `#111` or `neutral-400`.
3. **Mobile first** — Design for small screens, enhance at `sm`, `md`, `lg` breakpoints.
4. **Accessible by default** — shadcn primitives include focus rings, ARIA roles, and keyboard support.
5. **Trust through restraint** — Generous whitespace, clear hierarchy, subtle borders.

---

## Color System

All colors are defined as CSS variables in `src/app/globals.css` and mapped to Tailwind via `@theme inline`.

| Token | Purpose | Tailwind class |
|-------|---------|----------------|
| `--primary` | Primary actions, brand emphasis | `bg-primary`, `text-primary` |
| `--slate` | Secondary brand tone | `bg-slate`, `text-slate` |
| `--background` | Page background | `bg-background` |
| `--foreground` | Primary text | `text-foreground` |
| `--muted` | Subtle backgrounds | `bg-muted` |
| `--muted-foreground` | Secondary text | `text-muted-foreground` |
| `--border` | Borders and dividers | `border-border` |
| `--success` | Positive feedback | `bg-success`, `border-success` |
| `--warning` | Caution states | `bg-warning`, `border-warning` |
| `--error` / `--destructive` | Errors and destructive actions | `bg-error`, `text-destructive` |

### Usage rules

- **Never** use hardcoded hex colors in new components.
- Use `StatusAlert` for success/warning/error messages.
- Button variants map to semantic intent: `default` (primary), `secondary`, `outline`, `destructive`.

---

## Typography

Import from `@/components/typography/typography`:

| Component | Use case |
|-----------|----------|
| `H1` | Hero headlines |
| `H2` | Major section headings |
| `H3` | Subsection headings |
| `PageTitle` | Page-level title |
| `SectionTitle` | Section headings within a page |
| `Paragraph` | Body copy |
| `Muted` | Descriptions, secondary copy |
| `Caption` | Labels, metadata, fine print |

### Font

- **Inter** via `next/font/google`, exposed as `--font-sans`.
- Base size: 16px on inputs (prevents iOS zoom).

---

## Components

### UI primitives (`src/components/ui/`)

Installed via shadcn/ui:

- `button` — Primary, secondary, outline, destructive, ghost, link
- `input`, `textarea`, `select`, `checkbox`, `radio-group`, `label`
- `card` — Content containers
- `badge` — Status labels
- `avatar` — User images with fallback
- `alert` + `status-alert` — Feedback messages (`status`: `success`, `warning`, `error`)
- `skeleton`, `spinner` — Loading states
- `dialog`, `alert-dialog`, `dropdown-menu` — Overlays
- `breadcrumb` — Navigation hierarchy
- `sonner` — Toast notifications
- `separator` — Visual dividers

### Layout (`src/components/layout/`)

| Component | Purpose |
|-----------|---------|
| `Container` | Max-width content wrapper with responsive padding |
| `Section` | Vertical section spacing (`tight`, `default`, `loose`) |
| `PageWrapper` | Full-page background shell |
| `PageHeader` | Title + description + optional action |
| `SiteHeader` | Top navigation bar |
| `SiteFooter` | Footer links and copyright |
| `BottomNav` | Mobile bottom tab bar |
| `EmptyState` | No-data placeholder |
| `LoadingState` | Centered loading indicator |
| `ErrorState` | Error with optional retry |

---

## Layout Philosophy

```
PageWrapper
  └── SiteHeader (sticky top)
  └── main
        └── Section
              └── Container
                    └── PageHeader / content
  └── SiteFooter (desktop)
  └── BottomNav (mobile)
```

- **Container** handles horizontal padding and max-width.
- **Section** handles vertical rhythm.
- **PageWrapper** sets page-level background.

---

## Spacing

Use Tailwind spacing scale consistently:

| Size | px | Typical use |
|------|-----|-------------|
| `gap-2` / `p-2` | 8px | Tight inline spacing |
| `gap-4` / `p-4` | 16px | Form fields, card padding |
| `gap-6` / `py-6` | 24px | Section content gaps |
| `py-10` / `py-14` | 40–56px | Section vertical padding |

See `/style-guide` for visual spacing reference.

---

## Adding New Components

1. Check if shadcn has it: `npx shadcn@latest add <component>`
2. If app-specific, create in `src/components/` (not `ui/`) — e.g. `src/components/home/`.
3. Compose from existing primitives — don't duplicate button/card styles.
4. Add an example to `/style-guide` if it's a reusable pattern.

---

## File Structure

```
src/components/
  ui/           # shadcn primitives + thin wrappers
  layout/       # Page structure components
  typography/   # Text components
  home/         # Homepage-specific compositions
```

---

## Toasts

```tsx
import { toast } from "sonner";

toast.success("Review request sent");
toast.error("Something went wrong");
```

The `<Toaster />` is mounted in `src/app/layout.tsx`.

---

## Do Not

- Query Supabase from components (services layer — Phase 3)
- Hardcode colors (`text-[#111]`, `bg-neutral-50`)
- Inline styles (`style={{ ... }}`) except for dynamic values
- Duplicate typography classes in pages — use typography components
- Skip the style guide when adding new reusable patterns
