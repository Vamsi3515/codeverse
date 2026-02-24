# Code Execution Service Setup Guide

## ⚠️ Problem: Piston API Whitelist Restriction

As of February 15, 2026, the public Piston API at `emkc.org` is **whitelist-only**. This means you must use one of the following alternatives:

---

## ✅ Solution 1: Use Judge0 API (EASIEST - Recommended)

Judge0 is a reliable code execution service with a free tier available.

### Steps:

1. **Get RapidAPI Account & API Key:**
   - Go to: https://rapidapi.com/judge0-official/api/judge0-ce
   - Click "Subscribe" (Free plan includes 50 requests/day)
   - Copy your RapidAPI API Key

2. **Update `.env` file:**
   ```
   USE_JUDGE0=true
   JUDGE0_API_KEY=your_copied_api_key_here
   USE_PISTON=false
   ```

3. **Restart Backend:**
   ```bash
   npm start
   ```

### Supported Languages (Judge0):
- Python
- JavaScript
- Java
- C
- C++
- And many more...

**Pros:** No setup required, free tier available, reliable
**Cons:** Limited to 50 requests/day on free tier

---

## ✅ Solution 2: Self-Hosted Piston with Docker

Run your own Piston instance locally using Docker.

### Prerequisites:
- Docker installed: https://www.docker.com/products/docker-desktop

### Steps:

1. **Start Piston Docker Container:**
   ```bash
   docker run -d -p 2000:2000 --name piston evanwong/piston
   ```

2. **Update `.env` file:**
   ```
   USE_PISTON=true
   PISTON_API_URL=http://localhost:2000
   USE_JUDGE0=false
   ```

3. **Restart Backend:**
   ```bash
   npm start
   ```

4. **Verify it works:**
   ```bash
   curl http://localhost:2000/api/v2/piston/runtimes
   ```

### Supported Languages (Piston):
- Python, JavaScript, Java, C, C++, Go, Rust, PHP, Ruby, and 40+ more

**Pros:** Unlimited requests, full control, supports all languages
**Cons:** Requires Docker, uses local resources

---

## ✅ Solution 3: Glot.io API (Free, No Key Needed)

Alternative free service that doesn't require authentication.

Will implement in next update if Judge0/Dockerare not available.

---

## 🧪 Testing Your Setup

### Test via Backend Diagnostics:
```bash
GET /api/compiler/diagnostics/piston
```

### Test Code Execution:
```bash
POST /api/compiler/execute
Content-Type: application/json

{
  "language": "python",
  "sourceCode": "print('Hello from CodeVerse')",
  "input": ""
}
```

---

## 📋 Quick Setup Checklist

- [ ] Choose a solution (Judge0 is easiest)
- [ ] Get API key or setup Docker
- [ ] Update `.env` file with credentials
- [ ] Restart backend server
- [ ] Test code execution on platform
- [ ] Verify students can run code in hackathons

---

## ❓ Troubleshooting

### "Code Execution Error: No execution method available"
- Check that `JUDGE0_API_KEY` is set correctly
- Or verify Docker Piston is running on port 2000

### "Judge0: API limit exceeded"
- Free tier allows 50 requests/day
- Upgrade to paid tier or wait for next day

### "Connection refused to localhost:2000"
- Docker container is not running
- Start it: `docker run -d -p 200:2000 --name piston evanwong/piston`

### Python/Java not working locally
- These require proper runtime installation
- Use Judge0 or Docker solution instead

---

## 🚀 Recommended Setup for Production

For a production hackathon:

1. **Option A (Unlimited):** Docker Piston on dedicated server
   - Full control, unlimited requests
   - Host on AWS/DigitalOcean/your own server

2. **Option B (Managed):** Upgrade to paid Judge0 plan
   - Unlimited requests/month
   - No infrastructure management

3. **Option C (Hybrid):** Judge0 + local JavaScript fallback
   - Use Judge0 for complex languages
   - Fallback to local JS execution

---

## 📚 References

- Judge0 API: https://rapidapi.com/judge0-official/api/judge0-ce
- Piston Docker: https://hub.docker.com/r/evanwong/piston
- Glot.io API: https://glot.io/
