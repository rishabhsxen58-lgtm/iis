import React, { useState } from 'react';
import axios from 'axios';
import { Send, Loader2, AlertCircle, CheckCircle2, MapPin } from 'lucide-react';

export default function Home() {
  const [complaintText, setComplaintText] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!complaintText.trim()) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      // Connect to local backend for this project
      const response = await axios.post('http://localhost:5000/api/complaints', { text: complaintText });
      setResult(response.data);
      setComplaintText('');
    } catch (err) {
      if (err.response?.data?.needs_location) {
        setError(err.response.data.ai_response || "Please provide a location for your complaint.");
      } else {
        setError("Failed to submit complaint. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto mt-10">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-10 text-white">
          <h1 className="text-3xl font-extrabold tracking-tight mb-2">Lodge a Grievance</h1>
          <p className="text-blue-100 text-lg">Describe your issue naturally. Our AI will automatically categorize, prioritize, and assign it to the right department.</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="complaint" className="block text-sm font-medium text-gray-700 mb-2">
                Your Complaint
              </label>
              <textarea
                id="complaint"
                rows={5}
                className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-gray-900 bg-gray-50 p-4 transition duration-200 resize-none outline-none border hover:border-gray-400"
                placeholder="E.g., The street light outside 45 MG Road has been broken for 3 days. It's very dark and dangerous at night..."
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading || !complaintText.trim()}
                className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-xl text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-md transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5" />
                    Processing with AI...
                  </>
                ) : (
                  <>
                    <Send className="-ml-1 mr-2 h-5 w-5" />
                    Submit Grievance
                  </>
                )}
              </button>
            </div>
          </form>

          {error && (
            <div className="mt-8 bg-amber-50 border border-amber-200 rounded-xl p-5 flex items-start animate-fade-in-up">
              <AlertCircle className="h-6 w-6 text-amber-500 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-amber-800">Action Required</h3>
                <p className="mt-1 text-sm text-amber-700">{error}</p>
              </div>
            </div>
          )}

          {result && (
            <div className="mt-8 bg-green-50 border border-green-200 rounded-xl p-6 shadow-sm animate-fade-in-up">
              <div className="flex items-start mb-4">
                <CheckCircle2 className="h-6 w-6 text-green-500 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-green-800 mb-1">Grievance Registered Successfully</h3>
                  <p className="text-sm text-green-700 mb-4">{result.response}</p>
                </div>
              </div>
              
              <div className="bg-white rounded-lg p-5 border border-green-100 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Category</p>
                  <p className="font-medium text-gray-900 bg-gray-100 inline-block px-2.5 py-1 rounded-md">{result.data.category}</p>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Priority</p>
                  <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-sm font-medium ${
                    result.data.priority === 'High' ? 'bg-red-100 text-red-800' : 
                    result.data.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' : 
                    'bg-green-100 text-green-800'
                  }`}>
                    {result.data.priority}
                  </span>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1 flex items-center gap-1">
                    <MapPin size={14} /> Location
                  </p>
                  <p className="font-medium text-gray-900">{result.data.location}</p>
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Summary</p>
                  <p className="text-gray-800 text-sm border-l-4 border-blue-500 pl-3 py-1">{result.data.summary}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
