# Install Bookmarks Manager Extension

## Prerequisites

- Firefox browser

## Installation (Unpacked / Development Mode)

1. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`

2. Click **"Load Temporary Add-on…"**

3. Navigate to this folder and select any file (e.g. `manifest.json`)

The extension is now loaded temporarily. It will be removed when you restart Firefox.

## Installation (Permanent / Signed)

To install permanently, the extension must be signed by Mozilla:

1. Zip the extension files:
   ```bash
   cd /mnt/g/www/bookmarks-manager/firefox-extension
   zip -r ../extension.zip . -x "*.git*" "*.zip"
   ```

2. Upload the zip to [Mozilla Add-on Developer Hub](https://addons.mozilla.org/en-US/developers/addon/submit/distribution)

3. After signing, download the `.xpi` file and open it with Firefox

## Usage

Once installed, click the extension icon in the toolbar to open the popup. The extension adds a context menu item for saving bookmarks from any webpage.

## Notes

- The extension connects to `http://localhost:5170` — ensure the local server is running
- For development, use `about:debugging` for quick reloads after code changes
