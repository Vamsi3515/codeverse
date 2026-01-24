# Email Validation & OTP Flow - Visual Diagram

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║                    CODEVERSE CAMPUS - EMAIL VALIDATION & OTP FLOW             ║
╚═══════════════════════════════════════════════════════════════════════════════╝


┌─────────────────────────────────────────────────────────────────────────────┐
│                           STEP 1: REGISTRATION                              │
└─────────────────────────────────────────────────────────────────────────────┘

    Frontend                          Backend                        Database
       │                                 │                              │
       │  POST /api/auth/signup         │                              │
       │  {                              │                              │
       │    email: "john@mit.edu",       │                              │
       │    password: "..."              │                              │
       │  }                              │                              │
       ├────────────────────────────────>│                              │
       │                                 │                              │
       │                                 │  1. Validate email format    │
       │                                 │  2. Extract domain           │
       │                                 │     → "mit.edu"              │
       │                                 │  3. Check blocklist          │
       │                                 │     → NOT BLOCKED ✅         │
       │                                 │                              │
       │                                 │  4. Check if exists          │
       │                                 ├─────────────────────────────>│
       │                                 │<─────────────────────────────┤
       │                                 │  User not found ✅           │
       │                                 │                              │
       │                                 │  5. Generate OTP             │
       │                                 │     → Math.random()          │
       │                                 │     → "847291"               │
       │                                 │                              │
       │                                 │  6. Set expiry               │
       │                                 │     → Date.now() + 5min      │
       │                                 │                              │
       │                                 │  7. Save user                │
       │                                 ├─────────────────────────────>│
       │                                 │  {                           │
       │                                 │    email: "john@mit.edu"     │
       │                                 │    emailOTP: "847291"        │
       │                                 │    otpExpiry: Date           │
       │                                 │    isEmailVerified: false    │
       │                                 │  }                           │
       │                                 │<─────────────────────────────┤
       │                                 │  Saved ✅                    │
       │<────────────────────────────────┤                              │
       │  {                              │                              │
       │    success: true,               │                              │
       │    message: "Check email"       │                              │
       │  }                              │                              │
       │                                 │                              │


┌─────────────────────────────────────────────────────────────────────────────┐
│                        STEP 2: EMAIL NOTIFICATION                           │
└─────────────────────────────────────────────────────────────────────────────┘

                                  Backend              Email Service (SMTP)
                                     │                         │
                                     │  8. Send OTP email      │
                                     ├────────────────────────>│
                                     │  To: john@mit.edu       │
                                     │  Subject: Verification  │
                                     │  OTP: 847291            │
                                     │                         │
                                     │<────────────────────────┤
                                     │  Email sent ✅          │
                                     │                         │
                                                               │
                                                               v
                                                      ┌────────────────┐
                                                      │  Student Email │
                                                      │                │
                                                      │  📧 CodeVerse  │
                                                      │                │
                                                      │  Your OTP:     │
                                                      │  8 4 7 2 9 1   │
                                                      │                │
                                                      │  Valid: 5 min  │
                                                      └────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                      STEP 3: OTP VERIFICATION                               │
└─────────────────────────────────────────────────────────────────────────────┘

    Frontend                          Backend                        Database
       │                                 │                              │
       │  Student copies OTP             │                              │
       │  → 847291                       │                              │
       │                                 │                              │
       │  POST /api/auth/verify-email    │                              │
       │  {                              │                              │
       │    email: "john@mit.edu",       │                              │
       │    otp: "847291"                │                              │
       │  }                              │                              │
       ├────────────────────────────────>│                              │
       │                                 │                              │
       │                                 │  1. Find user                │
       │                                 ├─────────────────────────────>│
       │                                 │<─────────────────────────────┤
       │                                 │  User found ✅               │
       │                                 │                              │
       │                                 │  2. Check if already verified│
       │                                 │     → isEmailVerified?       │
       │                                 │     → false ✅               │
       │                                 │                              │
       │                                 │  3. Check OTP expiry         │
       │                                 │     → Date.now() < expiry?   │
       │                                 │     → true ✅                │
       │                                 │                              │
       │                                 │  4. Match OTP                │
       │                                 │     → "847291" == "847291"   │
       │                                 │     → true ✅                │
       │                                 │                              │
       │                                 │  5. Update user              │
       │                                 ├─────────────────────────────>│
       │                                 │  {                           │
       │                                 │    isEmailVerified: true     │
       │                                 │    emailOTP: undefined       │
       │                                 │    otpExpiry: undefined      │
       │                                 │  }                           │
       │                                 │<─────────────────────────────┤
       │                                 │  Updated ✅                  │
       │<────────────────────────────────┤                              │
       │  {                              │                              │
       │    success: true,               │                              │
       │    message: "Email verified!"   │                              │
       │  }                              │                              │
       │                                 │                              │


