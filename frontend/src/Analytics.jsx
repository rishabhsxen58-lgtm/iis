import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BarChart3, AlertCircle, CheckCircle2, AlertTriangle, TrendingUp, PieChart as PieIcon, Activity } from 'lucide-react';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend 
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Analytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/analytics');
        setAnalytics(response.data);
      } catch (error) {
        console.error('Failed to fetch analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-pulse flex flex-col items-center">
          <BarChart3 className="w-10 h-10 text-blue-300 mb-4" />
          <p className="text-gray-500 font-medium">Loading insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">System Analytics</h1>
        <p className="text-gray-500 mt-1">Real-time data visualization of grievance trends</p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="p-4 bg-blue-50 rounded-2xl text-blue-600">
            <TrendingUp size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Total Complaints</p>
            <p className="text-3xl font-bold text-gray-900">{analytics?.total || 0}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className="p-4 bg-amber-50 rounded-2xl text-amber-600">
            <AlertTriangle size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Common Category</p>
            <p className="text-2xl font-bold text-gray-900">{analytics?.commonCategory || 'N/A'}</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 flex items-center gap-4">
          <div className={`p-4 rounded-2xl ${
            analytics?.avgPriority === 'High' ? 'bg-red-50 text-red-600' :
            analytics?.avgPriority === 'Medium' ? 'bg-yellow-50 text-yellow-600' :
            'bg-green-50 text-green-600'
          }`}>
            <AlertCircle size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">System Priority</p>
            <p className="text-2xl font-bold text-gray-900">{analytics?.avgPriority || 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Distribution (Pie Chart) */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <PieIcon className="w-5 h-5 text-blue-500" />
            Category Distribution
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.categoryData || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {(analytics?.categoryData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown (Bar Chart) */}
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-indigo-500" />
            Priority Breakdown
          </h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={analytics?.priorityData || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {(analytics?.priorityData || []).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={
                      entry.name === 'High' ? '#ef4444' :
                      entry.name === 'Medium' ? '#f59e0b' : '#10b981'
                    } />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Insights Card */}
      <div className="bg-gradient-to-br from-blue-700 via-indigo-800 to-indigo-950 rounded-[2.5rem] p-10 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-12 opacity-10">
          <Activity size={180} className="text-white" />
        </div>
        <div className="relative z-10 max-w-2xl">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <CheckCircle2 className="text-green-400" />
            AI Management Insights
          </h2>
          <div className="space-y-6">
            <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <p className="text-blue-100 text-sm font-semibold uppercase tracking-wider mb-2">Category Trend</p>
              <p className="text-lg">
                The most frequent grievance is <span className="text-blue-300 font-bold underline decoration-blue-500/50">{analytics?.commonCategory}</span>. 
                Our AI suggests prioritizing field officers in this sector to reduce resolution time.
              </p>
            </div>
            <div className="p-6 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20">
              <p className="text-blue-100 text-sm font-semibold uppercase tracking-wider mb-2">Urgency Alert</p>
              <p className="text-lg">
                The overall urgency level is <span className={`font-bold ${analytics?.avgPriority === 'High' ? 'text-red-400' : 'text-yellow-400'}`}>{analytics?.avgPriority}</span>. 
                Automated assignment logic is currently optimizing for public safety hotspots.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
