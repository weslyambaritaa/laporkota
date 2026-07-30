# Design System Inspired by Apple

## 1. Visual Theme & Atmosphere

Apple's design system embodies **minimalism, clarity, and purposeful simplicity**. Every element serves a function, with generous whitespace creating breathing room and focus. The aesthetic is contemporary and refined—clean typography pairs with a restrained color palette, allowing product imagery and content to take center stage. The design communicates premium quality through precision, consistent alignment, and elegant interactions. Motion and depth are subtle but meaningful, never gratuitous. This system prioritizes accessibility and readability while maintaining a forward-looking, technology-forward personality.

**Key Characteristics**
- Extreme whitespace and generous padding
- Monochromatic and neutral-dominant palette with strategic blue accents
- Precise, grid-aligned layouts
- Smooth, purposeful micro-interactions
- Clear visual hierarchy through scale and weight
- Maximum readability with optimized contrast
- Focus on product and content over decoration

## 2. Color Palette & Roles

### Primary
- **Primary Action Blue** (`#0071E3`): Main CTA buttons, links, and interactive accents; used for purchase and shop buttons
- **Primary Blue Shade** (`#006EDB`): Secondary primary shade for hover states and interactive feedback
- **Primary Blue Dark** (`#0076DF`): Tertiary primary shade for pressed/active states

### Interactive
- **Interactive Blue Light** (`#0077ED`): Highlight and focus states on interactive elements

### Neutral Scale
- **Text Primary** (`#1D1D1F`): Default body text, headings, and primary interface text (most frequent)
- **Text Black** (`#000000`): Maximum contrast text, used for highest prominence headings and critical information
- **Text Secondary** (`#333336`): Secondary text, subheadings, and reduced-emphasis content
- **Text Tertiary** (`#6E6E73`): Disabled text, captions, helper text, and low-emphasis labels
- **Text Dark Shade** (`#272729`): Deep neutral for subtle contrast environments
- **Text Darkest** (`#18181A`): Highest opacity black for maximum impact

### Surface & Borders
- **Surface Light** (`#FAFAFC`): Light background surfaces, hero sections, and clean content areas
- **Surface Lighter** (`#EDEDF2`): Subtle borders, divider lines, and light surface variations
- **Navigation Background** (`#FFFFFF` with 80% opacity): Semi-transparent nav bar allowing content bleed-through

## 3. Typography Rules

### Font Family
**Primary Font:** SF Pro Text (fallback: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica Neue, sans-serif)
**Display Font:** SF Pro Display (fallback: -apple-system, BlinkMacSystemFont, Segoe UI, Helvetica Neue, sans-serif)

### Hierarchy

| Role | Font | Size | Weight | Line Height | Letter Spacing | Notes |
|------|------|------|--------|-------------|-----------------|-------|
| Display XL | SF Pro Display | 80px | 600 | 84px | 0px | Hero headlines, maximum impact |
| Display Large | SF Pro Display | 64px | 600 | 68px | 0px | Section headlines, primary messaging |
| Display Medium | SF Pro Display | 48px | 600 | 52px | 0px | Page titles and major headings |
| Heading XL | SF Pro Display | 40px | 600 | 44px | 0px | Section subheadings and feature titles |
| Heading Large | SF Pro Display | 28px | 600 | 32px | 0px | Card titles and subsection headers |
| Heading Medium | SF Pro Display | 24px | 600 | 24px | 0px | Input labels and form titles |
| Heading Small | SF Pro Text | 19px | 600 | 23px | 0px | Component headings and small titles |
| Heading XSmall | SF Pro Text | 14px | 600 | 19px | 0px | Tertiary headings and tag labels |
| Body Large | SF Pro Display | 28px | 400 | 32px | 0px | Large body text and feature descriptions |
| Body Medium | SF Pro Display | 21px | 400 | 29px | 0px | Standard body text for content |
| Body Small | SF Pro Text | 17px | 400 | 25px | 0px | Default paragraph text and descriptions |
| Body XSmall | SF Pro Text | 14px | 400 | 18px | 0px | Secondary body text and captions |
| Caption | SF Pro Text | 12px | 400 | 16px | 0px | Helper text, metadata, footnotes |
| Link Primary | SF Pro Text | 17px | 600 | 21px | 0px | Primary interactive links |
| Link Small | SF Pro Text | 14px | 400 | 18px | 0px | Secondary links and link variants |
| Button Text | SF Pro Text | 18px | 300 | 18px | 0px | CTA button labels |
| Button Secondary | SF Pro Text | 14px | 400 | 18px | 0px | Secondary button text |

