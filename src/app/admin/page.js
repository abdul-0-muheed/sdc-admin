// app/admin/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { FaUsers, FaCalendarAlt, FaEnvelopeOpenText, FaNewspaper, FaUserGraduate, FaChalkboardTeacher, FaBuilding, FaTools, FaClock, FaSpinner, FaFileInvoice, FaPhotoVideo, FaImage, FaBullhorn } from 'react-icons/fa';
import { supabase } from '../../../lib/supabaseClient';
import Link from 'next/link';

export default function DashboardPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [stats, setStats] = useState({
    news: 0,
    events: 0,
    admissions: 0,
    faculty: 0,
    achievers: 0,
    alumni: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    
    const fetchStats = async () => {
      try {
        setLoading(true);
        const fetchCount = async (table) => {
          const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
          return error ? 0 : count;
        };

        const [news, events, admissions, faculty, achievers, alumni, notices] = await Promise.all([
          fetchCount('news'),
          fetchCount('events'),
          fetchCount('admissions'),
          fetchCount('faculty'),
          fetchCount('achievers'),
          fetchCount('alumni'),
          fetchCount('notices')
        ]);

        // Fetch recent admissions
        const { data: recentAdmissions } = await supabase
          .from('admissions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        setStats({ news, events, admissions, faculty, achievers, alumni, notices, recentAdmissions: recentAdmissions || [] });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, []);

  return (
    <main className="bg-gray-50 min-h-screen pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-playfair tracking-tight">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, Admin! Here's what's happening at your college today.</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-xl">
                <FaNewspaper className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Total News</p>
                <p className="text-2xl font-bold text-gray-900">{stats.news}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-xl">
                <FaEnvelopeOpenText className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Applications</p>
                <p className="text-2xl font-bold text-gray-900">{stats.admissions}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-xl">
                <FaChalkboardTeacher className="text-purple-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Faculty</p>
                <p className="text-2xl font-bold text-gray-900">{stats.faculty}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-xl">
                <FaUserGraduate className="text-yellow-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Achievers</p>
                <p className="text-2xl font-bold text-gray-900">{stats.achievers}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Access Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6 font-playfair">Administrative Modules</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {[
                { label: 'Programs', icon: FaBuilding, url: '/admin/academics/programs', color: 'blue' },
                { label: 'Faculty', icon: FaChalkboardTeacher, url: '/admin/academics/faculty', color: 'purple' },
                { label: 'Admissions', icon: FaFileInvoice, url: '/admin/students/admissions', color: 'green' },
                { label: 'Achievers', icon: FaUserGraduate, url: '/admin/students/achievements', color: 'yellow' },
                { label: 'Alumni', icon: FaUsers, url: '/admin/students/alumni', color: 'indigo' },
                { label: 'Notices', icon: FaBullhorn, url: '/admin/content/notices', color: 'red' },
                { label: 'News', icon: FaNewspaper, url: '/admin/content/news', color: 'blue' },
                { label: 'Events', icon: FaCalendarAlt, url: '/admin/content/events', color: 'green' },
              ].map((module) => (
                <Link key={module.label} href={module.url}>
                  <div className="p-4 rounded-xl border border-gray-50 hover:border-blue-200 hover:bg-blue-50/30 transition-all group text-center">
                    <module.icon className={`mx-auto mb-2 text-2xl text-${module.color}-500 group-hover:scale-110 transition-transform`} />
                    <span className="text-[10px] font-black text-gray-700 uppercase tracking-widest">{module.label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-8 rounded-2xl shadow-lg text-white">
            <h2 className="text-xl font-bold mb-4 font-playfair">Quick Actions</h2>
            <div className="space-y-3">
              <Link href="/admin/content/banners" className="block w-full py-3 px-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10 text-sm font-bold flex items-center gap-3">
                <FaImage /> Update Admissions Banner
              </Link>
              <Link href="/admin/content/notices" className="block w-full py-3 px-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10 text-sm font-bold flex items-center gap-3">
                <FaBullhorn /> Post Important Notice
              </Link>
              <Link href="/admin/content/gallery" className="block w-full py-3 px-4 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10 text-sm font-bold flex items-center gap-3">
                <FaPhotoVideo /> Manage Media Gallery
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Admission Requests */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h2 className="text-xl font-bold text-gray-900 font-playfair flex items-center gap-2">
              <FaFileInvoice className="text-blue-600" />
              Recent Admission Requests
            </h2>
            <Link href="/admin/students/admissions" className="text-sm font-bold text-blue-600 hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 text-xs font-black text-gray-400 uppercase tracking-widest">
                <tr>
                  <th className="px-8 py-4">Student Name</th>
                  <th className="px-8 py-4">Applied Course</th>
                  <th className="px-8 py-4">Request Date</th>
                  <th className="px-8 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {loading ? (
                  <tr><td colSpan="4" className="px-8 py-10 text-center"><FaSpinner className="animate-spin text-blue-600 mx-auto" /></td></tr>
                ) : stats.recentAdmissions?.length === 0 ? (
                  <tr><td colSpan="4" className="px-8 py-10 text-center text-gray-400 font-bold">No recent requests.</td></tr>
                ) : (
                  stats.recentAdmissions?.map((app) => (
                    <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-8 py-4 font-bold text-gray-900">{app.full_name}</td>
                      <td className="px-8 py-4">
                        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest">{app.course}</span>
                      </td>
                      <td className="px-8 py-4 text-sm text-gray-500 font-medium">{new Date(app.created_at).toLocaleDateString()}</td>
                      <td className="px-8 py-4 text-right">
                        <Link href="/admin/students/admissions" className="text-blue-600 hover:text-blue-800"><FaFileInvoice /></Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}