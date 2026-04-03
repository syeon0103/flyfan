# 펜팔 (Fenpal) Installation Guide

## Current Status

All source code files have been successfully created. The project structure is complete with:
- ✓ 22 TypeScript/CSS source files
- ✓ 9 pages with full implementations
- ✓ 13 reusable UI and layout components
- ✓ Tailwind CSS configuration with Gemstone v7 design system
- ✓ Next.js 14 app router setup
- ✓ TypeScript configuration

## Project Location
```
/tmp/flyfan/
```

## Files Created Summary

### Configuration Files (11 files)
- `package.json` - Dependencies and scripts
- `tsconfig.json` - TypeScript configuration
- `tailwind.config.ts` - Tailwind CSS with design tokens
- `next.config.js` - Next.js configuration
- `postcss.config.js` - PostCSS configuration
- `.eslintrc.json` - ESLint rules
- `.eslintignore` - Files to ignore for linting
- `.gitignore` - Git ignore patterns
- `README.md` - Project documentation
- `INSTALLATION_GUIDE.md` - This file

### UI Components (5 files)
1. `src/components/ui/Button.tsx` - Button with variants (primary, secondary, ghost) and sizes
2. `src/components/ui/Input.tsx` - Text input with label, icon, and error support
3. `src/components/ui/Textarea.tsx` - Multi-line textarea with character count
4. `src/components/ui/Tag.tsx` - Pill-shaped tag/chip with optional remove button
5. `src/components/ui/Modal.tsx` - Bottom sheet and center modal support

### Layout Components (2 files)
1. `src/components/layout/TopAppBar.tsx` - Header with back, menu, logo, and actions
2. `src/components/layout/BottomNavBar.tsx` - Fixed bottom navigation with 4 tabs

### Post Components (2 files)
1. `src/components/posts/RecruitmentCard.tsx` - Recruitment card with status, tags, stats
2. `src/components/posts/IdolSlot.tsx` - Idol selection slot with active states

### Profile Components (1 file)
1. `src/components/profile/TimelineItem.tsx` - Timeline entry with featured variant

### Pages (10 files)
1. `src/app/page.tsx` - Home/Explore page with tabs and filters
2. `src/app/posts/[id]/page.tsx` - Post detail with comments
3. `src/app/posts/[id]/matching/page.tsx` - Matching interaction page
4. `src/app/posts/create/fan-meet/page.tsx` - 덕메 recruitment form
5. `src/app/posts/create/buddy/page.tsx` - 비계친 buddy form
6. `src/app/profile/settings/page.tsx` - Profile settings with timeline
7. `src/app/profile/keyword-select/page.tsx` - Keyword selection modal
8. `src/app/profile/timeline/add/page.tsx` - Add timeline entry
9. `src/app/saved/page.tsx` - Saved/bookmarked posts
10. `src/app/report/page.tsx` - Report modal

### App Setup (2 files)
1. `src/app/layout.tsx` - Root layout with metadata
2. `src/app/globals.css` - Global styles and font imports

## Design System Implemented (Gemstone v7)

### Colors
- Primary: #000000 (Black)
- Surface: #FFFFFF (White)
- Muted: #F5F5F5 (Light Gray)
- Text colors: Primary, Secondary, Muted
- Accent colors: Pink, Purple, Mint
- Status colors: Open (Green), Closed (Gray)

### Typography
- Font: Pretendard (Korean-optimized)
- Imported from CDN for Korean text support

### Spacing & Radius
- Border radius: xs (4px), sm (8px), md (12px), lg (16px), xl (20px)
- Responsive spacing with Tailwind utilities

### Components Features
- Responsive design (mobile-first)
- Proper color contrast for accessibility
- Hover and focus states
- Dark/light mode ready
- Korean text throughout

## How to Install and Run

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation Steps

```bash
# Navigate to project
cd /tmp/flyfan

# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000 in your browser
```

