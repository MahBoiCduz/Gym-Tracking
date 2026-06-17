---
name: Kickboxing Tracker
description: PT client management tool for multi-phase kickboxing roadmaps, session tracking, and nutrition logging.
colors:
  night-gym: "#0f172a"
  pit-dark: "#1e293b"
  iron-mid: "#334155"
  muted-text: "#94a3b8"
  soft-text: "#64748b"
  slate-border: "#e2e8f0"
  body-bg: "#f8fafc"
  surface: "#ffffff"
  drive-blue: "#2563eb"
  drive-blue-hover: "#3b82f6"
  drive-blue-subtle: "#eff6ff"
  coach-green: "#059669"
  coach-green-subtle: "#ecfdf5"
  warning-amber: "#d97706"
  alert-red: "#f43f5e"
typography:
  display:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "1.5rem"
    fontWeight: 800
    lineHeight: 1.2
    letterSpacing: "-0.025em"
  headline:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "1rem"
    fontWeight: 700
    lineHeight: 1.3
  title:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.75rem"
    fontWeight: 400
    lineHeight: 1.6
  label:
    fontFamily: "system-ui, -apple-system, 'Segoe UI', sans-serif"
    fontSize: "0.6875rem"
    fontWeight: 700
    letterSpacing: "0.06em"
rounded:
  sm: "8px"
  md: "12px"
  lg: "16px"
  full: "9999px"
spacing:
  xs: "8px"
  sm: "12px"
  md: "16px"
  lg: "24px"
  xl: "32px"
components:
  button-primary:
    backgroundColor: "{colors.drive-blue}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "6px 16px"
  button-primary-hover:
    backgroundColor: "{colors.drive-blue-hover}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "6px 16px"
  button-danger:
    backgroundColor: "{colors.alert-red}"
    textColor: "{colors.surface}"
    rounded: "{rounded.full}"
    padding: "6px 16px"
  button-ghost:
    backgroundColor: "{colors.pit-dark}"
    textColor: "{colors.muted-text}"
    rounded: "{rounded.full}"
    padding: "6px 12px"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "{spacing.lg}"
  chip:
    backgroundColor: "{colors.drive-blue-subtle}"
    textColor: "{colors.drive-blue}"
    rounded: "{rounded.full}"
    padding: "2px 8px"
  input-dark:
    backgroundColor: "{colors.pit-dark}"
    textColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
  input-light:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.night-gym}"
    rounded: "{rounded.md}"
    padding: "10px 12px"
---

# Design System: Kickboxing Tracker

## 1. Overview

**Creative North Star: "The Coaching Session"**

This is a tool that feels like a great PT standing next to you — demanding, invested, and clear. Every screen has a job. The header doesn't decorate; it commands. The data doesn't report; it judges your progress. The session checklist isn't a form; it's a ledger of earned effort. The atmosphere is that of a well-run training session: high energy where the action is, focused quiet where concentration is required.

The palette runs on a Discipline & Drive axis. The dark slate (Night Gym) is the discipline — controlled, structured, imposing without trying to impress. The electric blue (Drive Blue) is the effort — the push, the CTA, the thing you're building toward. Emerald green lands only when the PT is in control or when something has been successfully completed. These colors are not decoration; they are signals.

This system explicitly rejects: the blue-gradient dashboard template of generic fitness SaaS (MyFitnessPal/Fitbit style); the neon-on-black gamer aesthetic; and the mint-green softness of corporate wellness portals. It also rejects the warm-cream, minimal-type "wellness" aesthetic that signals retreat rather than performance.

**Key Characteristics:**
- Dark-header / light-body split: two distinct layers that signal two distinct modes (control vs. activity)
- Role-coded color: blue = action/client, green = PT mode/success, amber = warning, red = danger
- Tactile, structural components: borders feel load-bearing, not decorative
- Body text at 12px minimum — no 9px or 10px UI elements; legibility is non-negotiable
- Vietnamese diacritic support required throughout; font stack must handle full diacritic set

## 2. Colors: The Discipline & Drive Palette

Two axes define the palette: dark iron for structure, electric blue for energy. All other colors serve functional roles only.

