# Razorpay Payment Integration - Quick Start & Testing

## 🎯 What's Implemented

### Backend (Node.js + Express)
✅ `POST /api/payments/create-order` - Creates Razorpay order  
✅ `POST /api/payments/verify-payment` - Verifies payment & registers user  
✅ `GET /api/payments/status/:orderId` - Checks payment status  
✅ `POST /api/payments/webhook/razorpay` - Receives payment notifications  

### Frontend (React + Vite)
✅ `PaymentModal.jsx` - Payment UI component  
✅ `StudentDashboard.jsx` - Solo registration with payment  
✅ `TeamRegistrationModal.jsx` - Team registration with payment  

### Complete Flow
✅ Free hackathons: Direct registration (no payment)  
✅ Paid solo hackathons: Show payment modal → Razorpay → Verify → Register  
✅ Paid team hackathons: Show fee in team form → Payment flow → Register all members  

---

## ⚙️ Setup Instructions

### Step 1: Get Razorpay Test Keys
1. Go to https://dashboard.razorpay.com/
2. Settings → API Keys
3. Copy test Key ID and Secret

### Step 2: Set Backend Environment Variables
File: `backend/.env`
```
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXX
RAZORPAY_KEY_SECRET=XXXXXXXXXX
RAZORPAY_WEBHOOK_SECRET=whsec_XXXXXXXXXX
```

### Step 3: Set Frontend Environment Variables
File: `frontend/codeverse-campus/.env`
```
VITE_RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXX
```

### Step 4: Ensure Razorpay Script is Loaded
File: `frontend/codeverse-campus/index.html` (in `<head>`)
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

---

## 🧪 Quick Test Scenarios

### Test 1: Free Hackathon Registration
```
1. Find/create hackathon with registrationFee: 0
2. Click "Register" button
3. ✅ Verify: Registration succeeds without payment modal
```

### Test 2: Paid Solo Registration
```
1. Find/create hackathon with registrationFee: 500 (or any amount)
2. Click "Register" button
3. ✅ PaymentModal appears showing fee
4. Click "💳 Pay & Register"
5. ✅ Razorpay modal opens
6. Use test card: 4111 1111 1111 1111
7. Any expiry (e.g., 12/28), any CVV (e.g., 123)
8. ✅ Payment succeeds
9. ✅ Registration created
```

### Test 3: Paid Team Registration
```
1. Create team in paid hackathon
2. Fill team details
3. ✅ Yellow fee box shows amount
4. Click "💳 Pay & Register"
5. ✅ Payment modal opens
6. Complete payment with test card
7. ✅ Team and all members registered
```

### Test 4: Payment Failure
```
1. Use test card: 4222 2222 2222 2222
2. ✅ Razorpay shows error message
3. ✅ Registration NOT created
4. ✅ User can retry payment
```

---

## 🔍 Debugging Commands

### Check Backend Logs
```bash
# Watch for payment logs
npm run dev

# Look for:
# 💳 [PAYMENT] Creating order...
# ✅ [PAYMENT] Order created...
# ✅ [PAYMENT] Payment verified...
# ✅ [WEBHOOK] Signature verified...
```

### Check Frontend Logs
```javascript
// Open browser DevTools (F12)
// Console tab
// Look for:
// 💳 [PAYMENT] Creating order...
// 💳 [PAYMENT] Opening Razorpay...
// ✅ [PAYMENT] Payment successful!
```

### Check MongoDB Registrations
```javascript
// Registration record should have:
db.registrations.findOne({
  hackathonId: ObjectId("..."),
  studentId: ObjectId("...")
})

// Should include:
{
  _id: ObjectId(...),
  hackathonId: ObjectId(...),
  studentId: ObjectId(...),
  registrationType: "SOLO", // or "TEAM"
  paymentStatus: "VERIFIED",
  registrationDate: ISODate(...),
  razorpayOrderId: "order_...",
  razorpayPaymentId: "pay_..."
}
```

---

## 🎁 Razorpay Test Cards

| Type | Card Number | Status |
|------|---|---|
| Success | 4111 1111 1111 1111 | ✅ Payment succeeds |
| Failure | 4222 2222 2222 2222 | ❌ Payment fails |
| International | 4000 0000 0000 0002 | ✅ Payment succeeds |

**Expiry:** Any future date (e.g., 12/28)  
**CVV:** Any 3 digits (e.g., 123)  

---

## 📱 Frontend Component Usage

