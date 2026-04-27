"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../../../../lib/supabaseClient';
import { FaUserEdit, FaTrash, FaSpinner, FaFileInvoice, FaEye, FaTimes, FaSearch, FaFilter } from 'react-icons/fa';

export default function AdmissionsAdmin() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCourse, setFilterCourse] = useState('All');

  useEffect(() => {
    fetchApplications();
  }, []);

  async function fetchApplications() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('admissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setApplications(data || []);
    } catch (error) {
      alert('Error fetching applications: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this application?')) return;
    try {
      const { error } = await supabase.from('admissions').delete().eq('id', id);
      if (error) throw error;
      fetchApplications();
    } catch (error) {
      alert('Error deleting: ' + error.message);
    }
  }

  const filteredApps = applications.filter(app => {
    const matchesSearch = app.full_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          app.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCourse = filterCourse === 'All' || app.course === filterCourse;
    return matchesSearch && matchesCourse;
  });

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FaFileInvoice className="text-blue-600" />
              Admission Applications
            </h1>
            <p className="text-gray-600 mt-1">Review and manage student admission submissions.</p>
          </div>
          
          <div className="flex flex-wrap gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input 
                type="text" 
                placeholder="Search by name/email..." 
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <select 
              className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white font-medium text-gray-700"
              value={filterCourse}
              onChange={(e) => setFilterCourse(e.target.value)}
            >
              <option value="All">All Courses</option>
              <option value="BCA">BCA</option>
              <option value="BBA">BBA</option>
              <option value="BCOM">BCOM</option>
            </select>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b border-gray-300">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-gray-700 uppercase tracking-wider">Student Name</th>
                <th className="px-6 py-4 text-xs font-black text-gray-700 uppercase tracking-wider">Course</th>
                <th className="px-6 py-4 text-xs font-black text-gray-700 uppercase tracking-wider">Mobile</th>
                <th className="px-6 py-4 text-xs font-black text-gray-700 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-black text-gray-700 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr><td colSpan="5" className="px-6 py-20 text-center"><FaSpinner className="animate-spin text-blue-600 text-3xl mx-auto" /></td></tr>
              ) : filteredApps.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-20 text-center text-gray-400">No applications found matching your criteria.</td></tr>
              ) : filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-gray-900">{app.full_name}</div>
                    <div className="text-xs text-gray-500">{app.email} | {app.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="font-black text-blue-800 text-sm">{app.course}</span>
                    <div className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">{app.specialization || 'General'}</div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {new Date(app.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button onClick={() => setSelectedApp(app)} className="text-blue-600 hover:text-blue-800 p-2 bg-blue-50 rounded-lg"><FaEye /></button>
                    <button onClick={() => handleDelete(app.id)} className="text-red-500 hover:text-red-700 p-2 bg-red-50 rounded-lg"><FaTrash /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {selectedApp && (
        <div className="fixed inset-0 z-[10000] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-12 pb-12">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setSelectedApp(null)}></div>
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full overflow-hidden z-10">
              <div className="bg-blue-600 p-6 text-white flex justify-between items-center">
                <h3 className="text-2xl font-bold">Application Details</h3>
                <button onClick={() => setSelectedApp(null)} className="text-white opacity-80 hover:opacity-100"><FaTimes size={24} /></button>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
                <div className="space-y-6">
                  <section>
                    <h4 className="text-[10px] font-black text-gray-800 uppercase tracking-[0.2em] mb-4 border-b border-gray-200 pb-2">Personal Information</h4>
                    <div className="grid grid-cols-2 gap-6 text-sm">
                      <div><p className="text-gray-600 font-bold mb-0.5 uppercase text-[10px] tracking-wider">Full Name</p><p className="font-black text-gray-900 text-base">{selectedApp.full_name}</p></div>
                      <div><p className="text-gray-600 font-bold mb-0.5 uppercase text-[10px] tracking-wider">Date of Birth</p><p className="font-black text-gray-900 text-base">{selectedApp.dob}</p></div>
                      <div><p className="text-gray-600 font-bold mb-0.5 uppercase text-[10px] tracking-wider">Email Address</p><p className="font-bold text-blue-700">{selectedApp.email}</p></div>
                      <div><p className="text-gray-600 font-bold mb-0.5 uppercase text-[10px] tracking-wider">Phone Number</p><p className="font-black text-gray-900">{selectedApp.phone}</p></div>
                      <div className="col-span-2"><p className="text-gray-600 font-bold mb-0.5 uppercase text-[10px] tracking-wider">Residential Address</p><p className="font-bold text-gray-900 leading-relaxed">{selectedApp.address}</p></div>
                    </div>
                  </section>
                  <section>
                    <h4 className="text-[10px] font-black text-gray-800 uppercase tracking-[0.2em] mb-4 border-b border-gray-200 pb-2">Academic Choice</h4>
                    <div className="flex flex-wrap items-center gap-4">
                      <div className="bg-blue-600 px-6 py-3 rounded-2xl shadow-lg shadow-blue-200"><p className="text-[10px] text-blue-100 font-black uppercase tracking-widest mb-1">SELECTED COURSE</p><p className="text-xl font-black text-white">{selectedApp.course}</p></div>
                      {selectedApp.specialization && <div className="bg-purple-600 px-6 py-3 rounded-2xl shadow-lg shadow-purple-200"><p className="text-[10px] text-purple-100 font-black uppercase tracking-widest mb-1">SPECIALIZATION</p><p className="text-lg font-black text-white">{selectedApp.specialization}</p></div>}
                    </div>
                  </section>
                </div>
                <div className="space-y-6">
                  <section>
                    <h4 className="text-[10px] font-black text-gray-800 uppercase tracking-[0.2em] mb-4 border-b border-gray-200 pb-2">SSLC (10th) Details</h4>
                    <div className="grid grid-cols-2 gap-y-4 text-sm bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <p className="text-gray-600 font-bold uppercase text-[10px]">School Name</p><p className="font-black text-gray-900 text-right">{selectedApp.sslc_school}</p>
                      <p className="text-gray-600 font-bold uppercase text-[10px]">Board</p><p className="font-black text-gray-900 text-right">{selectedApp.sslc_board}</p>
                      <p className="text-gray-600 font-bold uppercase text-[10px]">Percentage</p><p className="font-black text-right text-green-700 bg-green-50 px-2 py-0.5 rounded-lg">{selectedApp.sslc_percentage}%</p>
                      <p className="text-gray-600 font-bold uppercase text-[10px]">Year of Passing</p><p className="font-black text-gray-900 text-right">{selectedApp.sslc_year}</p>
                    </div>
                  </section>
                  <section>
                    <h4 className="text-[10px] font-black text-gray-800 uppercase tracking-[0.2em] mb-4 border-b border-gray-200 pb-2">PUC (12th) Details</h4>
                    <div className="grid grid-cols-2 gap-y-4 text-sm bg-gray-50 p-4 rounded-2xl border border-gray-100">
                      <p className="text-gray-600 font-bold uppercase text-[10px]">College Name</p><p className="font-black text-gray-900 text-right">{selectedApp.puc_school}</p>
                      <p className="text-gray-600 font-bold uppercase text-[10px]">Board</p><p className="font-black text-gray-900 text-right">{selectedApp.puc_board}</p>
                      <p className="text-gray-600 font-bold uppercase text-[10px]">Percentage</p><p className="font-black text-right text-green-700 bg-green-50 px-2 py-0.5 rounded-lg">{selectedApp.puc_percentage}%</p>
                      <p className="text-gray-600 font-bold uppercase text-[10px]">Year of Passing</p><p className="font-black text-gray-900 text-right">{selectedApp.puc_year}</p>
                    </div>
                  </section>
                </div>
              </div>
              <div className="bg-gray-50 p-6 flex justify-end">
                <button onClick={() => setSelectedApp(null)} className="bg-gray-900 text-white px-8 py-2 rounded-full font-bold">Close Details</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
