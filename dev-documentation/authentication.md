# Authentication System

JWT-based authentication with cross-tab session synchronization and browser extension integration.

## Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Authentication Flow                       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────┐     ┌──────────┐     ┌──────────────┐        │
│  │  Client  │────►│ Express  │────►│   MongoDB    │        │
│  │  (React) │     │  (JWT)   │     │   (User)     │        │
│  └──────────┘     └──────────┘     └──────────────┘        │
│       │                  │                                   │
│       │  ◄── Token ────  │                                   │
│       │                  │                                   │
│       ▼                  ▼                                   │
│  ┌──────────────────────────┐                               │
│  │   localStorage.token    │                               │
│  │   Chrome Extension      │                               │
│  │   Cross-tab sync        │                               │
│  └──────────────────────────┘                               │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Authentication Components

### 1. Registration

**Endpoint**: `POST /api/users/register`

**Flow**:
```
User fills registration form
    ↓
Client validates locally (password match, email format)
    ↓
POST /api/users/register { username, email, password }
    ↓
Server checks if user exists
    ↓
Server hashes password (bcrypt, 10 rounds)
    ↓
Server creates user document
    ↓
Server generates JWT (24h expiry)
    ↓
Returns { token, user }
    ↓
Client stores token in localStorage
    ↓
Client sends token to Chrome extension (if installed)
    ↓
Redirect to /dashboard
```

**Server Code**:
```javascript
// routes/users.js
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Check if user exists
    let user = await User.findOne({ $or: [{ email }, { username }] });
    if (user) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // Create user (password hashed by pre-save hook)
    user = new User({ username, email, password });
    await user.save();
    
    // Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

**Client Code**:
```javascript
// AuthContext.jsx
const register = async (username, email, password) => {
  setIsAuthenticated(true); // Optimistic
  
  try {
    const data = await authApi.register({ username, email, password });
    localStorage.setItem('token', data.token);
    setUser(data.user);
    
    // Sync with Chrome extension
    try {
      await chrome.runtime.sendMessage(extensionId, {
        action: 'set_auth_token',
        token: data.token
      });
    } catch (e) {
      // Extension not installed
    }
  } catch (error) {
    setIsAuthenticated(false);
    throw error;
  }
};
```

---

### 2. Login

**Endpoint**: `POST /api/users/login`

**Flow**:
```
User enters email + password
    ↓
POST /api/users/login
    ↓
Server finds user by email
    ↓
Server compares password (bcrypt.compare)
    ↓
If match: generate JWT
    ↓
Returns { token, user }
    ↓
Client stores in localStorage
    ↓
Cross-tab sync triggers
    ↓
Redirect to /dashboard
```

**Server Code**:
```javascript
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    // Generate JWT
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
```

---

### 3. Token Verification

**Endpoint**: `GET /api/users/me`

**Flow**:
```
App mounts
    ↓
AuthContext checks localStorage for token
    ↓
If token exists: GET /api/users/me with token
    ↓
Server verifies token (auth middleware)
    ↓
If valid: returns user data
    ↓
If invalid: returns 401
    ↓
Client sets isAuthenticated accordingly
```

**Client Code**:
```javascript
useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    checkAuthStatus();
  } else {
    setLoading(false);
  }
}, []);

const checkAuthStatus = async () => {
  try {
    const user = await authApi.getProfile();
    setUser(user);
    setIsAuthenticated(true);
  } catch (error) {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  } finally {
    setLoading(false);
  }
};
```

---

## JWT Authentication Middleware

**File**: `middleware/auth.js`

```javascript
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const auth = async (req, res, next) => {
  try {
    // Extract token from header
    const token = req.header('x-auth-token') || 
                  req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token, authorization denied' });
    }
    
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Find user
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }
    
    // Attach user to request
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Token is not valid' });
  }
};

export default auth;
```

**Usage**:
```javascript
// Protected route
router.get('/bookmarks', auth, async (req, res) => {
  // req.user is available
  const bookmarks = await Bookmark.find({ owner: req.user._id });
  res.json(bookmarks);
});
```

---

## Token Management

### Storage

```javascript
// Save token
localStorage.setItem('token', token);

// Retrieve token
const token = localStorage.getItem('token');

// Remove token
localStorage.removeItem('token');
```

### Axios Interceptor

**File**: `src/utils/api.js`

```javascript
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers['x-auth-token'] = token;
  }
  return config;
});

// Handle 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## Cross-Tab Synchronization

### Storage Event Listener

**File**: `src/contexts/AuthContext.jsx`

```javascript
useEffect(() => {
  const handleStorageChange = (e) => {
    if (e.key === 'token') {
      if (e.newValue) {
        // Token added in another tab
        checkAuthStatus();
      } else {
        // Token removed in another tab
        setUser(null);
        setIsAuthenticated(false);
      }
    }
  };
  
  window.addEventListener('storage', handleStorageChange);
  return () => window.removeEventListener('storage', handleStorageChange);
}, []);
```

### Scenarios

| Action in Tab A | Effect in Tab B |
|-----------------|-----------------|
| Login | Auto-logs in |
| Logout | Auto-logs out |
| Token expires | Both get 401 on next request |
| Manual localStorage clear | Auto-logs out |

---

## Browser Extension Integration

### Chrome Extension Auth

**File**: `chrome-extension/background.js`

```javascript
// Store token
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'set_auth_token') {
    chrome.storage.local.set({ authToken: message.token }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
  
  if (message.action === 'get_auth_token') {
    chrome.storage.local.get(['authToken'], (result) => {
      sendResponse({ token: result.authToken });
    });
    return true;
  }
  
  if (message.action === 'clear_auth_token') {
    chrome.storage.local.remove('authToken', () => {
      sendResponse({ success: true });
    });
    return true;
  }
});
```

