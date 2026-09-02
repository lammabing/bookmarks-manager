# Changelog

## [Unreleased]

### Fixed (2026-08-10)
- **"Request failed with status code 401" when adding a bookmark** — the API returns 401 when the stored JWT is expired (tokens last 24h), invalidated, or the user was removed from the database. The app previously kept the stale token and stuck "authenticated" state, so every save failed with a cryptic axios error. Added a global 401 response interceptor (`src/utils/api.js`) that clears the invalid token and fires an `auth:unauthorized` event; `AuthContext` listens for it and drops back to the logged-out state so the UI shows the login prompt. `AddBookmarkForm` now also stashes the in-progress bookmark to `pendingBookmark` on 401 (so it's restored after re-login) and shows the server's own message (e.g. "Token is not valid") instead of the raw axios error.

### Fixed (2026-08-02)
- **Add Bookmark submit no longer silently fails ("unresponsive")** — `AddBookmarkForm` never rendered its `error` state or the login prompt, so any failed save (server error, network failure, auth issue) appeared to do nothing. Errors and the login prompt are now shown inline, and the `authLoading` guard gives feedback instead of returning silently.
- **Harden client-side favicon generation** — `addBookmark` in `BookmarkContext` used `new URL(bookmarkData.url).hostname` without a try/catch (the server was already hardened in 2026-06-14). An invalid URL could throw and abort the save before the API call. Now wrapped in try/catch.
- **Fix "Save Sharing Settings" submitting the bookmark form** — the button in `ShareSettings` had no `type` attribute, defaulting to `type="submit"` inside the Add Bookmark form, so it triggered the form submit instead of saving sharing settings. Added `type="button"`.
- **Fix password double-hash breaking new registrations** — the register route hashes the password and the `User` model pre-save hook hashed it again, so newly registered users could never log back in. The hook now skips re-hashing already-bcrypt-hashed passwords. Existing accounts with double-hashed passwords need a password reset.

### Fixed (2026-07-27)
- **Fix inline edit not saving bookmark changes** — `EditBookmarkForm` spread the entire bookmark object when submitting, including the populated `folder` object (`{ _id, name, color }`). The backend's folder validation (`Folder.findOne`) received an object instead of a plain ID, causing a 400 "Invalid folder" error that was silently caught. Fixed by extracting just the folder ID before submission.

### Added
- **PWA support with Web Share Target** — Added `manifest.json`, service worker, and PWA icons (192×192, 512×512). Android Chrome users can install the app and share web pages directly to it via the system share sheet. Added `text` query param handling as a fallback for bookmark description (maps from Web Share Target API).
- **Service worker** — Static asset caching for offline-capable app shell and faster repeat loads.

### Fixed (2026-06-27)
- **Fix 'create folder' in Add Bookmark form submitting the bookmark form instead** — Nested `<form>` inside `<form>` was invalid HTML. Changed to a `<div>` with button `onClick` and Enter key handler. Added user-visible error message on folder creation failure.
- **Fix stale closure bugs in `useFolders.js`** — `addFolder` and `editFolder` were using `folders` from closure inside a state updater function for `setFolderTree`, causing incorrect tree state when called sequentially.

### Fixes (2026-06-16)
- **Remove "Login Required" modal from extension popup** — The popup no longer shows a login modal at all. If the user is authenticated (token in background storage or content script), the bookmark form is shown directly in the popup. If not, the app's `/bookmark/new` route opens in a new tab with the current page data pre-filled, and the popup closes. The login section HTML/CSS was removed from both extensions.
- **Fix popup showing "Login Required" for logged-in users** — Chrome and Firefox extensions no longer call `verify_token` API (`GET /api/users/me`) on popup open. If a stored token exists, the bookmark form is shown immediately. Network-dependent verification was causing false "Login Required" state when the API server was unreachable.
- **Fix bookmarklet and extension showing main page instead of add-bookmark form** — Created dedicated `/bookmark/new` route that renders the AddBookmarkForm as a standalone page (not a modal overlay on the Home page). Updated bookmarklet code, extension popups, and bookmarklet.min.js to point to the new route. Fixed login redirect to preserve `pendingBookmark` from sessionStorage so the bookmark flow survives authentication. Dashboard now also checks for pending bookmarks on mount.

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
