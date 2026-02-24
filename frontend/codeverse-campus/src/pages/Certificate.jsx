import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Download, ArrowLeft, Printer, AlertCircle, Loader } from 'lucide-react';
import html2pdf from 'html2pdf.js';

const API_URL = 'http://localhost:5000/api';

/**
 * Professional Certificate Generation Page
 * Generates certificates based on leaderboard rankings
 * 
 * Certificate Types:
 * - Rank 1: Winner - First Prize
 * - Rank 2: Runner-Up - Second Prize
 * - Rank 3: Third Place - Third Prize
 * - All others: Certificate of Participation
 */
export default function Certificate() {
  const { id, userId } = useParams(); // hackathonId and userId
  const navigate = useNavigate();
  const certificateRef = React.useRef(null);

  const [hackathon, setHackathon] = useState(null);
  const [userData, setUserData] = useState(null);
  const [leaderboardEntry, setLeaderboardEntry] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCertificateData();
  }, [id, userId]);

  const fetchCertificateData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const currentUserId = userId || localStorage.getItem('userId');

      // Fetch hackathon info
      const hackRes = await axios.get(`${API_URL}/hackathons/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHackathon(hackRes.data.hackathon);

      // Fetch leaderboard
      const leaderRes = await axios.get(`${API_URL}/hackathons/${id}/leaderboard`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Find current user's entry and assign certificate type
      const leaderboard = leaderRes.data.leaderboard || [];
      const userEntry = leaderboard.find(entry => entry.userId?._id === currentUserId);

      if (!userEntry) {
        setError('You have not participated in this hackathon');
        return;
      }

      // Find user's rank position (0-indexed)
      const rankIndex = leaderboard.findIndex(entry => entry.userId?._id === currentUserId);
      
      // Determine certificate type based on ranking
      let certificateType, certificateTitle, certificateSubtitle;

      if (userEntry.disqualified === true) {
        setError('Your certificate is not available (Disqualified)');
        return;
      } else if (rankIndex === 0) {
        certificateType = 'FIRST_PRIZE';
        certificateTitle = 'Winner';
        certificateSubtitle = 'First Prize';
      } else if (rankIndex === 1) {
        certificateType = 'SECOND_PRIZE';
        certificateTitle = 'Runner-Up';
        certificateSubtitle = 'Second Prize';
      } else if (rankIndex === 2) {
        certificateType = 'THIRD_PRIZE';
        certificateTitle = 'Third Place';
        certificateSubtitle = 'Third Prize';
      } else if ((userEntry.problemsSubmitted?.length || 0) > 0) {
        certificateType = 'PARTICIPATION';
        certificateTitle = 'Certificate of Participation';
        certificateSubtitle = 'Successfully Participated';
      } else {
        setError('No certificate available (No submissions)');
        return;
      }

      // Fetch user details
      const userRes = await axios.get(`${API_URL}/students/${currentUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const user = userRes.data.student;

      setUserData(user);
      setLeaderboardEntry(userEntry);

      // Generate certificate
      const certData = {
        id: generateCertificateId(currentUserId, id),
        type: certificateType,
        title: certificateTitle,
        subtitle: certificateSubtitle,
        studentName: `${user.firstName} ${user.lastName}`,
        hackathonName: hackRes.data.hackathon.title,
        eventDate: formatDate(new Date(hackRes.data.hackathon.startDate)),
        organizerName: hackRes.data.hackathon.organizerName || 'CodeVerse Campus',
        rank: rankIndex + 1,
        score: userEntry.leaderboardScore,
        profileImage: user.profileImage || null
      };

      setCertificate(certData);
      setError(null);
    } catch (err) {
      console.error('Error fetching certificate data:', err);
      setError(err.response?.data?.message || 'Failed to generate certificate');
    } finally {
      setLoading(false);
    }
  };

  const generateCertificateId = (userId, hackathonId) => {
    // Format: CERT-HACKATHON-USER-TIMESTAMP
    const timestamp = Date.now().toString(36).toUpperCase();
    const userIdShort = userId.slice(-6).toUpperCase();
    const hackIdShort = hackathonId.slice(-6).toUpperCase();
    return `CERT-${hackIdShort}-${userIdShort}-${timestamp}`;
  };

  const formatDate = (date) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(date).toLocaleDateString('en-US', options);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    if (!certificateRef.current || !certificate) return;

    const element = certificateRef.current;
    const filename = `${certificate.studentName}_${certificate.title.replace(/\s+/g, '_')}_Certificate.pdf`;

    const options = {
      margin: 0,
      filename: filename,
      image: { type: 'png', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { 
        orientation: 'portrait', 
        unit: 'in', 
        format: 'letter',
        compress: true 
      },
      pagebreak: { avoid: ['tr', 'td', 'th'] }
    };

    html2pdf().set(options).from(element).save();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
          <p className="text-gray-300 text-lg">Generating your certificate...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 p-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
            <div className="flex items-center gap-3 mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
              <h2 className="text-xl font-semibold text-red-300">Certificate Not Available</h2>
            </div>
            <p className="text-red-200 mb-6">{error}</p>
            <button
              onClick={() => navigate('/dashboard/student')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Control Buttons - Hidden in print */}
      <div className="max-w-4xl mx-auto mb-6 print:hidden">
        <div className="flex justify-between items-center bg-white rounded-lg shadow p-4">
          <button
            onClick={() => navigate('/dashboard/student')}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h3 className="text-lg font-semibold text-gray-800">Certificate Preview</h3>
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              Download PDF
            </button>
          </div>
        </div>
      </div>

      {/* Certificate Container */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white print:bg-white print:shadow-none print:p-0 rounded-lg shadow-2xl overflow-hidden">
          {/* Certificate Content - Print-friendly A4 size */}
          <div ref={certificateRef} className="aspect-[8.5/11] w-full print:h-screen print:w-screen print:aspect-auto bg-gradient-to-br from-amber-50 via-white to-amber-50 p-12 print:p-16 flex flex-col justify-between relative overflow-hidden">
            
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600"></div>
            <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600"></div>
            
            {/* Left and Right accent lines */}
            <div className="absolute top-12 left-8 w-1 h-20 bg-gradient-to-b from-blue-400 to-transparent"></div>
            <div className="absolute top-12 right-8 w-1 h-20 bg-gradient-to-b from-blue-400 to-transparent"></div>

            {/* Main Content */}
            <div className="relative z-10 text-center space-y-2">
              {/* Main Title */}
              <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 mt-6 mb-2">
                {certificate.title}
              </h1>

              {/* Subtitle */}
              <p className="text-2xl text-indigo-600 font-semibold mb-8">
                {certificate.subtitle}
              </p>



              {/* Certificate Statement */}
              <p className="text-gray-700 text-lg mb-8 leading-relaxed">
                This certificate is proudly presented to
              </p>

              {/* Student Name - Prominent Display */}
              <div className="mb-8">
                <p className="text-4xl font-bold text-blue-900 pb-3 inline-block">
                  {certificate.studentName}
                </p>
              </div>

              {/* Achievement Details */}
              <div className="space-y-3 mb-8 text-gray-700">
                <p className="text-lg">
                  for {certificate.subtitle.toLowerCase()} in
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {certificate.hackathonName}
                </p>
              </div>

              {/* Performance Details */}
              {certificate.type !== 'PARTICIPATION' && (
                <div className="mt-6 mb-8 flex justify-center">
                  <div className="inline-flex gap-8 px-6 py-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div>
                    <p className="text-sm text-gray-600">Rank</p>
                    <p className="text-2xl font-bold text-blue-600">#{certificate.rank}</p>
                  </div>
                  <div className="w-px bg-gray-300"></div>
                  <div>
                    <p className="text-sm text-gray-600">Score</p>
                    <p className="text-2xl font-bold text-blue-600">{certificate.score} pts</p>
                  </div>
                </div>
              </div>
              )}

              {/* Signature Section - Single Row */}
              <div className="relative z-10">
                <div className="flex items-center justify-between text-center text-sm pt-6">
                  {/* Certificate ID */}
                  <div className="flex-1">
                    <p className="text-gray-700 font-bold uppercase text-xs">Certificate ID</p>
                    <p className="font-mono text-xs text-gray-800 font-bold">{certificate.id}</p>
                  </div>

                  {/* Organizer Signature */}
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-sm">SUREKHA NALLAKANTAM</p>
                    <p className="text-gray-600 text-xs">Hackathon Organizer</p>
                  </div>

                  {/* Issue Date */}
                  <div className="flex-1">
                    <p className="text-gray-700 font-bold uppercase text-xs">Date Issued</p>
                    <p className="font-semibold text-gray-800 text-lg">{formatDate(new Date())}</p>
                  </div>
                </div>
              </div>

              {/* Footer Note */}
              <div className="relative z-10 text-center text-xs text-gray-500 mt-6 print:mt-4">
                <p>This certificate is awarded in recognition of outstanding achievement and dedication</p>
                <p className="text-gray-700 font-bold mt-1">All rights reserved © CodeVerse Campus 2026</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Additional Information - Below Certificate */}
      <div className="max-w-4xl mx-auto mt-8 print:hidden">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Certificate Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Certificate Details</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Certificate Type</p>
                <p className="font-semibold text-gray-900">{certificate.title}</p>
              </div>
              <div>
                <p className="text-gray-600">Certificate ID</p>
                <p className="font-mono text-xs text-gray-800 break-all">{certificate.id}</p>
              </div>
              <div>
                <p className="text-gray-600">Hackathon</p>
                <p className="font-semibold text-gray-900">{certificate.hackathonName}</p>
              </div>
              <div>
                <p className="text-gray-600">Event Date</p>
                <p className="font-semibold text-gray-900">{certificate.eventDate}</p>
              </div>
            </div>
          </div>

          {/* User Performance */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Performance</h3>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-gray-600">Student Name</p>
                <p className="font-semibold text-gray-900">{certificate.studentName}</p>
              </div>
              {certificate.type !== 'PARTICIPATION' && (
                <>
                  <div>
                    <p className="text-gray-600">Leaderboard Rank</p>
                    <p className="font-semibold text-gray-900">#{certificate.rank}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Final Score</p>
                    <p className="font-semibold text-gray-900">{certificate.score} points</p>
                  </div>
                </>
              )}
              {certificate.type === 'PARTICIPATION' && (
                <div>
                  <p className="text-gray-600">Status</p>
                  <p className="font-semibold text-green-600">Successfully Participated</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Info Note */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-gray-700">
          <p className="font-semibold text-blue-900 mb-2">ℹ️ How to Share Your Certificate</p>
          <ul className="list-disc list-inside space-y-1 text-gray-700">
            <li>Print this certificate and keep it as a memorable record</li>
            <li>Download in PDF format to share digitally with employers or academic institutions</li>
            <li>Use the unique Certificate ID ({certificate.id}) for verification purposes</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