### Token Verification in Extension

```javascript
async function verifyToken(token) {
  try {
    const response = await fetch('http://localhost:5015/api/users/me', {
      headers: {
        'x-auth-token': token
      }
    });
    
    if (response.ok) {
      return await response.json();
    }
    return null;
  } catch (error) {
    return null;
  }
}
```

### Sync Flow

```
User logs in on web app
    ↓
Web app sends message to extension:
  chrome.runtime.sendMessage(extensionId, {
    action: 'set_auth_token',
    token: data.token
  })
    ↓
Extension stores token in chrome.storage.local
    ↓
Extension can now make authenticated API calls
```

---

## Route Protection

### ProtectedRoute Component

**File**: `src/components/ProtectedRoute.jsx`

```javascript
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
}

export default ProtectedRoute;
```

### Usage in Router

**File**: `src/App.jsx`

```javascript
<Routes>
  <Route path="/" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />
  <Route
    path="/dashboard"
    element={
      <ProtectedRoute>
        <Dashboard />
      </ProtectedRoute>
    }
  />
  <Route
    path="/import-bookmarks"
    element={
      <ProtectedRoute>
        <ImportBookmarksPage />
      </ProtectedRoute>
    }
  />
</Routes>
```

---

## Password Security

### Hashing

```javascript
// User.js model
import bcrypt from 'bcryptjs';

userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);  // 10 rounds
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});
```

### Comparison

```javascript
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};
```

### Security Measures

| Measure | Implementation |
|---------|---------------|
| Hashing algorithm | bcrypt (not MD5/SHA1) |
| Salt rounds | 10 (OWASP recommendation) |
| Salt generation | Automatic, unique per password |
| Timing-safe comparison | bcrypt.compare() |
| Password in responses | Never (excluded via select: false) |

---

## JWT Configuration

### Token Structure

```javascript
const token = jwt.sign(
  { id: user._id },           // Payload
  process.env.JWT_SECRET,      // Secret key
  { expiresIn: '24h' }         // Expiry
);
```

### Decoded Token Example

```json
{
  "id": "69b196cd36a03ff278ab64a0",
  "iat": 1775706427,
  "exp": 1775792827
}
```

| Claim | Description |
|-------|-------------|
| `id` | User MongoDB ObjectId |
| `iat` | Issued at (Unix timestamp) |
| `exp` | Expires at (Unix timestamp) |

### Secret Management

```env
# .env file (gitignored)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

**Best Practices**:
- Use long, random string (32+ chars)
- Different secret for each environment
- Rotate periodically
- Never commit to git

---

## Logout Flow

```javascript
const logout = () => {
  // Remove token
  localStorage.removeItem('token');
  
  // Clear state
  setUser(null);
  setIsAuthenticated(false);
  
  // Clear extension token
  try {
    chrome.runtime.sendMessage(extensionId, {
      action: 'clear_auth_token'
    });
  } catch (e) {
    // Extension not installed
  }
  
  // Redirect to login
  window.location.href = '/login';
};
```

---

## Security Considerations

### Current Vulnerabilities

| Vulnerability | Risk | Mitigation |
|---------------|------|------------|
| **XSS** | Medium | Token in localStorage accessible to JS |
| **CSRF** | Low | JWT in header (not cookie) |
| **Token theft** | Medium | No refresh token mechanism |
| **Brute force** | Low | bcrypt slows down attacks |

### Recommendations

1. **HTTP-Only Cookies** (future):
   ```javascript
   // Store token in httpOnly cookie
   res.cookie('token', token, {
     httpOnly: true,
     secure: true,  // HTTPS only
     sameSite: 'strict',
     maxAge: 24 * 60 * 60 * 1000  // 24h
   });
   ```

2. **Refresh Tokens**:
   - Short-lived access tokens (15min)
   - Long-lived refresh tokens (7 days)
   - Store refresh tokens in httpOnly cookies

3. **Rate Limiting**:
   ```javascript
   import rateLimit from 'express-rate-limit';
   
   const loginLimiter = rateLimit({
     windowMs: 15 * 60 * 1000,  // 15 minutes
     max: 5,  // 5 attempts per window
     message: 'Too many login attempts'
   });
   
   router.post('/login', loginLimiter, async (req, res) => {
     // ...
   });
   ```

4. **Helmet.js**:
   ```javascript
   import helmet from 'helmet';
   app.use(helmet());
   ```

---

## Environment Configuration

### Development

```env
MONGODB_URI=mongodb://localhost:27017/bookmarking-app
JWT_SECRET=dev-secret-not-for-production
PORT=5015
```

### Production

```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/bookmarks
JWT_SECRET=$(openssl rand -hex 64)
PORT=5015
NODE_ENV=production
```

---

## Testing Authentication

### Manual Testing

```bash
# Register
curl -X POST http://localhost:5015/api/users/register \
  -H "Content-Type: application/json" \
  -d '{"username":"test","email":"test@example.com","password":"password123"}'

# Login
curl -X POST http://localhost:5015/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get profile (use token from login)
curl http://localhost:5015/api/users/me \
  -H "x-auth-token: YOUR_TOKEN_HERE"
```

### Automated Testing

```javascript
// Test login
const response = await fetch('/api/users/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'h0ngk0ng'
  })
});

const data = await response.json();
console.log('Token:', data.token);
console.log('User:', data.user);
```

---

*Last Updated: April 9, 2026*
