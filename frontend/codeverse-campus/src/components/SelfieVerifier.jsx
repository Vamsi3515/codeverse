import React, { useEffect, useRef, useState } from 'react'

export default function SelfieVerifier({ open, onClose, onSuccess, onFailure, registeredSelfie }){
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const [error, setError] = useState('')
  const [captured, setCaptured] = useState(null)

  useEffect(()=>{
    if(!open) return
    setError('')
    setCaptured(null)
    async function start(){
      try{
        const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        streamRef.current = stream
        if(videoRef.current){
          videoRef.current.srcObject = stream
          videoRef.current.play()
        }
      }catch(e){
        setError('Unable to access camera')
      }
    }
    start()
    return ()=>{
      if(streamRef.current){
        streamRef.current.getTracks().forEach(t=>t.stop())
        streamRef.current = null
      }
    }
  },[open])

  function capture(){
    if(!videoRef.current) return
    const v = videoRef.current
    const canvas = document.createElement('canvas')
    canvas.width = v.videoWidth || 640
    canvas.height = v.videoHeight || 480
    const ctx = canvas.getContext('2d')
    ctx.drawImage(v,0,0,canvas.width,canvas.height)
    const data = canvas.toDataURL('image/png')
    setCaptured(data)

    // Demo comparison: simple string equality
    if(registeredSelfie && data === registeredSelfie){
      onSuccess && onSuccess()
    }else{
      onFailure && onFailure()
    }
  }

  if(!open) return null

  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center">
      <div className="w-full max-w-md bg-white rounded-lg p-4 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">Live Selfie Verification</h3>
          <button onClick={onClose} className="text-gray-500">Close</button>
        </div>

        <div className="flex flex-col items-center gap-3">
          {error && <div className="text-sm text-red-600">{error}</div>}
          <video ref={videoRef} className="w-full h-56 bg-black rounded-md object-cover" playsInline muted />
          <div className="flex items-center gap-2 w-full">
            <button onClick={capture} className="flex-1 py-2 bg-blue-600 text-white rounded-md">Capture & Verify</button>
            <button onClick={onClose} className="py-2 px-3 border rounded-md">Cancel</button>
          </div>
          <div className="text-xs text-gray-500">A live selfie will be captured and compared with your registered selfie (demo only).</div>
        </div>
      </div>
    </div>
  )
}
