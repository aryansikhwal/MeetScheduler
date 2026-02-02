# MarkAssist Frontend — Style & Theme Guide

## Tech Stack

- **Framework**: React 19 + TypeScript
- **Styling**: Tailwind CSS (CDN — `cdn.tailwindcss.com`)
- **Font**: [Inter](https://fonts.google.com/specimen/Inter) (weights 300–700)
- **Icons**: Inline SVGs (Lucide-style, 18–20px, `strokeWidth="2"`)

---

## Color Palette

### Primary — Blue

| Token             | Value       | Usage                                      |
| ----------------- | ----------- | ------------------------------------------ |
| `blue-600`        | `#2563EB`   | Primary buttons, sidebar bg, active states |
| `blue-700`        | `#1D4ED8`   | Button hover                               |
| `blue-500`        |             | Focus rings, accent badges                 |
| `blue-200`        |             | Button shadows (`shadow-blue-200`)         |
| `blue-100`        |             | Sidebar secondary text, badges             |
| `blue-50`         |             | Avatar bg, light tint backgrounds          |

### Neutrals — Slate

| Token             | Usage                                      |
| ----------------- | ------------------------------------------ |
| `slate-900`       | Headings, primary text                     |
| `slate-800`       | Body text in revealed badges               |
| `slate-700`       | Logo secondary text, medium text           |
| `slate-600`       | Labels, secondary buttons, nav text        |
| `slate-500`       | Subheadings, descriptions                  |
| `slate-400`       | Placeholder text, muted icons, table headers |
| `slate-300`       | Dividers in text, disabled states          |
| `slate-200`       | Borders, input borders                     |
| `slate-100`       | Table row borders, card borders            |
| `slate-50`        | Page background, table header bg, input bg |

### Semantic

| Color             | Usage                                      |
| ----------------- | ------------------------------------------ |
| `green-50/200/600`| Revealed status badges (email/phone)       |
| `green-400`       | Online indicator dot                       |
| `green-500`       | Live results pulse dot                     |
| `red-50/100/600`  | Error alerts, not-revealed badges          |
| `red-500`         | Clear button hover                         |
| `rose-200/500`    | Logout/danger nav items                    |
| `amber-500` (`#F59E0B`) | Logo accent dot                     |

### Backgrounds

| Context           | Class                                      |
| ----------------- | ------------------------------------------ |
| Page background   | `bg-slate-50`                              |
| Auth page         | `bg-gradient-to-br from-blue-50 via-white to-blue-100` |
| Sidebar           | `bg-blue-600`                              |
| Cards / panels    | `bg-white`                                 |
| Glass effect      | `.glass-panel` (white 90% opacity + blur)  |

---

## Typography

| Element            | Classes                                                    |
| ------------------ | ---------------------------------------------------------- |
| Page heading (h1)  | `text-3xl font-black text-slate-900 tracking-tight`        |
| Section heading    | `text-xl font-black text-slate-900`                        |
| Hero heading       | `text-4xl font-bold leading-tight` (auth) / `text-5xl font-black` (dashboard) |
| Body / description | `text-slate-500 font-medium`                               |
| Table header       | `text-[10px] font-black text-slate-400 uppercase tracking-widest` |
| Label              | `text-[11px] font-bold text-slate-600 uppercase tracking-wide` |
| Small badge text   | `text-[9px] font-bold uppercase`                           |
| Nav item           | `text-sm font-semibold`                                    |
| Credit count       | `text-xl font-black text-white` (sidebar)                  |

---

## Border Radius

| Element            | Radius                |
| ------------------ | --------------------- |
| Buttons            | `rounded-xl` (12px)   |
| Input fields       | `rounded-xl`          |
| Cards              | `rounded-2xl` (16px)  |
| Avatars / icons    | `rounded-xl`          |
| Auth container     | `rounded-3xl` (24px)  |
| Large empty states | `rounded-[3rem]`      |
| Status badges      | `rounded-lg` (8px)    |
| Sidebar credit box | `rounded-2xl`         |
| Modal dialogs      | `rounded-2xl`         |
| Logo on dark bg    | `rounded-xl`          |

---

## Shadows

| Usage              | Class                                      |
| ------------------ | ------------------------------------------ |
| Auth card          | `shadow-2xl`                               |
| Primary button     | `shadow-lg shadow-blue-200`                |
| Cards / panels     | `shadow-sm`                                |
| Modal overlay      | `shadow-2xl`                               |
| Active nav item    | `shadow-lg shadow-black/5`                 |
| Hero CTA button    | `shadow-2xl shadow-blue-200`               |

---

## Buttons

### Primary

```
bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 px-4 rounded-xl
shadow-lg shadow-blue-200 transition-all active:scale-[0.98]
disabled:opacity-70 disabled:cursor-not-allowed
```

### Secondary / Outline

```
px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-bold
text-slate-600 hover:bg-slate-50 transition-colors
```

### Danger

```
bg-red-600 text-white hover:bg-red-700 rounded-xl font-bold
```

### Ghost / Nav

```
text-blue-100 hover:bg-white/10 hover:text-white px-4 py-3.5 rounded-xl
```

### Active Nav

```
bg-white/15 text-white shadow-lg shadow-black/5 border border-white/10 rounded-xl
```

### Loading State

Show a `animate-spin` SVG spinner, disable with `disabled:opacity-50`.

---

## Form Inputs

```
w-full text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5
outline-none focus:ring-4 focus:ring-blue-50 focus:border-blue-500
transition-all placeholder:text-slate-300
```

- Clear button: absolute-positioned right-side X icon, `text-slate-400 hover:text-red-500`
- Select inputs: same styling, `cursor-pointer`

---

## Tables

- Container: `bg-white rounded-2xl border border-slate-100 shadow-sm overflow-x-auto`
- Table: `w-full min-w-[900px]`
- Header row: `border-b border-slate-100 bg-slate-50/50`
- Header cell: `text-[10px] font-black text-slate-400 uppercase tracking-widest py-3 px-4`
- Body row: `border-b border-slate-100 hover:bg-slate-50/80 transition-colors`
- Sticky first column: `sticky left-0 bg-white z-10` (with group-hover match)

---

## Badges / Pills

### Revealed (success)

```
inline-flex items-center space-x-2 bg-green-50 border border-green-200 rounded-lg px-3 py-1.5
```

### Not Revealed (locked)

```
inline-flex items-center space-x-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5
```

### Info / Default marker

```
text-[9px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded uppercase
```

### "In list" marker

```
text-[9px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded uppercase
```

---

## Avatars

```
w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center
text-blue-600 font-bold text-sm border border-blue-100
```

Display first + last initials. Sidebar avatar uses `bg-white text-blue-600`.

---

## Sidebar

- Width expanded: `w-64`, collapsed: `w-20`
- Background: `bg-blue-600`
- Transition: `transition-all duration-300 ease-in-out`
- Hidden below `lg` breakpoint: `hidden lg:flex`
- Mobile: slide-out drawer with backdrop `bg-black/40`, drawer `w-72 bg-blue-600 z-50`
- Credits box: `bg-white/10 rounded-2xl p-4 border border-white/10`
- Active indicator (collapsed): `absolute left-0 w-1 h-6 bg-white rounded-r-full`
- Online dot: `w-3 h-3 bg-green-400 border-2 border-blue-600 rounded-full`

---

## Modals

- Overlay: `fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4`
- Panel: `bg-white rounded-2xl shadow-2xl w-full max-w-md` (or `max-w-4xl` for large)
- Header: `p-6 pb-4 border-b border-slate-100`
- Footer: `p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl`
- Close button: `p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl`

---

## Animations & Transitions

| Animation           | Usage                            |
| ------------------- | -------------------------------- |
| `transition-all`    | Default for interactive elements |
| `active:scale-[0.98]` / `active:scale-95` | Button press feedback |
| `hover:scale-110`   | Nav icon hover                   |
| `animate-spin`      | Loading spinners                 |
| `animate-pulse`     | Skeleton loaders, live dot       |
| `animate-float`     | Auth page background blobs (6s)  |
| `animate-in fade-in slide-in-from-left-2 duration-300` | Sidebar text reveal |
| `animate-in fade-in zoom-in-95 duration-500` | Empty state entrance |

---

## Spacing Conventions

| Context            | Padding / Margin                |
| ------------------ | ------------------------------- |
| Page content       | `p-8` (desktop)                 |
| Card internal      | `p-6` or `p-8`                  |
| Auth form panel    | `p-8 sm:p-12 md:p-16`          |
| Table cell         | `py-4 px-4` (body), `py-3 px-4` (header) |
| Sidebar nav items  | `px-4 py-3.5`                   |
| Button (primary)   | `py-3.5 px-4`                   |
| Button (small)     | `px-4 py-2` or `px-2.5 py-1`   |
| Section gap        | `space-y-4` (forms), `gap-6` (grids) |
| Header bottom      | `mb-10` (auth), `mb-6`–`mb-12` (dashboard) |

---

## Responsive Breakpoints

| Breakpoint | Usage                                      |
| ---------- | ------------------------------------------ |
| default    | Mobile-first base styles                   |
| `sm:`      | Minor layout tweaks (padding)              |
| `md:`      | Header flex-row, increased padding         |
| `lg:`      | Sidebar visible, auth two-column layout    |
| `xl:`      | —                                          |
| `2xl:`     | —                                          |

Mobile navigation: hamburger menu in `lg:hidden` top bar, slide-out drawer overlay.

---

## Custom CSS (in `index.html`)

```css
.glass-panel {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

@keyframes float {
  0%   { transform: translateY(0px); }
  50%  { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}
.animate-float { animation: float 6s ease-in-out infinite; }

.custom-scrollbar::-webkit-scrollbar { width: 4px; }
.custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
.custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
.custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #cbd5e1; }
```

---

## Logo

- Icon: Custom SVG (M-shape with amber accent dot)
- Icon stroke color: `#2563EB` (blue-600)
- Accent dot: `#F59E0B` (amber-500)
- Text: "**Mark**" (`font-extrabold`) + "Assist" (`font-semibold`), `text-2xl tracking-tight`
- On dark bg: icon wrapped in `bg-white p-1.5 rounded-xl shadow-sm`
- Collapsible: hides text, shows icon only
