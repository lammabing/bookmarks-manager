# Bookmark Manager

A web-based application for managing bookmarks with advanced organization features, authentication, and cross-device sync.

## Features

- **User Authentication**: Secure registration and login with JWT
- **Bookmark Management**: Add, edit, and delete bookmarks with metadata
- **Tag Management**: Organize bookmarks with customizable tags and bulk editing
- **Folder System**: Hierarchical folder organization with drag-and-drop functionality
- **Advanced Search**: Filter bookmarks by tags, keywords, and dates
- **Font Customization**: Adjust font settings with Google Fonts integration
- **Metadata Extraction**: Automatically fetches titles, descriptions and favicons
- **Import/Export**: Import bookmarks from browsers or export for backup
- **Browser Extension**: Add bookmarks directly from Chrome/Firefox (popup UI and context menu implemented; background sync in progress)
- **Bookmarklet**: Add bookmarks from any webpage with a single click using the bookmarklet

## Getting Started

### Prerequisites
- Node.js v20+
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
   cp .env copy .env
   ```
   Edit .env with your configuration. Required variables:
   - `MONGODB_URI`: MongoDB connection string (e.g., `mongodb://localhost:27017/bookmarking-app`)
   - `JWT_SECRET`: Secret key for JWT authentication (generate with `openssl rand -base64 32`)
   - `VITE_API_BASE_URL`: Frontend API base URL for production (e.g., `https://yourdomain.com/api`)

4. Start MongoDB with Docker:
   ```bash
   ./start-mongo.sh
   ```
   Or use Docker Compose:
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
├── extension/              # Browser extension source (Chrome/Firefox)
│   ├── background.js       # Handles context menu and background processes
│   ├── manifest.json       # Extension configuration and permissions
│   ├── popup.html          # Popup UI for extension
│   ├── popup.js            # Popup interaction logic
│   ├── bookmarkImporter.js # Browser bookmark import functionality
│   └── icons/              # Extension icons
├── admin-scripts/          # Admin/maintenance scripts
├── .env                    # Environment variables
├── docker-compose.yml      # Docker configuration
├── package.json            # Project dependencies
├── server.js               # Backend entry point
├── README.md               # Project documentation
└── ... (other config and support files)
```

## Bookmarklet

The bookmarklet allows you to quickly add bookmarks to your bookmarks-manager from any webpage with a single click.

### How to Install the Bookmarklet

1. Copy the JavaScript code from [src/bookmarklet.min.js](src/bookmarklet.min.js)

2. Create a new bookmark in your browser's bookmarks bar

3. Name it "Add to Bookmarks Manager" (or any name you prefer)

4. Paste the copied JavaScript code as the URL/address of the bookmark

5. Save the bookmark

### How to Use the Bookmarklet

1. Navigate to any webpage you want to bookmark
2. Click the "Add to Bookmarks Manager" bookmark in your bookmarks bar
3. A new window will open with a form pre-filled with:
   - Page URL
   - Page title
   - Page description (if available)
   - Site favicon (if available)
4. You can edit any of these fields before saving
5. Click "Add Bookmark" to save it to your bookmarks-manager
6. After successful save, you'll see a subtle success message and the form will automatically close

### Bookmarklet Features

- Automatically extracts page information (URL, title, description)
- Attempts to fetch the site's favicon
- Opens in a properly sized window for easy use
- Works on most websites
- Preserves form data during login redirects
- Shows subtle success indication when bookmark is added
- Automatically closes after successful save

### Bookmarklet Troubleshooting

If the bookmarklet doesn't work:

1. Make sure your bookmarks-manager is running on `http://localhost:5170`
2. Check that you're logged in to your bookmarks-manager
3. Try refreshing the page before using the bookmarklet
4. Some websites with strict Content Security Policies may block bookmarklets

### Bookmarklet Customization

If you're running your bookmarks-manager on a different port or URL, you'll need to modify the bookmarklet code accordingly. Change this part of the code:

```javascript
const appUrl = `http://localhost:5170/?url=${url}&title=${title}&description=${description}&favicon=${favicon}`;
```

Replace `http://localhost:5170` with your actual bookmarks-manager URL.

For testing instructions, see [documentation/bookmarklet-testing-guide.md](documentation/bookmarklet-testing-guide.md).

## API Documentation
See [documentation/techStack.md](documentation/techStack.md) and [documentation/dataSources.md](documentation/dataSources.md) for API endpoints and data schemas.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/your-feature`)
3. Commit your changes (`git commit -am 'Add some feature'`)
4. Push to the branch (`git push origin feature/your-feature`)
5. Open a pull request

## License
Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---
*Documentation updated: 2025-07-30*
