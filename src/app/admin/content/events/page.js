"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../../../../lib/supabaseClient';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaCalendarAlt, FaCheck, FaTimes, FaMapMarkerAlt, FaClock, FaExternalLinkAlt, FaStar } from 'react-icons/fa';
import ImageUpload from '../../../../../componets/ImageUpload';

export default function EventsAdmin() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    date: new Date().toISOString().split('T')[0],
    time: '9:00 AM - 5:00 PM',
    location: 'SDC Campus',
    description: '',
    details_description: '',
    image: '',
    image1: '',
    image2: '',
    image3: '',
    url: '',
    category: 'academic',
    department: 'Computer Science & Engineering',
    featured: false,
    registrationurl: ''
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  async function fetchEvents() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      alert('Error fetching events: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  function generateSlug(title) {
    return '/events/' + title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setSubmitting(true);
      
      const slug = formData.url || generateSlug(formData.title);
      const dataToSave = {
        ...formData,
        url: slug
      };

      if (editingId) {
        const { error } = await supabase.from('events').update(dataToSave).eq('id', editingId);
        if (error) throw error;
      } else {
        const newId = `event_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
        const { error } = await supabase.from('events').insert([{ ...dataToSave, id: newId }]);
        if (error) throw error;
      }
      
      setModalOpen(false);
      resetForm();
      fetchEvents();
    } catch (error) {
      alert('Error saving event: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure you want to delete this event?')) return;
    try {
      const { error } = await supabase.from('events').delete().eq('id', id);
      if (error) throw error;
      fetchEvents();
    } catch (error) {
      alert('Error deleting: ' + error.message);
    }
  }

  function handleEdit(event) {
    setFormData(event);
    setEditingId(event.id);
    setModalOpen(true);
  }

  function resetForm() {
    setFormData({
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '9:00 AM - 5:00 PM',
      location: 'SDC Campus',
      description: '',
      details_description: '',
      image: '',
      image1: '',
      image2: '',
      image3: '',
      url: '',
      category: 'academic',
      department: 'Computer Science & Engineering',
      featured: false,
      registrationurl: ''
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
              <FaCalendarAlt className="text-blue-600" />
              Event Management
            </h1>
            <p className="text-gray-700 font-medium mt-1">Schedule and manage college symposiums, fests, and workshops.</p>
          </div>
          <button 
            onClick={() => { resetForm(); setModalOpen(true); }}
            className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 transition-all flex items-center gap-2 shadow-lg"
          >
            <FaPlus /> New Event
          </button>
        </div>

        {/* List */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left">
            <thead className="bg-gray-100 border-b border-gray-300">
              <tr>
                <th className="px-6 py-4 text-xs font-black text-gray-700 uppercase tracking-wider">Event Details</th>
                <th className="px-6 py-4 text-xs font-black text-gray-700 uppercase tracking-wider">Date/Time</th>
                <th className="px-6 py-4 text-xs font-black text-gray-700 uppercase tracking-wider">Department</th>
                <th className="px-6 py-4 text-xs font-black text-gray-700 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="4" className="px-6 py-20 text-center"><FaSpinner className="animate-spin text-blue-600 text-3xl mx-auto" /></td></tr>
              ) : events.length === 0 ? (
                <tr><td colSpan="4" className="px-6 py-20 text-center text-gray-400 font-bold">No events scheduled.</td></tr>
              ) : (
                events.map((event) => (
                  <tr key={event.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        {event.image ? (
                          <img src={event.image} className="w-16 h-10 rounded-lg object-cover bg-gray-100 border" alt="" />
                        ) : (
                          <div className="w-16 h-10 rounded-lg bg-gray-100 border flex items-center justify-center text-gray-300">
                            <FaCalendarAlt size={14} />
                          </div>
                        )}
                        <div>
                          <div className="font-black text-gray-900 leading-tight">{event.title}</div>
                          <div className="text-[10px] text-gray-500 flex items-center gap-1 mt-1 font-bold">
                            <FaMapMarkerAlt className="text-red-500" /> {event.location} | {event.featured && <span className="text-yellow-600 font-black tracking-tighter">★ HOME PAGE</span>}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-gray-900">{event.date}</div>
                      <div className="text-[10px] text-gray-500 flex items-center gap-1"><FaClock /> {event.time}</div>
                    </td>
                    <td className="px-6 py-4 text-[11px] font-black text-gray-700 uppercase tracking-tighter">{event.department}</td>
                    <td className="px-6 py-4 text-right space-x-3">
                      <button onClick={() => handleEdit(event)} className="text-blue-600 hover:text-blue-800"><FaEdit size={18} /></button>
                      <button onClick={() => handleDelete(event.id)} className="text-red-400 hover:text-red-600"><FaTrash size={18} /></button>
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
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden">
              <form onSubmit={handleSubmit}>
                <div className="px-8 py-6 border-b flex justify-between items-center bg-gray-50">
                  <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">
                    {editingId ? 'Edit Event' : 'Schedule New Event'}
                  </h3>
                  <button type="button" onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    <FaTimes size={24} />
                  </button>
                </div>

                <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[70vh] overflow-y-auto">
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-1">Event Title</label>
                      <input
                        required
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({...formData, title: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none"
                        placeholder="National Symposium 2026"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-black text-gray-900 mb-1">Event Date</label>
                        <input
                          required
                          type="date"
                          value={formData.date}
                          onChange={(e) => setFormData({...formData, date: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 font-bold outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-black text-gray-900 mb-1">Event Category</label>
                        <select
                          value={formData.category}
                          onChange={(e) => setFormData({...formData, category: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 font-bold outline-none"
                        >
                          <option value="academic">Academic</option>
                          <option value="cultural">Cultural</option>
                          <option value="sports">Sports</option>
                          <option value="networking">Networking</option>
                          <option value="others">Others</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-black text-gray-900 mb-1">Time</label>
                        <input
                          type="text"
                          value={formData.time}
                          onChange={(e) => setFormData({...formData, time: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 font-bold outline-none"
                          placeholder="9:00 AM - 5:00 PM"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-black text-gray-900 mb-1">Location</label>
                        <input
                          type="text"
                          value={formData.location}
                          onChange={(e) => setFormData({...formData, location: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 font-bold outline-none"
                          placeholder="Main Hall"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-1">Organizing Department</label>
                      <input
                        type="text"
                        value={formData.department}
                        onChange={(e) => setFormData({...formData, department: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 font-bold outline-none"
                        placeholder="Computer Science"
                      />
                    </div>
                  </div>

                  <div className="space-y-6">
                    <ImageUpload 
                      label="Event Banner"
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
                      <label className="block text-sm font-black text-gray-900 mb-1">Short Summary</label>
                      <textarea
                        required
                        rows="3"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 font-medium outline-none"
                        placeholder="Quick overview for the card view..."
                      ></textarea>
                    </div>

                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="efat"
                          checked={formData.featured}
                          onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                          className="w-5 h-5 rounded border-gray-300 text-blue-600"
                        />
                        <label htmlFor="efat" className="text-sm font-black text-gray-900 uppercase">Feature on Homepage</label>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-1">Full Details Description</label>
                      <textarea
                        required
                        rows="6"
                        value={formData.details_description}
                        onChange={(e) => setFormData({...formData, details_description: e.target.value})}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 font-medium outline-none"
                        placeholder="Detailed schedule, rules, prizes etc..."
                      ></textarea>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-black text-gray-900 mb-1">Registration Link (Optional)</label>
                        <input
                          type="text"
                          value={formData.registrationurl}
                          onChange={(e) => setFormData({...formData, registrationurl: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 font-medium outline-none"
                          placeholder="https://forms.gle/..."
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-black text-gray-900 mb-1">URL Slug (Optional)</label>
                        <input
                          type="text"
                          value={formData.url}
                          onChange={(e) => setFormData({...formData, url: e.target.value})}
                          className="w-full px-4 py-2.5 border border-gray-300 rounded-xl text-gray-900 font-medium outline-none text-xs"
                          placeholder="/events/national-symposium"
                        />
                      </div>
                    </div>
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
                    {editingId ? 'Update Event' : 'Schedule Event'}
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