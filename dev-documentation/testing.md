# Testing Guide

Testing strategies, procedures, and best practices for the Bookmarks Manager.

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Testing Pyramid                          │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│                        /\                                    │
│                       /  \                                   │
│                      / E2E \              ← Cypress/Playwright│
│                     /________\                                 │
│                    /          \                                │
│                   / Integration\           ← API Tests         │
│                  /______________\                               │
│                 /                \                              │
│                /  Unit Tests     \          ← Jest/Vitest       │
│               /____________________\                            │
│              /                      \                           │
│             /    Manual Testing     \       ← Browser testing   │
│            /_________________________\                          │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

**Current Status**: The project relies primarily on **manual testing**. Automated testing infrastructure can be added as needed.

---

## Manual Testing

### Authentication Testing

#### Registration

```bash
# Test valid registration
curl -X POST http://localhost:5015/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123"
  }'

# Expected: 201 with token and user

# Test duplicate email
curl -X POST http://localhost:5015/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "anotheruser",
    "email": "test@example.com",
    "password": "password123"
  }'

# Expected: 400 "User already exists"

# Test invalid email
curl -X POST http://localhost:5015/api/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser2",
    "email": "not-an-email",
    "password": "password123"
  }'

# Expected: 400 validation error
```

#### Login

```bash
# Test valid login
curl -X POST http://localhost:5015/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "h0ngk0ng"
  }'

# Expected: 200 with token and user

# Test invalid password
curl -X POST http://localhost:5015/api/users/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "wrongpassword"
  }'

# Expected: 400 "Invalid credentials"

# Test missing fields
curl -X POST http://localhost:5015/api/users/login \
  -H "Content-Type: application/json" \
  -d '{}'

# Expected: 400 validation error
```

#### Token Verification

```bash
# Get token from login response
TOKEN="eyJhbGci..."

# Verify token
curl http://localhost:5015/api/users/me \
  -H "x-auth-token: $TOKEN"

# Expected: 200 with user data (no password)

# Test with invalid token
curl http://localhost:5015/api/users/me \
  -H "x-auth-token: invalid-token"

# Expected: 401 "Token is not valid"

# Test without token
curl http://localhost:5015/api/users/me

# Expected: 401 "No token, authorization denied"
```

---

### Bookmark API Testing

#### Create Bookmark

```bash
TOKEN="your-token-here"

# Create bookmark
curl -X POST http://localhost:5015/api/bookmarks \
  -H "Content-Type: application/json" \
  -H "x-auth-token: $TOKEN" \
  -d '{
    "url": "https://github.com",
    "title": "GitHub",
    "description": "Code repository",
    "tags": ["dev", "code"]
  }'

# Expected: 201 with bookmark object

# Create bookmark with invalid URL
curl -X POST http://localhost:5015/api/bookmarks \
  -H "Content-Type: application/json" \
  -H "x-auth-token: $TOKEN" \
  -d '{
    "title": "No URL"
  }'

# Expected: 400 validation error
```

#### Get Bookmarks

```bash
# Get all bookmarks
curl http://localhost:5015/api/bookmarks \
  -H "x-auth-token: $TOKEN"

# Expected: Array of bookmarks

# Filter by folder
curl "http://localhost:5015/api/bookmarks?folder=folderId" \
  -H "x-auth-token: $TOKEN"

# Search bookmarks
curl "http://localhost:5015/api/bookmarks?search=github" \
  -H "x-auth-token: $TOKEN"

# Filter by tags
curl "http://localhost:5015/api/bookmarks?tags=dev,code" \
  -H "x-auth-token: $TOKEN"
```

#### Update Bookmark

```bash
BOOKMARK_ID="bookmark-id"

curl -X PUT http://localhost:5015/api/bookmarks/$BOOKMARK_ID \
  -H "Content-Type: application/json" \
  -H "x-auth-token: $TOKEN" \
  -d '{
    "title": "Updated Title",
    "tags": ["new", "tags"]
  }'

# Expected: 200 with updated bookmark
```

#### Delete Bookmark

```bash
curl -X DELETE http://localhost:5015/api/bookmarks/$BOOKMARK_ID \
  -H "x-auth-token: $TOKEN"

# Expected: 200 "Bookmark deleted"
```

---

### Bulk Operations Testing

#### Bulk Delete

```bash
curl -X POST http://localhost:5015/api/bookmarks/bulk-delete \
  -H "Content-Type: application/json" \
  -H "x-auth-token: $TOKEN" \
  -d '{
    "bookmarkIds": ["id1", "id2", "id3"]
  }'

# Expected: 200 "Bulk delete completed"
```

#### Bulk Edit

