import axios from 'axios'

// Placeholder API calls using Axios. These call backend endpoints if available,
// otherwise they gracefully fallback to simulated responses.

const simulate = (data, delay = 800) => new Promise(res => setTimeout(() => res({ data }), delay))

export async function sendEmailOTP(email){
  try{
    const res = await axios.post('/api/student/send-email-otp', { email })
    return res.data
  }catch(err){
    return simulate({ success: true, message: 'OTP sent (simulated)' })
  }
}

export async function verifyEmailOTP(email, otp){
  try{
    const res = await axios.post('/api/student/verify-email-otp', { email, otp })
    return res.data
  }catch(err){
    // Simulate success only for 4-digit '1234'
    const ok = String(otp).trim() === '1234'
    return simulate({ success: ok, message: ok ? 'Email verified (simulated)' : 'Invalid OTP (simulated)' })
  }
}

export async function sendPhoneOTP(phone){
  try{
    const res = await axios.post('/api/student/send-phone-otp', { phone })
    return res.data
  }catch(err){
    return simulate({ success: true, message: 'Phone OTP sent (simulated)' })
  }
}

export async function verifyPhoneOTP(phone, otp){
  try{
    const res = await axios.post('/api/student/verify-phone-otp', { phone, otp })
    return res.data
  }catch(err){
    const ok = String(otp).trim() === '5678'
    return simulate({ success: ok, message: ok ? 'Phone verified (simulated)' : 'Invalid OTP (simulated)' })
  }
}

export async function registerStudent(payload){
  try{
    const res = await axios.post('/api/student/register', payload)
    return res.data
  }catch(err){
    return simulate({ success: true, message: 'Registered (simulated)' }, 1000)
  }
}

export default { sendEmailOTP, verifyEmailOTP, sendPhoneOTP, verifyPhoneOTP, registerStudent }
