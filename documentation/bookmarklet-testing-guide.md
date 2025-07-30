# Bookmarklet Testing Guide

## Overview
This guide provides instructions for testing the bookmarklet functionality in the bookmarks-manager application. The bookmarklet allows users to quickly add bookmarks from any webpage.

## Prerequisites
1. The bookmarks-manager application must be running on `http://localhost:5170`
2. A test browser with bookmark management capabilities
3. Access to the bookmarklet code (found in `src/bookmarklet.min.js`)

## Testing Process

### 1. Install the Bookmarklet
1. Open your browser and navigate to the bookmarks-manager application
2. Copy the bookmarklet code from `src/bookmarklet.min.js`
3. Create a new bookmark in your browser's bookmarks bar
4. Name it "Add to Bookmarks Manager" (or any preferred name)
5. Paste the copied JavaScript code as the URL/address of the bookmark
6. Save the bookmark

### 2. Test Basic Functionality
1. Navigate to any webpage (e.g., the test page at `http://localhost:5170/bookmarklet-test.html`)
2. Click the "Add to Bookmarks Manager" bookmark in your bookmarks bar
3. Verify that:
   - A new window opens with the bookmarks-manager form
   - The form is pre-filled with:
     - Page URL
     - Page title
     - Page description (if available)
     - Site favicon (if available)
   - The form can be submitted successfully
   - The bookmark is added to the user's collection

### 3. Test Edge Cases
1. Test with pages that have no description meta tag
2. Test with pages that have no favicon
3. Test with pages that have special characters in title/description
4. Test with pages that require authentication
5. Test with pages that have strict Content Security Policies

### 4. Test Error Handling
1. Try using the bookmarklet when the bookmarks-manager is not running
2. Try using the bookmarklet with invalid URLs
3. Try submitting the form with missing required fields
4. Try using the bookmarklet while not logged in (should redirect to login)

## Expected Behavior

### Successful Bookmark Addition
- Form opens in a new window with correct dimensions (600x700)
- All available metadata is pre-filled
- User can edit any fields before saving
- After submission, success message is displayed
- Form closes automatically after successful save
- New bookmark appears in the user's collection

### Authentication Handling
- If user is not logged in, form data is preserved
- User is redirected to login page
- After successful login, user is redirected back to add bookmark form
- Previously entered data is restored

### Error Cases
- Network errors are handled gracefully
- Invalid URLs are rejected with appropriate messages
- Missing required fields prevent submission
- Duplicate bookmarks are handled according to application logic

## Troubleshooting

### Common Issues
1. **Bookmarklet doesn't work:**
   - Verify bookmarks-manager is running on `http://localhost:5170`
   - Check that you're logged in to your bookmarks-manager
   - Try refreshing the page before using the bookmarklet
   - Some websites with strict Content Security Policies may block bookmarklets

2. **Metadata not extracted correctly:**
   - Check that the webpage has proper meta tags
   - Verify favicon link is accessible
   - Test with the provided test page

3. **Form doesn't pre-fill correctly:**
   - Check browser console for JavaScript errors
   - Verify URL parameters are being passed correctly
   - Ensure the AddBookmarkForm component is properly handling URL parameters

### Debugging Steps
1. Open browser developer tools
2. Check console for any error messages
3. Verify network requests to the bookmarks-manager API
4. Check that URL parameters are correctly encoded/decoded
5. Test the bookmarklet code in browser console directly

## Test Pages
- `public/bookmarklet-test.html` - Basic test page with all metadata
- `http://localhost:5170` - Application homepage
- External websites with various metadata configurations

## Validation Checklist
- [ ] Bookmarklet installs correctly
- [ ] New window opens with correct dimensions
- [ ] URL is correctly extracted and decoded
- [ ] Title is correctly extracted and decoded
- [ ] Description is correctly extracted and decoded
- [ ] Favicon is correctly extracted or defaulted
- [ ] Form can be submitted successfully
- [ ] Success message is displayed
- [ ] Form closes after successful submission
- [ ] Bookmark appears in user's collection
- [ ] Authentication redirect works correctly
- [ ] Form data is preserved during login redirect
- [ ] Error cases are handled gracefully

## Customization Testing
If running bookmarks-manager on a different port or URL:
1. Modify the bookmarklet code to use the correct URL
2. Test that the bookmarklet still functions correctly
3. Verify all features work with the custom URL

---
*Last Updated: 2025-07-30 by Development Team*