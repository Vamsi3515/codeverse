# Razorpay Payment Integration - Complete Implementation

## 📋 Executive Summary

Complete Razorpay payment integration has been implemented for both **solo** and **team** hackathon registrations with optional payment fees. The system includes:

- ✅ Frontend payment modal for collecting payments
- ✅ Backend payment order creation and verification
- ✅ Signature verification for payment security
- ✅ Webhook handler for async payment notifications
- ✅ Conditional registration flows (free vs paid hackathons)

---

## 🔄 Payment Flow Architecture

### 1. Solo Registration Flow
```
User views hackathon → Clicks "Register" button
    ↓
System checks: registrationFee > 0?
    ├─ YES → Opens PaymentModal
    │   ├─ User sees: Hackathon info + Fee amount
    │   ├─ Clicks "💳 Pay & Register"
    │   ├─ Frontend calls: POST /api/payments/create-order
    │   ├─ Backend creates Razorpay order
    │   ├─ Frontend opens Razorpay checkout modal
    │   ├─ User completes payment
    │   ├─ Frontend calls: POST /api/payments/verify-payment
    │   ├─ Backend verifies signature and creates Registration
    │   ├─ Razorpay sends webhook to: POST /api/payments/webhook/razorpay
    │   └─ Triggers onPaymentSuccess callback
    └─ NO → Direct registration via POST /api/registrations
```

### 2. Team Registration Flow
```
User creates team → Fills team details → Clicks "Register Team"
    ↓
System checks: registrationFee > 0?
    ├─ YES → Opens PaymentModal inside TeamRegistrationModal
    │   ├─ Displays: Team info + per-member fee
    │   ├─ Shows total: fee × team size
    │   └─ Follows same payment flow as above
    └─ NO → Direct team registration via POST /api/registrations
```

---

## 🛠️ Backend Implementation

### Payment Controller (`paymentController.js`)

#### Endpoint 1: Create Payment Order
**Route:** `POST /api/payments/create-order`
**Authentication:** Required (JWT token)
**Body:**
```json
{
  "hackathonId": "507f1f77bcf86cd799439011",
  "teamId": null,
  "amount": 500
}
```
**Response:**
```json
{
  "success": true,
  "orderId": "order_1Aa00000000002",
  "amount": 50000,
  "currency": "INR"
}
```
**Logic:**
1. Validates hackathonId exists
2. Checks registration fee in hackathon
3. Prevents duplicate registrations
4. Creates Razorpay order via `razorpay.orders.create()`
5. Returns orderId and amount

#### Endpoint 2: Verify Payment
**Route:** `POST /api/payments/verify-payment`
**Authentication:** Required (JWT token)
**Body:**
```json
{
  "orderId": "order_1Aa00000000002",
  "paymentId": "pay_1Aa00000000001",
  "signature": "9ef4dffbfd84f1318f6739a3ce19f9d85851857ae648f114332d8401e0949a3d",
  "teamId": null
}
```
**Response:**
```json
{
  "success": true,
  "registration": {
    "_id": "reg_123",
    "hackathonId": "hack_123",
    "studentId": "student_123",
    "registrationType": "SOLO",
    "paymentStatus": "VERIFIED",
    "registrationDate": "2024-01-15T10:30:00Z"
  }
}
```
**Logic:**
1. Verifies HMAC signature using: `crypto.createHmac('sha256', RAZORPAY_KEY_SECRET).update(orderId|paymentId).digest('hex')`
2. Checks signature matches provided signature
3. Creates Registration record in MongoDB
4. Updates Student profile with new registration
5. Returns registration details

#### Endpoint 3: Get Payment Status
**Route:** `GET /api/payments/status/:orderId`
**Authentication:** Required (JWT token)
**Response:**
```json
{
  "success": true,
  "status": "paid",
  "amount": 50000,
  "currency": "INR"
}
```

#### Endpoint 4: Razorpay Webhook Handler
**Route:** `POST /api/payments/webhook/razorpay`
**Authentication:** Not required (Razorpay signature verification)
**Events Handled:**
- `payment.authorized` - Payment received and verified
- `payment.failed` - Payment failure
- `payment.captured` - Payment captured (for manual settlement)

