# HACKATHON MANAGEMENT BACKEND - MongoDB Setup

## Quick Fix: Use MongoDB Atlas (FREE - No Installation Required)

**The backend needs MongoDB to run. You have 2 options:**

---

### ✅ OPTION 1: MongoDB Atlas (Recommended - 5 minutes)

1. **Sign up for free:** https://www.mongodb.com/cloud/atlas/register
2. **Create a free cluster** (M0 - Free tier)
3. **Get your connection string:**
   - Click "Connect" on your cluster
   - Choose "Connect your application"
   - Copy the connection string (looks like `mongodb+srv://...`)
4. **Create `.env` file** in the `backend` folder with:

```env
MONGODB_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/codeverse-campus?retryWrites=true&w=majority
PORT=5000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-random-secret-key-here
NODE_ENV=development
SOCKET_IO_CORS_ORIGIN=http://localhost:5173
```

5. **Replace** `your-username`, `your-password`, and `cluster0.xxxxx` with your actual values
6. **Restart the backend:** `npm run dev`

---

### OPTION 2: Local MongoDB (Requires Installation)

1. **Install MongoDB Community Server:**
   - Windows: https://www.mongodb.com/try/download/community
   - Mac: `brew install mongodb-community`
   - Linux: Follow official docs

2. **Start MongoDB service:**
   - Windows: `net start MongoDB` (or start from Services)
   - Mac/Linux: `brew services start mongodb-community` or `sudo systemctl start mongod`

3. **Create `.env` file** in the `backend` folder:

```env
MONGODB_URI=mongodb://localhost:27017/codeverse-campus
PORT=5000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=your-random-secret-key-here
NODE_ENV=development
SOCKET_IO_CORS_ORIGIN=http://localhost:5173
```

4. **Restart the backend:** `npm run dev`

---

## After Setup

Once connected, you should see:
```
MongoDB Connected: cluster0.xxxxx.mongodb.net
Server running on port 5000
```

Then test:
```bash
curl http://localhost:5000/api/health
```

Should return: `{"success":true,"message":"Server is running"}`