### Primary

- **Drive Blue** (`#2563eb`): The action color. Used on primary CTAs, active tab indicators, focused inputs, and the "Client mode" identity stripe. Never decorative — every blue pixel should be telling the user to do something or confirming what they're doing.
- **Drive Blue Hover** (`#3b82f6`): Applied on hover/active states of Drive Blue elements. One step lighter; stays clearly in family.
- **Drive Blue Subtle** (`#eff6ff`): The chip and label background. Session range tags, role chips. Never as a card background — too close to white to create structure.

### Secondary

- **Coach Green** (`#059669`): Reserved exclusively for PT mode indicators, save-success states, and completed-solution markers. Its presence means "the expert is in control" or "something is done." Prohibited in client-facing read-only views.
- **Coach Green Subtle** (`#ecfdf5`): The PT-mode status bar background. Reinforces that the PT view is a different mode, not just a different tab.

### Tertiary

- **Warning Amber** (`#d97706`): BMI indicators, edit-mode warnings (the pulsing "Save" button). Signals that something needs attention without alarm.
- **Alert Red** (`#f43f5e`): Delete actions, error states, destructive operations. Never used for emphasis or decoration.

### Neutral

- **Night Gym** (`#0f172a`): The header, phase-block headers, loading screens, and login background. The heaviest element in the stack — it grounds the entire interface.
- **Pit Dark** (`#1e293b`): Secondary dark surface for input fields in dark contexts.
- **Iron Mid** (`#334155`): Dark-context borders and dividers.
- **Body BG** (`#f8fafc`): The main light-mode canvas. One step off pure white — enough separation from Surface white to make cards pop without color.
- **Surface** (`#ffffff`): Cards, modals, input fields in light context. The active work surface.
- **Slate Border** (`#e2e8f0`): Card borders, dividers, section separators. Structural, not decorative.
- **Muted Text** (`#94a3b8`): Secondary labels, placeholder text. Must be verified at ≥4.5:1 against its background — use `#64748b` (Soft Text) on white backgrounds where Muted Text fails contrast.
- **Soft Text** (`#64748b`): On white/body-bg surfaces, use this instead of Muted Text for body-level labels to hit WCAG AA.

### Named Rules

**The Signal Rule.** Each accent color has one functional meaning and no other. Blue = action or client identity. Green = PT control or completion. Amber = attention. Red = danger. A color used outside its signal role is a bug, not a design choice.

**The No-Decoration Rule.** No accent color is used for visual interest alone. No gradient fills. No colored card backgrounds. No colored section borders unless they carry the Signal Rule meaning.

## 3. Typography

**Body Font:** system-ui, -apple-system, 'Segoe UI', sans-serif (system stack)

No display typeface is loaded. The system stack is used throughout, leaning on weight and size to create hierarchy rather than contrast between families. The Vietnamese diacritic set is supported natively by the system stack on all major platforms — font loading would risk rendering gaps.

**Character:** Workmanlike and authoritative. The type is the coach's clipboard — clear, functional, no flourish. Weight does the work.

### Hierarchy

- **Display** (800 weight, 1.5rem / 24px, line-height 1.2, tracking −0.025em): App name, login headline, major modal headline. Maximum usage: once per view. No display-level text in card bodies.
- **Headline** (700 weight, 1rem / 16px, line-height 1.3): Section headings, tab labels (large breakpoint), phase/block titles inside dark headers. The primary structural signal in the content area.
- **Title** (600 weight, 0.875rem / 14px, line-height 1.4): Card section labels, modal sub-headers, client name in header. One level below Headline.
- **Body** (400 weight, 0.75rem / 12px, line-height 1.6): Exercise descriptions, diet plan entries, solution items, goal text. This is the minimum. Never go below 12px / 0.75rem in any meaningful UI element.
- **Label** (700 weight, 0.6875rem / 11px, tracking 0.06em): Metric names ("TDEE Tiêu thụ", "Chiều cao / Nặng"), tab badge text, status chip labels. Uppercase tracking compensates for the small size.

### Named Rules

