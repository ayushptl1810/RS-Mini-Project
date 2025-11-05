# Backend API

Flask backend with MongoDB connection for user authentication and profile management.

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. The `.env` file is already configured with your MongoDB URI. Make sure to:
   - Change the `JWT_SECRET_KEY` to a secure random string in production
   - Update the `MONGO_URI` if needed

3. Run the Flask application:
```bash
python app.py
```

The API will be available at `http://localhost:5000`

## API Endpoints

### Authentication

- **POST /auth/register** - Register a new user
  - Body: `{ "name": "string", "email": "string", "password": "string" }`
  - Returns: `{ "user": {...}, "token": "string" }`

- **POST /auth/login** - Login user
  - Body: `{ "email": "string", "password": "string" }`
  - Returns: `{ "user": {...}, "token": "string" }`

- **GET /auth/me** - Get current user
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ "user": {...} }`

### User Profile

- **GET /users/profile** - Get user profile
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ "user": {...}, "techStack": [], "projects": [], "resumeData": {...} }`

- **PUT /users/profile** - Update user profile
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "name": "string", "email": "string", "resumeData": {...} }`
  - Returns: `{ "user": {...} }`

- **PUT /users/profile/tech-stack** - Update tech stack
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "techStack": [...] }`
  - Returns: `{ "user": {...}, "techStack": [...] }`

- **PUT /users/profile/projects** - Update projects
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "projects": [...] }`
  - Returns: `{ "user": {...}, "projects": [...] }`

## Environment Variables

- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET_KEY` - Secret key for JWT token generation
- `FLASK_ENV` - Flask environment (development/production)

