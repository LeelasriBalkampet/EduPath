# MongoDB Atlas Setup Guide

## Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Sign up for a free account
3. Create a new cluster (Free M0 tier is sufficient)

## Step 2: Configure Database Access

1. In Atlas dashboard, go to **Database Access**
2. Click **Add New Database User**
3. Create a user with username and password
4. Set permissions to **Read and write to any database**
5. **Save the username and password** - you'll need these for the connection string

## Step 3: Configure Network Access

1. Go to **Network Access**
2. Click **Add IP Address**
3. Click **Allow Access from Anywhere** (0.0.0.0/0)
   - For production, restrict to specific IPs
4. Confirm

## Step 4: Get Connection String

1. Go to **Database** → **Connect**
2. Choose **Connect your application**
3. Select **Node.js** driver
4. Copy the connection string (looks like):
   ```
   mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

## Step 5: Update .env File

1. Open `backend/.env`
2. Replace the `MONGODB_URI` value with your connection string:
   ```env
   MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/edupath?retryWrites=true&w=majority
   ```
3. Replace `<username>` and `<password>` with your actual credentials
4. Add `/edupath` before the `?` to specify the database name

## Step 6: Seed the Database

Run the seed script to populate initial data:

```bash
cd backend
npm run seed
```

This will create:
- 1 admin user (admin@edupath.com / admin123)
- 3 student users (rahul@student.com, priya@student.com, amit@student.com / student123)
- 3 sample quizzes

## Step 7: Start the Backend

```bash
npm start
```

You should see:
```
✅ MongoDB Connected Successfully
📊 Database: edupath
🚀 Backend running on http://localhost:5000
```

## Troubleshooting

### Connection Timeout
- Check if your IP is whitelisted in Network Access
- Verify your connection string is correct

### Authentication Failed
- Double-check username and password in connection string
- Ensure special characters in password are URL-encoded

### Database Not Found
- Make sure you added `/edupath` to the connection string before the `?`

## Viewing Your Data

Use [MongoDB Compass](https://www.mongodb.com/products/compass) to view your data:
1. Download and install MongoDB Compass
2. Use the same connection string to connect
3. Browse collections: users, quizzes, quizattempts, chathistories
