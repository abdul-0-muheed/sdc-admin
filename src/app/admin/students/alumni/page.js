"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../../../../lib/supabaseClient';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaUserGraduate, FaCheck, FaTimes, FaLinkedin } from 'react-icons/fa';
import ImageUpload from '../../../../../componets/ImageUpload';

export default function AlumniAdmin() {
  const [alumni, setAlumni] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    batch: '',
    company: '',
    position: '',
    testimonial: '',
    image_src: '',
    linkedin_url: '',
    featured: false
  });

  useEffect(() => {
    fetchAlumni();
  }, []);

  async function fetchAlumni() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('alumni')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      setAlumni(data || []);
    } catch (error) {
      alert('Error fetching alumni: ' + error.message);
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
          .from('alumni')
          .update(formData)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('alumni')
          .insert([formData]);
        if (error) throw error;
      }
      setModalOpen(false);
      resetForm();
      fetchAlumni();
    } catch (error) {
      alert('Error saving alumni: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this alumni record?')) return;
    try {
      const { error } = await supabase.from('alumni').delete().eq('id', id);
      if (error) throw error;
      fetchAlumni();
    } catch (error) {
      alert('Error deleting: ' + error.message);
    }
  }

  function handleEdit(person) {
    setFormData({
      name: person.name,
      batch: person.batch,
      company: person.company,
      position: person.position,
      testimonial: person.testimonial,
      image_src: person.image_src,
      linkedin_url: person.linkedin_url,
      featured: person.featured
    });
    setEditingId(person.id);
    setModalOpen(true);
  }

  function resetForm() {
    setFormData({
      name: '',
      batch: '',
      company: '',
      position: '',
      testimonial: '',
      image_src: '',
      linkedin_url: '',
      featured: false
    });
    setEditingId(null);
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FaUserGraduate className="text-blue-600" />
              Alumni Directory
            </h1>
            <p className="text-gray-600 mt-1">Manage successful alumni stories and testimonials.</p>
          </div>
          <button 
            onClick={() => { resetForm(); setModalOpen(true); }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg"
          >
            <FaPlus /> Add Alumni
          </button>
        </div>

        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Alumni</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Batch</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Work</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Featured</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <FaSpinner className="animate-spin text-blue-600 text-3xl mx-auto mb-4" />
                  </td>
                </tr>
              ) : alumni.map((person) => (
                <tr key={person.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <img src={person.image_src} className="w-10 h-10 rounded-full object-cover border" alt="" />
                      <span className="font-bold text-gray-900">{person.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 font-medium">Class of {person.batch}</td>
                  <td className="px-6 py-4">
                    <div className="text-xs text-gray-500">{person.position}</div>
                    <div className="text-sm font-bold text-gray-800">{person.company}</div>
                  </td>
                  <td className="px-6 py-4">
                    {person.featured && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider">Featured</span>}
                  </td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button onClick={() => handleEdit(person)} className="text-blue-600 hover:text-blue-800">
                      <FaEdit size={18} />
                    </button>
                    <button onClick={() => handleDelete(person.id)} className="text-red-500 hover:text-red-700">
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
          <div className="flex items-center justify-center min-h-screen px-4 pt-12 pb-12">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setModalOpen(false)}></div>

            <div className="relative bg-white rounded-2xl shadow-xl transform transition-all max-w-2xl w-full z-10 overflow-hidden">
              <form onSubmit={handleSubmit}>
                <div className="p-8">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">{editingId ? 'Edit Alumni' : 'Add New Alumni'}</h3>
                    <button type="button" onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600"><FaTimes size={24} /></button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="John Smith" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Passout Batch</label>
                        <input required type="text" value={formData.batch} onChange={(e) => setFormData({...formData, batch: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="2022" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn Profile</label>
                        <div className="flex items-center gap-2">
                          <FaLinkedin className="text-blue-600" />
                          <input type="text" value={formData.linkedin_url} onChange={(e) => setFormData({...formData, linkedin_url: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="https://linkedin.com/in/..." />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <ImageUpload label="Profile Photo" defaultValue={formData.image_src} onUpload={(url) => setFormData({...formData, image_src: url})} />
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Company</label>
                        <input type="text" value={formData.company} onChange={(e) => setFormData({...formData, company: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Google" />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Position</label>
                        <input type="text" value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Software Engineer" />
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Testimonial</label>
                    <textarea rows="4" value={formData.testimonial} onChange={(e) => setFormData({...formData, testimonial: e.target.value})} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="Share their experience..."></textarea>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4">
                    <input type="checkbox" id="alumni-featured" checked={formData.featured} onChange={(e) => setFormData({...formData, featured: e.target.checked})} className="w-4 h-4 text-blue-600 border-gray-300 rounded" />
                    <label htmlFor="alumni-featured" className="text-sm font-medium text-gray-700">Feature this story on homepage</label>
                  </div>
                </div>

                <div className="bg-gray-50 px-8 py-4 flex justify-end gap-4">
                  <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-2 text-gray-600 font-semibold">Cancel</button>
                  <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-2">
                    {submitting ? <FaSpinner className="animate-spin" /> : <FaCheck />} {editingId ? 'Save Changes' : 'Add Alumni'}
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