### PaymentModal Props
```javascript
<PaymentModal
  open={true}                          // Show modal?
  hackathon={hackathonObject}          // Hackathon data
  registrationType="SOLO"              // 'SOLO' or 'TEAM'
  teamData={teamObject}                // For team registrations
  registrationFee={500}                // Fee in INR
  onClose={() => {}}                   // When user closes
  onPaymentSuccess={(reg) => {}}       // After successful payment
  onPaymentFailed={() => {}}           // If payment fails
/>
```

### Current Usage in StudentDashboard
```javascript
// Opens when user clicks Register on paid hackathon
handleRegister(hackathon) {
  if (hackathon.registrationFee > 0) {
    setPaymentModal({
      open: true,
      hackathon,
      registrationFee: hackathon.registrationFee,
      registrationType: 'SOLO'
    })
  } else {
    registerSoloDirectly(hackathon) // No payment needed
  }
}
```

### Current Usage in TeamRegistrationModal
```javascript
// Opens when user submits team form for paid hackathon
handleSubmit() {
  const registrationFee = hackathon.registrationFee || 0
  if (registrationFee > 0) {
    setPaymentModal({
      open: true,
      hackathon,
      registrationFee,
      registrationType: 'TEAM'
    })
  } else {
    registerTeamDirectly() // No payment needed
  }
}
```

---

## 🔐 Security Checklist

✅ HMAC-SHA256 signature verification implemented  
✅ Webhook signature verification enabled  
✅ JWT authentication on all payment endpoints (except webhook)  
✅ Duplicate registration prevention  
✅ Input validation on all endpoints  
✅ Error handling with no sensitive data exposure  

---

## 🚨 Common Issues & Fixes

### Issue: "Razorpay modal not appearing"
**Fix:** 
- Check browser console for errors
- Verify Razorpay script loaded: `window.Razorpay` exists
- Check `VITE_RAZORPAY_KEY_ID` in browser DevTools
- Clear browser cache and reload

### Issue: "Payment verification failed - Signature mismatch"
**Fix:**
- Verify backend `RAZORPAY_KEY_SECRET` matches Razorpay dashboard
- Check signature calculation: `orderId|paymentId`
- Verify HMAC algorithm: SHA256

### Issue: "Registration not created after payment"
**Fix:**
- Check backend logs for "Payment verified" message
- Verify MongoDB connection
- Check Student record exists with valid ID
- Look for duplicate registration error

### Issue: "Webhook not receiving events"
**Fix:**
- Configure webhook URL in Razorpay dashboard
- Webhook endpoint: `https://your-domain/api/payments/webhook/razorpay`
- Set webhook secret in `RAZORPAY_WEBHOOK_SECRET`
- Test webhook using Razorpay dashboard Test Event button

---

## 📊 File Locations

```
backend/
├── src/
│   ├── controllers/
│   │   └── paymentController.js      ✅ Payment logic
│   ├── routes/
│   │   └── paymentRoutes.js          ✅ Payment endpoints
│   ├── index.js                       ✅ Routes mounted
│   └── .env                           ✅ Razorpay keys

frontend/codeverse-campus/
├── src/
│   ├── components/
│   │   ├── PaymentModal.jsx           ✅ Payment UI
│   │   └── TeamRegistrationModal.jsx  ✅ Team + payment
│   ├── pages/
│   │   └── StudentDashboard.jsx       ✅ Solo + payment
│   ├── .env                           ✅ Razorpay key
│   └── index.html                     ✅ Razorpay script
```

---

## ✨ Next Steps

1. **Immediate Testing:**
   - Test free hackathon registration (should skip payment)
   - Test paid solo registration with test card
   - Test paid team registration
   - Verify registrations in MongoDB

2. **Before Production:**
   - Get live Razorpay keys
   - Update all env variables to live keys
   - Configure webhook URL in Razorpay dashboard
   - Set up monitoring for payment failures
   - Test with real transactions (small amounts)

3. **Optional Enhancements:**
   - Add payment receipt generation
   - Email confirmation after payment
   - Payment history in student profile
   - Refund management UI
   - Payment failure notifications

---

## 📞 Support Resources

- **Razorpay Docs:** https://razorpay.com/docs/
- **Test Cards:** https://razorpay.com/docs/payments/payments/test-cards/
- **Webhooks:** https://razorpay.com/docs/webhooks/
- **API Keys:** https://dashboard.razorpay.com/app/settings/api-keys

---

**Last Updated:** 2024  
**Status:** ✅ Complete and Ready for Testing