```bash
curl -X POST http://localhost:5015/api/bookmarks/bulk-edit \
  -H "Content-Type: application/json" \
  -H "x-auth-token: $TOKEN" \
  -d '{
    "bookmarkIds": ["id1", "id2"],
    "folder": "new-folder-id",
    "tags": {
      "operation": "add",
      "tags": ["new-tag"]
    }
  }'

# Expected: 200 "Bulk edit completed"
```

---

### Folder API Testing

#### Create Folder

```bash
curl -X POST http://localhost:5015/api/folders \
  -H "Content-Type: application/json" \
  -H "x-auth-token: $TOKEN" \
  -d '{
    "name": "Development",
    "color": "#3B82F6",
    "icon": "code"
  }'

# Expected: 201 with folder object
```

#### Get Folder Tree

```bash
curl http://localhost:5015/api/folders \
  -H "x-auth-token: $TOKEN"

# Expected: Hierarchical folder structure
```

---

## Frontend Testing

### UI Testing Checklist

#### Authentication

- [ ] Registration form validates correctly
- [ ] Login with correct credentials works
- [ ] Login with wrong credentials shows error
- [ ] Logout clears token and redirects
- [ ] Cross-tab sync works (login in one tab)
- [ ] Protected routes redirect to login

#### Bookmarks

- [ ] Add bookmark form works
- [ ] Edit bookmark updates data
- [ ] Delete bookmark removes from list
- [ ] Search filters bookmarks correctly
- [ ] Tag filter works
- [ ] Folder filter works
- [ ] Grid view displays correctly
- [ ] List view displays correctly
- [ ] Multi-select works
- [ ] Bulk operations work

#### Folders

- [ ] Create folder works
- [ ] Edit folder updates correctly
- [ ] Delete folder moves bookmarks
- [ ] Folder tree displays hierarchy
- [ ] Folder selection works
- [ ] Clicking folder filters bookmarks

#### Tags

- [ ] Tag selector shows existing tags
- [ ] Create new tag works
- [ ] Tag manager lists all tags
- [ ] Rename tag updates all bookmarks
- [ ] Delete tag removes from all bookmarks

#### Import/Export

- [ ] File upload works
- [ ] HTML bookmark file parses correctly
- [ ] Import creates folders
- [ ] Import shows progress
- [ ] Export downloads JSON

#### Sharing

- [ ] Set visibility works
- [ ] Share with users works
- [ ] Public bookmarks page shows public items
- [ ] Shared-with-me shows shared bookmarks
- [ ] Sharing badges display correctly

---

### Browser Testing

#### Chrome

1. Open DevTools (F12)
2. Go to Application tab
3. Check localStorage for token
4. Check Network tab for API calls
5. Check Console for errors

#### Testing Cross-Browser

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Login | ✓ | ✓ | ? | ✓ |
| Add Bookmark | ✓ | ✓ | ? | ✓ |
| Import | ✓ | ✓ | ? | ✓ |
| Extensions | ✓ | ✓ | N/A | ✓ |

---

## Extension Testing

### Chrome Extension

1. Load unpacked extension
2. Open popup DevTools
3. Test authentication sync
4. Test bookmark creation
5. Check background service worker logs

### Firefox Extension

1. Load temporary add-on
2. Inspect extension
3. Test context menu
4. Test bookmark creation
5. Check background script logs

---

## Automated Testing (Future)

### Unit Tests with Vitest

**Setup**:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

**Example Test**:
```javascript
// src/utils/__tests__/folderApi.test.js
import { describe, it, expect } from 'vitest';
import { buildFolderTree } from '../folderApi';

describe('buildFolderTree', () => {
  it('should build tree from flat array', () => {
    const folders = [
      { _id: '1', name: 'Root', parent: null },
      { _id: '2', name: 'Child', parent: '1' }
    ];
    
    const tree = buildFolderTree(folders);
    
    expect(tree).toHaveLength(1);
    expect(tree[0].children).toHaveLength(1);
    expect(tree[0].children[0].name).toBe('Child');
  });
  
  it('should handle empty array', () => {
    expect(buildFolderTree([])).toEqual([]);
  });
});
```

**Run Tests**:
```bash
npx vitest
```

### API Tests with Supertest

**Setup**:
```bash
npm install -D supertest
```

**Example Test**:
```javascript
// tests/api/users.test.js
import request from 'supertest';
import app from '../../server.js';

describe('User API', () => {
  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/users/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('email', 'test@example.com');
  });
  
  it('should not register duplicate user', async () => {
    // First registration
    await request(app)
      .post('/api/users/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
    
    // Second registration should fail
    const res = await request(app)
      .post('/api/users/register')
      .send({
        username: 'testuser2',
        email: 'test@example.com',
        password: 'password123'
      });
    
    expect(res.statusCode).toBe(400);
  });
});
```

