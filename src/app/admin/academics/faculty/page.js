"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../../../../lib/supabaseClient';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaChalkboardTeacher, FaCheck, FaTimes } from 'react-icons/fa';
import ImageUpload from '../../../../../componets/ImageUpload';

export default function FacultyAdmin() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    department: '',
    image_src: '',
    bio: '',
    featured: false
  });

  useEffect(() => {
    fetchFaculty();
  }, []);

  async function fetchFaculty() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('faculty')
        .select('*')
        .order('id', { ascending: false });

      if (error) throw error;
      setFaculty(data || []);
    } catch (error) {
      alert('Error fetching faculty: ' + error.message);
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
          .from('faculty')
          .update(formData)
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('faculty')
          .insert([formData]);
        if (error) throw error;
      }
      setModalOpen(false);
      resetForm();
      fetchFaculty();
    } catch (error) {
      alert('Error saving faculty: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this faculty member?')) return;
    try {
      const { error } = await supabase.from('faculty').delete().eq('id', id);
      if (error) throw error;
      fetchFaculty();
    } catch (error) {
      alert('Error deleting: ' + error.message);
    }
  }

  function handleEdit(member) {
    setFormData({
      name: member.name,
      role: member.role,
      department: member.department,
      image_src: member.image_src,
      bio: member.bio,
      featured: member.featured
    });
    setEditingId(member.id);
    setModalOpen(true);
  }

  function resetForm() {
    setFormData({
      name: '',
      role: '',
      department: '',
      image_src: '',
      bio: '',
      featured: false
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
              <FaChalkboardTeacher className="text-blue-600" />
              Faculty Management
            </h1>
            <p className="text-gray-600 mt-1">Add, edit, or remove teaching staff members.</p>
          </div>
          <button 
            onClick={() => { resetForm(); setModalOpen(true); }}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center gap-2 shadow-lg"
          >
            <FaPlus /> Add Member
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b border-gray-300">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-gray-700 uppercase tracking-wider">Member</th>
                <th className="px-6 py-4 text-xs font-black text-gray-700 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-xs font-black text-gray-700 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-black text-gray-700 uppercase tracking-wider">Featured</th>
                <th className="px-6 py-4 text-xs font-black text-gray-700 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <FaSpinner className="animate-spin text-blue-600 text-3xl mx-auto mb-4" />
                    <p className="text-gray-500">Loading faculty members...</p>
                  </td>
                </tr>
              ) : faculty.length === 0 ? (
                <tr>
                  <td colSpan="5" className="px-6 py-20 text-center">
                    <p className="text-gray-400 text-lg">No faculty members found.</p>
                  </td>
                </tr>
              ) : (
                faculty.map((member) => (
                  <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <img src={member.image_src} className="w-10 h-10 rounded-full object-cover border" alt="" />
                        <span className="font-bold text-gray-900">{member.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-900 font-medium text-sm">{member.department}</td>
                    <td className="px-6 py-4 text-gray-900 font-medium text-sm">{member.role}</td>
                    <td className="px-6 py-4">
                      {member.featured ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <FaCheck /> Featured
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => handleEdit(member)} className="text-blue-600 hover:text-blue-800 transition-colors">
                        <FaEdit size={18} />
                      </button>
                      <button onClick={() => handleDelete(member.id)} className="text-red-500 hover:text-red-700 transition-colors">
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

            <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full overflow-hidden transform transition-all z-10">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-8 pt-8 pb-6">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900">
                      {editingId ? 'Edit Faculty Member' : 'Add New Member'}
                    </h3>
                    <button type="button" onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                      <FaTimes size={24} />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-black text-gray-900 mb-1">Full Name</label>
                        <input
                          required
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="Dr. John Doe"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-black text-gray-900 mb-1">Role/Designation</label>
                        <input
                          required
                          type="text"
                          value={formData.role}
                          onChange={(e) => setFormData({...formData, role: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="Assistant Professor"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-black text-gray-900 mb-1">Department</label>
                        <input
                          required
                          type="text"
                          value={formData.department}
                          onChange={(e) => setFormData({...formData, department: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                          placeholder="Computer Science"
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <ImageUpload 
                        label="Portrait Photo"
                        defaultValue={formData.image_src}
                        onUpload={(url) => setFormData({...formData, image_src: url})}
                      />
                      <div className="flex items-center gap-2 pt-4">
                        <input
                          type="checkbox"
                          id="featured"
                          checked={formData.featured}
                          onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                        <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                          Feature this member on homepage
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <label className="block text-sm font-black text-gray-900 mb-1">Short Bio</label>
                    <textarea
                      rows="3"
                      value={formData.bio}
                      onChange={(e) => setFormData({...formData, bio: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                      placeholder="Brief description of their expertise..."
                    ></textarea>
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
                    {editingId ? 'Save Changes' : 'Add Member'}
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