**The 12px Floor Rule.** No meaningful content renders below 12px (0.75rem). The current codebase contains text at 9px and 10px (`text-[9px]`, `text-[10px]`). These are prohibited in production UI. Replace with Label (11px) or Body (12px) with appropriate weight.

**The Weight Hierarchy Rule.** Hierarchy is created by weight, not size alone. A 12px/700 label reads above a 14px/400 title. Don't reach for a smaller size to signal secondary importance when reducing weight achieves the same result with better legibility.

## 4. Elevation

This system is **flat by default, structurally bordered**. Depth is conveyed primarily through background color contrast (Night Gym header over Body BG canvas over white Surface cards) and border definition, not shadows.

Shadows exist at one level only: a subtle ambient lift (`0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)`) used on white cards sitting on the Body BG canvas. This is `shadow-sm` in Tailwind — the lightest possible shadow. It signals "this is an active surface" without competing with the Night Gym header.

Modals use a backdrop (`rgba(0,0,0,0.6)`) and a `shadow-2xl` elevation to break from the page plane. This is the only place a heavy shadow is appropriate.

### Shadow Vocabulary

- **Card Lift** (`0 1px 3px rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)`): White cards on Body BG. The standard card treatment.
- **Modal Float** (`0 25px 50px -12px rgba(0,0,0,0.25)`): Modals and dialogs. Heavy; reserved for screen-breaking layers only.

### Named Rules

**The One Depth Rule.** The interface has two elevation planes: the flat canvas (header + body-bg) and the surface layer (white cards). That is the entire stack outside of modals. Do not add intermediate shadow levels or layered card-in-card layouts.

## 5. Components

### Buttons

Buttons feel like they have physical weight. They respond on press, not just hover.

- **Shape:** Gently rounded (12px / `rounded-xl`). Full-pill (`rounded-full`) reserved for compact action chips in the header bar only.
- **Primary:** Drive Blue background (`#2563eb`), white text, 700 weight, 0.75rem, 6px/16px padding. Hover transitions to Drive Blue Hover (`#3b82f6`) in 150ms. Used for all principal PT actions (Save, Create Client, Submit).
- **Focus:** 2px blue outline, 2px offset. Never remove the focus ring.
- **PT Edit Button:** Warning Amber with a `animate-pulse` treatment signals unsaved state. This is the only sanctioned use of animation on a button.
- **Ghost / Secondary:** Dark surface background (`#1e293b`), Muted Text (`#94a3b8`) label, pill shape. Used for Sign Out, Cancel, Exit. Hover shifts to rose-900 for destructive ghost buttons.
- **Disabled:** 50% opacity. No pointer events.

### Chips / Status Pills

- **Style:** Drive Blue Subtle background (`#eff6ff`), Drive Blue text (`#2563eb`), 700 weight, Label size (11px), `rounded-full`, 2px/8px padding.
- **Usage:** Session range tags ("Buổi 1-5"), role identifiers. Never used for navigation or primary actions.
- **PT Mode Variant:** Coach Green Subtle / Coach Green for PT-specific chips.

### Cards / Containers

- **Corner Style:** Gently rounded (12px / `rounded-xl`). Modal containers use 16px (`rounded-2xl`).
- **Background:** Surface white (`#ffffff`).
- **Shadow:** Card Lift (see Elevation).
- **Border:** Slate Border (`#e2e8f0`), 1px solid. The border is structural — it defines the card edge.
- **Internal Padding:** 24px / `p-6` standard. 16px / `p-4` for compact metric cards.
- **Phase Block Headers:** Night Gym (`#0f172a`) background with white text. These are full-bleed card headers, not standalone cards. The dark-header / white-body split within a card mirrors the app's global split.

### Inputs / Fields

**Dark context (login, header dropdowns):**
- Background: Pit Dark (`#1e293b`), border: Iron Mid (`#334155`), text: white, placeholder: Muted Text (`#94a3b8`). Rounded 12px. Focus: Drive Blue border (`#2563eb`), no ring.

**Light context (modal forms, inline edit fields):**
- Background: Surface white, border: Slate Border (`#e2e8f0`). Focus: Drive Blue border + blue-200 ring (`focus:ring-1 focus:ring-blue-200`). Rounded 12px.

