# ACH Finance — Design System

Generated with Google Stitch (Project ID: 13512796482141959979)

## Color Tokens

Extracted from Stitch-generated screens.

### Primary (Indigo)
| Token | Value | Usage |
|-------|-------|-------|
| `primary` | `#4648D4` / `hsl(239 84% 67%)` | CTA buttons, active nav, links |
| `primary-container` | `#6063EE` | Icon backgrounds |
| `primary-fixed-dim` | `#C0C1FF` | Subtle highlights |

### Surface & Background
| Token | Value | Usage |
|-------|-------|-------|
| `background` | `#F8F9FF` | Page background |
| `surface` | `#F8F9FF` | Card backgrounds |
| `surface-container` | `#E5EEFF` | Table headers, hover states |
| `surface-container-low` | `#EFF4FF` | Input backgrounds |
| `on-surface` | `#0B1C30` | Primary text |
| `on-surface-variant` | `#464554` | Secondary text, labels |

### Semantic
| Token | Value | Usage |
|-------|-------|-------|
| Success | `#22C55E` | Income, positive trends |
| Danger/Error | `#BA1A1A` / `#EF4444` | Expenses, errors, exceeded budgets |
| Warning | `#F59E0B` | Budget alerts (80%+) |
| Outline | `#767586` | Borders, dividers |

## Typography

| Style | Font | Weight | Size |
|-------|------|--------|------|
| Display | Inter | 800 | 32px |
| Heading 1 | Inter | 700 | 24px |
| Heading 2 | Inter | 600 | 20px |
| Heading 3 | Inter | 600 | 18px |
| Body | Inter | 400 | 14px |
| Caption | Inter | 400 | 12px |
| Label | Inter | 500 | 12px |

## Spacing Scale (from Stitch)

| Token | Value |
|-------|-------|
| `xs` | 4px |
| `sm` | 8px |
| `md` | 16px |
| `lg` | 24px |
| `xl` | 40px |
| `gutter` | 24px |
| `container-max` | 1280px |

## Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `DEFAULT` | 4px | Badges, chips |
| `lg` | 8px | Inputs, small cards |
| `xl` | 12px | Cards, modals |
| `2xl` | 16px | Large modals |
| `full` | 9999px | Pills, avatars |

## Component Specifications

### Sidebar
- Width: 256px (fixed)
- Background: `bg-card` (white/slate-900)
- Border: right 1px `border-border`
- Logo area height: 64px
- Nav item height: 40px
- Active state: `bg-primary/10 text-primary`

### Header
- Height: 64px
- Sticky, backdrop blur
- Background: `bg-card/80`

### KPI Cards
- Padding: 24px
- Icon container: 48×48px, rounded-xl
- Value: text-2xl font-bold
- Trend badge: text-xs, rounded-full

### Data Table
- Header: `bg-muted/30`, text-xs uppercase
- Row height: ~56px
- Hover: `bg-muted/30`
- Border: `divide-border`

### Buttons (Primary)
- Height: 36px (default), 44px (lg)
- Background: `bg-primary`
- Radius: `rounded-lg` (8px)
- Font: text-sm font-medium

### Inputs
- Height: 36px
- Radius: `rounded-lg`
- Border: `border-input`
- Focus ring: `ring-2 ring-ring`

### Modals / Dialogs
- Max width: 520px
- Radius: `rounded-2xl` (16px)
- Shadow: `shadow-2xl`
- Overlay: `bg-black/40 backdrop-blur-sm`

## Stitch Screen IDs

| Screen | ID |
|--------|----|
| Login | `a1e6895dce8c418b810cbdebe654804f` |
| Register | `820d4644a636440f86746d8ee017504d` |
| Dashboard | `e3a8c561051a4075a94ed568df8327e0` |
| Transactions | `4dac646bea914aca9a3e21018fed928b` |
| Transaction Modal | `adb7a580cd68498298f1a7077c076c67` |
| Categories | `b9f75c46e5fc4601abaedb60e6f312d2` |
| Budgets | `efba7e49f96d49ca9b67d4406f1c16c0` |
| Analytics | `a0e3d79dd68c4adcbbc8e4164ac5f32a` |

**Stitch Project URL**: https://stitch.withgoogle.com/project/13512796482141959979
