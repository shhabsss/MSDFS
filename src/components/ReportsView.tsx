import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Download, 
  Calendar, 
  TrendingUp, 
  Users, 
  CheckCircle2, 
  XCircle, 
  DollarSign,
  FileSpreadsheet
} from 'lucide-react';
import { Booking, Jodi } from '../types';
import { exportBookingsToCSV, formatDateDMY, formatAmountDisplay, getTodayDateString } from '../utils/bookingUtils';

interface ReportsViewProps {
  bookings: Booking[];
  jodis: Jodi[];
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  bookings,
  jodis
}) => {
  const [timeRange, setTimeRange] = useState<'all' | 'month' | 'week'>('month');

  const today = getTodayDateString();

  // Filter by range
  const filteredBookings = useMemo(() => {
    if (timeRange === 'all') return bookings;
    const now = new Date();
    const days = timeRange === 'week' ? 7 : 30;
    const cutoff = new Date(now.setDate(now.getDate() - days)).toISOString().split('T')[0];
    return bookings.filter(b => b.serviceDate >= cutoff);
  }, [bookings, timeRange]);

  // Key metrics
  const totalJobs = filteredBookings.length;
  const completedJobs = filteredBookings.filter(b => b.jobStatus === 'Completed').length;
  const cancelledJobs = filteredBookings.filter(b => b.jobStatus === 'Cancelled').length;
  const confirmedJobs = filteredBookings.filter(b => b.jobStatus === 'Confirmed').length;

  let totalCollectedRevenue = 0;
  let totalEstimatedRevenue = 0;

  filteredBookings.forEach(b => {
    const num = b.amount.match(/\d+/);
    const val = num ? parseInt(num[0], 10) : 0;
    totalEstimatedRevenue += val;
    if (b.jobStatus === 'Completed') {
      totalCollectedRevenue += val;
    }
  });

  // Jodi breakdown
  const jodiStats = useMemo(() => {
    return jodis.map(j => {
      const jb = filteredBookings.filter(b => b.assignedStaff.trim().toLowerCase() === j.name.trim().toLowerCase());
      const completed = jb.filter(b => b.jobStatus === 'Completed').length;
      let rev = 0;
      jb.forEach(b => {
        const m = b.amount.match(/\d+/);
        if (m) rev += parseInt(m[0], 10);
      });
      return {
        jodi: j,
        total: jb.length,
        completed,
        revenue: rev
      };
    });
  }, [filteredBookings, jodis]);

  // Service breakdown
  const serviceStats = useMemo(() => {
    const map = new Map<string, { count: number; revenue: number }>();
    filteredBookings.forEach(b => {
      const cur = map.get(b.services) || { count: 0, revenue: 0 };
      const num = b.amount.match(/\d+/);
      const val = num ? parseInt(num[0], 10) : 0;
      map.set(b.services, {
        count: cur.count + 1,
        revenue: cur.revenue + val
      });
    });
    return Array.from(map.entries()).sort((a, b) => b[1].count - a[1].count);
  }, [filteredBookings]);

  // CSV Export
  const handleExportCSV = () => {
    const csvContent = exportBookingsToCSV(filteredBookings);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `MSD_Bookings_Report_${today}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 pb-20">
      
      {/* Header & Export CTA */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              Operational Analytics & Reports
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Booking trends, Jodi performance, and service revenue in Puducherry
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Range picker */}
          <div className="flex items-center bg-slate-100 rounded-xl p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setTimeRange('week')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                timeRange === 'week' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              7 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('month')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                timeRange === 'month' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              30 Days
            </button>
            <button
              type="button"
              onClick={() => setTimeRange('all')}
              className={`px-2.5 py-1.5 rounded-lg transition-all ${
                timeRange === 'all' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600'
              }`}
            >
              All Time
            </button>
          </div>

          {/* Export CSV */}
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 mb-1">Total Bookings</div>
          <div className="text-2xl font-black text-slate-900">{totalJobs}</div>
          <div className="text-[11px] text-slate-400 mt-1">{confirmedJobs} confirmed</div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 mb-1">Completed Jobs</div>
          <div className="text-2xl font-black text-emerald-600">{completedJobs}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {totalJobs > 0 ? `${Math.round((completedJobs / totalJobs) * 100)}% completion` : '0%'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 mb-1">Cancelled Jobs</div>
          <div className="text-2xl font-black text-rose-600">{cancelledJobs}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            {totalJobs > 0 ? `${Math.round((cancelledJobs / totalJobs) * 100)}% cancel rate` : '0%'}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="text-xs font-semibold text-slate-500 mb-1">Collected Revenue</div>
          <div className="text-2xl font-black text-slate-900">
            ₹{totalCollectedRevenue.toLocaleString('en-IN')}
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            ₹{totalEstimatedRevenue.toLocaleString('en-IN')} total pipeline
          </div>
        </div>

      </div>

      {/* Jodi Performance Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-400" />
            <h3 className="font-bold text-sm sm:text-base">Staff & Jodi Performance</h3>
          </div>
          <span className="text-xs text-slate-400">5 Active Teams</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Jodi</th>
                <th className="py-3 px-4">Members</th>
                <th className="py-3 px-4 text-center">Total Jobs</th>
                <th className="py-3 px-4 text-center">Completed</th>
                <th className="py-3 px-4 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {jodiStats.map(s => (
                <tr key={s.jodi.id} className="hover:bg-slate-50">
                  <td className="py-3 px-4 font-bold text-slate-900">{s.jodi.name}</td>
                  <td className="py-3 px-4 text-slate-600">{s.jodi.members}</td>
                  <td className="py-3 px-4 text-center font-bold text-blue-600">{s.total}</td>
                  <td className="py-3 px-4 text-center font-bold text-emerald-600">{s.completed}</td>
                  <td className="py-3 px-4 text-right font-black text-slate-900">
                    ₹{s.revenue.toLocaleString('en-IN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Service-wise Breakdown */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <h3 className="font-bold text-sm sm:text-base text-slate-900 mb-3">
          Popular Services Breakdown
        </h3>
        <div className="space-y-3">
          {serviceStats.map(([serviceName, stat]) => {
            const pct = totalJobs > 0 ? Math.round((stat.count / totalJobs) * 100) : 0;

            return (
              <div key={serviceName} className="space-y-1">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <span className="text-slate-800">{serviceName}</span>
                  <span className="text-slate-500">
                    {stat.count} bookings ({pct}%) • ₹{stat.revenue.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};
