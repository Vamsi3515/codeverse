# 🔴 FIX: Email Verification Error - MongoDB Connection Issue

## Problem Identified

The error `getaddrinfo ENOTFOUND ac-r6cvrwn-shard-00-01.rarnzxt.mongodb.net` means:
- ❌ Backend cannot connect to MongoDB Atlas
- ❌ Email verification fails because database is unreachable
- ❌ OTP cannot be stored or retrieved

## ✅ IMMEDIATE SOLUTIONS

---

### **SOLUTION 1: Install and Use Local MongoDB (RECOMMENDED)**

#### Step 1: Install MongoDB Community Server

**Download Link:** https://www.mongodb.com/try/download/community

1. Download MongoDB Community Server for Windows
2. Run the installer
3. Choose "Complete" installation
4. Check "Install MongoDB as a Service"
5. Complete installation

#### Step 2: Start MongoDB Service

```powershell
# Start MongoDB service
net start MongoDB

# Or use MongoDB Compass (GUI tool)
# Download: https://www.mongodb.com/try/download/compass
```

#### Step 3: Your .env is Already Updated

I already changed your `.env` to use local MongoDB:
```env
MONGO_URI=mongodb://127.0.0.1:27017/codeverse_campus
```

#### Step 4: Restart Backend Server

```bash
cd backend
npm start
```

**Expected Output:**
```
✅ MongoDB Connected Successfully
   Database: codeverse_campus
   Host: 127.0.0.1
```

---

### **SOLUTION 2: Fix MongoDB Atlas (If You Prefer Cloud)**

#### Step 1: Login to MongoDB Atlas
https://cloud.mongodb.com/

#### Step 2: Whitelist Your IP Address

1. Go to your cluster
2. Click **"Network Access"** in left sidebar
3. Click **"Add IP Address"**
4. Choose one:
   - **Allow Access from Anywhere**: `0.0.0.0/0` (easier for development)
   - **Add Current IP Address**: Click this button

#### Step 3: Update .env

Uncomment the Atlas connection:
```env
# MONGO_URI=mongodb://127.0.0.1:27017/codeverse_campus
MONGODB_URI=mongodb+srv://HackathonUser:Hackathon2026@cluster0.rarnzxt.mongodb.net/codeverse-campus?retryWrites=true&w=majority&appName=Cluster0
```

#### Step 4: Restart Backend

```bash
cd backend
npm start
```

---

### **SOLUTION 3: Use MongoDB Atlas but Create New Cluster**

Your current cluster might have issues. Create a fresh one:

1. Go to MongoDB Atlas
2. Create **New Cluster** (Free tier M0)
3. Create database user
4. Get new connection string
5. Update `.env` with new connection string

---

## ✅ BONUS FIX: Extended OTP Expiry

I also fixed the "too late" issue by extending OTP expiry time:

### Before:
- ⏱️ OTP expires in **5 minutes**

### After:
- ⏱️ OTP expires in **15 minutes** ✅

This gives users more time to verify their email!

---

## 🧪 Testing After Fix

### Step 1: Start Backend
```bash
cd backend
npm start
```

**Look for this:**
```
✅ MongoDB Connected Successfully
   Database: codeverse_campus
   Host: 127.0.0.1
🚀 Server running on port 5000
```

### Step 2: Test Registration
```bash
curl -X POST http://localhost:5000/api/auth/signup -H "Content-Type: application/json" -d "{\"firstName\":\"Test\",\"lastName\":\"User\",\"email\":\"test@college.edu\",\"password\":\"Test@123\",\"phone\":\"1234567890\",\"college\":\"Test College\"}"
```

### Step 3: Check Console for OTP

If email service not configured, you'll see:
```
📧 EMAIL SERVICE NOT CONFIGURED - OTP LOGGED BELOW:
═══════════════════════════════════════════════════
To: test@college.edu

🔑 OTP CODE: 847291

⚠️  COPY THIS OTP TO VERIFY EMAIL
═══════════════════════════════════════════════════
```

### Step 4: Verify OTP
```bash
curl -X POST http://localhost:5000/api/auth/verify-email -H "Content-Type: application/json" -d "{\"email\":\"test@college.edu\",\"otp\":\"847291\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Email verified successfully! You can now login."
}
```

---

## 📊 Summary of Changes Made

| File | Change | Reason |
|------|--------|--------|
| `.env` | Use local MongoDB | Fix connection error |
| `authController.js` | OTP expiry: 5min → 15min | Give more time to verify |
| `otpService.js` | OTP expiry: 5min → 15min | Consistent timing |
| `emailService.js` | Update email text | Reflect new 15min expiry |

---

## 🚨 Quick Troubleshooting

### Still Getting MongoDB Error?

**Check if MongoDB is running:**
```powershell
# Check MongoDB service status
Get-Service MongoDB

# Start MongoDB if stopped
net start MongoDB
```

### OTP Still Expiring Too Fast?

The expiry is now **15 minutes**. If still too fast:
1. Check system clock is correct
2. Clear browser cache
3. Request new OTP with resend endpoint

### Can't Start MongoDB Service?

**Alternative: Run MongoDB manually**
```powershell
# Start MongoDB in a separate terminal
mongod --dbpath C:\data\db
```

---

## ✅ Verification Checklist

After following solutions above:

- [ ] MongoDB service started
- [ ] Backend shows "MongoDB Connected Successfully"
- [ ] Backend running on port 5000
- [ ] Registration creates user successfully
- [ ] OTP generated and logged to console
- [ ] OTP verification works within 15 minutes
- [ ] Login works after email verification

---

## 🎯 Recommended Next Steps

1. **Install MongoDB locally** (easiest for development)
2. **Restart backend server**
3. **Test registration flow**
4. **Verify OTP works**
5. **Configure email service** (optional, for production)

---

## 📞 Need More Help?

If issues persist:

1. **Check backend console logs** - Look for MongoDB connection status
2. **Check browser console** - Look for network errors
3. **Verify .env file** - Make sure MongoDB connection string is correct
4. **Test with Postman/cURL** - Isolate frontend vs backend issues

---

**Status: ✅ FIXES APPLIED**
- MongoDB connection updated to local
- OTP expiry extended to 15 minutes
- Ready to test!
