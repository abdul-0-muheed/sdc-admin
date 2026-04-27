"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../../../../lib/supabaseClient';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaNewspaper, FaCheck, FaTimes, FaUser, FaCalendarAlt, FaTag } from 'react-icons/fa';
import ImageUpload from '../../../../../componets/ImageUpload';

export default function NewsAdmin() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    category: 'achievement',
    image: '',
    image1: '',
    image2: '',
    image3: '',
    url: '',
    author: 'Admin',
    is_featured: false
  });

  useEffect(() => {
    fetchNews();
  }, []);

  async function fetchNews() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setNews(data || []);
    } catch (error) {
      alert('Error fetching news: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  function generateSlug(title) {
    return '/news/' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      const dataToSave = {
        ...formData,
        url: formData.url || generateSlug(formData.title)
      };

      if (editingId) {
        const { error } = await supabase.from('news').update(dataToSave).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('news').insert([dataToSave]);
        if (error) throw error;
      }
      
      setModalOpen(false);
      resetForm();
      fetchNews();
    } catch (error) {
      alert('Error saving news: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this news article?')) return;
    try {
      const { error } = await supabase.from('news').delete().eq('id', id);
      if (error) throw error;
      fetchNews();
    } catch (error) {
      alert('Error deleting: ' + error.message);
    }
  }

  function handleEdit(article) {
    setFormData(article);
    setEditingId(article.id);
    setModalOpen(true);
  }

  function resetForm() {
    setFormData({
      title: '',
      excerpt: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      category: 'achievement',
      image: '',
      image1: '',
      image2: '',
      image3: '',
      url: '',
      author: 'Admin',
      is_featured: false
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
              <FaNewspaper className="text-blue-600" />
              News & Announcements
            </h1>
            <p className="text-gray-700 font-medium mt-1">Manage college news, press releases, and featured stories.</p>
          </div>
          <button 
            onClick={() => { resetForm(); setModalOpen(true); }}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg"
          >
            <FaPlus /> Create News
          </button>
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b border-gray-300">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-gray-700 uppercase tracking-wider">Article</th>
                <th className="px-6 py-4 text-xs font-black text-gray-700 uppercase tracking-wider">Category</th>
                <th className="px-6 py-4 text-xs font-black text-gray-700 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-xs font-black text-gray-700 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-20 text-center"><FaSpinner className="animate-spin text-blue-600 text-3xl mx-auto" /></td></tr>
              ) : news.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-20 text-center text-gray-400 font-bold">No news articles found.</td></tr>
              ) : (
                news.map((article) => (
                  <tr key={article.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {article.image ? (
                          <img src={article.image} className="w-16 h-10 rounded-lg object-cover bg-gray-100 border" alt="" />
                        ) : (
                          <div className="w-16 h-10 rounded-lg bg-gray-100 border flex items-center justify-center text-gray-300">
                            <FaNewspaper size={14} />
                          </div>
                        )}
                        <div>
                          <div className="font-black text-gray-900 leading-tight">{article.title}</div>
                          <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-1">
                            <FaUser /> {article.author} | {article.is_featured && <span className="text-yellow-600 font-bold">★ FEATURED</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-gray-700 capitalize">{article.category}</td>
                    <td className="px-6 py-4 text-sm text-gray-900 font-medium">{article.date}</td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => handleEdit(article)} className="text-blue-600 hover:text-blue-800"><FaEdit size={18} /></button>
                      <button onClick={() => handleDelete(article.id)} className="text-red-400 hover:text-red-600"><FaTrash size={18} /></button>
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
          <div className="flex items-center justify-center min-h-screen px-4 py-8">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity" onClick={() => setModalOpen(false)}></div>
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full overflow-hidden">
              <form onSubmit={handleSubmit}>
                <div className="px-8 py-6 border-b flex justify-between items-center bg-gray-50">
                  <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
                    {editingId ? 'Edit Article' : 'Create New Article'}
                  </h3>
                  <button type="button" onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <FaTimes size={24} />
                  </button>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-1">Article Title</label>
                      <input
                        required
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="SDC Wins National Hackathon..."
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-black text-gray-900 mb-1">Date</label>
                        <input
                          required
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({...formData, date: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 font-bold outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-black text-gray-900 mb-1">Category</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 font-bold outline-none"
                        >
                          <option value="achievement">Achievement</option>
                          <option value="infrastructure">Infrastructure</option>
                          <option value="partnership">Partnership</option>
                          <option value="announcement">Announcement</option>
                          <option value="others">Others</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-1">Short Excerpt (Intro)</label>
                      <textarea
                        required
                        rows="3"
                        value={formData.excerpt}
                        onChange={(e) => setFormData({...formData, excerpt: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 font-medium outline-none"
                        placeholder="Brief summary for list view..."
                      ></textarea>
                    </div>

                    <div className="flex items-center gap-6 pt-2">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="feat"
                          checked={formData.is_featured}
                          onChange={(e) => setFormData({...formData, is_featured: e.target.checked})}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600"
                        />
                        <label htmlFor="feat" className="text-sm font-black text-gray-900 uppercase">Feature Story</label>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-6">
                    <ImageUpload 
                      label="Main Article Image"
                      defaultValue={formData.image}
                      onUpload={(url) => setFormData({...formData, image: url})}
                    />
                    
                    <div className="grid grid-cols-3 gap-4">
                      <ImageUpload 
                        label="Extra Image 1"
                        defaultValue={formData.image1}
                        onUpload={(url) => setFormData({...formData, image1: url})}
                      />
                      <ImageUpload 
                        label="Extra Image 2"
                        defaultValue={formData.image2}
                        onUpload={(url) => setFormData({...formData, image2: url})}
                      />
                      <ImageUpload 
                        label="Extra Image 3"
                        defaultValue={formData.image3}
                        onUpload={(url) => setFormData({...formData, image3: url})}
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-1">Author Name</label>
                      <input
                        type="text"
                        value={formData.author}
                        onChange={(e) => setFormData({...formData, author: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 font-bold outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-1">Custom Slug (Optional)</label>
                      <input
                        type="text"
                        value={formData.url}
                        onChange={(e) => setFormData({...formData, url: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 font-medium outline-none text-xs"
                        placeholder="/news/custom-title-here"
                      />
                      <p className="text-[10px] text-gray-400 mt-1 italic">Leave blank to auto-generate from title.</p>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-black text-gray-900 mb-1">Full Article Description (Markdown/HTML)</label>
                    <textarea
                      required
                      rows="8"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 font-medium outline-none"
                      placeholder="Detailed content of the article..."
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
                    {editingId ? 'Update Article' : 'Publish News'}
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