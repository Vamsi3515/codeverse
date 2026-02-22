import React, { useState, useRef, useEffect } from 'react'

export default function StudentRegister(){
  const [fullName, setFullName] = useState('')
  const [college, setCollege] = useState('')
  const [collegeAddress, setCollegeAddress] = useState('')
  const [collegeEmail, setCollegeEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [rollNumber, setRollNumber] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [emailOtp, setEmailOtp] = useState('')
  const [emailOtpSent, setEmailOtpSent] = useState(false)
  const [emailOtpLoading, setEmailOtpLoading] = useState(false)
  const [otpExpired, setOtpExpired] = useState(false)
  const [otpTimeLeft, setOtpTimeLeft] = useState(0)
  
  const [phoneOtp, setPhoneOtp] = useState('')
  const [phoneOtpSent, setPhoneOtpSent] = useState(false)
  const [phoneVerified, setPhoneVerified] = useState(false)
  const [phoneOtpLoading, setPhoneOtpLoading] = useState(false)

  const [collegeIdCard, setCollegeIdCard] = useState(null)
  const [collegeIdCardPreview, setCollegeIdCardPreview] = useState('')
  const [collegeIdCardError, setCollegeIdCardError] = useState('')
  const [collegeIdCardUrl, setCollegeIdCardUrl] = useState('')
  const [uploadingIdCard, setUploadingIdCard] = useState(false)

  const [liveSelfieUrl, setLiveSelfieUrl] = useState('')
  const [uploadingSelfie, setUploadingSelfie] = useState(false)

  const [idFile, setIdFile] = useState(null)
  const [idFileError, setIdFileError] = useState('')

  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [cameraOn, setCameraOn] = useState(false)
  const [selfieDataUrl, setSelfieDataUrl] = useState('')
  const [cameraError, setCameraError] = useState('')

  const [formErrors, setFormErrors] = useState({})

  useEffect(()=>{
    return ()=>{
      if(streamRef.current) streamRef.current.getTracks().forEach(t=>t.stop())
    }
  },[])

  // OTP expiry timer
  useEffect(() => {
    if (!emailOtpSent || otpExpired) return
    
    const timer = setInterval(() => {
      setOtpTimeLeft((prev) => {
        if (prev <= 1) {
          setOtpExpired(true)
          clearInterval(timer)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [emailOtpSent, otpExpired])
  const verifyStudentIdWithFastAPI = async () => {
  if (!collegeIdCard) {
    alert("Please upload ID card");
    return { success: false };
  }

  const formData = new FormData();
  formData.append("full_name", fullName);
  formData.append("college_name", college);
  formData.append("roll_number", rollNumber);
  formData.append("file", collegeIdCard);

  try {
    const response = await fetch(
      "http://127.0.0.1:8000/verification/verify-student-id",
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("FastAPI Verification Error:", error);
    return { success: false, message: "Verification server error" };
  }
};


  // Send Email OTP
  const handleSendEmailOtp = async ()=>{
    if(!collegeEmail.trim()){
      setFormErrors({...formErrors, collegeEmail: 'Email is required'})
      return
    }
    
    // Validate other required fields before sending OTP
   if (
  !fullName.trim() ||
  !college.trim() ||
  !rollNumber.trim() ||   // 🔥 ADD THIS HERE
  !password ||
  !phone.trim()
) {
  alert('⚠️ Please fill in all required fields (Name, College, Roll Number, Phone, Password)')
  return
}

    
    // 🔥 NEW STEP - ID TEXT VERIFICATION
const verificationResult = await verifyStudentIdWithFastAPI();

if (!verificationResult.success) {
  alert("❌ ID Verification Failed: " + verificationResult.message);
  return;
}

    
    if(!liveSelfieUrl) {
      alert('⚠️ Please capture a live selfie first')
      return
    }
    
    setEmailOtpLoading(true)
    try {
      const [firstName, ...lastNameParts] = fullName.trim().split(' ')
      const lastName = lastNameParts.join(' ') || 'Student'
      
      console.log('📤 Sending OTP to:', collegeEmail.toLowerCase());
      const response = await fetch('http://localhost:5000/api/auth/student/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email: collegeEmail.toLowerCase(),
          password,
          phone,
          college,
          collegeAddress: collegeAddress || college,
          regNumber: rollNumber,
          collegeIdCard: collegeIdCardUrl,
          liveSelfie: liveSelfieUrl
        })
      })
      const data = await response.json()
      console.log('📨 Signup response:', data);
      
      if(data.success) {
        setEmailOtpSent(true)
        setOtpExpired(false)
        setEmailOtp('')
        setOtpTimeLeft(60) // 1 minute
        alert('✅ OTP sent to your email! Please check your inbox and enter the OTP.')
      } else {
        alert('❌ ' + (data.message || 'Failed to send OTP. Please try again.'))
      }
    } catch(err) {
      console.error('Error:', err);
      alert('❌ Unable to send OTP. Check your connection.')
    } finally {
      setEmailOtpLoading(false)
    }
  }

  const handleVerifyEmailOtp = async ()=>{
    if(!emailOtp.trim()) {
      alert('Please enter OTP')
      return
    }
    setEmailOtpLoading(true)
    try {
      console.log('🔍 Verifying OTP for email:', collegeEmail.toLowerCase());
      const response = await fetch('http://localhost:5000/api/auth/student/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: collegeEmail.toLowerCase(), otp: emailOtp })
      })
      const data = await response.json()
      console.log('📩 Verification response:', data);
      
      if(data.success) {
        alert('✅ Email verified successfully! Your account has been created.')
        // Auto-login and redirect
        localStorage.setItem('token', data.token);
        localStorage.setItem('userRole', 'student');
        localStorage.setItem('userName', data.user.firstName + ' ' + data.user.lastName);
        localStorage.setItem('userId', data.user.id);
        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = '/dashboard/student';
        }, 1500);
      } else {
        console.error('❌ Verification failed:', data.message);
        alert('❌ ' + (data.message || 'Email verification failed'))
      }
    } catch(err) {
      console.error('❌ Verification error:', err);
      alert('❌ Verification failed. Please try again. Error: ' + err.message)
    } finally {
      setEmailOtpLoading(false)
    }
  }

  const handleSendPhoneOtp = ()=>{
    if(!phone.trim()){
      setFormErrors({...formErrors, phone: 'Phone number is required'})
      return
    }
    // For now, auto-verify phone (SMS service not configured)
    setPhoneOtpSent(true)
    setPhoneVerified(true)
    alert('✅ Mobile verified successfully!')
  }

  const handleVerifyPhoneOtp = ()=>{
    setPhoneVerified(true)
    alert('✅ Mobile number verified successfully!')
  }

  const handleOpenCamera = async ()=>{
    setCameraError('')
    try{
      const s = await navigator.mediaDevices.getUserMedia({ video:{ facingMode:'user' } })
      streamRef.current = s
      if(videoRef.current) videoRef.current.srcObject = s
      setCameraOn(true)
    }catch(e){ setCameraError('Camera unavailable') }
  }

  const handleCaptureSelfie = async ()=>{
    if(!videoRef.current) return
    const v = videoRef.current
    const w = v.videoWidth || 320
    const h = v.videoHeight || 240
    const c = canvasRef.current
    c.width=w; c.height=h
    const ctx = c.getContext('2d')
    ctx.drawImage(v,0,0,w,h)
    const data = c.toDataURL('image/jpeg',0.9)
    setSelfieDataUrl(data)
    if(streamRef.current){ streamRef.current.getTracks().forEach(t=>t.stop()); streamRef.current=null }
    setCameraOn(false)

    // Upload selfie to backend
    await uploadSelfie(data)
  }

  const uploadSelfie = async (dataUrl) => {
    setUploadingSelfie(true)
    try {
      // Convert data URL to blob
      const blob = await fetch(dataUrl).then(r => r.blob())
      const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' })
      
      const formData = new FormData()
      formData.append('liveSelfie', file)

      const response = await fetch('http://localhost:5000/api/auth/upload-selfie', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setLiveSelfieUrl(data.imageUrl)
        console.log('✅ Selfie uploaded:', data.imageUrl)
      } else {
        alert(data.message || 'Failed to upload selfie')
        setSelfieDataUrl('')
      }
    } catch (error) {
      alert('Failed to upload selfie. Please try again.')
      setSelfieDataUrl('')
    } finally {
      setUploadingSelfie(false)
    }
  }

  const handleFileChange = (e)=>{
    setIdFileError('')
    const f = e.target.files && e.target.files[0]
    if(!f) return
    const ok = ['image/jpeg','image/png','application/pdf']
    if(!ok.includes(f.type)) return setIdFileError('Only JPG, PNG or PDF allowed')
    if(f.size>5*1024*1024) return setIdFileError('File must be <= 5MB')
    setIdFile(f)
  }

  const handleCollegeIdCardChange = async (e) => {
    setCollegeIdCardError('')
    const file = e.target.files && e.target.files[0]
    if (!file) return

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      setCollegeIdCardError('Only JPG, PNG, or PDF files are allowed')
      return
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setCollegeIdCardError('File size must be less than 5MB')
      return
    }

    // Set file and create preview
    setCollegeIdCard(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setCollegeIdCardPreview(reader.result)
    }
    reader.readAsDataURL(file)

    // Upload to backend immediately
    await uploadCollegeIdCard(file)
  }

  const uploadCollegeIdCard = async (file) => {
    setUploadingIdCard(true)
    try {
      const formData = new FormData()
      formData.append('collegeIdCard', file)

      const response = await fetch('http://localhost:5000/api/auth/upload-college-id', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (data.success) {
        setCollegeIdCardUrl(data.imageUrl)
        setCollegeIdCardError('')
      } else {
        setCollegeIdCardError(data.message || 'Failed to upload ID card')
        setCollegeIdCard(null)
        setCollegeIdCardPreview('')
      }
    } catch (error) {
      setCollegeIdCardError('Failed to upload ID card. Please try again.')
      setCollegeIdCard(null)
      setCollegeIdCardPreview('')
    } finally {
      setUploadingIdCard(false)
    }
  }

  const handleDragOver = (e)=> e.preventDefault()
  const handleDrop = (e)=>{ e.preventDefault(); setIdFileError(''); const f = e.dataTransfer.files && e.dataTransfer.files[0]; if(!f) return; const ok=['image/jpeg','image/png','application/pdf']; if(!ok.includes(f.type)) return setIdFileError('Only JPG, PNG or PDF allowed'); if(f.size>5*1024*1024) return setIdFileError('File must be <= 5MB'); setIdFile(f) }



  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <header className="text-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Student Portal</h1>
          <p className="text-sm text-gray-500 mt-1">Register as a student on CodeVerse Campus</p>
        </header>

        <form className="space-y-4" onSubmit={e=>e.preventDefault()}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
            <input value={fullName} onChange={e=>setFullName(e.target.value)} className="w-full rounded-lg border border-gray-200 h-12 px-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter full name" />
            {formErrors.fullName && <p className="text-xs text-red-600 mt-1">{formErrors.fullName}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">College Name</label>
            <input value={college} onChange={e=>setCollege(e.target.value)} className="w-full rounded-lg border border-gray-200 h-12 px-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter college name" />
            {formErrors.college && <p className="text-xs text-red-600 mt-1">{formErrors.college}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">College Address</label>
            <input value={collegeAddress} onChange={e=>setCollegeAddress(e.target.value)} className="w-full rounded-lg border border-gray-200 h-12 px-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter college full address" />
            <p className="text-xs text-gray-500 mt-1">This address will be used to calculate routes to hackathon venues.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              College Email <span className="text-red-600">*</span>
            </label>
            <input 
              value={collegeEmail} 
              onChange={e=>setCollegeEmail(e.target.value)} 
              className="w-full rounded-lg border border-gray-200 h-12 px-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="student@college.edu" 
              disabled={emailOtpSent}
            />
            {formErrors.collegeEmail && <p className="text-xs text-red-600 mt-1">{formErrors.collegeEmail}</p>}
            {emailOtpSent && <p className="text-xs text-blue-600 mt-1">📧 OTP sent to this email</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
            <input 
              value={phone} 
              onChange={e=>setPhone(e.target.value)} 
              className="w-full rounded-lg border border-gray-200 h-12 px-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" 
              placeholder="+91 XXXXX XXXXX" 
            />
            {formErrors.phone && <p className="text-xs text-red-600 mt-1">{formErrors.phone}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">College Roll Number</label>
            <input value={rollNumber} onChange={e=>setRollNumber(e.target.value)} className="w-full rounded-lg border border-gray-200 h-12 px-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter roll number" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Upload College ID Card <span className="text-red-600">*</span>
            </label>
            <input 
              type="file" 
              accept=".jpg,.jpeg,.png"
              onChange={handleCollegeIdCardChange}
              className="w-full rounded-lg border border-gray-200 h-12 px-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {collegeIdCardError && <p className="text-xs text-red-600 mt-1">{collegeIdCardError}</p>}
            {uploadingIdCard && <p className="text-xs text-blue-600 mt-1">Uploading...</p>}
            {collegeIdCardPreview && (
              <div className="mt-3 w-full border border-gray-200 rounded-md overflow-hidden bg-white">
                <img 
                  src={collegeIdCardPreview} 
                  alt="College ID Card Preview" 
                  className="w-full h-48 object-contain"
                />
              </div>
            )}
            <p className="text-xs text-gray-500 mt-2">
              This ID card will be used for student verification and hackathon entry.
            </p>
            {formErrors.collegeIdCard && <p className="text-xs text-red-600 mt-1">{formErrors.collegeIdCard}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Live Selfie Capture <span className="text-red-600">*</span>
            </label>
            <div className="flex items-center gap-3">
              <button type="button" onClick={handleOpenCamera} disabled={uploadingSelfie} className="flex-1 h-12 bg-white text-gray-700 rounded-lg border border-gray-200 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed">Open Camera</button>
              <button type="button" onClick={handleCaptureSelfie} disabled={!cameraOn || uploadingSelfie} className="flex-1 h-12 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">{uploadingSelfie ? 'Uploading...' : 'Capture Selfie'}</button>
            </div>
            <div className="mt-3 w-full h-36 border border-gray-200 rounded-md flex items-center justify-center overflow-hidden bg-white">
              {!selfieDataUrl ? (
                <>
                  <video ref={videoRef} autoPlay playsInline className={`${cameraOn ? 'block' : 'hidden'} w-full h-full object-cover`} />
                  {cameraError ? <p className="text-xs text-red-600">{cameraError}</p> : <p className="text-sm text-gray-400">No selfie captured</p>}
                </>
              ) : (
                <img src={selfieDataUrl} alt="selfie" className="w-full h-full object-cover" />
              )}
            </div>
            {liveSelfieUrl && <p className="text-xs text-green-600 mt-2">✅ Selfie uploaded successfully</p>}
            <canvas ref={canvasRef} className="hidden" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
            <input value={password} onChange={e=>setPassword(e.target.value)} type="password" className="w-full rounded-lg border border-gray-200 h-12 px-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Enter password" />
            {formErrors.password && <p className="text-xs text-red-600 mt-1">{formErrors.password}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
            <input value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} type="password" className="w-full rounded-lg border border-gray-200 h-12 px-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Confirm password" />
            {formErrors.confirmPassword && <p className="text-xs text-red-600 mt-1">{formErrors.confirmPassword}</p>}
          </div>

          <div>
            {!emailOtpSent ? (
              <button 
                type="button" 
                onClick={handleSendEmailOtp} 
                disabled={emailOtpLoading || uploadingIdCard || uploadingSelfie || !collegeIdCardUrl || !liveSelfieUrl || !fullName.trim() || !college.trim() || !collegeEmail.trim() || !phone.trim() || !password || password !== confirmPassword}
                className="w-full h-12 bg-indigo-600 text-white rounded-lg text-sm font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {emailOtpLoading ? '⏳ Registering...' : uploadingIdCard ? 'Uploading ID Card...' : uploadingSelfie ? 'Uploading Selfie...' : '📝 Register'}
              </button>
            ) : (
              <div className="space-y-3">
                {otpExpired ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <p className="text-sm text-red-600 font-medium mb-3">⏰ OTP has expired!</p>
                    <button
                      type="button"
                      onClick={handleSendEmailOtp}
                      disabled={emailOtpLoading}
                      className="w-full h-12 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {emailOtpLoading ? '⏳ Sending...' : '🔄 Resend OTP'}
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="relative">
                      <input
                        type="text"
                        value={emailOtp}
                        onChange={(e) => setEmailOtp(e.target.value.slice(0, 6))}
                        placeholder="Enter 6-digit OTP"
                        maxLength="6"
                        className="w-full h-12 px-4 rounded-lg border border-gray-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-green-500 font-bold text-center text-2xl tracking-widest"
                      />
                      <span className="absolute right-3 top-3 text-xs text-gray-500 font-medium">{Math.floor(otpTimeLeft / 60)}:{String(otpTimeLeft % 60).padStart(2, '0')}</span>
                    </div>
                    <button
                      type="button"
                      onClick={handleVerifyEmailOtp}
                      disabled={emailOtpLoading || !emailOtp.trim()}
                      className="w-full h-12 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {emailOtpLoading ? '⏳ Verifying...' : '✅ Verify OTP & Complete Registration'}
                    </button>
                  </>
                )}
              </div>
            )}
            <p className="text-xs text-gray-500 text-center mt-2">
              {!emailOtpSent ? 'Step 1: Fill all details and click Register to send OTP' : otpExpired ? 'Your OTP has expired. Request a new one.' : 'Step 2: Enter OTP from your email to verify and complete registration'}
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}