**Webhook Verification:**
```javascript
const crypto = require('crypto');
const digest = crypto
  .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
  .update(JSON.stringify(req.body))
  .digest('hex');

if (digest !== req.headers['x-razorpay-signature']) {
  return res.status(401).json({ success: false });
}
```

### Payment Routes (`paymentRoutes.js`)

```javascript
// Protected endpoints (require JWT authentication)
POST /api/payments/create-order       // Create Razorpay order
POST /api/payments/verify-payment     // Verify payment and register user
GET  /api/payments/status/:orderId    // Get payment status

// Webhook endpoint (unprotected, verified by Razorpay signature)
POST /api/payments/webhook/razorpay   // Receive payment notifications
```

### Environment Variables (`backend/.env`)

Required:
```
RAZORPAY_KEY_ID=rzp_test_YOUR_TEST_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_TEST_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET
```

Get from: https://dashboard.razorpay.com/ → Settings → API Keys

---

## 🎨 Frontend Implementation

### Payment Modal Component (`PaymentModal.jsx`)

**Props:**
```javascript
{
  open: boolean,                    // Modal visibility
  hackathon: object,                // Hackathon data
  registrationType: 'SOLO' | 'TEAM', // Registration type
  teamData: object,                 // Team info (for team registrations)
  registrationFee: number,          // Fee amount in INR
  onClose: function,                // Close handler
  onPaymentSuccess: function,       // Success callback
  onPaymentFailed: function         // Failure callback
}
```

**Features:**
1. Shows hackathon name and fee
2. Validates all required data before payment
3. Creates Razorpay order via `/api/payments/create-order`
4. Opens Razorpay checkout modal using `window.Razorpay`
5. Verifies payment signature via `/api/payments/verify-payment`
6. Calls `onPaymentSuccess` on successful verification
7. Handles errors and displays error messages

**Key Functions:**

```javascript
// Handle payment process
const handlePayment = async () => {
  // 1. Create order
  const orderResponse = await fetch('/api/payments/create-order', ...)
  const { orderId } = await orderResponse.json()
  
  // 2. Open Razorpay modal
  const options = {
    key: RAZORPAY_KEY_ID,
    order_id: orderId,
    amount: registrationFee * 100,
    handler: verifyPayment
  }
  const razorpay = new window.Razorpay(options)
  razorpay.open()
}

// Verify payment on backend
const verifyPayment = async (response) => {
  const verifyResponse = await fetch('/api/payments/verify-payment', {
    method: 'POST',
    body: JSON.stringify({
      orderId: response.razorpay_order_id,
      paymentId: response.razorpay_payment_id,
      signature: response.razorpay_signature,
      teamId: teamData?.id
    })
  })
  
  const { success } = await verifyResponse.json()
  if (success) onPaymentSuccess()
}
```

### Student Dashboard (`StudentDashboard.jsx`)

**Updates:**
1. Added `PaymentModal` import
2. Added payment modal state:
```javascript
const [paymentModal, setPaymentModal] = useState({
  open: false,
  hackathon: null,
  registrationFee: 0,
  registrationType: null
})
```

3. Updated `handleRegister()` function:
```javascript
function handleRegister(hackathon) {
  const participationType = hackathon.participationType?.toUpperCase() || 'SOLO'
  const registrationFee = hackathon.registrationFee || 0
  
  if (participationType === 'TEAM') {
    setRegistrationModal({ open: true, hackathon })
  } else {
    if (registrationFee > 0) {
      // Show payment modal for paid hackathons
      setPaymentModal({
        open: true,
        hackathon,
        registrationFee,
        registrationType: 'SOLO'
      })
    } else {
      // Direct registration for free hackathons
      registerSoloDirectly(hackathon)
    }
  }
}
```

4. Renders PaymentModal component:
```jsx
<PaymentModal
  open={paymentModal.open}
  hackathon={paymentModal.hackathon}
  registrationType={paymentModal.registrationType}
  registrationFee={paymentModal.registrationFee}
  onClose={() => setPaymentModal(prev => ({ ...prev, open: false }))}
  onPaymentSuccess={handleRegistrationSuccess}
  onPaymentFailed={() => setPaymentModal(prev => ({ ...prev, open: false }))}
/>
```

### Team Registration Modal (`TeamRegistrationModal.jsx`)

**Updates:**
1. Added PaymentModal import
2. Added payment modal state management
3. Updated `handleSubmit()` to check for fees:

