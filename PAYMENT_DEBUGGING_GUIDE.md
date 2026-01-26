# Payment Integration - Debugging Guide

## 🔍 If You Can Register Without Payment

If you're able to register for a paid hackathon without seeing the payment modal, follow these debugging steps:

---

## Step 1: Open Browser Console

1. Open your browser (Chrome, Firefox, etc.)
2. Press **F12** to open Developer Tools
3. Go to **Console** tab
4. **Keep the console open** while you test registration

---

## Step 2: Test with a PAID Hackathon

Try registering for one of these paid hackathons:

| Hackathon | Fee | Type |
|-----------|-----|------|
| **InnovateAI Hackathon** | ₹500 | SOLO |
| **GreenTech Challenge** | ₹300 | SOLO |
| **Campus Hack & Learn** | ₹1000 | TEAM |
| **Fullstack Forge** | ₹750 | TEAM |

---

## Step 3: Watch Console Logs

When you click "Register", you should see these logs in the console:

### ✅ CORRECT Behavior (Paid Hackathon):
```
📋 [REGISTER] Full hackathon object: {_id: 'h1', title: 'InnovateAI...', registrationFee: 500, ...}
📋 [REGISTER] Hackathon type: SOLO Fee: 500
📋 [REGISTER] Fee is positive? true
💳 [REGISTER] Opening payment modal for solo registration with fee ₹500
🎨 [PAYMENT] PaymentModal useEffect triggered - Modal is OPEN
🎨 [PAYMENT] Hackathon: {_id: 'h1', title: 'InnovateAI...', ...}
🎨 [PAYMENT] Fee: 500
✅ [PAYMENT] PaymentModal rendered with: {open: true, hackathonId: 'h1', registrationFee: 500, registrationType: 'SOLO'}
```

**Then:** Payment modal should appear on screen with fee display + "💳 Pay & Register" button

### ❌ WRONG Behavior (No Payment Modal):
```
📋 [REGISTER] Full hackathon object: {...}
📋 [REGISTER] Hackathon type: SOLO Fee: 0  ← FEE IS 0!
📋 [REGISTER] Fee is positive? false
✅ [REGISTER] No fee, registering directly
```

**This means:** The hackathon's `registrationFee` is 0 or undefined!

---

## Step 4: If Console Shows Fee = 0

### Issue: `registrationFee` is not being set

**Check 1: Are you using API hackathons or mock data?**
- Open console and look for: `📊 [DASHBOARD STATE] Using 'API' or 'STATIC' hackathons`
- If it says **STATIC**, you're using mock data (which has fees)
- If it says **API**, the problem is in the API response

**Check 2: If using API hackathons, verify they have `registrationFee`**
- In console, check: `📊 [DASHBOARD STATE] allHackathons:` and look at the array
- Each hackathon should have `registrationFee: {number}`
- If `registrationFee` is missing or 0, the issue is in the **backend**

**Check 3: If using mock data, verify fees are set**
- Look for logs like: `🔄 [TRANSFORM 1] Registration Fee: 500`
- This should show the fee for each mock hackathon

---

## Step 5: Common Issues & Fixes

### Issue A: "Console shows Fee: 0 even though I set it to 500"

**Solution:** Refresh the page and try again
```
1. Press Ctrl + Shift + R (hard refresh)
2. Log in again
3. Try registering
```

**Why:** Browser might be caching old data

---

### Issue B: "Payment modal briefly appears then disappears"

**Console logs needed:**
- Check if you see: `onPaymentSuccess` or `onPaymentFailed` logs
- This means the payment modal is closing automatically

**Solutions:**
1. Check if there are any error messages in console
2. Verify `hackathon._id` is set (should be `h1`, `h2`, etc.)
3. Check if localStorage has a valid token: `localStorage.getItem('token')`

---

### Issue C: "Console shows correct fee but modal doesn't appear visually"

**Solution:** Check if Razorpay script loaded
```javascript
// Type this in console and press Enter:
window.Razorpay

// Should output: [Function: Razorpay]
// If undefined, Razorpay script didn't load
```

**Fix:**
1. Check `index.html` has the Razorpay script:
   ```html
   <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
   ```
2. If missing, add it to `<head>`
3. Refresh page

---

## Step 6: Check Network Tab

If payment modal appears but Razorpay checkout doesn't:

1. Open **Network** tab in DevTools
2. Look for requests to `checkout.razorpay.com`
3. If there's a red X (failed), the Razorpay script didn't load

**Fix:** Verify your internet connection and that the Razorpay CDN is accessible

---

## Step 7: Manual Test Steps

