"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../../../../lib/supabaseClient';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaGraduationCap, FaCheck, FaTimes, FaLink } from 'react-icons/fa';
import ImageUpload from '../../../../../componets/ImageUpload';

export default function ProgramsAdmin() {
  const [programs, setPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    subtitle: '',
    description: '',
    category: 'UG',
    status: 'open',
    url: '',
    bg_image: ''
  });

  useEffect(() => {
    fetchPrograms();
  }, []);

  async function fetchPrograms() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('programs')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      setPrograms(data || []);
    } catch (error) {
      alert('Error fetching programs: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
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
      fetchPrograms();
    } catch (error) {
      alert('Error saving program: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this program?')) return;
    try {
      const { error } = await supabase.from('programs').delete().eq('id', id);
      if (error) throw error;
      fetchPrograms();
    } catch (error) {
      alert('Error deleting: ' + error.message);
    }
  }

  function handleEdit(program) {
    setFormData({
      name: program.name,
      subtitle: program.subtitle,
      description: program.description,
      category: program.category,
      status: program.status,
      url: program.url,
      bg_image: program.bg_image
    });
    setEditingId(program.id);
    setModalOpen(true);
  }

  function resetForm() {
    setFormData({
      name: '',
      subtitle: '',
      description: '',
      category: 'UG',
      status: 'open',
      url: '',
      bg_image: ''
    });
    setEditingId(null);
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FaGraduationCap className="text-blue-600" />
              Programs Management
            </h1>
            <p className="text-gray-600 mt-1">Manage academic programs and admission statuses.</p>
          </div>
          <button 
            onClick={() => { resetForm(); setModalOpen(true); }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg"
          >
            <FaPlus /> Add Program
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Program</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="4" className="px-6 py-20 text-center">
                    <FaSpinner className="animate-spin text-blue-600 text-3xl mx-auto mb-4" />
                  </td>
                </tr>
              ) : programs.map((program) => (
                <tr key={program.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600">
                        <FaGraduationCap size={24} />
                      </div>
                      <div>
                        <span className="font-bold text-gray-900 block">{program.name}</span>
                        <span className="text-xs text-gray-500">{program.subtitle}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium">{program.category}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${
                      program.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    }`}>
                      {program.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button onClick={() => handleEdit(program)} className="text-blue-600 hover:text-blue-800">
                      <FaEdit size={18} />
                    </button>
                    <button onClick={() => handleDelete(program.id)} className="text-red-500 hover:text-red-700">
                      <FaTrash size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[10000] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 py-12">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setModalOpen(false)}></div>

            <div className="relative bg-white rounded-2xl shadow-xl transform transition-all max-w-4xl w-full z-10 overflow-hidden">
              <form onSubmit={handleSubmit}>
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">{editingId ? 'Edit Program' : 'Add New Program'}</h3>
                    <button type="button" onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600"><FaTimes size={24} /></button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Program Name</label>
                        <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="BCA Aviation" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subtitle</label>
                        <input type="text" value={formData.subtitle} onChange={(e) => setFormData({...formData, subtitle: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Aviation & Hospitality" />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                          <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                            <option value="UG">UG</option>
                            <option value="PG">PG</option>
                            <option value="PhD">PhD</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Admission Status</label>
                          <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500">
                            <option value="open">Open</option>
                            <option value="closed">Closed</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Landing Page URL</label>
                        <div className="flex items-center gap-2">
                          <FaLink className="text-gray-400" />
                          <input type="text" value={formData.url} onChange={(e) => setFormData({...formData, url: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="/admissions/bca-aviation" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <ImageUpload label="Background/Hero Image" defaultValue={formData.bg_image} onUpload={(url) => setFormData({...formData, bg_image: url})} />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Short Description</label>
                        <textarea rows="4" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Program highlights..."></textarea>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-8 py-4 flex justify-end gap-4">
                  <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-2 text-gray-600 font-semibold">Cancel</button>
                  <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2">
                    {submitting ? <FaSpinner className="animate-spin" /> : <FaCheck />} {editingId ? 'Save Changes' : 'Create Program'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
