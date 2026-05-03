# Recruitment Platform Backend

A scalable Node.js + Express backend for a MERN recruitment platform.

## Features

- JWT Authentication
- Job posting and management
- Job applications
- Error handling middleware
- MongoDB with Mongoose

## Getting Started

1. Install dependencies: `npm install`
2. Set up environment variables in `.env`
3. Start MongoDB
4. Run the server: `npm run dev`

## Environment Variables

- `PORT`: Server port (default: 5000)
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: JWT secret key
- `NODE_ENV`: Environment (development/production)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user (protected)

### Jobs
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:id` - Get single job
- `POST /api/jobs` - Create job (protected)
- `PUT /api/jobs/:id` - Update job (protected)
- `DELETE /api/jobs/:id` - Delete job (protected)
- `POST /api/jobs/:id/apply` - Apply to job (protected)

## Technologies

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- bcryptjs