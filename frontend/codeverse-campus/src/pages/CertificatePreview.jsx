import React, { useState, useRef } from 'react';
import { ArrowLeft, Printer, Download } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import html2pdf from 'html2pdf.js';

/**
 * Certificate Preview Page
 * Shows sample certificates for different achievement types
 * No authentication required - for UI demonstration
 */
export default function CertificatePreview() {
  const navigate = useNavigate();
  const [selectedCertificate, setSelectedCertificate] = useState('FIRST_PRIZE');
  const certificateRef = useRef(null);

  // Sample certificate data
  const certificates = {
    FIRST_PRIZE: {
      type: 'FIRST_PRIZE',
      title: 'Winner',
      subtitle: 'First Prize',
      badge: '🥇 First Prize',
      studentName: 'John Alexander Smith',
      hackathonName: 'CodeVerse Campus Hackathon 2026',
      eventDate: 'February 15, 2026',
      organizerName: 'CodeVerse Campus',
      rank: 1,
      score: 1250,
      id: 'CERT-A1B2C3-XYZ789-DEMO'
    },
    SECOND_PRIZE: {
      type: 'SECOND_PRIZE',
      title: 'Runner-Up',
      subtitle: 'Second Prize',
      badge: '🥈 Second Prize',
      studentName: 'Sarah Johnson Williams',
      hackathonName: 'CodeVerse Campus Hackathon 2026',
      eventDate: 'February 15, 2026',
      organizerName: 'CodeVerse Campus',
      rank: 2,
      score: 1180,
      id: 'CERT-A1B2C3-ABC456-DEMO'
    },
    THIRD_PRIZE: {
      type: 'THIRD_PRIZE',
      title: 'Third Place',
      subtitle: 'Third Prize',
      badge: '🥉 Third Prize',
      studentName: 'Michael Chen Rodriguez',
      hackathonName: 'CodeVerse Campus Hackathon 2026',
      eventDate: 'February 15, 2026',
      organizerName: 'CodeVerse Campus',
      rank: 3,
      score: 1050,
      id: 'CERT-A1B2C3-DEF123-DEMO'
    },
    PARTICIPATION: {
      type: 'PARTICIPATION',
      title: 'Certificate of Participation',
      subtitle: 'Successfully Participated',
      badge: '✓ Participation',
      studentName: 'Emily Watson Taylor',
      hackathonName: 'CodeVerse Campus Hackathon 2026',
      eventDate: 'February 15, 2026',
      organizerName: 'CodeVerse Campus',
      rank: null,
      score: null,
      id: 'CERT-A1B2C3-GHI789-DEMO'
    }
  };

  const certificate = certificates[selectedCertificate];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const handleDownloadPDF = () => {
    if (!certificateRef.current) return;

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

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header */}
      <div className="max-w-6xl mx-auto mb-6">
        <button
          onClick={() => navigate('/dashboard/student')}
          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center gap-2 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Certificate Preview</h1>
        <p className="text-gray-600 mt-2">View sample certificates for different achievement types</p>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Certificate Type Selector */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow p-6 sticky top-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Certificate Types</h3>
            <div className="space-y-2">
              {[
                { key: 'FIRST_PRIZE', label: '🥇 Winner - First Prize' },
                { key: 'SECOND_PRIZE', label: '🥈 Runner-Up - Second Prize' },
                { key: 'THIRD_PRIZE', label: '🥉 Third Place - Third Prize' },
                { key: 'PARTICIPATION', label: '✓ Certificate of Participation' }
              ].map(cert => (
                <button
                  key={cert.key}
                  onClick={() => setSelectedCertificate(cert.key)}
                  className={`w-full text-left px-4 py-3 rounded-lg transition-all ${
                    selectedCertificate === cert.key
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {cert.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Certificate Display */}
        <div className="lg:col-span-3">
          {/* Control Buttons */}
          <div className="flex justify-between items-center bg-white rounded-lg shadow p-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-800">{certificate.title}</h3>
            <div className="flex gap-2">
              <button
                onClick={() => window.print()}
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

          {/* Main Certificate */}
          <div className="bg-white rounded-lg shadow-2xl overflow-hidden">
            {/* Certificate Content - A4 size */}
            <div ref={certificateRef} className="aspect-[8.5/11] w-full bg-gradient-to-br from-yellow-50 via-white to-amber-100 p-16 flex flex-col justify-between relative overflow-hidden">
              
              {/* Premium Decorative Corners - Top Left & Right */}
              <div className="absolute top-0 left-0 w-20 h-20 border-t-4 border-l-4 border-blue-700 rounded-br-3xl opacity-60"></div>
              <div className="absolute top-0 right-0 w-20 h-20 border-t-4 border-r-4 border-blue-700 rounded-bl-3xl opacity-60"></div>
              
              {/* Premium Decorative Corners - Bottom Left & Right */}
              <div className="absolute bottom-0 left-0 w-20 h-20 border-b-4 border-l-4 border-blue-700 rounded-tr-3xl opacity-60"></div>
              <div className="absolute bottom-0 right-0 w-20 h-20 border-b-4 border-r-4 border-blue-700 rounded-tl-3xl opacity-60"></div>
              
              {/* Premium Top Border */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-700"></div>
              
              {/* Premium Bottom Border */}
              <div className="absolute bottom-0 left-0 w-full h-2 bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-700"></div>
              
              {/* Decorative Side Elements */}
              <div className="absolute top-24 left-6 w-1 h-16 bg-gradient-to-b from-gold-400 to-transparent opacity-70"></div>
              <div className="absolute top-24 right-6 w-1 h-16 bg-gradient-to-b from-gold-400 to-transparent opacity-70"></div>

              {/* Main Content */}
              <div className="relative z-10 text-center space-y-2">
                {/* Watermark - Faint Background */}
                <div className="absolute inset-0 opacity-5 text-center flex items-center justify-center pointer-events-none">
                  <span className="text-9xl font-bold text-gray-800">★</span>
                </div>

                {/* Main Title - Premium Styling */}
                <h1 className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-900 via-indigo-700 to-purple-900 mt-8 mb-3 drop-shadow-lg">
                  {certificate.title}
                </h1>

                {/* Subtitle with Icon */}
                <p className="text-3xl text-blue-800 font-bold mb-8 tracking-wide">
                  {certificate.subtitle}
                </p>



                {/* Certificate Statement - Elegant Font */}
                <p className="text-gray-800 text-xl mb-8 leading-relaxed font-serif italic">
                  This Certificate is Proudly Presented to
                </p>

                {/* Student Name - Most Prominent */}
                <div className="mb-10">
                  <p className="text-5xl font-black text-blue-950 pb-4 inline-block px-4">
                    {certificate.studentName}
                  </p>
                </div>

                {/* Achievement Details - Premium Layout */}
                <div className="space-y-4 mb-10 text-gray-800">
                  <p className="text-2xl font-semibold">
                    in recognition of
                  </p>
                  <p className="text-3xl font-black text-blue-900">
                    {certificate.subtitle.toUpperCase()}
                  </p>
                  <p className="text-lg text-gray-700 font-serif">
                    in the prestigious
                  </p>
                  <p className="text-3xl font-black text-blue-900 mb-2">
                    {certificate.hackathonName}
                  </p>
                </div>

                {/* Performance Details - Premium Card */}
                {certificate.rank !== null && (
                  <div className="mt-6 mb-10 flex justify-center">
                    <div className="inline-flex gap-12 px-8 py-5 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl border-3 border-blue-700 shadow-xl">
                      <div>
                        <p className="text-sm text-gray-700 font-bold uppercase tracking-wider">Rank</p>
                        <p className="text-4xl font-black text-blue-900">#{certificate.rank}</p>
                      </div>
                      <div className="w-1 bg-blue-700"></div>
                      <div>
                        <p className="text-sm text-gray-700 font-bold uppercase tracking-wider">Score</p>
                        <p className="text-4xl font-black text-blue-900">{certificate.score}</p>
                        <p className="text-xs text-gray-600">POINTS</p>
                      </div>
                    </div>
                  </div>
                )}


              </div>

              {/* Signature Section - Single Row */}
              <div className="relative z-10">
                <div className="flex items-center justify-between text-center text-sm pt-6">
                  {/* Certificate ID */}
                  <div className="flex-1">
                    <p className="text-gray-700 font-bold uppercase text-xs tracking-wide">Certificate ID</p>
                    <p className="font-mono text-xs text-gray-900 font-bold">{certificate.id}</p>
                  </div>

                  {/* Organizer Signature */}
                  <div className="flex-1">
                    <p className="font-bold text-gray-900 text-sm">SUREKHA NALLAKANTAM</p>
                    <p className="text-gray-700 text-xs">Hackathon Organizer</p>
                  </div>

                  {/* Issue Date */}
                  <div className="flex-1">
                    <p className="text-gray-700 font-bold uppercase text-xs tracking-wide">Date Issued</p>
                    <p className="font-bold text-gray-900 text-lg">{formatDate(new Date())}</p>
                  </div>
                </div>
              </div>

              {/* Footer Note - Legal Text */}
              <div className="relative z-10 text-center text-xs text-gray-600 mt-6 font-serif">
                <p className="leading-relaxed mb-1">
                  This certificate is awarded in recognition of outstanding achievement and dedication
                </p>
                <p className="text-gray-700 font-bold">
                  All rights reserved © CodeVerse Campus 2026
                </p>
              </div>
            </div>
          </div>

          {/* Certificate Details Cards */}
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  <p className="font-semibold text-gray-900">{formatDate(certificate.eventDate)}</p>
                </div>
              </div>
            </div>

            {/* Performance Summary */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance Summary</h3>
              <div className="space-y-3 text-sm">
                <div>
                  <p className="text-gray-600">Student Name</p>
                  <p className="font-semibold text-gray-900">{certificate.studentName}</p>
                </div>
                {certificate.rank !== null && (
                  <>
                    <div>
                      <p className="text-gray-600">Leaderboard Rank</p>
                      <p className="font-semibold text-blue-600">#{certificate.rank}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Final Score</p>
                      <p className="font-semibold text-blue-600">{certificate.score} points</p>
                    </div>
                  </>
                )}
                {certificate.rank === null && (
                  <div>
                    <p className="text-gray-600">Status</p>
                    <p className="font-semibold text-green-600">Successfully Participated</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Info Note */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
            <p className="font-semibold text-blue-900 mb-2">ℹ️ About This Preview</p>
            <p className="text-gray-700">
              This is a sample certificate display. In the actual application, certificates are generated based on your leaderboard ranking after each hackathon. 
              These are demonstration templates showing what your certificate would look like.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
