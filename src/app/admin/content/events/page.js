// app/admin/events/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { FaCalendarAlt, FaEdit, FaTrash, FaPlus, FaTimes, FaSpinner, FaImage, FaSave } from 'react-icons/fa';
import { supabase } from '../../../../../lib/supabaseClient';

// Department options
const departments = [
  "Computer Science & Engineering",
  "Information Science and Engineering",
  "Computer Science & Engineering (Artificial Intelligence & Machine Learning)",
  "Artificial Intelligence & Data Science",
  "Electronics & Communication Engineering",
  "Mechanical Engineering",
  "Civil Engineering",
  "Aeronautical Engineering",
  "M.Tech-Construction Technology",
  "Master of Business Administration",
  "Master of Computer Application",
  "Research Centre(Phd)",
  "B. Pharm",
  "M. Pharm",
  "Pharm D",
  "B.P.T",
  "M.P.T",
  "B.Sc Nursing",
  "M.Sc Nursing",
  "BSc Medical Laboratory Technology",
  "BSc Medical Imaging Technology",
  "BSc Anaesthesia and Operation Theatre Technology",
  "BSc Respiratory Care Technology",
  "BSc Renal Dialysis Technology",
  "B.H.S",
  "B.Sc. Food Technology",
  "B.Sc. Food Nutrition and Dietetics",
  "B.H.S. with Aviation",
  "B.Sc IN INTERIOR DESIGN AND DECORATION",
  "B.Sc. in Fashion Design",
  "BBA",
  "BCA",
  "B.Com",
  "B.B.A / B Com with Aviation and Hospitality Management",
  "B.B.A / B Com with Supply Chain and Logistic",
  "BCA / BBA / B.Com with Data Analytics, Artificial Intelligence and Cyber Security",
  "M.S.W"
];

// Event categories
const allEventCategories = [
  { id: 'academic', name: 'Academic' },
  { id: 'cultural', name: 'Cultural' },
  { id: 'sports', name: 'Sports' },
  { id: 'networking', name: 'Networking' },
  { id: 'others', name: 'Others' }
];