┌─────────────────────────────────────────────────────────────────────────────┐
│                          STEP 4: LOGIN                                      │
└─────────────────────────────────────────────────────────────────────────────┘

    Frontend                          Backend                        Database
       │                                 │                              │
       │  POST /api/auth/login           │                              │
       │  {                              │                              │
       │    email: "john@mit.edu",       │                              │
       │    password: "..."              │                              │
       │  }                              │                              │
       ├────────────────────────────────>│                              │
       │                                 │                              │
       │                                 │  1. Find user                │
       │                                 ├─────────────────────────────>│
       │                                 │<─────────────────────────────┤
       │                                 │  User found ✅               │
       │                                 │                              │
       │                                 │  2. Check password           │
       │                                 │     → bcrypt.compare()       │
       │                                 │     → true ✅                │
       │                                 │                              │
       │                                 │  3. Check email verified     │
       │                                 │     → isEmailVerified?       │
       │                                 │     → true ✅                │
       │                                 │                              │
       │                                 │  4. Generate JWT token       │
       │                                 │     → jwt.sign(userId)       │
       │                                 │                              │
       │<────────────────────────────────┤                              │
       │  {                              │                              │
       │    success: true,               │                              │
       │    token: "eyJhbGc...",         │                              │
       │    user: { ... }                │                              │
       │  }                              │                              │
       │                                 │                              │
       │  ✅ LOGIN SUCCESSFUL            │                              │
       │                                 │                              │


╔═══════════════════════════════════════════════════════════════════════════════╗
║                              ERROR SCENARIOS                                  ║
╚═══════════════════════════════════════════════════════════════════════════════╝


┌─────────────────────────────────────────────────────────────────────────────┐
│                    SCENARIO A: Public Email Blocked                         │
└─────────────────────────────────────────────────────────────────────────────┘

    Frontend                          Backend
       │                                 │
       │  POST /api/auth/signup         │
       │  {                              │
       │    email: "john@gmail.com"      │
       │  }                              │
       ├────────────────────────────────>│
       │                                 │  1. Extract domain
       │                                 │     → "gmail.com"
       │                                 │  2. Check blocklist
       │                                 │     → FOUND IN LIST ❌
       │<────────────────────────────────┤
       │  {                              │
       │    success: false,              │
       │    message: "Use college email",│
       │    isPublicEmail: true          │
       │  }                              │
       │                                 │
       │  ❌ REGISTRATION BLOCKED        │


┌─────────────────────────────────────────────────────────────────────────────┐
│                      SCENARIO B: Expired OTP                                │
└─────────────────────────────────────────────────────────────────────────────┘

    Frontend                          Backend
       │                                 │
       │  POST /api/auth/verify-email    │
       │  (after 5+ minutes)             │
       ├────────────────────────────────>│
       │                                 │  1. Check OTP expiry
       │                                 │     → Date.now() > expiry
       │                                 │     → EXPIRED ❌
       │<────────────────────────────────┤
       │  {                              │
       │    success: false,              │
       │    message: "OTP expired"       │
       │  }                              │
       │                                 │
       │  User must request new OTP      │


┌─────────────────────────────────────────────────────────────────────────────┐
│                      SCENARIO C: Invalid OTP                                │
└─────────────────────────────────────────────────────────────────────────────┘

    Frontend                          Backend
       │                                 │
       │  POST /api/auth/verify-email    │
       │  { otp: "999999" }              │
       ├────────────────────────────────>│
       │                                 │  1. Match OTP
       │                                 │     → "999999" != "847291"
       │                                 │     → NO MATCH ❌
       │<────────────────────────────────┤
       │  {                              │
       │    success: false,              │
       │    message: "Invalid OTP"       │
       │  }                              │
       │                                 │
       │  User can retry                 │


╔═══════════════════════════════════════════════════════════════════════════════╗
║                         SECURITY FEATURES                                     ║
╚═══════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────┐
│  ✅ Email Domain Validation                                                 │
│     • 16+ blocked public domains                                            │
│     • Extensible blocklist                                                  │
│     • Case-insensitive matching                                             │
│                                                                              │
│  ✅ OTP Security                                                             │
│     • Random 6-digit generation                                             │
│     • 5-minute automatic expiry                                             │
│     • Single use only                                                       │
│     • Stored securely (select: false)                                       │
│                                                                              │
│  ✅ Email Verification Required                                             │
│     • Blocks login until verified                                           │
│     • Prevents unauthorized access                                          │
│     • Ensures email ownership                                               │
│                                                                              │
│  ✅ Professional Email Template                                             │
│     • Clear OTP display                                                     │
│     • Security warnings                                                     │
│     • Expiry notifications                                                  │
│     • Modern HTML design                                                    │
└─────────────────────────────────────────────────────────────────────────────┘


╔═══════════════════════════════════════════════════════════════════════════════╗
║                          IMPLEMENTATION STATUS                                ║
╚═══════════════════════════════════════════════════════════════════════════════╝

✅ Email validation utility created
✅ Blocklist implemented (16+ domains)
✅ Auth controller updated
✅ OTP controller updated
✅ Email service enhanced
✅ Test suite passing (100%)
✅ Documentation complete
✅ Ready for production

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                        🚀 IMPLEMENTATION COMPLETE 🚀
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```
