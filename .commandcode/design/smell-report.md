# Smell Report — WarungERP

**Date:** 2026-06-09
**Score:** 5/10 — PRESENT
**Register:** Product (ERP dashboard / admin tool)

---

## Verdict

Competent, functional admin dashboard that looks like it could belong to any SaaS product. The design makes no wrong moves, but also no memorable ones. It reads as "default shadcn/ui + Tailwind admin template" rather than a tool built specifically for Indonesian food-and-beverage UMKM operators.

The color choice (emerald green) avoids the blue-purple tech startup trap and loosely ties to food/money — but the rest of the system is pure default: slate everywhere, Geist with no personality, cards wrapping every surface, stat monuments filling the dashboard, and a layout that never takes a risk.

---

## Odors Detected

### 1. Stat Monument — DETECTED

The dashboard opens with four identical stat cards: Pendapatan, Profit, Margin Rata-Rata, Best Seller. Each has an icon in a colored rounded box, a small label, and a big number. Nothing is prioritized — all four get equal visual weight. This is the classic "number cluster filling space where a product story belongs" pattern. The user has no idea which metric actually matters.

**Fix mode:** `relayout` or `redesign`

### 2. Icon Topper — DETECTED

Every stat card has a rounded-square icon with a colored background (emerald, blue, purple, amber). The icons serve no function beyond filling the template slot. The Best Seller card is especially telling — a Star icon next to a text value, doing nothing but signaling "this is a card component."

**Fix mode:** `redesign` or `refine`

### 3. Cards Everywhere — DETECTED

Cards are the default container for everything: dashboard stats, table wrappers, login forms, empty states, best-seller lists. The design never commits to a different structural pattern. Tables are wrapped in cards with borders. Empty states are cards with centered content. The login page is literally a Card component. There's no visual variety — every surface feels like the same rectangular box.

**Fix mode:** `relayout`

### 4. Center Stack — DETECTED

The layout is aggressively safe. Sidebar left, navbar top, content centered in the remaining space. Every page uses `space-y-4` or `space-y-6` to stack elements vertically. No tension, no editorial pacing, no deliberate asymmetry. It works, but it's the layout equivalent of muzak.

**Fix mode:** `relayout`

### 5. Default Type — DETECTED

Geist Sans and Geist Mono are modern system-adjacent fonts, but they're used with no voice. Almost everything is `text-sm` or `text-xs`. Headings are just `font-semibold text-sm` — no scale, no hierarchy, no contrast. The login page's h1 is `text-xl font-bold`, but inside the app, page titles are just `text-sm font-semibold`. The type system doesn't guide the eye; it flattens everything.

**Fix mode:** `typeset`

### 6. Domain Default Trap — FAINT

Emerald green for a food/restaurant business tool is predictable but not wrong. It ties to freshness, profit, and growth. Slate as the neutral is standard Tailwind default. The design doesn't lean hard into the domain — there's nothing that screams "this is for warung operators in Indonesia" beyond the Indonesian copy. No warmth, no culinary character, no local texture.

**Fix mode:** `voice` or `recolor`

---

## Odors NOT Detected

- **Tech gradient** — No blue-purple-to-cyan gradients. Colors are solid and flat.
- **Accent rail** — No colored stripes on card edges pretending to be organization.
- **Unearned blur** — No frosted glass panels. Depth is handled with borders and shadows.
- **Bounce everywhere** — Minimal motion. Only a simple sidebar collapse transition.
- **Prompt drift** — The design is consistent with the project name (WarungERP), domain (food & beverage ERP), and audience (Indonesian UMKM operators).

---

## Heuristics Score

| Odor | Status | Score |
|---|---|---|
| Tech gradient | Clean | 1 |
| Generic tech hue | Clean (emerald, not blue-purple) | 1 |
| Feature tile grid | Clean (not grid of feature cards) | 1 |
| Accent rail | Clean | 1 |
| Unearned blur | Clean | 1 |
| Stat monument | **Detected** | 0 |
| Icon topper | **Detected** | 0 |
| Bounce everywhere | Clean | 1 |
| Default type | **Detected** | 0 |
| Center stack | **Detected** | 0 |
| Cards everywhere (bonus) | **Detected** | — |
| Domain default (faint) | **Faint** | — |

**5 tells detected → 5/10 — PRESENT**

---

## Root Cause

The design is built entirely from shadcn/ui defaults and standard Tailwind patterns. Every component — Button, Card, Table, Badge, Input — is a direct shadcn/ui port with minimal customization. The layout is the standard admin template (sidebar + navbar + content). The dashboard is the standard stat-card grid. The type is Geist at uniform sizes. Nothing is *wrong*, but nothing is *chosen* for this specific product.

This is the visual equivalent of "Lorem Ipsum" — placeholder design that hasn't been replaced yet.

---

## Recommended Next Steps

1. **`/design relayout`** — Break the stat monument, remove card wrapping from tables, introduce hierarchy and visual variety on the dashboard
2. **`/design typeset`** — Build a real type scale with hierarchy, not just `text-sm font-semibold` everywhere
3. **`/design voice`** — Push the design toward the domain: warmth, culinary character, Indonesian UMKM identity. Make it feel like a tool for real warung operators, not a generic admin panel
