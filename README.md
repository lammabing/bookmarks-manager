# Bookmark Manager

A web-based application for managing bookmarks with advanced organization features, authentication, and cross-device sync.

## Features

- **User Authentication**: Secure registration and login with JWT
- **Bookmark Management**: Add, edit, and delete bookmarks with metadata
- **Tag Organization**: Organize bookmarks with customizable tags
- **Advanced Search**: Filter bookmarks by tags, keywords, and dates
- **Font Customization**: Adjust font settings for better readability
- **Metadata Extraction**: Automatically fetches titles, descriptions and favicons
- **Import/Export**: Import bookmarks from browsers or export for backup

## Getting Started

### Prerequisites
- Node.js v18+
- MongoDB (local or cloud instance)
- Docker (for local MongoDB setup)

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/lammabing/bookmarking-app.git
   cd bookmarking-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit .env with your configuration. Required variables:
   - `MONGODB_URI`: MongoDB connection string (e.g., `mongodb://localhost:27017/bookmarking-app`)
   - `JWT_SECRET`: Secret key for JWT authentication (generate with `openssl rand -base64 32`)
   - `VITE_API_BASE_URL`: Frontend API base URL (e.g., `http://localhost:5015/api`)

4. Start MongoDB with Docker:
   ```bash
   docker compose up -d
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Access the application at: http://localhost:5170

### Production Deployment
1. Build frontend assets:
   ```bash
   npm run build
   ```

2. Start production server:
   ```bash
   npm run start
   ```

## Project Structure

```
.
├── documentation/          # Project documentation
├── middleware/             # Express middleware
├── models/                 # MongoDB models
├── routes/                 # API route handlers
├── scripts/                # Database maintenance scripts
├── src/                    # Frontend React application
├── .env                    # Environment variables
├── docker-compose.yml      # Docker configuration
├── package.json            # Project dependencies
├── server.js               # Backend entry point
└── README.md               # Project documentation
```

## API Documentation
See [documentation/techStack.md](documentation/techStack.md) for API endpoints and data schemas.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a pull request

## License
Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---
*Documentation updated: 2025-06-17*