### Principles
- **Scale and weight drive hierarchy**, not color alone
- **Line height exceeds font size** for spacious, readable text
- **SF Pro fonts are metric-optimized** for Apple platforms and provide superior legibility
- **Light weights (300–400) paired with larger sizes** create sophisticated, breathing layouts
- **Medium/bold weights (600) reserved** for headings and emphasized content only
- **Letter spacing remains neutral** (0px) across the system; white space manages breathing
- **Text contrast meets WCAG AAA** standards with dark text on light backgrounds and vice versa

## 4. Component Stylings

### Buttons

#### Primary Button (Solid)
- **Background:** `#1D1D1F`
- **Text Color:** `#FFFFFF`
- **Font:** SF Pro Text, `18px`, weight `300`, line-height `18px`
- **Padding:** `8px 16px`
- **Border Radius:** `8px`
- **Border:** none
- **Hover State:** Background `#333336`
- **Active State:** Background `#000000`
- **Disabled State:** Opacity `0.5`, cursor not-allowed

#### Secondary Button (Ghost/Text)
- **Background:** transparent
- **Text Color:** `#1D1D1F`
- **Font:** SF Pro Text, `17px`, weight `400`, line-height `25px`
- **Padding:** `0px 0px`
- **Border Radius:** `0px`
- **Border:** none
- **Hover State:** Text color `#0071E3`, underline optional
- **Active State:** Text color `#006EDB`
- **Disabled State:** Text color `#6E6E73`

#### Icon Button
- **Background:** transparent
- **Icon Color:** `#1D1D1F` with `80%` opacity
- **Width/Height:** `18px` or `22px`
- **Font Size:** `17px` or `18px`
- **Padding:** `0px`
- **Border Radius:** `0px`
- **Hover State:** Icon color becomes `#1D1D1F` at full opacity
- **Active State:** Icon color `#0071E3`

#### CTA Button (Featured)
- **Background:** `#0071E3`
- **Text Color:** `#FFFFFF`
- **Font:** SF Pro Text, `17px` or `18px`, weight `400`–`600`
- **Padding:** `12px 24px`
- **Border Radius:** `50%` (pill-shaped) or `8px` (rounded)
- **Border:** none
- **Hover State:** Background `#006EDB`
- **Active State:** Background `#0076DF`
- **Focus State:** Outline `2px solid #0071E3` with `4px` offset

### Cards & Containers

#### Product Card
- **Background:** `#FFFFFF`
- **Text Color:** `#1D1D1F`
- **Padding:** `0px` (images edge-to-edge)
- **Border Radius:** `28px`
- **Border:** none
- **Box Shadow:** none (flat design)
- **Font:** SF Pro Text, `17px`, weight `400`, line-height `25px`
- **Width:** `372px` (responsive to container)
- **Height:** `387px` (auto-adjust based on content)

#### Content Container
- **Background:** `#FAFAFC` or `#FFFFFF`
- **Text Color:** `#1D1D1F`
- **Padding:** `24px`, `40px`, `84px`, or `88px` (contextual)
- **Border Radius:** `0px`
- **Border:** none
- **Margin:** `0px` (full-width with padding management)

#### Divider / Border
- **Background:** `#EDEDF2`
- **Height:** `1px`
- **Width:** full-width or contextual
- **Opacity:** `1`

### Inputs & Forms

#### Text Input
- **Background:** `#FFFFFF`
- **Text Color:** `#1D1D1F`
- **Font:** SF Pro Text, `17px`, weight `400`
- **Padding:** `12px 16px`
- **Border Radius:** `8px`
- **Border:** `1px solid #EDEDF2`
- **Height:** `44px` (touch-safe minimum)
- **Placeholder Color:** `#6E6E73` at `60%` opacity
- **Focus State:** Border `2px solid #0071E3`, box-shadow `0 0 0 3px rgba(0, 113, 227, 0.1)`
- **Error State:** Border `2px solid #FF3B30`, text color `#FF3B30`
- **Disabled State:** Background `#F5F5F7`, text color `#6E6E73`, cursor not-allowed

#### Select / Dropdown
- **Background:** `#FFFFFF`
- **Text Color:** `#1D1D1F`
- **Font:** SF Pro Display, `24px`, weight `600` (for large select elements)
- **Padding:** `12px 16px`
- **Border Radius:** `8px`
- **Border:** `1px solid #EDEDF2`
- **Height:** `44px`
- **Chevron Icon Color:** `#6E6E73`
- **Hover State:** Border `#D0D0D5`
- **Focus State:** Border `2px solid #0071E3`

#### Checkbox / Radio
- **Size:** `18px × 18px`
- **Border Radius:** `4px` (checkbox), `50%` (radio)
- **Border:** `2px solid #D0D0D5`
- **Background:** `#FFFFFF`
- **Checked Background:** `#0071E3`
- **Checked Border:** none
- **Checked Icon Color:** `#FFFFFF`
- **Focus State:** Outline `2px solid #0071E3` at `3px` offset

