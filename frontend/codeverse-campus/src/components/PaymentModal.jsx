import React, { useState, useEffect } from 'react'

const API_URL = 'http://localhost:5000/api'
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_YOUR_TEST_KEY_ID'

export default function PaymentModal({
  open,
  hackathon,
  registrationType, 
  teamData, 
  registrationFee,
  onClose,
  onPaymentSuccess,
  onPaymentFailed
}) {
  console.log('🔧 [PAYMENT] PaymentModal component mounted/updated with props:', { open, hackathonId: hackathon?._id, hackathonTitle: hackathon?.title, registrationFee, registrationType });
  
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [processingPayment, setProcessingPayment] = useState(false)

  useEffect(() => {
    if (open) {
      console.log('🎨 [PAYMENT] PaymentModal useEffect triggered - Modal is OPEN');
      console.log('🎨 [PAYMENT] Hackathon:', hackathon);
      console.log('🎨 [PAYMENT] Fee:', registrationFee);
    }
  }, [open, hackathon, registrationFee])

  console.log('✅ [PAYMENT] PaymentModal rendered with:', {
    open,
    hackathonId: hackathon?._id,
    registrationFee,
    registrationType
  });

  const handlePayment = async () => {
    if (!hackathon || registrationFee === null || registrationFee === undefined || registrationFee === 0) {
      setError('Missing hackathon or fee information')
      return
    }

    setProcessingPayment(true)
    setError('')

    try {
      
      const token = localStorage.getItem('token')
      if (!token) {
        setError('Please login to proceed with payment')
        setProcessingPayment(false)
        return
      }

      console.log('💳 [PAYMENT] Creating order for:', {
        hackathonId: hackathon._id,
        amount: registrationFee,
        type: registrationType
      })

      const orderResponse = await fetch(`${API_URL}/payments/create-order`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hackathonId: hackathon._id,
          amount: registrationFee,
          registrationType,
          teamData: registrationType === 'TEAM' ? teamData : null
        })
      })

      const orderData = await orderResponse.json()
      console.log('📦 [PAYMENT] Order created:', orderData)

      if (!orderData.success) {
        throw new Error(orderData.message || 'Failed to create payment order')
      }

      // Step 2: Initialize Razorpay payment
      const options = {
        key: RAZORPAY_KEY_ID,
        amount: registrationFee * 100, // Amount in paise
        currency: 'INR',
        order_id: orderData.orderId,
        name: 'Codeverse Hackathon',
        description: `Registration for ${hackathon.title}`,
        image: hackathon.bannerImage || 'https://codeverse.io/logo.png',
        handler: async function (response) {
          console.log('✅ [PAYMENT] Payment successful:', response)
          await verifyPayment(response)
        },
        prefill: {
          name: localStorage.getItem('userName') || '',
          email: localStorage.getItem('userEmail') || '',
          contact: localStorage.getItem('userPhone') || ''
        },
        theme: {
          color: '#3B82F6'
        },
        modal: {
          ondismiss: function () {
            console.log('❌ [PAYMENT] User cancelled payment')
            setProcessingPayment(false)
            onPaymentFailed?.('Payment cancelled by user')
          }
        }
      }

      console.log('🚀 [PAYMENT] Opening Razorpay with options:', options)

      // Load Razorpay script and open payment modal
      if (window.Razorpay) {
        const rzp = new window.Razorpay(options)
        rzp.open()
      } else {
        throw new Error('Razorpay script not loaded')
      }
    } catch (err) {
      console.error('❌ [PAYMENT] Error:', err)
      setError(err.message || 'Payment failed. Please try again.')
      setProcessingPayment(false)
      onPaymentFailed?.(err.message)
    }
  }

  const verifyPayment = async (paymentData) => {
    try {
      const token = localStorage.getItem('token')

      console.log('🔐 [PAYMENT] Verifying payment signature...', paymentData)

      const verifyResponse = await fetch(`${API_URL}/payments/verify-payment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          hackathonId: hackathon._id,
          orderId: paymentData.razorpay_order_id,
          paymentId: paymentData.razorpay_payment_id,
          signature: paymentData.razorpay_signature,
          registrationType,
          teamData: registrationType === 'TEAM' ? teamData : null
        })
      })

      const verifyData = await verifyResponse.json()
      console.log('✅ [PAYMENT] Verification response:', verifyData)

      setProcessingPayment(false)

      if (verifyData.success) {
        console.log('🎉 [PAYMENT] Payment verified and registration complete!')
        onPaymentSuccess?.(verifyData.registration)
        onClose()
      } else {
        const errorMsg = verifyData.message || 'Payment verification failed'
        console.error('❌ [PAYMENT] Verification failed:', errorMsg)
        setError(errorMsg)
        onPaymentFailed?.(errorMsg)
      }
    } catch (err) {
      console.error('❌ [PAYMENT] Verification error:', err)
      setError('Failed to verify payment. Please contact support.')
      setProcessingPayment(false)
      onPaymentFailed?.(err.message)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        {/* Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Payment Required</h2>
          <p className="text-sm text-gray-600 mt-1">{hackathon?.title}</p>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Hackathon Mode Badge */}
          {hackathon?.mode === 'offline' && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-3 flex items-center gap-2">
              <span className="text-lg">📍</span>
              <div>
                <h4 className="font-semibold text-purple-900 text-sm">Offline Hackathon</h4>
                <p className="text-xs text-purple-700">This is an in-person hackathon event</p>
              </div>
            </div>
          )}

          {/* Registration Details */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-700">Registration Type:</span>
                <span className="font-semibold text-gray-900">{registrationType}</span>
              </div>
              {registrationType === 'TEAM' && teamData && (
                <div className="flex justify-between">
                  <span className="text-gray-700">Team Members:</span>
                  <span className="font-semibold text-gray-900">{teamData.members?.length + 1 || 2}</span>
                </div>
              )}
              <div className="border-t border-blue-200 pt-2 mt-2 flex justify-between">
                <span className="text-lg font-bold text-gray-900">Registration Fee:</span>
                <span className="text-2xl font-bold text-blue-600">₹{registrationFee}</span>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Info Box */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">📋 Next Steps</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Click "Pay & Register" to proceed to payment</li>
              <li>• You will be redirected to Razorpay</li>
              <li>• Complete the payment securely</li>
              <li>• Registration will be confirmed automatically</li>
            </ul>
          </div>

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={processingPayment}
              className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 text-gray-700 font-semibold rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePayment}
              disabled={processingPayment}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processingPayment ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                <>
                  💳 Pay & Register
                </>
              )}
            </button>
          </div>

          {/* Razorpay Info */}
          <div className="text-xs text-center text-gray-500">
            💳 Secure payment powered by Razorpay
          </div>
        </div>
      </div>
    </div>
  )
}
