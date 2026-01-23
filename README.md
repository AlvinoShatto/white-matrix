# Voting Platform

A full-stack voting platform built with React (Vite), Node.js (Express), and MySQL.

## Features

- **Authentication**: Google OAuth, LinkedIn OAuth, and standard email/password authentication
- **One-Time Voting**: Users can vote only once (enforced on both frontend and backend)
- **Voter List**: View all voters with clickable LinkedIn profiles
- **Forgot Password**: Password reset functionality via email
- **Admin Dashboard**: Comprehensive admin panel for managing candidates, users, and voting statistics
- **Modern UI**: Built with Tailwind CSS

## Prerequisites

- Node.js (v16 or higher)
- MySQL (v8 or higher)
- npm or yarn

## Setup Instructions

### 1. Database Setup

1. Create a MySQL database:
```sql
CREATE DATABASE voting_platform;
```

2. Run the schema file:
```bash
mysql -u root -p voting_platform < backend/database/schema.sql
```

Or import the SQL file using your MySQL client.

### 2. Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (copy from `.env.example`):
```bash
cp .env.example .env
```

4. Update the `.env` file with your configuration:
   - Database credentials
   - Google OAuth credentials (from [Google Cloud Console](https://console.cloud.google.com/))
   - LinkedIn OAuth credentials (from [LinkedIn Developer Portal](https://www.linkedin.com/developers/))
   - Email configuration for Nodemailer
   - JWT and session secrets

5. Start the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### 3. Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file (optional, defaults are set):
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## OAuth Setup

### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:5000/api/auth/google/callback`
6. Copy Client ID and Client Secret to `.env`

### LinkedIn OAuth

1. Go to [LinkedIn Developer Portal](https://www.linkedin.com/developers/)
2. Create a new app
3. Add redirect URL: `http://localhost:5000/api/auth/linkedin/callback`
4. Request access to `r_emailaddress` and `r_liteprofile` scopes
5. Copy Client ID and Client Secret to `.env`

## Email Configuration (Forgot Password)

For Gmail:
1. Enable "Less secure app access" or use an App Password
2. Update `.env` with your email credentials:
```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

## Project Structure

```
.
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── passport.js
│   ├── routes/
│   │   ├── auth.js
│   │   └── votes.js
│   ├── database/
│   │   └── schema.sql
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── VoterList.jsx
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   └── ResetPassword.jsx
│   │   ├── utils/
│   │   │   └── api.js
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── index.html
│   └── package.json
└── README.md
```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/google` - Google OAuth
- `GET /api/auth/linkedin` - LinkedIn OAuth
- `POST /api/auth/forgot-password` - Request password reset
- `POST /api/auth/reset-password` - Reset password

### Voting
- `GET /api/candidates` - Get all candidates (max 2)
- `GET /api/check-vote` - Check if user has voted
- `POST /api/vote` - Submit a vote
- `GET /api/voters` - Get list of all voters

## Admin Dashboard

The platform includes a comprehensive admin dashboard for managing the voting system.

### Admin Features:
- **Statistics Dashboard**: View voting statistics, voter information, and candidate performance
- **Candidate Management**: Add, edit, and delete candidates
- **User Management**: Manage users, promote/demote admin status
- **Vote Management**: Reset voting data

### Access the Admin Dashboard:
1. Navigate to `/admin` (requires admin privileges)
2. An admin user can promote other users to admin status
3. For initial setup, see [ADMIN_SETUP.md](ADMIN_SETUP.md)

## Security Features

- Passwords are hashed using bcrypt
- JWT tokens for authentication
- Unique constraint on user_id in votes table
- SQL injection protection using parameterized queries
- CORS configuration
- Admin role-based access control

## License

MIT