```javascript
const handleSubmit = async (e) => {
  const registrationFee = hackathon.registrationFee || 0
  
  if (registrationFee > 0) {
    // Show payment modal
    setPaymentModal({
      open: true,
      hackathon,
      registrationFee,
      registrationType: 'TEAM'
    })
  } else {
    // Direct registration
    registerTeamDirectly()
  }
}
```

4. Fee display box (shown when `registrationFee > 0`):
```jsx
{registrationFee > 0 && (
  <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
    <h3 className="text-yellow-800 font-semibold mb-2">Registration Fee</h3>
    <p className="text-2xl font-bold text-yellow-600">₹{registrationFee}</p>
  </div>
)}
```

5. Dynamic button text:
```jsx
{registrationFee > 0 ? '💳 Pay & Register' : '✓ Register'}
```

### Frontend Environment (`frontend/.env`)

Required:
```
VITE_RAZORPAY_KEY_ID=rzp_test_YOUR_TEST_KEY_ID
```

Get from: https://dashboard.razorpay.com/ → Settings → API Keys

### HTML Script Tag (`frontend/index.html`)

Required in `<head>`:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

---

## 🧪 Testing Guide

### 1. Test Free Hackathon Registration (No Payment)
```
1. Create hackathon with registrationFee: 0
2. Click "Register"
3. Verify: Direct registration (no payment modal)
4. Expected: Registration created immediately
```

### 2. Test Paid Solo Registration
```
1. Create hackathon with registrationFee: 500
2. Click "Register"
3. Verify: PaymentModal opens with fee
4. Click "💳 Pay & Register"
5. Verify: Razorpay modal opens
6. Use test card: 4111 1111 1111 1111 (any future date, any CVV)
7. Verify: Payment successful notification
8. Expected: Registration created with payment verification
```

### 3. Test Paid Team Registration
```
1. Create hackathon with registrationFee: 1000
2. Create team with 3 members
3. Click "Register Team"
4. Verify: TeamRegistrationModal shows fee (₹1000)
5. Click "💳 Pay & Register"
6. Complete payment flow
7. Expected: Team registration created with all members
```

### 4. Test Razorpay Webhook (Optional)
```
1. Configure webhook in Razorpay dashboard:
   URL: https://your-domain/api/payments/webhook/razorpay
   Events: payment.authorized, payment.failed
2. Make a test payment
3. Check backend logs for webhook receipt
4. Expected: "✅ [WEBHOOK] Signature verified, processing: payment.authorized"
```

### Test Payment Cards (Razorpay Testing Mode)
```
Success Card:       4111 1111 1111 1111
Failure Card:       4222 2222 2222 2222
International Card: 4000 0000 0000 0002

Expiry: Any future date (MM/YY)
CVV: Any 3 digits
```

---

## 🔐 Security Implementation

### 1. Signature Verification (Backend)
Payment verification uses HMAC-SHA256:
```javascript
const expectedSignature = crypto
  .createHmac('sha256', RAZORPAY_KEY_SECRET)
  .update(`${orderId}|${paymentId}`)
  .digest('hex');

if (signature !== expectedSignature) {
  throw new Error('Invalid signature');
}
```

### 2. Webhook Signature Verification
```javascript
const digest = crypto
  .createHmac('sha256', RAZORPAY_WEBHOOK_SECRET)
  .update(JSON.stringify(req.body))
  .digest('hex');

if (digest !== req.headers['x-razorpay-signature']) {
  return res.status(401).json({ success: false });
}
```

### 3. Authentication
- All payment endpoints (except webhook) require JWT token
- Webhook uses Razorpay signature instead of JWT
- Prevents unauthorized payment creation

### 4. Idempotency
- Check for duplicate registrations before creating order
- Prevents multiple charges for same hackathon

---

## 📊 Data Flow Diagram

```
Frontend                          Backend                        Razorpay
   │                                 │                              │
   ├─ POST /create-order ────────────>├─ Validate hackathonId       │
   │                                 ├─ Check fee > 0              │
   │                                 ├─ Create order ──────────────>│
   │                                 │<─ Return orderId ───────────┤
   │<─ Return orderId ────────────────┤                              │
   │                                 │                              │
   ├─ Open Razorpay Modal ─────────────────────────────────────────>│
   │                                 │         (User pays)           │
   │<─ Payment Result ──────────────────────────────────────────────┤
   │                                 │                              │
   ├─ POST /verify-payment ─────────>├─ Verify signature            │
   │                                 ├─ Create registration         │
   │                                 ├─ Update student profile      │
   │<─ Registration ────────────────┤                              │
   │                                 │                              │
   │                                 │<─ Webhook (async) ──────────┤
   │                                 ├─ Log payment authorized      │
   │                                 └─ (Optional: Update DB)       │
```

