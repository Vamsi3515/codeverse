import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const CalendarCallback = () => {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('processing')
  const [message, setMessage] = useState('Connecting your Google Calendar...')

  useEffect(() => {
    const processCallback = async () => {
      try {
        const accessToken = searchParams.get('accessToken')
        const refreshToken = searchParams.get('refreshToken')
        const success = searchParams.get('success')
        const error = searchParams.get('error')

        if (success === 'false' || error) {
          setStatus('error')
          setMessage(`Failed to connect: ${error || 'Unknown error'}`)
          setTimeout(() => {
            window.opener?.postMessage(
              { type: 'CALENDAR_AUTH_FAILED', error: error || 'Unknown error' },
              '*'
            )
            window.close()
          }, 2000)
          return
        }

        if (!accessToken) {
          setStatus('error')
          setMessage('No access token received')
          setTimeout(() => {
            window.opener?.postMessage(
              { type: 'CALENDAR_AUTH_FAILED', error: 'No access token' },
              '*'
            )
            window.close()
          }, 2000)
          return
        }

        console.log('✅ [CALENDAR CALLBACK] Storing tokens...')

        // Send tokens to backend to store in user profile
        const token = localStorage.getItem('token')
        const response = await fetch(`${API_URL}/calendar/callback`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            accessToken,
            refreshToken
          })
        })

        const data = await response.json()

        if (data.success) {
          console.log('✅ [CALENDAR CALLBACK] Tokens stored successfully')
          setStatus('success')
          setMessage('Google Calendar connected successfully! Closing...')

          // Signal parent window that auth was successful
          setTimeout(() => {
            window.opener?.postMessage(
              { type: 'CALENDAR_AUTH_SUCCESS', accessToken, refreshToken },
              '*'
            )
            window.close()
          }, 1500)
        } else {
          setStatus('error')
          setMessage(`Failed to store tokens: ${data.message}`)
          setTimeout(() => {
            window.opener?.postMessage(
              { type: 'CALENDAR_AUTH_FAILED', error: data.message },
              '*'
            )
            window.close()
          }, 2000)
        }
      } catch (error) {
        console.error('❌ [CALENDAR CALLBACK] Error:', error)
        setStatus('error')
        setMessage(`Error: ${error.message}`)
        setTimeout(() => {
          window.opener?.postMessage(
            { type: 'CALENDAR_AUTH_FAILED', error: error.message },
            '*'
          )
          window.close()
        }, 2000)
      }
    }

    processCallback()
  }, [searchParams])

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
        {status === 'processing' && (
          <>
            <div className="mb-4">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
              </div>
            </div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Connecting Google Calendar</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="mb-4">
              <div className="inline-block text-4xl">✅</div>
            </div>
            <h2 className="text-xl font-bold text-green-600 mb-2">Success!</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="mb-4">
              <div className="inline-block text-4xl">❌</div>
            </div>
            <h2 className="text-xl font-bold text-red-600 mb-2">Connection Failed</h2>
            <p className="text-gray-600">{message}</p>
          </>
        )}
      </div>
    </div>
  )
}

export default CalendarCallback
