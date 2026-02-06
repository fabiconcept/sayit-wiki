# SayIt Wiki - Backend & Frontend Implementation

## Project Overview

SayIt Wiki is a privacy-focused, anonymous note-sharing platform where users can post notes without creating profiles. User identification is handled through encrypted browser-based IDs stored in localStorage.

## Key Features

### ✅ Implemented

1. **No User Profiles**
   - No registration or authentication required
   - Anonymous posting with encrypted userId
   - Privacy-first design

2. **Encrypted User IDs**
   - Generated on first visit
   - Stored encrypted in localStorage
   - Used for tracking likes, views, and reports
   - Never exposed to other users

3. **Admin Panel (Development Only)**
   - View reported content
   - Ignore or take down reported notes
   - Filter by status (pending, reviewed, all)
   - Only accessible when `NODE_ENV=development`

4. **Backend API Structure**
   - RESTful API endpoints
   - Comprehensive error handling
   - Rate limiting support
   - Content moderation integration

## Architecture

### Frontend Stack
- **Framework:** Next.js 16 (App Router)
- **State Management:** Redux Toolkit
- **UI:** React 19, TailwindCSS, Framer Motion
- **Content Moderation:** @useverse/profanity-guard

### Backend Stack (To Be Implemented)
- **Runtime:** Node.js with Next.js API Routes
- **Database:** PostgreSQL (recommended) or MongoDB
- **Caching:** Redis (for rate limiting)
- **ORM:** Prisma or raw SQL

## File Structure

```
sayit-wiki/
├── app/
│   ├── admin/
│   │   └── page.tsx                    # Admin panel for reported content
│   ├── api/
│   │   ├── health/
│   │   │   └── route.ts               # Health check endpoint
│   │   └── v1/
│   │       ├── notes/
│   │       │   ├── route.ts           # GET /notes, POST /notes
│   │       │   └── [noteId]/
│   │       │       ├── route.ts       # GET /notes/:id, DELETE /notes/:id
│   │       │       └── comments/
│   │       │           └── route.ts   # GET/POST comments
│   │       ├── likes/
│   │       │   └── route.ts           # POST /likes (toggle)
│   │       ├── views/
│   │       │   └── route.ts           # POST /views (track)
│   │       ├── reports/
│   │       │   └── route.ts           # POST /reports
│   │       └── admin/
│   │           └── reports/
│   │               ├── route.ts       # GET /admin/reports
│   │               └── [reportId]/
│   │                   ├── ignore/
│   │                   │   └── route.ts
│   │                   └── takedown/
│   │                       └── route.ts
│   ├── note/
│   │   └── [noteId]/
│   │       └── page.tsx               # Individual note page
│   └── page.tsx                       # Home page (notes feed)
├── components/
│   ├── make-a-note/
│   │   └── index.tsx                  # Create note modal
│   ├── report-note.tsx                # Report note modal
│   └── ui/
│       └── NoteCard/                  # Note card components
├── lib/
│   ├── crypto.ts                      # Encryption utilities
│   ├── userId.ts                      # User ID management
│   ├── api.ts                         # API client
│   └── utils.ts                       # Utility functions
├── hooks/
│   └── useUserId.ts                   # React hook for userId
├── store/
│   ├── slices/
│   │   ├── notesSlice.ts             # Notes state management
│   │   ├── commentsSlice.ts          # Comments state management
│   │   └── appSlice.ts               # App state management
│   └── store.ts                       # Redux store configuration
├── types/
│   └── note.ts                        # TypeScript types
└── docs/
    ├── BACKEND_API_REQUIREMENTS.md    # Complete API specification
    ├── IMPLEMENTATION_GUIDE.md        # Step-by-step implementation
    └── README.md                      # This file
```

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Set Up Environment Variables

Create `.env.local`:

```env
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/sayit_wiki
REDIS_URL=redis://localhost:6379
NEXT_PUBLIC_ENCRYPTION_KEY=your-secret-key-change-in-production
```

### 3. Run Development Server

```bash
npm run dev
```

Visit:
- Main app: `http://localhost:3000`
- Admin panel: `http://localhost:3000/admin` (dev only)
- Health check: `http://localhost:3000/api/health`

## Core Concepts

### 1. User Identification

Users are identified by an encrypted ID stored in localStorage:

```typescript
import { getUserId, getEncryptedUserId } from '@/lib/userId';

// Get plain userId (for internal use)
const userId = getUserId();

// Get encrypted userId (for API requests)
const encryptedId = getEncryptedUserId();
```

The encrypted userId is automatically included in all API requests via the `X-User-Id` header.

### 2. API Client

All API calls should use the centralized API client:

