# Development Documentation

Comprehensive technical documentation for the Bookmarks Manager project.

## 📚 Documentation Index

| Document | Description |
|----------|-------------|
| [Architecture Overview](./architecture.md) | System design, technology stack, and high-level architecture |
| [Project Structure](./project-structure.md) | Complete directory and file organization |
| [Database Models](./database-models.md) | MongoDB schema definitions and relationships |
| [API Reference](./api-reference.md) | Complete REST API endpoint documentation |
| [Frontend Components](./frontend-components.md) | React component library and UI architecture |
| [State Management](./state-management.md) | Context providers, hooks, and data flow |
| [Authentication System](./authentication.md) | JWT auth flow, session management, and security |
| [Browser Extensions](./browser-extensions.md) | Chrome and Firefox extension development |
| [Development Setup](./development-setup.md) | Environment configuration and getting started |
| [Deployment Guide](./deployment.md) | Production build and deployment procedures |
| [Testing Guide](./testing.md) | Testing strategies and procedures |
| [Troubleshooting](../TROUBLESHOOTING.md) | Common issues and solutions |

## 🚀 Quick Start

```bash
# 1. Ensure Docker Desktop is running (with WSL integration enabled)
docker info

# 2. Install dependencies
npm install

# 3. Start the application (MongoDB + Frontend + Backend)
./start.sh

# 4. Access the application
# Frontend: http://localhost:5170
# Backend API: http://localhost:5015
```

## 📊 Project Stats

- **Frontend**: React 18.2 + Vite 6.3.5 + Tailwind CSS 3.3
- **Backend**: Node.js + Express 4.21.2
- **Database**: MongoDB 8.0 with Mongoose 8.0.3
- **Authentication**: JWT with cross-tab session sync
- **Extensions**: Chrome (Manifest V3) + Firefox (Manifest V3)
- **Components**: 30+ reusable UI components
- **API Endpoints**: 30+ REST endpoints
- **Lines of Code**: ~15,000+

## 🎯 Key Features

- User authentication with JWT
- Bookmark CRUD operations
- Hierarchical folder organization
- Tag management system
- Advanced search and filtering
- Bulk operations (edit, delete, share, tag)
- Import/export bookmarks (browser format)
- Social media sharing
- Browser extensions (Chrome/Firefox)
- Bookmarklet for quick adding
- Font customization
- Auto-backup system

## 📝 Conventions

### Code Organization
- **ES Modules**: All files use `import/export` syntax
- **Naming**: 
  - Components: PascalCase (`BookmarkGrid.jsx`)
  - Functions/variables: camelCase (`fetchBookmarks`)
  - Constants: UPPER_SNAKE_CASE (`API_BASE_URL`)
  - Files: Match exported component/hook name

### Git Workflow
- `main`: Production-ready code
- Feature branches: `feature/description`
- Bug fix branches: `fix/description`
- Commit messages: Clear, concise, focused on "why"

### API Design
- RESTful endpoints
- JWT authentication required for private routes
- Consistent error responses: `{ error: "message" }`
- Pagination for list endpoints

---

*Last Updated: April 9, 2026*
