# Backend Setup

## Environment Variables

Create a `.env` file in the backend directory with the following variables:

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=voting_platform

GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

SESSION_SECRET=your_session_secret_key

JWT_SECRET=your_jwt_secret_key

EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password

FRONTEND_URL=http://localhost:5173
```

## Installation

```bash
npm install
```

## Run

```bash
npm run dev
```



