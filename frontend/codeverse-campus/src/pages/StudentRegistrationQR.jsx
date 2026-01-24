import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const StudentRegistrationQR = () => {
  const { registrationId } = useParams();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [registrationData, setRegistrationData] = useState(null);

  useEffect(() => {
    fetchRegistrationDetails();
  }, [registrationId]);

  const fetchRegistrationDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(`${API_BASE_URL}/registrations/public/${registrationId}`);
      
      console.log('📋 API Response:', response.data);
      console.log('🖼️ Selfie URL:', response.data.data?.selfieUrl);
      
      if (response.data.success) {
        setRegistrationData(response.data.data);
      } else {
        setError(response.data.message || 'Failed to fetch registration details');
      }
    } catch (err) {
      console.error('Error fetching registration details:', err);
      setError(err.response?.data?.message || 'Failed to load registration details');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-6 rounded-lg shadow-xl max-w-md w-full">
          <div className="flex items-center">
            <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-lg font-semibold">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!registrationData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-6 rounded-lg shadow-xl">
          <p className="text-lg">No registration data found</p>
        </div>
      </div>
    );
  }

  const { studentName, rollNumber, college, email, selfieUrl, hackathon, registrationStatus, qrUsed, registeredAt } = registrationData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 via-indigo-600 to-blue-600 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-8 px-6 text-center">
            <h1 className="text-4xl font-bold mb-2">Student Registration Details</h1>
            <p className="text-lg opacity-90">QR Code Verification</p>
          </div>

          <div className="p-8">
            {/* Student Photo Section */}
            <div className="flex justify-center mb-6">
              <div className="relative">
                {selfieUrl ? (
                  <img
                    src={selfieUrl}
                    alt={studentName}
                    className="w-44 h-44 rounded-full object-cover border-8 border-purple-500 shadow-lg"
                    onError={(e) => {
                      console.error('Image failed to load:', selfieUrl);
                      e.target.src = 'https://via.placeholder.com/176?text=No+Photo';
                    }}
                  />
                ) : (
                  <div className="w-44 h-44 rounded-full bg-gray-300 border-8 border-purple-500 shadow-lg flex items-center justify-center">
                    <span className="text-gray-600 text-center px-4">No photo available</span>
                  </div>
                )}
                <div className="absolute bottom-0 right-0 bg-green-500 rounded-full p-2 border-4 border-white">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="flex justify-center mb-8">
              <span className={`inline-flex items-center px-6 py-2 rounded-full text-sm font-semibold ${
                qrUsed 
                  ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-400' 
                  : 'bg-green-100 text-green-800 border-2 border-green-400'
              }`}>
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {qrUsed ? 'Already Checked In' : 'Registration Active'}
              </span>
            </div>

            <div className="border-t-2 border-gray-200 my-6"></div>

            {/* Student Details Section */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-purple-700 mb-4 flex items-center">
                <svg className="w-7 h-7 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Student Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Full Name */}
                <div className="bg-gradient-to-br from-purple-50 to-indigo-50 p-4 rounded-xl border-2 border-purple-200 shadow-sm">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-purple-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Full Name</span>
                  </div>
                  <p className="text-xl font-bold text-gray-800">{studentName}</p>
                </div>

                {/* Roll Number */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border-2 border-blue-200 shadow-sm">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-blue-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2 5a2 2 0 012-2h7a2 2 0 012 2v4a2 2 0 01-2 2H9l-3 3v-3H4a2 2 0 01-2-2V5z" />
                    </svg>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Roll Number</span>
                  </div>
                  <p className="text-xl font-bold text-gray-800">{rollNumber}</p>
                </div>

                {/* College */}
                <div className="bg-gradient-to-br from-green-50 to-teal-50 p-4 rounded-xl border-2 border-green-200 shadow-sm">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                    </svg>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">College</span>
                  </div>
                  <p className="text-xl font-bold text-gray-800">{college}</p>
                </div>

                {/* Email */}
                <div className="bg-gradient-to-br from-pink-50 to-rose-50 p-4 rounded-xl border-2 border-pink-200 shadow-sm">
                  <div className="flex items-center mb-2">
                    <svg className="w-5 h-5 text-pink-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                      <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                    </svg>
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Email</span>
                  </div>
                  <p className="text-lg font-bold text-gray-800 break-all">{email}</p>
                </div>
              </div>
            </div>

            <div className="border-t-2 border-gray-200 my-6"></div>

            {/* Hackathon Details Section */}
            <div>
              <h2 className="text-2xl font-bold text-indigo-700 mb-4 flex items-center">
                <svg className="w-7 h-7 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Hackathon Details
              </h2>

              <div className="space-y-4">
                {/* Event Name */}
                <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-5 rounded-xl border-2 border-indigo-300 shadow-md">
                  <div className="flex items-center mb-2">
                    <svg className="w-6 h-6 text-indigo-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    <span className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Event Name</span>
                  </div>
                  <p className="text-2xl font-bold text-indigo-900">{hackathon.title}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Start Date */}
                  <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Start Date</p>
                    <p className="text-lg font-bold text-gray-800">{formatDate(hackathon.startDate)}</p>
                  </div>

                  {/* End Date */}
                  <div className="bg-blue-50 p-4 rounded-xl border-2 border-blue-200">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">End Date</p>
                    <p className="text-lg font-bold text-gray-800">{formatDate(hackathon.endDate)}</p>
                  </div>
                </div>

                {/* Venue */}
                {hackathon.location && (
                  <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-5 rounded-xl border-2 border-amber-200 shadow-sm">
                    <div className="flex items-start">
                      <svg className="w-6 h-6 text-amber-600 mr-3 mt-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Venue</p>
                        <p className="text-xl font-bold text-gray-800 mb-1">{hackathon.location.venueName}</p>
                        <p className="text-sm text-gray-600">{hackathon.location.address}, {hackathon.location.city}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Registration Date */}
                <div className="bg-gray-50 p-4 rounded-xl border-2 border-gray-200">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">Registered On</p>
                  <p className="text-lg font-bold text-gray-800">{formatDate(registeredAt)}</p>
                </div>
              </div>
            </div>

            {/* Footer Note */}
            <div className="mt-8 text-center">
              <div className="inline-flex items-center bg-blue-50 text-blue-700 px-6 py-3 rounded-full border-2 border-blue-200">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">This QR code is valid only for offline hackathons</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentRegistrationQR;