### Navigation

#### Top Navigation Bar
- **Background:** `#FFFFFF` with `80%` opacity (backdrop blur recommended)
- **Text Color:** `#1D1D1F`
- **Font:** SF Pro Text, `17px`, weight `400`, line-height `25px`
- **Height:** `44px`
- **Padding:** `0px` (full-width with internal spacing via links)
- **Border Radius:** `0px`
- **Border:** bottom `1px solid #EDEDF2`
- **Width:** `1440px` (responsive max-width container)
- **Link Styling (inactive):** Text `#1D1D1F`, opacity `0.8`, padding `0px 8px`
- **Link Styling (active/hover):** Text `#0071E3`, opacity `1`

#### Link / Navigation Item
- **Text Color:** `#1D1D1F` at `80%` opacity
- **Font:** SF Pro Text, `17px`, weight `600` (primary nav), `400` (secondary)
- **Padding:** `0px 8px` (for height: `44px` container)
- **Line Height:** `21px` or `25px`
- **Border Radius:** `0px`
- **Background:** transparent
- **Hover State:** Text color `#1D1D1F` at full opacity, optional bottom border `2px solid #0071E3`
- **Active State:** Text color `#0071E3`, bottom border `2px solid #0071E3`
- **Font Size Variants:** `12px`, `14px`, `17px` (based on hierarchy role)

## 5. Layout Principles

### Spacing System
**Base Unit:** `4px`

**Spacing Scale:**
- `8px` (xs) – micro-spacing between inline elements
- `12px` (sm) – small gaps between components
- `16px` (md) – default padding and margin
- `20px` (lg) – component spacing
- `24px` (xl) – section padding
- `28px` (2xl) – generous margins
- `32px` (3xl) – section breaks
- `36px` (4xl) – large section spacing
- `40px` (5xl) – major section padding
- `44px` (6xl) – navigation and tall containers
- `84px` (7xl) – hero section padding
- `88px` (8xl) – maximum section padding

**Usage Context:**
- `8px`–`16px`: Button padding, input spacing, list gaps
- `20px`–`28px`: Card padding, component margins
- `32px`–`44px`: Section padding, container spacing
- `84px`–`88px`: Hero sections, full-width padding

### Grid & Container
- **Max Width:** `1440px` (navigation and main content container)
- **Column Strategy:** 12-column responsive grid; collapses to 6 columns at tablet, 1 column on mobile
- **Gutter:** `20px` between columns
- **Outer Margin:** `20px` on sides (increases to `40px` on larger screens)
- **Section Pattern:** Full-width containers with `40px`–`88px` padding; content max-width `1200px`

### Whitespace Philosophy
**Whitespace is a first-class design element**, not residual space. Apple embraces generous margins and padding to reduce cognitive load and emphasize focal points. Breathing room around typography and imagery creates sophistication. Section breaks use vertical spacing (`40px`–`88px`) rather than visual dividers. The design favors subtraction over addition—every element must justify its presence.

### Border Radius Scale
- **0px:** Navigation, full-width containers, clean geometric forms
- **8px:** Buttons, input fields, small components
- **28px:** Large cards, product containers, featured elements
- **50%:** Pill-shaped buttons, perfect circles, icon backgrounds

## 6. Depth & Elevation

| Level | Treatment | Use |
|-------|-----------|-----|
| Flat (0) | No shadow; flat background | Default cards, containers, standard UI |
| Raised (1) | `0px 2px 8px rgba(0, 0, 0, 0.08)` | Hover states on flat cards |
| Floating (2) | `0px 4px 16px rgba(0, 0, 0, 0.12)` | Modals, dropdowns, floating action elements |
| Overlay (3) | `0px 8px 32px rgba(0, 0, 0, 0.16)` | Prominent modals, fullscreen overlays |

**Shadow Philosophy:**
Apple's design system uses **minimal, subtle shadows** that never distract. Shadows are reserved for elevation context—communicating layering and interaction feedback rather than creating dimension. Most surfaces are flat; shadow use is restrained and purposeful. Ambient shadows hint at depth; they do not overwhelm the interface.

## 7. Do's and Don'ts

### Do
- **Use whitespace generously** to frame content and reduce visual noise
- **Prioritize legibility** with high contrast (WCAG AAA) and appropriate font sizes
- **Apply consistent spacing** using the spacing scale (`4px` base unit)
- **Leverage typography scale** to establish hierarchy; avoid relying on color alone
- **Keep interactions smooth** with subtle transitions (`0.2s`–`0.3s` easing)
- **Test on real devices** to ensure touch targets are minimum `44px × 44px`
- **Use the primary blue** (`#0071E3`) sparingly for CTAs and high-emphasis interactions
- **Maintain alignment** to an invisible grid; avoid arbitrary positioning
- **Provide clear focus states** for keyboard navigation and accessibility
- **Use SF Pro fonts** exclusively for brand consistency and metric optimization

