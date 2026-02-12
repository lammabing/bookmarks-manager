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
- **Browser Extension**: Add bookmarks directly from Chrome/Firefox with enhanced popup UI and context menu; now supports pre-filling bookmark forms with current page information when not logged in
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
   cp .env\ copy .env
   ```
   Edit .env with your configuration. Required variables:
   - `MONGODB_URI`: MongoDB connection string (e.g., `mongodb://localhost:27017/bookmarking-app`)
   - `JWT_SECRET`: Secret key for JWT authentication (generate with `openssl rand -base64 32`)
   - `VITE_API_BASE_URL`: Frontend API base URL for production (e.g., `https://yourdomain.com/api`)

4. Security Notice: Never commit your .env file to version control. Ensure your .gitignore properly excludes sensitive files:
   - The .env file should be in .gitignore and never committed
   - Use .env.example for documenting required environment variables without exposing values
   - Regularly rotate your API keys and secrets

5. Start MongoDB with Docker:
   ```bash
   ./start-mongo.sh
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Access the application at: http://localhost:5170

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
├── start-mongo.sh          # MongoDB Docker container starter script
├── package.json            # Project dependencies
├── server.js               # Backend entry point
├── README.md               # Project documentation
└── ... (other config and support files)
```

## Bookmarklet

The bookmarklet allows you to quickly add bookmarks to your bookmarks-manager from any webpage with a single click.

### How to Install the Bookmarklet

There are two ways to install the bookmarklet:

**Option 1: Drag-and-Drop (Easiest)**
1. Look for the "Add Bookmark" button in the navigation bar when you're logged in
2. Drag this button to your browser's bookmarks bar
3. The bookmarklet is now installed!

**Option 2: Manual Installation**
1. Copy the JavaScript code from [src/bookmarklet.min.js](src/bookmarklet.min.js)
2. Create a new bookmark in your browser's bookmarks bar
3. Name it "Add to Bookmarks Manager" (or any name you prefer)
4. Paste the copied JavaScript code as the URL/address of the bookmark
5. Save the bookmark

### How to Use the Bookmarklet

1. Navigate to any webpage you want to bookmark
2. Click the "Add to Bookmarks Manager" bookmark in your bookmarks bar
3. A prompt will appear asking for tags (comma-separated) - enter any tags you want to associate with this bookmark
4. A new window will open with a form pre-filled with:
   - Page URL
   - Page title
   - Page description (if available)
   - Site favicon (if available)
   - Tags (if entered in step 3)
5. You can edit any of these fields before saving
6. Click "Add Bookmark" to save it to your bookmarks-manager
7. After successful save, you'll see a subtle success message and the form will automatically close

### Bookmarklet Features

- Automatically extracts page information (URL, title, description)
- Attempts to fetch the site's favicon
- Prompts for tags when adding bookmarks
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

## Data Backup and Recovery

### Backup Strategy
To protect against data loss during WSL reinstallation or system failures, this application includes a robust backup system:

- **Automated Backups**: Use the `admin-scripts/robust-backup-improved.js` script
- **Dual Storage**: Backups are stored both locally and on the Windows host filesystem
- **Cross-Platform**: Survives WSL reinstallation since Windows files persist
- **Compressed Archives**: Efficient storage with .tar.gz format
- **Scheduled Options**: Configure cron jobs for automatic backups

### Setting Up Automated Backups
1. Create a backup directory in Windows: `C:\Users\[YourUsername]\Documents\BookmarkManagerBackups`
2. Set up a cron job to run backups automatically:
   ```bash
   # Daily at 2 AM
   0 2 * * * cd /mnt/g/www/bookmarks && /usr/bin/node admin-scripts/robust-backup-improved.js >> /tmp/bookmark-backup.log 2>&1
   ```

### Recovery Process
In case of data loss:
1. Reinstall the application
2. Use the `restore-bookmarks.js` script to restore from backup files
3. Your bookmarks and user data will be recovered

### MongoDB Data Persistence
To ensure your MongoDB data survives WSL reinstallation, move the data directory to a dedicated drive like D: which is separate from system drives:
1. Create directory: `D:\backups\mongodb-data` (or `/mnt/d/backups/mongodb-data`)
2. Stop current container: `docker stop mongodb-container`
3. Copy data: `cp -r /home/ceo/mongodb/* /mnt/d/backups/mongodb-data/`
4. Restart with bind mount: Use the persistent startup command above

For detailed backup instructions, see [documentation/backup-strategy.md](documentation/backup-strategy.md).
For backup cleanup summary, see [documentation/backup-cleanup-summary.md](documentation/backup-cleanup-summary.md).

## License
Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---
*Documentation updated: 2026-02-05*