---

## 📝 API Response Examples

### Success Flow
```json
// Step 1: Create Order Response
{
  "success": true,
  "orderId": "order_1Aa00000000002",
  "amount": 50000,
  "currency": "INR"
}

// Step 2: Verify Payment Response
{
  "success": true,
  "registration": {
    "_id": "507f1f77bcf86cd799439012",
    "hackathonId": "507f1f77bcf86cd799439011",
    "studentId": "507f1f77bcf86cd799439010",
    "registrationType": "SOLO",
    "paymentStatus": "VERIFIED",
    "registrationDate": "2024-01-15T10:30:00Z"
  }
}
```

### Error Cases
```json
// Invalid hackathon
{
  "success": false,
  "message": "Hackathon not found",
  "error": "..."
}

// Signature verification failed
{
  "success": false,
  "message": "Payment verification failed",
  "error": "Signature mismatch"
}

// Duplicate registration
{
  "success": false,
  "message": "Already registered for this hackathon"
}
```

---

## 🚀 Deployment Checklist

### Before Going Live

- [ ] Replace test keys with live Razorpay keys:
  - [ ] `RAZORPAY_KEY_ID` (live key)
  - [ ] `RAZORPAY_KEY_SECRET` (live secret)
  - [ ] `RAZORPAY_WEBHOOK_SECRET` (live webhook secret)

- [ ] Configure Razorpay webhook:
  - [ ] URL: `https://your-production-domain/api/payments/webhook/razorpay`
  - [ ] Events: `payment.authorized`, `payment.failed`, `payment.captured`
  - [ ] Secret: Use webhook secret from dashboard

- [ ] Update frontend environment:
  - [ ] `VITE_RAZORPAY_KEY_ID` (live key in .env)

- [ ] Security audit:
  - [ ] Verify signature validation working
  - [ ] Check JWT authentication on protected routes
  - [ ] Test duplicate registration prevention
  - [ ] Verify webhook signature verification

- [ ] Load testing:
  - [ ] Test concurrent payment creation
  - [ ] Test webhook rate limiting
  - [ ] Monitor database for registration records

- [ ] Monitoring:
  - [ ] Set up payment failure alerts
  - [ ] Log all webhook events
  - [ ] Track payment success rate

---

## 📞 Troubleshooting

### Issue: "Invalid webhook signature"
**Solution:** Verify `RAZORPAY_WEBHOOK_SECRET` matches dashboard secret

### Issue: "Payment verified but registration not created"
**Solution:** Check:
- MongoDB connection
- Duplicate registration check logic
- Student record exists

### Issue: "Razorpay modal not opening"
**Solution:** Verify:
- Razorpay script loaded: `<script src="https://checkout.razorpay.com/v1/checkout.js"></script>`
- `VITE_RAZORPAY_KEY_ID` set in frontend .env
- `window.Razorpay` object exists

### Issue: "CORS error on payment endpoints"
**Solution:** Verify CORS middleware configured for payment routes

---

## ✅ Implementation Status

✅ **Complete:**
- Payment order creation
- Payment verification with signature
- Webhook handler for async notifications
- Solo registration payment flow
- Team registration payment flow
- Environment variable configuration
- Security implementation (HMAC, JWT)
- Error handling and validation

⚙️ **Ready for Testing:**
- Use Razorpay test keys and test cards
- Monitor console logs for payment flow
- Verify registrations in MongoDB

🚀 **Ready for Production:**
- Replace with live Razorpay keys
- Configure production webhook URL
- Set up monitoring and alerts

---

## 📚 Resources

- Razorpay Documentation: https://razorpay.com/docs/
- Test Cards: https://razorpay.com/docs/payments/payments/test-cards/
- Webhook Setup: https://razorpay.com/docs/webhooks/
- API Keys: https://dashboard.razorpay.com/app/settings/api-keys
