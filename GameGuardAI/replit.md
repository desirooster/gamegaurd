# GameProxy - Secure Gaming Proxy Platform

## Overview

GameProxy is a web-based proxy application that allows users to access gaming websites through a secure intermediary. The platform features AI-powered game recommendations based on browsing history, a personal library of saved sites, and comprehensive browsing/proxy logging capabilities. Built with a modern tech stack, it provides a Steam/Discord-inspired dark gaming aesthetic while maintaining a clean, functional user experience.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript running on Vite for fast development and optimized production builds.

**UI Component System**: shadcn/ui components built on Radix UI primitives, providing accessible, customizable components styled with Tailwind CSS. The design system follows a gaming platform aesthetic with a dark-first theme approach.

**State Management**: TanStack Query (React Query) handles all server state management, caching, and data synchronization. No global client state management library is used; component-level state with hooks suffices for local UI state.

**Routing**: Wouter provides lightweight client-side routing without the complexity of React Router.

**Styling Approach**: Tailwind CSS with custom design tokens defined in CSS variables. The system uses HSL color values for easy theme manipulation and supports both light and dark modes. Gaming-inspired fonts (Rajdhani for headers, Inter for body) are loaded from Google Fonts.

**Key Design Decisions**:
- Dark mode by default to align with gaming platform expectations
- Component-based architecture with reusable UI elements (GameCard, LogEntry, EmptyState, etc.)
- Custom spacing system based on Tailwind's scale (2, 4, 6, 8, 12 units)
- Hover effects and elevation shadows for interactive feel

### Backend Architecture

**Server Framework**: Express.js running on Node.js with TypeScript for type safety.

**API Design**: RESTful API endpoints under `/api` namespace. The server handles:
- Proxy requests (`/api/proxy`) - fetches and processes external content
- Site management (`/api/sites`) - CRUD operations for saved gaming sites
- Browsing history (`/api/history`) - tracks and retrieves user navigation
- Proxy logs (`/api/logs`) - records all proxy requests with status and timing
- AI recommendations (`/api/recommendations`) - generates personalized game suggestions

**Data Storage Strategy**: The application uses an in-memory storage implementation (`MemStorage` class) that implements the `IStorage` interface. This design allows for easy swapping to a database-backed implementation (PostgreSQL with Drizzle ORM) without changing the API layer.

**Schema Design**: Drizzle ORM schemas are defined for three main entities:
- `savedSites`: User's library of gaming websites with metadata (title, favicon, category, favorites, visit tracking)
- `browsingHistory`: Chronological record of visited URLs with duration tracking
- `proxyLogs`: Technical logs of proxy requests including status codes, response times, and errors

**Build Process**: esbuild bundles the server code with selective dependency bundling (allowlist approach) to reduce cold start times by minimizing file system operations.

### AI Integration

**Service**: OpenAI GPT-5 for generating gaming website recommendations.

**Implementation Pattern**: The `getGameRecommendations` function takes browsing history as context and uses structured prompts to generate 6-8 varied gaming site recommendations. The AI returns JSON-formatted responses with title, URL, description, genre, and personalized reasoning.

**Error Handling**: Graceful degradation if OpenAI API key is not configured - the app functions normally but recommendations feature shows appropriate error states.

### Proxy Functionality

**Core Mechanism**: The proxy server fetches external HTML content on behalf of the client to bypass CORS restrictions and potentially blocked sites. It:
1. Validates and normalizes input URLs
2. Fetches content with browser-like headers to avoid bot detection
3. Extracts page title from HTML
4. Logs request metadata (status, timing, errors)
5. Returns processed content to the client for iframe rendering

**Security Considerations**: The proxy only returns HTML content (validates content-type). Non-HTML responses return appropriate errors.

**Performance Tracking**: Response times are measured and stored for monitoring proxy performance.

### Session & State Management

No authentication system is currently implemented. All data is session-less and ephemeral (in-memory storage). The architecture supports adding PostgreSQL persistence via Drizzle ORM without API changes.

## External Dependencies

### Core Runtime Dependencies

**Frontend**:
- `react` & `react-dom` - UI framework
- `@tanstack/react-query` - Server state management and caching
- `wouter` - Lightweight routing
- `tailwindcss` - Utility-first CSS framework
- `@radix-ui/*` - Headless UI component primitives (20+ components)
- `class-variance-authority` & `clsx` - Dynamic className composition
- `react-hook-form` & `@hookform/resolvers` - Form state management
- `zod` - Schema validation
- `date-fns` - Date formatting and manipulation
- `lucide-react` - Icon library

**Backend**:
- `express` - Web server framework
- `drizzle-orm` & `drizzle-zod` - Database ORM and schema validation
- `@neondatabase/serverless` - PostgreSQL driver (Neon Database)
- `openai` - OpenAI API client for GPT-5 recommendations
- `zod` & `zod-validation-error` - Request/response validation

### Development Tools

- `vite` - Build tool and dev server
- `tsx` - TypeScript execution for Node.js
- `esbuild` - Server bundling
- `typescript` - Type checking
- `drizzle-kit` - Database migration tool
- `@replit/vite-plugin-*` - Replit-specific development enhancements

### Database

**Configured**: PostgreSQL via Neon Database serverless driver
**Current State**: In-memory storage implementation active; database schema defined but persistence not yet enabled
**Migration Path**: Connection string required in `DATABASE_URL` environment variable; `npm run db:push` command ready to provision schema

### Third-Party APIs

**OpenAI API**: 
- Purpose: Generate personalized gaming website recommendations
- Model: GPT-5
- Configuration: Requires `OPENAI_API_KEY` environment variable
- Graceful degradation: App functions without this key but recommendations feature will error

### Environment Variables

- `DATABASE_URL` - PostgreSQL connection string (optional, in-memory storage used if not provided)
- `OPENAI_API_KEY` - OpenAI API key for recommendations (optional, feature disabled if not provided)
- `NODE_ENV` - Environment mode (development/production)