### Don't
- **Don't use excessive shadows** or gradients; maintain flatness
- **Don't mix font families** outside SF Pro Text and SF Pro Display
- **Don't create custom color palettes**; use the defined neutral and primary scale
- **Don't place text directly on busy backgrounds** without sufficient contrast
- **Don't make interactive elements smaller than `44px` on touch devices**
- **Don't use decorative elements** that don't serve a functional purpose
- **Don't apply bold weights** to body text; reserve weight for emphasis in headings
- **Don't over-animate**; transitions should be under `400ms` and use ease-in-out timing
- **Don't ignore accessibility**; always provide keyboard navigation and ARIA labels
- **Don't deviate from the spacing scale** without documented justification

## 8. Responsive Behavior

### Breakpoints

| Name | Width | Key Changes |
|------|-------|-------------|
| Mobile | 320px–767px | Single column, `16px`–`20px` padding, font sizes reduced by 1–2 steps, navigation collapses to hamburger |
| Tablet | 768px–1023px | 2–3 columns, `24px`–`40px` padding, font sizes slightly reduced, simplified navigation |
| Desktop | 1024px–1439px | Full 12-column grid, `40px`–`88px` padding, all typography scales applied, full navigation bar |
| Large Desktop | 1440px+ | Content capped at `1440px`, outer padding increases to `80px` minimum |

### Touch Targets
- **Minimum Size:** `44px × 44px` for all interactive elements (buttons, links, inputs, icons)
- **Minimum Spacing:** `12px` between adjacent touch targets to prevent mis-taps
- **Safe Zone:** `8px` minimum padding around touch target edges
- **Icons in Buttons:** Icon should be `18px`–`24px` centered within `44px` container

### Collapsing Strategy
- **Navigation:** Hamburger menu at mobile; horizontal nav bar at tablet+
- **Grid Layout:** Single column on mobile, 2–3 columns at tablet, full 12 columns at desktop
- **Padding:** Decrease outer padding as viewport shrinks; maintain baseline rhythm internally
- **Typography:** Base sizes remain fixed; reduce only where necessary for small screens
- **Images:** Use `max-width: 100%` with aspect-ratio containers to maintain proportions
- **Cards:** Full-width single column on mobile; multi-column grid at tablet+
- **Modals/Overlays:** Full-screen on mobile; centered modal at tablet+

## 9. Agent Prompt Guide

### Quick Color Reference
- **Primary CTA:** Primary Action Blue (`#0071E3`)
- **Primary Hover:** Primary Blue Shade (`#006EDB`)
- **Primary Active:** Primary Blue Dark (`#0076DF`)
- **Default Background:** `#FFFFFF`
- **Section Background:** Surface Light (`#FAFAFC`)
- **Text Primary:** Text Primary (`#1D1D1F`)
- **Text Secondary:** Text Secondary (`#333336`)
- **Text Tertiary / Disabled:** Text Tertiary (`#6E6E73`)
- **Borders / Dividers:** Surface Lighter (`#EDEDF2`)
- **Navigation Background:** `rgba(255, 255, 255, 0.8)` with backdrop blur

### Iteration Guide

1. **Always use SF Pro Text and SF Pro Display fonts exclusively.** No substitutions or custom fonts.

2. **Apply spacing from the scale (`8px`, `12px`, `16px`, `20px`, `24px`, `28px`, `32px`, `36px`, `40px`, `44px`, `84px`, `88px`).** Never use arbitrary spacing values.

3. **Build typography hierarchy using size and weight, not color.** Headings use weight `600`, body uses `400`–`300`, with sizes matching the Hierarchy table exactly.

4. **Set touch targets to minimum `44px × 44px`** for all interactive elements. Maintain `12px` spacing between adjacent targets.

5. **Use the primary blue (`#0071E3`) only for primary CTAs, links, and high-emphasis feedback states.** Secondary and neutral elements use the dark neutral scale.

6. **Apply border-radius sparingly:** `0px` for full-width containers, `8px` for buttons/inputs, `28px` for large cards, `50%` for pills.

7. **Maintain flat design** with no shadows on default states. Shadows are reserved for elevated states (`0px 2px 8px rgba(0,0,0,0.08)` minimum).

8. **Implement focus states** with `2px solid #0071E3` outline at `3px`–`4px` offset for keyboard navigation.

9. **Test contrast ratios** to meet WCAG AAA (4.5:1 for text, 3:1 for graphics). Dark text (`#1D1D1F`) on light backgrounds and light text on dark backgrounds.

10. **Use max-width containers** at `1440px` for navigation and main content. Responsive columns collapse from 12 columns (desktop) to 1 column (mobile) following the Breakpoints table.