### Test Solo Paid Registration:
```
1. Refresh page (Ctrl + Shift + R)
2. Find "InnovateAI Hackathon" (₹500)
3. Click "Register"
4. Alert should show: "💳 Payment Modal Opening: Hackathon..."
5. Payment modal should appear below alert
6. Modal should show:
   - Hackathon title
   - Fee: ₹500
   - Button: "💳 Pay & Register"
7. Click button
8. Razorpay modal should open
9. Use test card: 4111 1111 1111 1111
10. Complete payment
11. Should show success message
```

### Test Team Paid Registration:
```
1. Find "Campus Hack & Learn" (₹1000, TEAM)
2. Click "Register"
3. Team registration form should open
4. Yellow fee box should show: ₹1000
5. Fill team details
6. Click "💳 Pay & Register"
7. PaymentModal should open
8. Complete payment flow
```

---

## Step 8: Check Backend

If payment modal opens but payment creation fails:

1. Open **Network** tab in DevTools
2. Click "💳 Pay & Register"
3. Look for request to `POST /api/payments/create-order`
4. Check response:
   - If **200 OK**: Backend working, issue is frontend
   - If **404**: Endpoint not found, backend routes not mounted
   - If **401**: Not authenticated, check token
   - If **500**: Backend error, check backend logs

---

## 🔧 Required Environment Variables

### Frontend (.env)
```
VITE_RAZORPAY_KEY_ID=rzp_test_S8a1I2V7AuhAd6
```
This should match your Razorpay test key

### Backend (.env)
```
RAZORPAY_KEY_ID=rzp_test_S8a1I2V7AuhAd6
RAZORPAY_KEY_SECRET=nNOVY0TR06u8BrS76LOpS8YY
RAZORPAY_WEBHOOK_SECRET=jqE32H2Y_NaN@@E
```

---

## 📋 Complete Console Log Output (Expected)

When everything works correctly, you should see:

```javascript
// Dashboard loads
📊 [DASHBOARD STATE] Using 'STATIC' hackathons
📊 [DASHBOARD STATE] allHackathons: Array(6) [...]

// You click Register on paid hackathon
📋 [REGISTER] Full hackathon object: {_id: 'h1', title: 'InnovateAI Hackathon', registrationFee: 500, ...}
📋 [REGISTER] Hackathon type: SOLO Fee: 500
📋 [REGISTER] Fee is positive? true
💳 [REGISTER] Opening payment modal for solo registration with fee ₹500

// Payment modal opens
🎨 [PAYMENT] PaymentModal useEffect triggered - Modal is OPEN
🎨 [PAYMENT] Hackathon: {_id: 'h1', title: 'InnovateAI Hackathon', ...}
🎨 [PAYMENT] Fee: 500
✅ [PAYMENT] PaymentModal rendered with: {open: true, hackathonId: 'h1', registrationFee: 500, registrationType: 'SOLO'}

// You click "💳 Pay & Register"
💳 [PAYMENT] Creating order for: {hackathonId: 'h1', amount: 500, type: 'SOLO'}

// Order created
📦 [PAYMENT] Order created: {success: true, orderId: 'order_...', amount: 50000, currency: 'INR'}
🚀 [PAYMENT] Opening Razorpay with options: {...}

// After payment, signature verification
🔐 [PAYMENT] Verifying payment signature... {orderId: 'order_...', paymentId: 'pay_...', signature: '...'}
✅ [PAYMENT] Verification response: {success: true, registration: {...}}
🎉 [PAYMENT] Payment verified and registration complete!
```

---

## 🎯 Quick Troubleshooting

| Symptom | Cause | Fix |
|---------|-------|-----|
| Direct registration | `registrationFee` is 0 | Check backend returns fees in API |
| Modal doesn't appear | Fee check failing | Check console for logs |
| Razorpay doesn't open | Script not loaded | Verify in DevTools: `window.Razorpay` |
| Payment verification fails | Signature mismatch | Check backend keys match Razorpay |
| No console logs | Page not refreshed | Refresh with Ctrl + Shift + R |

---

## 📞 Getting Help

When reporting an issue, provide:
1. **Screenshot of the alert that appears** (or doesn't appear)
2. **All console logs** from the moment you click Register
3. **Network tab errors** (if any)
4. **Which hackathon you tested** (name and fee amount)
5. **Whether API or mock data** is being used

**Share these with your developer so they can debug faster!**

---

## ✅ When It's Working

You'll see:
- ✅ Alert appears when clicking Register on paid hackathon
- ✅ Payment modal opens with fee display
- ✅ Razorpay checkout opens when you click pay button
- ✅ Success message after completing payment
- ✅ Registration shows in dashboard

**That's it! 🎉 Payment integration is working!**
