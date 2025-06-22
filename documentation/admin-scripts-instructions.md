# Admin Scripts Instructions

The `scripts` directory contains utility scripts for administrative tasks. These scripts are designed to be run from the command line and help with database maintenance, user management, and data analysis.

## Script List and Usage

### assignBookmarksToUser.js
- **Purpose:** Assigns all bookmarks in the database to a specified user
- **Usage:** 
  ```bash
  node scripts/assignBookmarksToUser.js <username>
  ```
- **Example:**
  ```bash
  node scripts/assignBookmarksToUser.js admin
  ```

### checkUserBookmarks.js
- **Purpose:** Checks how many bookmarks are visible to a specified user
- **Usage:** 
  ```bash
  node scripts/checkUserBookmarks.js <username>
  ```
- **Example:**
  ```bash
  node scripts/checkUserBookmarks.js user1
  ```

### migrate-orphaned-bookmarks-to-user.js
- **Purpose:** Migrates bookmarks without an owner to a specified user
- **Usage:** 
  ```bash
  node scripts/migrate-orphaned-bookmarks-to-user.js <username>
  ```
- **Example:**
  ```bash
  node scripts/migrate-orphaned-bookmarks-to-user.js admin
  ```

### reset-password-of-user.js
- **Purpose:** Resets a user's password
- **Usage:** 
  ```bash
  node scripts/reset-password-of-user.js <username> <newPassword>
  ```
- **Example:**
  ```bash
  node scripts/reset-password-of-user.js user1 newsecurepassword
  ```

### find-bookmarks-by-user.js
- **Purpose:** Finds all bookmarks belonging to a specific user
- **Usage:** 
  ```bash
  node scripts/find-bookmarks-by-user.js <username>
  ```
- **Example:**
  ```bash
  node scripts/find-bookmarks-by-user.js user2
  ```

## General Requirements
1. MongoDB must be running locally on the default port (27017)
2. The database connection string is hardcoded in each script to 'mongodb://localhost:27017/bookmarking-app'
3. Scripts must be run from the project root directory

## Best Practices
- Always back up your database before running administrative scripts
- Test scripts in a development environment before using in production
- Review script source code to understand what changes will be made
- Use strong passwords when resetting user credentials

## Troubleshooting
- If a script fails to connect to MongoDB, verify that:
  - MongoDB is running
  - The connection string is correct
- If a user is not found, verify the username is correct using the User model
- Check script output for specific error messages

---
Last Updated: 2025-06-23 12:52 AM by Documentation Agent