"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../../../../lib/supabaseClient';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaTrophy, FaCheck, FaTimes } from 'react-icons/fa';
import ImageUpload from '../../../../../componets/ImageUpload';

export default function AchieversAdmin() {
  const [achievers, setAchievers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    rank: '',
    department: '',
    image_src: '',
    featured: true
  });

  useEffect(() => {
    fetchAchievers();
  }, []);

  async function fetchAchievers() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('achievers')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      setAchievers(data || []);
    } catch (error) {
      alert('Error fetching achievers: ' + error.message);
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
          .from('achievers')
          .update(formData)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('achievers')
          .insert([formData]);
        if (error) throw error;
      }
      setModalOpen(false);
      resetForm();
      fetchAchievers();
    } catch (error) {
      alert('Error saving achiever: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this achiever?')) return;
    try {
      const { error } = await supabase.from('achievers').delete().eq('id', id);
      if (error) throw error;
      fetchAchievers();
    } catch (error) {
      alert('Error deleting: ' + error.message);
    }
  }

  function handleEdit(student) {
    setFormData({
      name: student.name,
      rank: student.rank,
      department: student.department,
      image_src: student.image_src,
      featured: student.featured
    });
    setEditingId(student.id);
    setModalOpen(true);
  }

  function resetForm() {
    setFormData({
      name: '',
      rank: '',
      department: '',
      image_src: '',
      featured: true
    });
    setEditingId(null);
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FaTrophy className="text-yellow-500" />
              Student Achievers
            </h1>
            <p className="text-gray-600 mt-1">Manage rank holders and academic achievers.</p>
          </div>
          <button 
            onClick={() => { resetForm(); setModalOpen(true); }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg"
          >
            <FaPlus /> Add Achiever
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Student</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Rank</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <FaSpinner className="animate-spin text-blue-600 text-3xl mx-auto mb-4" />
                    <p className="text-gray-500">Loading achievers...</p>
                  </td>
                </tr>
              ) : achievers.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <p className="text-gray-400 text-lg">No achievers found.</p>
                  </td>
                </tr>
              ) : (
                achievers.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img src={student.image_src} className="w-10 h-10 rounded-full object-cover border" alt="" />
                        <span className="font-bold text-gray-900">{student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-yellow-700 text-sm font-bold">{student.rank}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{student.department}</td>
                    <td className="px-6 py-4">
                      {student.featured ? (
                        <span className="text-green-600 text-xs font-bold">Visible in Marquee</span>
                      ) : (
                        <span className="text-gray-400 text-xs">Hidden</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => handleEdit(student)} className="text-blue-600 hover:text-blue-800 transition-colors">
                        <FaEdit size={18} />
                      </button>
                      <button onClick={() => handleDelete(student.id)} className="text-red-500 hover:text-red-700 transition-colors">
                        <FaTrash size={18} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[10000] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setModalOpen(false)}></div>

            <div className="relative bg-white rounded-2xl shadow-xl max-w-xl w-full overflow-hidden transform transition-all z-10">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-8 pt-8 pb-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {editingId ? 'Edit Achiever' : 'Add New Achiever'}
                    </h3>
                    <button type="button" onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                      <FaTimes size={24} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <ImageUpload 
                      label="Student Photo"
                      defaultValue={formData.image_src}
                      onUpload={(url) => setFormData({...formData, image_src: url})}
                    />
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Student Name</label>
                      <input
                        required
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="e.g. Kiran Kumar"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Rank Title</label>
                        <input
                          required
                          type="text"
                          value={formData.rank}
                          onChange={(e) => setFormData({...formData, rank: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="1st Rank College"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                        <input
                          required
                          type="text"
                          value={formData.department}
                          onChange={(e) => setFormData({...formData, department: e.target.value})}
                          className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="BCA Aviation"
                        />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={formData.featured}
                        onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                        Display in homepage marquee
                      </label>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 px-8 py-4 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-6 py-2 text-gray-600 font-semibold hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 text-white px-8 py-2 rounded-lg font-bold hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                    {editingId ? 'Update Record' : 'Add Achiever'}
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
