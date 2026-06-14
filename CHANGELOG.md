# Changelog

## [Unreleased]

### Code Review — Security & Correctness (2026-06-14)

#### 🔴 Critical
- **Add auth middleware** to all bookmark extension routes (GET/POST/PUT/DELETE were unauthenticated)
- **Fix URL crash** on POST bookmark by wrapping favicon URL generation in try-catch
- **Fix user existence check** — separate email/username lookups to prevent wrong error messages
- **Standardize `req.user.id`** — changed `req.user._id` to `req.user.id` in tags route for consistency
- **Replace dynamic `import(jsonwebtoken)`** with static import in bookmark import route
- **Move client-side Mongoose imports** (`BookmarkImporter`, `BookmarkHTMLParser`) from `src/utils/` to server-side `utils/`
- **Extract duplicate auto-backup code** (3 copies → 1 shared `utils/backup.js`), removed ~165 duplicated lines

#### 🟡 High Priority
- **Remove debug console.logs** — 20+ `🔍 [DEBUG]` statements stripped from Dashboard, BookmarkGrid, AuthContext, api.js, bookmarks.js
- **Validate favicon URLs** — server-side validation ensures only http/https URLs are stored
- **Rate limit auth endpoints** — `express-rate-limit` added to login/register (20 requests per 15 min)
- **Fix `useVirtualization`** — was stubbed with `Math.floor(0)`, now accepts `scrollTop` parameter
- **Fix `batchUpdates`** — `const` reassignment bug fixed (changed to `let`)
- **Fix route ordering** — `GET /shared-with-me` moved above `GET /:id` to prevent route shadowing
- **Remove unused code**: IndexedDB utility (`db.js`), UndoManager/UndoContext, stale `tagApi.createTag/updateTag/deleteTag`
- **404 dead files deleted** totaling ~475 lines

#### 🟡 Medium Priority
- **Replace third-party CORS proxy** — metadata fetching moved from `api.allorigins.win` to server-side endpoint (`/api/metadata`)
- **Extract tags normalization** — duplicated logic in POST/PUT bookmark routes consolidated into shared `normalizeTags()` helper
- **Remove GC interval** — forced `global.gc()` every 30s removed from `server.js`
- **Strip internal fields from exports** — `_id`, `__v`, `owner` filtered out of bookmark JSON exports
- **Fix LinkedIn icon** — was using `MessageCircle` (same as WhatsApp), now uses `Linkedin` icon
- **Fix `response.data || response` pattern** — simplified to `response.data` across all API files
- **Configurable CORS origin** — now uses `CORS_ORIGIN` env var with fallback to `http://localhost:5170`

#### 💭 Low Priority
- **Delete stale `AddBookmarkForm copy.jsx`** — accidental duplicate file
- **Fix sync `fs.unlinkSync`** — changed to `await fs.promises.unlink()` in async route handler
- **Configurable extension URL** — Chrome extension reads `appUrl` from `chrome.storage.sync`, falls back to `http://localhost:5170`
- **New server-side metadata route** (`/api/metadata`) — fetches page title without third-party proxy

---

## [10.1] — 2026-06-13

### Added
- Duplicate bookmark detection and removal

## [10.0] — 2026-06-12

### Added
- Font Settings UI with web-safe font options
- Troubleshooting and dev documentation
- Database management utility scripts
- Comprehensive README with installation guide
- Automatic backup system for data protection

## [9.5] — 2026-06-10

### Fixed
- Folder view not showing bookmarks

## [9.2] — 2026-06-08

### Changed
- Security improvements and documentation updates

## [9.0] — 2026-06-05

### Added
- User management and bookmark restoration scripts
- Browser extensions with pre-filled bookmark forms
- Firefox compatibility

## [8.5] — 2026-06-01

### Added
- Initial bookmark manager release