### E2E Tests with Playwright

**Setup**:
```bash
npm init playwright@latest
```

**Example Test**:
```javascript
// tests/e2e/login.spec.js
import { test, expect } from '@playwright/test';

test('user can login successfully', async ({ page }) => {
  await page.goto('http://localhost:5170/login');
  
  await page.fill('input[name="email"]', 'admin@example.com');
  await page.fill('input[name="password"]', 'h0ngk0ng');
  await page.click('button[type="submit"]');
  
  await expect(page).toHaveURL('/dashboard');
  await expect(page.locator('text=Dashboard')).toBeVisible();
});

test('user can add bookmark', async ({ page }) => {
  // Login first
  await page.goto('http://localhost:5170/login');
  await page.fill('input[name="email"]', 'admin@example.com');
  await page.fill('input[name="password"]', 'h0ngk0ng');
  await page.click('button[type="submit"]');
  
  // Add bookmark
  await page.click('text=Add Bookmark');
  await page.fill('input[name="url"]', 'https://example.com');
  await page.fill('input[name="title"]', 'Example');
  await page.click('button:has-text("Save")');
  
  // Verify bookmark appears
  await expect(page.locator('text=Example')).toBeVisible();
});
```

---

## Performance Testing

### Load Testing with Artillery

**Install**:
```bash
npm install -g artillery
```

**Test Script** (`load-test.yml`):
```yaml
config:
  target: "http://localhost:5015"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Ramp up load"
    - duration: 60
      arrivalRate: 100
      name: "Spike test"

scenarios:
  - flow:
      - get:
          url: "/api/bookmarks"
          headers:
            x-auth-token: "{{ token }}"
```

**Run**:
```bash
artillery run load-test.yml
```

### Lighthouse Audit

```bash
# Install Lighthouse CLI
npm install -g lighthouse

# Run audit
lighthouse http://localhost:5170 --view

# Or use Chrome DevTools
# 1. Open DevTools (F12)
# 2. Go to Lighthouse tab
# 3. Click "Generate report"
```

---

## Debugging

### Backend Debugging

**Enable Debug Logging**:
```bash
NODE_ENV=development DEBUG=* npm run start
```

**Inspect with Node Debugger**:
```bash
node --inspect server.js
# Open chrome://inspect in Chrome
```

### Frontend Debugging

**React DevTools**:
1. Install React DevTools extension
2. Open Components tab
3. Inspect component tree
4. View props and state

**Redux DevTools** (if migrated):
1. Install Redux DevTools extension
2. View state changes
3. Time travel debugging

### Database Debugging

**MongoDB Compass**:
1. Connect to `mongodb://localhost:27017`
2. Browse collections
3. Run queries
4. View indexes

**Mongosh**:
```bash
mongosh mongodb://localhost:27017/bookmarking-app

# List collections
show collections

# Query bookmarks
db.bookmarks.find({ owner: ObjectId("...") })

# Count documents
db.bookmarks.countDocuments()
```

---

## Test Data

### Create Test Bookmarks

```bash
node scripts/createTestBookmarks.js
```

Or use the API:
```bash
TOKEN="your-token"

for i in {1..50}; do
  curl -X POST http://localhost:5015/api/bookmarks \
    -H "Content-Type: application/json" \
    -H "x-auth-token: $TOKEN" \
    -d "{
      \"url\": \"https://example.com/$i\",
      \"title\": \"Test Bookmark $i\",
      \"tags\": [\"test\", \"bulk\"]
    }"
done
```

### Reset Test Database

```bash
# Stop MongoDB
docker stop mongodb-container

# Remove volume
docker volume rm mongodb-data

# Restart
./start-mongo-reliable.sh

# Create fresh test data
node scripts/createTestBookmarks.js
```

---

## Testing Best Practices

### Manual Testing

1. **Test in multiple browsers**: Chrome, Firefox, Edge
2. **Test on mobile**: Responsive design
3. **Test edge cases**: Empty states, errors, large datasets
4. **Document test results**: Keep checklist updated
5. **Test after every change**: Don't skip testing

### Automated Testing (when implemented)

1. **Write tests first** (TDD): Define behavior before implementation
2. **Test edge cases**: Empty arrays, null values, errors
3. **Mock external dependencies**: API calls, database
4. **Keep tests fast**: Under 10 seconds for unit tests
5. **Test one thing per test**: Clear failure messages
6. **Use descriptive names**: `shouldReturnEmptyArrayWhenNoFolders`
7. **Don't test implementation**: Test behavior, not internals

---

*Last Updated: April 9, 2026*