```typescript
import { apiClient } from '@/lib/api';

// Create a note
const response = await apiClient.createNote({
    content: "My note",
    backgroundColor: "#FFE5B4",
    noteStyle: "sticky-note",
    clipType: "pin",
    tilt: -2.5,
    selectedFont: "Schoolbell"
});

// Like a note
await apiClient.toggleLike(noteId, 'note');

// Report content
await apiClient.reportContent(noteId, 'note', 'Inappropriate');
```

### 3. Admin Panel

The admin panel is only accessible in development mode:

- **URL:** `/admin`
- **Access Control:** Checks `process.env.NODE_ENV === 'development'`
- **Features:**
  - View all reported content
  - Filter by status
  - Ignore reports
  - Take down content

### 4. Content Moderation

Content is moderated using `@useverse/profanity-guard`:

```typescript
import { ProfanityGuard, ModerationLevel } from '@useverse/profanity-guard';

const guard = new ProfanityGuard();
const result = guard.check(content, ModerationLevel.STRICT);
```

## API Endpoints

### Notes
- `GET /api/v1/notes` - Get paginated notes
- `POST /api/v1/notes` - Create a note
- `GET /api/v1/notes/:noteId` - Get single note
- `DELETE /api/v1/notes/:noteId` - Delete note

### Comments
- `GET /api/v1/notes/:noteId/comments` - Get comments
- `POST /api/v1/notes/:noteId/comments` - Create comment

### Interactions
- `POST /api/v1/likes` - Toggle like on note/comment
- `POST /api/v1/views` - Track note view
- `POST /api/v1/reports` - Report content

### Admin (Dev Only)
- `GET /api/v1/admin/reports` - Get reported content
- `POST /api/v1/admin/reports/:reportId/ignore` - Ignore report
- `POST /api/v1/admin/reports/:reportId/takedown` - Take down content

See `docs/BACKEND_API_REQUIREMENTS.md` for complete API documentation.

## Database Schema

### Tables

1. **notes** - User-posted notes
2. **comments** - Comments on notes
3. **likes** - Like records (userId + targetId)
4. **views** - View records (userId + noteId)
5. **reports** - Content reports

See `docs/BACKEND_API_REQUIREMENTS.md` for complete schema definitions.

## Rate Limiting

Per userId per hour:
- **Notes:** 10 requests
- **Comments:** 20 requests
- **Likes:** 100 requests
- **Views:** 200 requests
- **Reports:** 5 requests

## Security Features

1. **No PII Collection** - No personal information stored
2. **Encrypted User IDs** - All user identification is encrypted
3. **Content Moderation** - Profanity filtering on all content
4. **Rate Limiting** - Prevents abuse
5. **Input Validation** - Strict validation on all inputs
6. **SQL Injection Prevention** - Parameterized queries
7. **XSS Prevention** - Content sanitization

## Development Workflow

### 1. Frontend Development

```bash
# Start dev server
npm run dev

# Access admin panel
open http://localhost:3000/admin
```

### 2. Backend Development

The API routes are in `app/api/v1/`. Each route currently returns mock data. To implement:

1. Set up database connection in `lib/db.ts`
2. Implement rate limiting in `lib/rateLimit.ts`
3. Update API routes to use database
4. Test endpoints

See `docs/IMPLEMENTATION_GUIDE.md` for detailed steps.

### 3. Testing

```bash
# Run linter
npm run lint

# Build for production
npm run build

# Start production server
npm start
```

## Deployment

### Environment Setup

1. Set up PostgreSQL database
2. Set up Redis instance
3. Configure environment variables
4. Deploy to Vercel/Netlify/your platform

### Production Checklist

- [ ] Database configured and migrated
- [ ] Redis configured for rate limiting
- [ ] Strong encryption key set
- [ ] CORS configured
- [ ] Rate limits tested
- [ ] Content moderation tested
- [ ] Admin panel inaccessible (NODE_ENV=production)
- [ ] SSL/TLS enabled
- [ ] Monitoring configured
- [ ] Backups configured

## Troubleshooting

### Common Issues

**Issue:** userId not persisting
- **Solution:** Check localStorage is enabled

**Issue:** Admin panel not accessible
- **Solution:** Verify `NODE_ENV=development`

**Issue:** API calls failing
- **Solution:** Check network tab, verify X-User-Id header

**Issue:** Content rejected by moderation
- **Solution:** Adjust moderation level or content

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## Documentation

- **API Specification:** `docs/BACKEND_API_REQUIREMENTS.md`
- **Implementation Guide:** `docs/IMPLEMENTATION_GUIDE.md`
- **This README:** `docs/README.md`

## License

[Your License Here]

## Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ for privacy-conscious note sharing**