### Build for Production
```bash
npm run build
npm start
```

## Project Structure Overview

```
/tmp/flyfan/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx           # Home (/)
│   │   ├── layout.tsx         # Root layout
│   │   ├── globals.css        # Global styles
│   │   ├── posts/
│   │   │   ├── [id]/
│   │   │   │   ├── page.tsx           # Detail (/posts/[id])
│   │   │   │   └── matching/page.tsx  # Matching (/posts/[id]/matching)
│   │   │   └── create/
│   │   │       ├── fan-meet/page.tsx  # Form (/posts/create/fan-meet)
│   │   │       └── buddy/page.tsx     # Form (/posts/create/buddy)
│   │   ├── profile/
│   │   │   ├── settings/page.tsx      # Settings (/profile/settings)
│   │   │   ├── keyword-select/page.tsx # Modal (/profile/keyword-select)
│   │   │   └── timeline/add/page.tsx  # Form (/profile/timeline/add)
│   │   ├── saved/page.tsx             # Saved posts (/saved)
│   │   └── report/page.tsx            # Report (/report)
│   └── components/
│       ├── ui/                # Base UI components
│       │   ├── Button.tsx
│       │   ├── Input.tsx
│       │   ├── Textarea.tsx
│       │   ├── Tag.tsx
│       │   └── Modal.tsx
│       ├── layout/            # Layout components
│       │   ├── TopAppBar.tsx
│       │   └── BottomNavBar.tsx
│       ├── posts/             # Post components
│       │   ├── RecruitmentCard.tsx
│       │   └── IdolSlot.tsx
│       └── profile/           # Profile components
│           └── TimelineItem.tsx
├── tailwind.config.ts         # Design system tokens
├── tsconfig.json
├── next.config.js
├── postcss.config.js
├── package.json
├── README.md
└── .gitignore
```

## Key Features Implemented

### Pages & Features
- ✓ Responsive home page with filters and tabs
- ✓ Post detail page with comments
- ✓ Recruitment form (덕메 and 비계친)
- ✓ Profile settings with timeline
- ✓ Saved posts page
- ✓ Modals for keywords and reports
- ✓ Timeline creation page
- ✓ Matching interaction page

### Components
- ✓ Reusable button component (3 variants, 3 sizes)
- ✓ Form inputs with validation
- ✓ Tag/chip component with remove option
- ✓ Modal (center and bottom-sheet)
- ✓ Top app bar with flexible actions
- ✓ Fixed bottom navigation
- ✓ Recruitment cards with status
- ✓ Idol selection slots
- ✓ Timeline items with featured states

### Design System
- ✓ Tailwind configuration with custom colors
- ✓ Border radius system
- ✓ Shadow utilities
- ✓ Korean font (Pretendard)
- ✓ Mobile-first responsive design
- ✓ Consistent spacing system

## Troubleshooting

### npm install fails
The environment may have npm registry restrictions. In that case:
1. Try: `npm install --legacy-peer-deps`
2. Or use: `yarn install` if yarn is available
3. Or manually copy node_modules from another environment

### TypeScript errors
All files are TypeScript-strict compatible. Ensure:
- Node.js 18+ is installed
- `npm install` completes successfully
- TypeScript 5.2+ is installed

### Missing Lucide Icons
Icons are imported from 'lucide-react'. Ensure it's installed:
```bash
npm install lucide-react
```

## Next Steps

1. **Install dependencies**: `npm install`
2. **Start development**: `npm run dev`
3. **View in browser**: http://localhost:3000
4. **Customize**: Update colors in `tailwind.config.ts`
5. **Deploy**: Build and deploy to Vercel or any Node.js host

## Support

All code is fully typed with TypeScript and follows React 18+ best practices.
For questions about the design system, refer to the Gemstone v7 specifications in `tailwind.config.ts`.

---
Project created: 2026-04-02
Last updated: 2026-04-02
