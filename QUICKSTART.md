# Quick Start Guide - MongoDB Integration

## 🚀 What's Been Done

✅ Complete MongoDB backend with authentication  
✅ All database models (User, Quiz, QuizAttempt, ChatHistory)  
✅ RESTful API with JWT authentication  
✅ Frontend integration with API client  
✅ Database seed script with sample data  

## 📋 What You Need To Do

### 1. Set Up MongoDB Atlas (5 minutes)

1. Go to https://www.mongodb.com/cloud/atlas
2. Sign up for free account
3. Create a free cluster (M0)
4. Create database user (remember username/password!)
5. Whitelist IP: 0.0.0.0/0 (allow from anywhere)
6. Get connection string

**Detailed guide:** See `backend/MONGODB_SETUP.md`

### 2. Update Environment Variables

Edit `backend/.env`:

```env
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/edupath?retryWrites=true&w=majority
```

Replace:
- `YOUR_USERNAME` - your MongoDB Atlas username
- `YOUR_PASSWORD` - your MongoDB Atlas password  
- `cluster0.xxxxx.mongodb.net` - your cluster URL

### 3. Seed the Database

```bash
cd backend
npm run seed
```

This creates:
- Admin: admin@edupath.com / admin123
- 3 Students: rahul@student.com, priya@student.com, amit@student.com / student123
- 3 Sample quizzes

### 4. Start the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
npm run dev
```

### 5. Test It Out

1. Open http://localhost:5173 (or your Vite port)
2. Login with: admin@edupath.com / admin123
3. Try creating a quiz (admin features)
4. Login as student: rahul@student.com / student123
5. Take a quiz, use chat feature

## 🔑 Key Features

### Authentication
- JWT-based authentication
- Password hashing with bcrypt
- Persistent sessions (survives page refresh)
- Role-based access (admin/student)

### API Endpoints

**Auth:**
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

**Students (Admin only):**
- GET /api/students
- PUT /api/students/:id
- DELETE /api/students/:id

**Quizzes:**
- GET /api/quizzes
- POST /api/quizzes (admin)
- POST /api/quizzes/:id/attempt (student)

**Chat:**
- POST /api/chat
- GET /api/chat/history/:userId

## 🐛 Troubleshooting

**"MongoDB connection error"**
- Check your connection string in .env
- Verify IP is whitelisted in Atlas
- Ensure username/password are correct

**"Invalid token"**
- Clear localStorage and login again
- Check JWT_SECRET in .env

**"Cannot find module"**
- Run `npm install` in backend folder

## 📚 Documentation

- **Full Walkthrough:** See artifact `walkthrough.md`
- **MongoDB Setup:** `backend/MONGODB_SETUP.md`
- **Implementation Plan:** See artifact `implementation_plan.md`

## 🎯 What Changed

**Backend:**
- Removed SQL (there was none)
- Added MongoDB with Mongoose
- Created 4 models, 4 route modules, 2 middleware files
- Refactored server.cjs completely

**Frontend:**
- Created API client (src/utils/api.js)
- Updated AuthContext for real authentication
- Modified StudentChat to use API client
- All data now persists in MongoDB!

---

**You're all set!** Just configure MongoDB Atlas and run the seed script. 🎉