export default function EventsManagementPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploading1, setImageUploading1] = useState(false);
  const [imageUploading2, setImageUploading2] = useState(false);
  const [imageUploading3, setImageUploading3] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    id: '',
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
    image: '',
    image1: '',
    image2: '',
    image3: '',
    url: '',
    category: '',
    department: 'Computer Science & Engineering',
    featured: false,
    details_description: '',
    registrationurl: ''
  });

  // Fetch events from Supabase
  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('events')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching events:', error);
      } else {
        setEvents(data || []);
      }
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    // Auto-generate URL when title changes
    if (name === 'title' && !editingEvent) {
      const urlSlug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setFormData(prev => ({
        ...prev,
        url: `/events/${urlSlug}`
      }));
    }
  };

  // Handle image upload to Supabase storage
  const handleImageUpload = async (e, imageField) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Set appropriate loading state
    if (imageField === 'image') setImageUploading(true);
    else if (imageField === 'image1') setImageUploading1(true);
    else if (imageField === 'image2') setImageUploading2(true);
    else if (imageField === 'image3') setImageUploading3(true);
    
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
      const filePath = `${fileName}`;
      
      console.log('Uploading file:', fileName);
      
      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('events')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
      
      if (error) {
        console.error('Storage upload error:', error);
        throw error;
      }
      
      console.log('File uploaded successfully:', data);
      
      // Get public URL
      const { data: publicData } = supabase.storage
        .from('events')
        .getPublicUrl(filePath);
      
      const publicUrl = publicData.publicUrl;
      console.log('Public URL:', publicUrl);
      
      // Update form data with the URL
      setFormData(prev => ({
        ...prev,
        [imageField]: publicUrl
      }));
      
      alert('Image uploaded successfully!');
    } catch (error) {
      console.error('Error uploading image:', error);
      alert(`Error uploading image: ${error.message}`);
    } finally {
      // Reset appropriate loading state
      if (imageField === 'image') setImageUploading(false);
      else if (imageField === 'image1') setImageUploading1(false);
      else if (imageField === 'image2') setImageUploading2(false);
      else if (imageField === 'image3') setImageUploading3(false);
    }
  };

  // Handle image deletion
  const handleImageDelete = (imageField) => {
    setFormData(prev => ({
      ...prev,
      [imageField]: ''
    }));
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      id: '',
      title: '',
      date: '',
      time: '',
      location: '',
      description: '',
      image: '',
      image1: '',
      image2: '',
      image3: '',
      url: '/events/',
      category: '',
      department: 'Computer Science & Engineering',
      featured: false,
      details_description: '',
      registrationurl: ''
    });
    setEditingEvent(null);
    setShowForm(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Generate a unique ID if creating a new event
      if (!editingEvent) {
        formData.id = `event_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      }
      
      if (editingEvent) {
        // Update existing event
        const { error } = await supabase
          .from('events')
          .update(formData)
          .eq('id', editingEvent.id);
        
        if (error) throw error;
      } else {
        // Create new event
        const { error } = await supabase
          .from('events')
          .insert([formData]);
        
        if (error) throw error;
      }
      
      // Refresh events list
      await fetchEvents();
      resetForm();
      alert(editingEvent ? 'Event updated successfully!' : 'Event created successfully!');
    } catch (error) {
      console.error('Error saving event:', error);
      alert(`Error saving event: ${error.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit event
  const handleEditEvent = (event) => {
    setFormData(event);
    setEditingEvent(event);
    setShowForm(true);
  };

  // Handle delete event
  const handleDeleteEvent = async (eventId) => {
    if (!confirm('Are you sure you want to delete this event?')) return;
    
    try {
      const { error } = await supabase
        .from('events')
        .delete()
        .eq('id', eventId);
      
      if (error) throw error;
      
      // Refresh events list
      await fetchEvents();
      alert('Event deleted successfully!');
    } catch (error) {
      console.error('Error deleting event:', error);
      alert(`Error deleting event: ${error.message}`);
    }
  };

  return (
    <main className="bg-gray-50 min-h-screen pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-playfair">Event Management</h1>
            <p className="text-gray-600 mt-1">Manage all events and add new ones</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <FaPlus className="mr-2" />
            Add New Event
          </button>
        </div>

        {/* Events List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">All Events</h2>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <FaSpinner className="animate-spin text-blue-600 text-2xl mr-2" />
              <span className="text-gray-600">Loading events...</span>
            </div>
          ) : events.length === 0 ? (
            <div className="text-center py-12">
              <FaCalendarAlt className="text-gray-400 text-4xl mx-auto mb-4" />
              <p className="text-gray-500">No events found</p>
              <p className="text-sm text-gray-400 mt-2">Add your first event to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Featured
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.map((event) => (
                    <tr key={event.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {event.image ? (
                              <img className="h-10 w-10 rounded-full object-cover" src={event.image} alt={event.title} />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <FaImage className="text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{event.title}</div>
                            <div className="text-sm text-gray-500">{event.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{event.date}</div>
                        <div className="text-sm text-gray-500">{event.time}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event.location}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {event.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {event.featured ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Yes
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            No
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          <FaTrash />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Add/Edit Event Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
            <div className="fixed inset-0 bg-black opacity-50" onClick={resetForm}></div>
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[calc(100vh-160px)] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl z-10">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold">
                    {editingEvent ? 'Edit Event' : 'Add New Event'}
                  </h3>
                  <button
                    onClick={resetForm}
                    className="text-white hover:text-gray-200 transition-colors"
                  >
                    <FaTimes size={24} />
                  </button>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select a category</option>
                      {allEventCategories.map(category => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date *
                    </label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Time *
                    </label>
                    <input
                      type="text"
                      name="time"
                      value={formData.time}
                      onChange={handleInputChange}
                      placeholder="e.g., 10:00 AM - 2:00 PM"
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Location *
                    </label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Department *
                    </label>
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      {departments.map(dept => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      URL *
                    </label>
                    <input
                      type="text"
                      name="url"
                      value={formData.url}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Registration URL
                    </label>
                    <input
                      type="text"
                      name="registrationurl"
                      value={formData.registrationurl}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Details Description
                  </label>
                  <textarea
                    name="details_description"
                    value={formData.details_description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="featured"
                    id="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="featured" className="ml-3 block text-sm text-gray-700">
                    Featured Event
                  </label>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Main Image *
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'image')}
                        className="hidden"
                        id="main-image-upload"
                      />
                      <label
                        htmlFor="main-image-upload"
                        className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-4 border border-blue-200 rounded-lg shadow-sm text-sm font-medium transition-all"
                      >
                        {imageUploading ? (
                          <span className="flex items-center">
                            <FaSpinner className="animate-spin mr-2" />
                            Uploading...
                          </span>
                        ) : (
                          'Choose File'
                        )}
                      </label>
                      {formData.image && (
                        <div className="flex items-center">
                          <img src={formData.image} alt="Preview" className="h-12 w-12 object-cover rounded-lg" />
                          <span className="ml-2 text-sm text-gray-500">Image uploaded</span>
                          <button
                            type="button"
                            onClick={() => handleImageDelete('image')}
                            className="ml-2 text-red-600 hover:text-red-800"
                            title="Delete image"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Image 1
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'image1')}
                        className="hidden"
                        id="image1-upload"
                      />
                      <label
                        htmlFor="image1-upload"
                        className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-4 border border-blue-200 rounded-lg shadow-sm text-sm font-medium transition-all"
                      >
                        {imageUploading1 ? (
                          <span className="flex items-center">
                            <FaSpinner className="animate-spin mr-2" />
                            Uploading...
                          </span>
                        ) : (
                          'Choose File'
                        )}
                      </label>
                      {formData.image1 && (
                        <div className="flex items-center">
                          <img src={formData.image1} alt="Preview" className="h-12 w-12 object-cover rounded-lg" />
                          <span className="ml-2 text-sm text-gray-500">Image uploaded</span>
                          <button
                            type="button"
                            onClick={() => handleImageDelete('image1')}
                            className="ml-2 text-red-600 hover:text-red-800"
                            title="Delete image"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Image 2
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'image2')}
                        className="hidden"
                        id="image2-upload"
                      />
                      <label
                        htmlFor="image2-upload"
                        className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-4 border border-blue-200 rounded-lg shadow-sm text-sm font-medium transition-all"
                      >
                        {imageUploading2 ? (
                          <span className="flex items-center">
                            <FaSpinner className="animate-spin mr-2" />
                            Uploading...
                          </span>
                        ) : (
                          'Choose File'
                        )}
                      </label>
                      {formData.image2 && (
                        <div className="flex items-center">
                          <img src={formData.image2} alt="Preview" className="h-12 w-12 object-cover rounded-lg" />
                          <span className="ml-2 text-sm text-gray-500">Image uploaded</span>
                          <button
                            type="button"
                            onClick={() => handleImageDelete('image2')}
                            className="ml-2 text-red-600 hover:text-red-800"
                            title="Delete image"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Additional Image 3
                    </label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, 'image3')}
                        className="hidden"
                        id="image3-upload"
                      />
                      <label
                        htmlFor="image3-upload"
                        className="cursor-pointer bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-4 border border-blue-200 rounded-lg shadow-sm text-sm font-medium transition-all"
                      >
                        {imageUploading3 ? (
                          <span className="flex items-center">
                            <FaSpinner className="animate-spin mr-2" />
                            Uploading...
                          </span>
                        ) : (
                          'Choose File'
                        )}
                      </label>
                      {formData.image3 && (
                        <div className="flex items-center">
                          <img src={formData.image3} alt="Preview" className="h-12 w-12 object-cover rounded-lg" />
                          <span className="ml-2 text-sm text-gray-500">Image uploaded</span>
                          <button
                            type="button"
                            onClick={() => handleImageDelete('image3')}
                            className="ml-2 text-red-600 hover:text-red-800"
                            title="Delete image"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-6 py-3 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-6 py-3 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center transition-all"
                  >
                    {submitting ? (
                      <>
                        <FaSpinner className="animate-spin mr-2" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <FaSave className="mr-2" />
                        {editingEvent ? 'Update Event' : 'Create Event'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}