"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../../../../lib/supabaseClient';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaBullhorn, FaCheck, FaTimes, FaCalendarAlt, FaExclamationTriangle } from 'react-icons/fa';

export default function NoticesAdmin() {
  const [notices, setNotices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    content: '',
    urgent: false
  });

  useEffect(() => {
    fetchNotices();
  }, []);

  async function fetchNotices() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('notices')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setNotices(data || []);
    } catch (error) {
      alert('Error fetching notices: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  function generateSlug(title) {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      const slug = formData.slug || generateSlug(formData.title);
      const dataToSave = {
        ...formData,
        slug: slug
      };

      if (editingId) {
        const { error } = await supabase.from('notices').update(dataToSave).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('notices').insert([dataToSave]);
        if (error) throw error;
      }
      
      setModalOpen(false);
      resetForm();
      fetchNotices();
    } catch (error) {
      alert('Error saving notice: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    try {
      const { error } = await supabase.from('notices').delete().eq('id', id);
      if (error) throw error;
      fetchNotices();
    } catch (error) {
      alert('Error deleting: ' + error.message);
    }
  }

  function handleEdit(notice) {
    setFormData({
      title: notice.title,
      slug: notice.slug,
      date: notice.date,
      description: notice.description,
      content: notice.content || '',
      urgent: notice.urgent
    });
    setEditingId(notice.id);
    setModalOpen(true);
  }

  function resetForm() {
    setFormData({
      title: '',
      slug: '',
      date: new Date().toISOString().split('T')[0],
      description: '',
      content: '',
      urgent: false
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
              <FaBullhorn className="text-blue-600" />
              Important Notices
            </h1>
            <p className="text-gray-700 font-medium mt-1">Manage official announcements, circulars, and urgent alerts.</p>
          </div>
          <button 
            onClick={() => { resetForm(); setModalOpen(true); }}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg"
          >
            <FaPlus /> Post New Notice
          </button>
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b border-gray-300">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-gray-700 uppercase tracking-wider">Notice Title</th>
                <th className="px-6 py-4 text-xs font-black text-gray-700 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-black text-gray-700 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-xs font-black text-gray-700 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-20 text-center"><FaSpinner className="animate-spin text-blue-600 text-3xl mx-auto" /></td></tr>
              ) : notices.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-20 text-center text-gray-400 font-bold">No notices found.</td></tr>
              ) : (
                notices.map((notice) => (
                  <tr key={notice.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {notice.urgent && <FaExclamationTriangle className="text-red-500 animate-pulse" />}
                        <div>
                          <div className="font-black text-gray-900 leading-tight">{notice.title}</div>
                          <div className="text-[10px] text-gray-500 mt-1 font-bold uppercase tracking-wider">Slug: {notice.slug}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-bold">{notice.date}</td>
                    <td className="px-6 py-4">
                      {notice.urgent ? (
                        <span className="bg-red-100 text-red-700 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Urgent</span>
                      ) : (
                        <span className="bg-blue-100 text-blue-700 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest">Normal</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => handleEdit(notice)} className="text-blue-600 hover:text-blue-800 p-2 bg-blue-50 rounded-lg"><FaEdit size={18} /></button>
                      <button onClick={() => handleDelete(notice.id)} className="text-red-400 hover:text-red-600 p-2 bg-red-50 rounded-lg"><FaTrash size={18} /></button>
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

            <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden z-10 transform transition-all">
              <form onSubmit={handleSubmit}>
                <div className="px-8 py-6 border-b flex justify-between items-center bg-gray-50">
                  <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
                    {editingId ? 'Edit Notice' : 'Post New Notice'}
                  </h3>
                  <button type="button" onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <FaTimes size={24} />
                  </button>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-1">Notice Title</label>
                      <input
                        required
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="Semester Exam Postponed..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-black text-gray-900 mb-1">Notice Date</label>
                        <input
                          required
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({...formData, date: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 font-bold outline-none"
                        />
                      </div>
                      <div className="flex items-center gap-2 pt-6">
                        <input
                          type="checkbox"
                          id="urgent"
                          checked={formData.urgent}
                          onChange={(e) => setFormData({...formData, urgent: e.target.checked})}
                          className="w-5 h-5 rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                        <label htmlFor="urgent" className="text-sm font-black text-red-600 uppercase">Mark as Urgent</label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-1">Notice Slug (URL)</label>
                      <input
                        type="text"
                        value={formData.slug}
                        onChange={(e) => setFormData({...formData, slug: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 font-medium outline-none text-xs"
                        placeholder="semester-exam-postponed"
                      />
                      <p className="text-[10px] text-gray-400 mt-1 italic">Leave blank to auto-generate.</p>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-1">Brief Description (Intro)</label>
                      <textarea
                        required
                        rows="3"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 font-medium outline-none"
                        placeholder="A short summary that appears on the notice card..."
                      ></textarea>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-black text-gray-900 mb-1">Full Notice Content (Markdown/HTML)</label>
                    <textarea
                      rows="8"
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 font-medium outline-none"
                      placeholder="Detailed announcement content..."
                    ></textarea>
                  </div>
                </div>

                <div className="bg-gray-100 px-8 py-5 flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-6 py-2 text-gray-600 font-black uppercase text-xs tracking-widest hover:text-gray-900"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-blue-600 text-white px-10 py-3 rounded-full font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl flex items-center gap-2 disabled:opacity-50"
                  >
                    {submitting ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                    {editingId ? 'Update Notice' : 'Post Notice'}
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
