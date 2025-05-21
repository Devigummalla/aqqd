import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiAlertCircle, FiClock, FiMapPin, FiDownload } from 'react-icons/fi';
import { FaMask, FaRunning, FaHome, FaExclamationTriangle, FaSmile, FaCalendarAlt, FaUserMd } from 'react-icons/fa';
import { BsClockHistory } from 'react-icons/bs';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const HealthReportDetail = () => {
  const reportRef = useRef();

  const downloadReport = async () => {
    const element = reportRef.current;
    const canvas = await html2canvas(element);
    const data = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgProperties = pdf.getImageProperties(data);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProperties.height * pdfWidth) / imgProperties.width;
    pdf.addImage(data, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('health-report.pdf');
  };

  const { id } = useParams();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);


  useEffect(() => {
    const fetchReport = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view health reports');
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:5000/api/health/report/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        const data = await response.json();
        if (data.success) {
          setReport(data.report);
        } else {
          setError(data.message);
        }
      } catch (err) {
        console.error('Error fetching health report:', err);
        setError('Failed to fetch health report');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center">
            <div className="w-10 h-10 border-4 rounded-full border-primary-500 border-t-transparent animate-spin"></div>
            <span className="ml-3 text-gray-700 dark:text-gray-300">Loading health report...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center text-danger-500">
            <FiAlertCircle className="w-5 h-5 mr-2" />
            <span>{error}</span>
          </div>
        </div>
      </div>
    );
  }

  if (!report) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 p-6">
      <div className="max-w-6xl mx-auto">
        <Link
          to="/health-reports"
          className="inline-flex items-center mb-6 text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
        >
          <FiArrowLeft className="w-5 h-5 mr-2" />
          <span>Back to Health Reports</span>
        </Link>

        <div className="grid grid-cols-1 gap-6">
          <div ref={reportRef}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-dark-600 p-4 rounded-lg shadow-md border border-gray-100 dark:border-primary-700 hover:shadow-lg transition-shadow"
            >
              <div className="border-b dark:border-gray-600 pb-6 mb-6">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
                  Current Air Quality
                </h1>
                <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4 mb-4 shadow-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex flex-col justify-center items-center p-4 bg-white dark:bg-dark-800 rounded-lg shadow-sm">
                      <div className="text-gray-600 dark:text-gray-300 mb-1 text-center font-medium">AQI Value</div>
                      <div className="text-3xl font-bold text-primary-600">{report.aqiData?.value || report.aqi}</div>
                    </div>
                    <div className="flex flex-col justify-center items-center p-4 bg-white dark:bg-dark-800 rounded-lg shadow-sm">
                      <div className="text-gray-600 dark:text-gray-300 mb-1 text-center font-medium">Status</div>
                      <div className="text-3xl font-bold text-primary-600">{report.aqiData?.status || report.status}</div>
                    </div>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <FiMapPin className="w-4 h-4 mr-2 text-primary-500 dark:text-primary-400" />
                    <span>Your detected location (±205380 meters)</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                    <FiClock className="w-4 h-4 mr-2 text-primary-500 dark:text-primary-400" />
                    <span>{new Date(report.report?.timestamp || report.aqiData?.timestamp || Date.now()).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Personal Information
                </h2>
                <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Name</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-primary-300">
                        {report.healthData?.name || 'N/A'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Age</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-primary-300">
                        {report.healthData?.age ? `${report.healthData.age} years` : 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                  Air Quality Information
                </h2>
                <div className="bg-gray-50 dark:bg-dark-700 rounded-lg p-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">AQI Value</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-primary-300">
                        {report.aqiData?.value}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">Status</p>
                      <p className="text-2xl font-bold text-gray-900 dark:text-primary-300">
                        {report.aqiData?.status}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="border border-gray-100 dark:border-primary-700 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-dark-700">
                  <div className="flex items-center text-blue-600 mb-3">
                    <FaSmile className="w-5 h-5 mr-2" />
                    <h2 className="text-lg font-medium dark:text-white">General Recommendation</h2>
                  </div>
                  <div className="flex items-start">
                    <span className="text-2xl mr-3">😊</span>
                    <p className="text-gray-600 dark:text-gray-200 leading-relaxed">{report.report?.generalRecommendations?.[0]}</p>
                  </div>
                </div>

                <div className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center text-blue-600 mb-3">
                    <FaCalendarAlt className="w-5 h-5 mr-2" />
                    <h2 className="text-lg font-medium dark:text-white">Age-specific Recommendation</h2>
                  </div>
                  <div className="flex items-start bg-gray-50 dark:bg-dark-600 p-3 rounded-lg">
                    <span className="text-xl mr-3">🏃</span>
                    <p className="text-gray-600 dark:text-gray-200 leading-relaxed">{report.report?.ageSpecificRecommendations?.[0]}</p>
                  </div>
                </div>

                <div className="border border-gray-100 rounded-lg p-4">
                  <div className="flex items-center text-blue-600 mb-3">
                    <FaUserMd className="w-5 h-5 mr-2" />
                    <h2 className="text-lg font-medium dark:text-white">Health Condition Recommendation</h2>
                  </div>
                  <div className="flex items-start bg-gray-50 dark:bg-dark-600 p-3 rounded-lg">
                    <span className="text-xl mr-3">🏥</span>
                    <p className="text-gray-600 dark:text-gray-200 leading-relaxed">{report.report?.healthSpecificRecommendations?.[0]}</p>
                  </div>
                </div>

                <div className="border border-gray-100 dark:border-primary-700 rounded-lg p-4 bg-white dark:bg-dark-700 hover:shadow-md transition-shadow">
                  <div className="flex items-center text-blue-600 dark:text-blue-400 mb-3">
                    <BsClockHistory className="w-5 h-5 mr-2" />
                    <h2 className="text-lg font-medium dark:text-white">Time-specific Recommendation</h2>
                  </div>
                  <div className="flex items-start bg-gray-50 dark:bg-dark-600 p-3 rounded-lg">
                    <span className="text-xl mr-3">⏰</span>
                    <p className="text-gray-600 dark:text-gray-200 leading-relaxed">
                      Air quality is typically better in the early morning and late evening. If you must go outside, try to do so during these less polluted times.
                      <br /><br />
                      <strong>Outdoor Activity Assessment:</strong> {report.report?.activityGuidelines?.outdoor || 
                        (report.aqiData?.value > 150 ? 
                          "Based on the current AQI, outdoor activities are not recommended. It's best to stay indoors as much as possible." : 
                          report.aqiData?.value > 100 ? 
                            "The current air quality is not ideal for prolonged outdoor activities. Consider limiting time outside, especially if you have respiratory issues." : 
                            "The current air quality allows for outdoor activities, but stay aware of any changes in air quality or your health condition.")
                      }
                    </p>
                  </div>
                </div>

                <div className="border border-gray-100 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-center text-blue-600 mb-3">
                    <FaMask className="w-5 h-5 mr-2" />
                    <h2 className="text-lg font-medium dark:text-white">Mask Recommendation</h2>
                  </div>
                  <div className="flex items-start bg-gray-50 dark:bg-dark-600 p-3 rounded-lg">
                    <span className="text-xl mr-3">😷</span>
                    <p className="text-gray-600 dark:text-gray-200 leading-relaxed">{report.report?.protectiveMeasures?.[0] || 
                        (report.aqiData?.value > 150 ? 
                          "Given the unhealthy air quality, wearing a high-quality N95 or KN95 mask is strongly recommended if you have to go outdoors. A simple cloth mask won't provide adequate protection." : 
                          report.aqiData?.value > 100 ? 
                            "For the current air quality level, an N95 or KN95 mask is recommended if you need to spend extended time outdoors, especially if you have respiratory conditions." : 
                            report.aqiData?.value > 50 ? 
                              "A standard surgical mask may provide some protection during outdoor activities, though it's not essential at this air quality level unless you have respiratory sensitivities." : 
                              "At the current air quality level, masks are generally not necessary for outdoor activities unless you have specific health concerns.")}
                      <br /><br />
                      <strong>Personalized Mask Recommendation:</strong> {report.healthData?.symptoms?.includes("Asthma") || report.healthData?.symptoms?.includes("Respiratory condition") ? 
                        "Based on your reported respiratory conditions, an N95 or KN95 mask is recommended even at moderate AQI levels to provide adequate protection for your sensitive respiratory system." : 
                        report.healthData?.age > 65 ? 
                          "As a senior adult, your respiratory system may be more vulnerable to air pollution. A properly fitted N95 mask is recommended when air quality is poor." : 
                          report.healthData?.age < 12 ? 
                            "For children, specially sized masks designed for younger users are important. Standard adult masks won't provide proper protection due to fit issues." : 
                            "Based on your profile, follow the general mask recommendations for your current air quality level."}
                    </p>
                  </div>
                </div>

                <div className="border border-gray-100 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
                  <div className="flex items-center text-blue-600 mb-3">
                    <FaUserMd className="w-5 h-5 mr-2" />
                    <h2 className="text-lg font-medium dark:text-white">Medicine Recommendations</h2>
                  </div>
                  <div className="flex items-start bg-gray-50 dark:bg-dark-600 p-3 rounded-lg">
                    <span className="text-xl mr-3">💊</span>
                    <div className="text-gray-600 dark:text-gray-200">
                      {report.report?.medicineRecommendations?.[0] ? (
                        <p>{report.report.medicineRecommendations[0]}</p>
                      ) : (
                        <div>
                          {report.healthData?.symptoms?.length > 0 ? (
                            <p>
                              {report.healthData.symptoms.includes("Asthma") ? 
                                "For asthma symptoms, ensure you have your prescribed rescue inhaler readily available. Consider using your controller medications as directed by your healthcare provider, especially before going outdoors in current air quality conditions." : ""}
                              
                              {report.healthData.symptoms.includes("Allergies") ? 
                                "For allergy symptoms, non-drowsy antihistamines like Cetirizine or Loratadine may help reduce symptoms. Nasal saline rinses can help clear irritants from nasal passages." : ""}
                              
                              {report.healthData.symptoms.includes("Cough") ? 
                                "For cough symptoms, consider honey-based cough suppressants (if over 1 year old) or over-the-counter expectorants like Guaifenesin to help loosen congestion." : ""}
                              
                              {report.healthData.symptoms.includes("Shortness of breath") ? 
                                "Shortness of breath can be serious. If you have a prescribed inhaler, use as directed. If symptoms persist or worsen, seek immediate medical attention." : ""}
                              
                              {report.healthData.symptoms.includes("Eye irritation") ? 
                                "For eye irritation, preservative-free lubricating eye drops can help flush irritants and provide relief." : ""}
                              
                              {report.healthData.symptoms.includes("Headache") ? 
                                "For headaches, over-the-counter pain relievers like Acetaminophen or Ibuprofen may provide relief. Stay hydrated and consider rest in a dark, quiet room." : ""}
                              
                              {report.healthData.symptoms.includes("Throat irritation") ? 
                                "For throat irritation, throat lozenges, warm saltwater gargles, or soothing herbal teas with honey may provide relief." : ""}
                              
                              {!report.healthData.symptoms.some(symptom => [
                                "Asthma", "Allergies", "Cough", "Shortness of breath", 
                                "Eye irritation", "Headache", "Throat irritation"
                              ].includes(symptom)) ? 
                                "Based on your reported symptoms, staying hydrated and monitoring your condition is recommended. If symptoms persist or worsen, consult with a healthcare provider." : ""}
                            </p>
                          ) : (
                            <p>
                              Based on the current air quality (AQI: {report.aqiData?.value}), no specific medications are recommended at this time. Stay hydrated and monitor for any developing symptoms.
                              
                              {report.aqiData?.value > 100 ? 
                                " If you have pre-existing respiratory conditions, keep rescue medications readily available." : ""}
                            </p>
                          )}
                          
                          <div className="mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md border border-yellow-200 dark:border-yellow-800">
                            <p className="text-sm text-yellow-800 dark:text-yellow-200">
                              <strong>Important:</strong> These medicine recommendations are provided as general guidance only and not as medical advice. Always consult with a healthcare professional before starting any medication, especially if you have pre-existing conditions, are pregnant, or are taking other medications.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-8 text-sm text-gray-500 text-center max-w-2xl mx-auto">
                  This report is generated based on current air quality data and your provided health information. It is intended as general guidance and not as medical advice. Please consult with a healthcare professional for personalized medical recommendations.
                </div>

                <button
                  onClick={downloadReport}
                  className="mt-8 w-full sm:w-auto sm:mx-auto flex items-center justify-center px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-colors text-base font-medium shadow-md border border-transparent hover:border-blue-300 dark:hover:border-blue-400"
                >
                  <FiDownload className="w-5 h-5 mr-2 animate-pulse" />
                  Download Your Health Report
                </button>
              </div>
            </motion.div>
          </div>


        </div>
      </div>
    </div>
  );
};

export default HealthReportDetail;
