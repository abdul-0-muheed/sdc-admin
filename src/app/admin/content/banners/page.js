"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../../../../lib/supabaseClient';
import { FaImage, FaSpinner, FaCheck, FaInfoCircle, FaEdit, FaTrash, FaPlus, FaTimes, FaLink } from 'react-icons/fa';
import ImageUpload from '../../../../../componets/ImageUpload';

export default function BannersAdmin() {
  const [title, setTitle] = useState('Admission 2025-2026');
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  
  // Program Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    status: 'Applications Open',
    url: '',
    category: 'UG',
    description: '',
    is_active: true
  });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      
      // Fetch Title
      const { data: titleData } = await supabase
        .from('site_settings')
        .select('value')
        .eq('key', 'admission_banner_title')
        .single();
      
      if (titleData) setTitle(titleData.value);

      // Fetch Programs
      const { data: programsData } = await supabase
        .from('programs')
        .select('*')
        .order('created_at', { ascending: true });
      
      setPrograms(programsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }

  async function handleSaveTitle() {
    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('site_settings')
        .upsert({ key: 'admission_banner_title', value: title });
      
      if (error) throw error;
      alert('Title updated successfully!');
    } catch (error) {
      alert('Error saving title: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleProgramSubmit(e) {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingId) {
        const { error } = await supabase
          .from('programs')
          .update(formData)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('programs')
          .insert([formData]);
        if (error) throw error;
      }
      setModalOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      alert('Error saving program: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteProgram(id) {
    if (!confirm('Are you sure?')) return;
    try {
      const { error } = await supabase.from('programs').delete().eq('id', id);
      if (error) throw error;
      fetchData();
    } catch (error) {
      alert('Error deleting: ' + error.message);
    }
  }

  function handleEditProgram(program) {
    setFormData(program);
    setEditingId(program.id);
    setModalOpen(true);
  }

  function resetForm() {
    setFormData({
      id: '',
      name: '',
      status: 'Applications Open',
      url: '',
      category: 'UG',
      description: '',
      is_active: true
    });
    setEditingId(null);
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <FaSpinner className="animate-spin text-blue-600 text-4xl" />
    </div>
  );

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FaImage className="text-blue-600" />
            Admissions Banner Manager
          </h1>
          <p className="text-gray-600 mt-1">Manage the marquee banner title and program highlights.</p>
        </div>

        {/* 1. TITLE MANAGEMENT */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaEdit className="text-blue-500" /> Banner Title
          </h2>
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-xs font-black text-gray-700 uppercase tracking-widest mb-2">Left Side Title</label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-lg font-bold text-gray-900 placeholder-gray-400"
              />
            </div>
            <button 
              onClick={handleSaveTitle}
              disabled={submitting}
              className="bg-blue-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2"
            >
              {submitting ? <FaSpinner className="animate-spin" /> : <FaCheck />} Save Title
            </button>
          </div>
        </div>

        {/* 2. PREVIEW SECTION */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8">
          <h2 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
            <FaInfoCircle className="text-blue-500" /> Live Preview
          </h2>
          <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-blue-100 overflow-hidden p-6 flex items-center">
            <div className="flex-shrink-0 pr-8 py-2 border-r-2 border-blue-100 text-xl font-black text-blue-900 uppercase italic tracking-tighter">
              {title}
            </div>
            <div className="flex-grow overflow-hidden relative ml-4">
              <div className="flex items-center gap-12 animate-marquee whitespace-nowrap">
                {programs.filter(p => p.is_active).map(p => (
                  <div key={p.id} className="flex items-center gap-3">
                    <span className="font-bold text-blue-900">{p.name}</span>
                    <span className="text-blue-500 text-sm">- {p.status}</span>
                    <span className="bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-bold">Apply Now</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <p className="mt-4 text-xs text-gray-400 italic">* Preview shows a simplified version of the marquee animation.</p>
        </div>

        {/* 3. PROGRAMS MANAGEMENT */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-8 border-b flex justify-between items-center">
            <h2 className="text-lg font-bold text-gray-800">Banner Programs</h2>
            <button 
              onClick={() => { resetForm(); setModalOpen(true); }}
              className="bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2"
            >
              <FaPlus /> Add Program
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50 border-b">
                <tr>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase">Program</th>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase">Status</th>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase">Active</th>
                  <th className="px-8 py-4 text-xs font-black text-gray-400 uppercase text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {programs.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-8 py-4">
                      <div className="font-bold text-blue-900">{p.name}</div>
                    </td>
                    <td className="px-8 py-4 font-medium text-blue-600">{p.status}</td>
                    <td className="px-8 py-4">
                      {p.is_active ? <FaCheck className="text-green-500" /> : <FaTimes className="text-red-400" />}
                    </td>
                    <td className="px-8 py-4 text-right space-x-3">
                      <button onClick={() => handleEditProgram(p)} className="text-blue-600 hover:text-blue-800"><FaEdit size={18} /></button>
                      <button onClick={() => handleDeleteProgram(p.id)} className="text-red-400 hover:text-red-600"><FaTrash size={18} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Program Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[10000] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-12 pb-12">
            <div className="fixed inset-0 bg-gray-900 opacity-75" onClick={() => setModalOpen(false)}></div>
            <div className="relative bg-white rounded-2xl shadow-xl max-w-4xl w-full p-8 overflow-hidden">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-bold text-gray-900">{editingId ? 'Edit Program' : 'Add New Program'}</h3>
                <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600"><FaTimes size={24} /></button>
              </div>

              <form onSubmit={handleProgramSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-1">Internal ID (e.g. bca-ai)</label>
                      <input required type="text" value={formData.id} onChange={(e) => setFormData({...formData, id: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" disabled={!!editingId} />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-1">Display Name</label>
                      <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="BCA + AI" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-black text-gray-900 mb-1">Status Text</label>
                        <input type="text" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Applications Open" />
                      </div>
                      <div>
                        <label className="block text-sm font-black text-gray-900 mb-1">Category</label>
                        <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none">
                          <option value="UG">UG</option>
                          <option value="PG">PG</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-1">Redirect URL</label>
                      <input type="text" value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="/academics/programs/bca-ai" />
                    </div>
                    <div className="flex items-center gap-2 pt-4">
                      <input type="checkbox" id="active" checked={formData.is_active} onChange={(e) => setFormData({...formData, is_active: e.target.checked})} className="w-4 h-4 text-blue-600 rounded" />
                      <label htmlFor="active" className="text-sm font-black text-gray-900">Active in Banner</label>
                    </div>
                  </div>
                </div>

                <div className="pt-6 border-t flex justify-end gap-4">
                  <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-2 font-bold text-gray-500">Cancel</button>
                  <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-10 py-3 rounded-full font-bold hover:bg-blue-700 flex items-center gap-2">
                    {submitting ? <FaSpinner className="animate-spin" /> : <FaCheck />} {editingId ? 'Update Program' : 'Create Program'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          display: flex;
          animation: marquee 20s linear infinite;
        }
      `}</style>
    </main>
  );
}