**Inline edit fields (PT edit mode):**
- Bottom-border-only style: `border-b border-blue-500`. Used only for in-situ editing of text values in cards. Not for standalone form inputs.

### Navigation (Tabs)

- Horizontal tab bar, bottom-border indicator style.
- Active: Drive Blue bottom border (2px), Drive Blue text.
- Inactive: transparent border, Soft Text (`#64748b`). Hover: slate-800 text.
- Font: 700 weight, 12px, no uppercase, no tracking.

### Progress Indicators

- Track: `rgba(255,255,255,0.2)` on dark surfaces; Slate Border (`#e2e8f0`) on light surfaces.
- Fill: Drive Blue (`#2563eb`) for workout progress; Coach Green (`#34d399` / emerald-400) for nutrition/calorie progress.
- Height: 6px (`h-1.5`). Rounded full. Transition 500ms.

### Session Completion Checklist (Signature Component)

The exercise checklist row is the primary interaction for clients. It carries role signal and earned-state display.

- **Default:** White/slate-50 row, slate-800 text, no visual embellishment.
- **Completed:** Checkmark icon (Coach Green), text struck through with Muted Text, row background shifts to Coach Green Subtle (`#ecfdf5`). The shift is the reward — the row changes planes.
- **PT Edit Mode:** Additional delete and add controls appear inline. These are always Danger-colored (rose) to prevent accidental invocation.

## 6. Do's and Don'ts

### Do:

- **Do** use Drive Blue (`#2563eb`) exclusively for action-bearing elements: primary buttons, active tab borders, focused input borders, in-progress state chips.
- **Do** maintain the Night Gym / white surface split as the primary depth signal. The dark header is the app's backbone; it should never be lightened.
- **Do** keep body text at 0.75rem (12px) minimum. Use Label (0.6875rem / 11px) only for metric names and status chips, never for full sentences.
- **Do** verify body text contrast at ≥4.5:1. On white Surface, use Soft Text (`#64748b`) not Muted Text (`#94a3b8`) — Muted Text fails WCAG AA on white.
- **Do** use Coach Green (`#059669`) to signal PT control and completion states. It should appear and clients should read "the expert has touched this."
- **Do** support full Vietnamese diacritics. The system stack handles this; if custom fonts are ever added, verify the full diacritic set renders correctly.
- **Do** honor `prefers-reduced-motion` — the PT edit button pulse and spinner are the only animated elements; both must have static fallbacks.

### Don't:

- **Don't** use `border-left` or `border-right` greater than 1px as a colored accent stripe on cards, callout boxes, or list items. The existing target-callout stripe (`border-l-4 border-blue-400`) is a prohibited pattern and should be replaced with a background tint or full border.
- **Don't** build the generic fitness SaaS template: blue-gradient hero, stock-photo abs, dashboard widget grid, MyFitnessPal-style pastel charts. This is the first anti-reference explicitly named in PRODUCT.md.
- **Don't** use a gamer/esports dark UI: neon accents, glitch effects, aggressive decorative typefaces, purple-on-black. Named anti-reference from PRODUCT.md.
- **Don't** use the corporate wellness aesthetic: mint green, soft rounded-2xl everything, pastel gradient backgrounds, healthcare-portal softness. Named anti-reference from PRODUCT.md.
- **Don't** use gradient text (`background-clip: text` with a gradient). All text uses a single solid color.
- **Don't** render any metric or meaningful content below 12px. Replace `text-[9px]` and `text-[10px]` utilities. If it's small enough to be a 9px label, either remove it or make it a proper Label-scale element.
- **Don't** use identical card grids: same-sized cards with icon + heading + description, repeated across a section. The metric cards (5-across) are an intentional data grid; they are not a template to apply to every section.
- **Don't** add emerald/green to client-facing views for decorative purposes. Coach Green is reserved for PT control signals and completion states. A client should associate green with "done" and nothing else.
- **Don't** use background colors for cards other than Surface white. No tinted card backgrounds, no gradient cards. Depth comes from the border and the Card Lift shadow.
