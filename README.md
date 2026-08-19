# Book Store - Admin Panel

ReactJS admin panel for the Book Store application, styled with Tailwind CSS CDN. This admin panel connects to the FastAPI backend for managing books and databases.

## Features

- **Login**: Secure admin authentication with JWT
- **Dashboard**: View statistics (users, books, images, categories)
- **Books Management**: Create, Edit, Delete books with multiple image upload
- **Backup Database**: Create backups of all users, books, and images to JSON
- **Import Database**: Restore data from JSON backup files

## Tech Stack

- React 18
- Tailwind CSS (CDN)
- Font Awesome Icons
- Fetch API for backend integration

## Project Structure

```
frontend_admin/
├── package.json              # npm dependencies and scripts
├── public/
│   └── index.html            # HTML entry (Tailwind CDN, Font Awesome)
└── src/
    ├── index.js              # React entry point
    ├── App.js                # Main admin app (routing & auth state)
    ├── config.js             # API URL configuration
    ├── api.js                # Backend API integration
    ├── utils.js              # Helper functions
    ├── components/
    │   ├── Sidebar.js        # Sidebar navigation
    │   └── Topbar.js         # Top bar with user info
    └── pages/
        ├── LoginPage.js      # Admin login
        ├── DashboardPage.js  # Statistics dashboard
        ├── BooksPage.js      # Book management (CRUD)
        └── BackupRestorePage.js  # Database backup & import
```

## Setup & Run

### 1. Install dependencies

```bash
cd frontend_admin
npm install
```

### 2. Start the Backend Server

```bash
cd Backend
uvicorn main:app --reload
```

The backend will run at `http://localhost:8000`

### 3. Start the Admin Frontend

```bash
cd frontend_admin
npm start
```

The admin panel will open at `http://localhost:3001`

## Admin Features

### Dashboard
- Total Users, Total Books, Book Images counts
- Books by Category chart
- Recent books table

### Books Management
- Search and filter books by category
- Add new book with multiple image upload
- Edit book details (title, category, description, prices)
- Delete books

### Backup & Restore
- **Backup Database**: Creates a JSON backup file of all users, books, and book images
- **Download Backup**: Download any backup file to your local computer
- **Import Database**: Upload a JSON backup file to restore data
  - Users matched by email (skips duplicates)
  - Books matched by title + category (skips duplicates)
  - Book images restored with each book

## API Configuration

The backend URL is configured in `src/config.js`:

```javascript
export const API_URL = "http://localhost:8000";
```

Change this to your deployed backend URL when deploying.

## Backend Admin API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/admin/stats` | Get database statistics |
| GET | `/admin/backup` | Create a JSON backup |
| GET | `/admin/backups` | List all backups |
| GET | `/admin/download-backup/{filename}` | Download a backup file |
| POST | `/admin/import` | Import data from JSON file |