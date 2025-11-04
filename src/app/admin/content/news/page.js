// app/admin/content/news/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { FaNewspaper, FaEdit, FaTrash, FaPlus, FaTimes, FaSpinner, FaImage, FaSave } from 'react-icons/fa';
import { supabase } from '../../../../../lib/supabaseClient';

// News categories
const newsCategories = [
  { id: 'achievement', name: 'Achievement' },
  { id: 'infrastructure', name: 'Infrastructure' },
  { id: 'partnership', name: 'Partnership' },
  { id: 'announcement', name: 'Announcement' },
  { id: 'others', name: 'Others' }
];

export default function NewsManagementPage() {
  const [news, setNews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNews, setEditingNews] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [imageUploading1, setImageUploading1] = useState(false);
  const [imageUploading2, setImageUploading2] = useState(false);
  const [imageUploading3, setImageUploading3] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    title: '',
    excerpt: '',
    description: '',
    date: '',
    category: '',
    image: '',
    image1: '',
    image2: '',
    image3: '',
    url: '',
    author: 'Admin',
    is_featured: false,
    seo_title: '',
    seo_description: ''
  });

  // Fetch news from Supabase
  useEffect(() => {
    fetchNews();
  }, []);

  const fetchNews = async () => {
    try {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .order('date', { ascending: false });
      
      if (error) {
        console.error('Error fetching news:', error);
        alert(`Error fetching news: ${error.message || 'Unknown error'}`);
      } else {
        setNews(data || []);
      }
    } catch (error) {
      console.error('Error fetching news:', error);
      alert(`Error fetching news: ${error.message || 'Unknown error'}`);
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
    if (name === 'title' && !editingNews) {
      const urlSlug = value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
      setFormData(prev => ({
        ...prev,
        url: `/news/${urlSlug}`
      }));
    }
    
    // Auto-generate SEO title when title changes
    if (name === 'title' && !editingNews) {
      setFormData(prev => ({
        ...prev,
        seo_title: value
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
        .from('news')
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
        .from('news')
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
      alert(`Error uploading image: ${error.message || 'Unknown error'}`);
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
      title: '',
      excerpt: '',
      description: '',
      date: '',
      category: '',
      image: '',
      image1: '',
      image2: '',
      image3: '',
      url: '/news/',
      author: 'Admin',
      is_featured: false,
      seo_title: '',
      seo_description: ''
    });
    setEditingNews(null);
    setShowForm(false);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      // Prepare data for submission - remove id field as it's auto-generated
      const submitData = {
        title: formData.title,
        excerpt: formData.excerpt,
        description: formData.description,
        date: formData.date,
        category: formData.category,
        image: formData.image,
        image1: formData.image1,
        image2: formData.image2,
        image3: formData.image3,
        url: formData.url,
        author: formData.author,
        is_featured: formData.is_featured,
        seo_title: formData.seo_title,
        seo_description: formData.seo_description
      };
      
      console.log('Submitting data:', submitData);
      
      if (editingNews) {
        // Update existing news
        const { data, error } = await supabase
          .from('news')
          .update(submitData)
          .eq('id', editingNews.id)
          .select();
        
        if (error) {
          console.error('Update error:', error);
          throw error;
        }
        console.log('Update successful:', data);
      } else {
        // Create new news
        const { data, error } = await supabase
          .from('news')
          .insert([submitData])
          .select();
        
        if (error) {
          console.error('Insert error:', error);
          throw error;
        }
        console.log('Insert successful:', data);
      }
      
      // Refresh news list
      await fetchNews();
      resetForm();
      alert(editingNews ? 'News updated successfully!' : 'News created successfully!');
    } catch (error) {
      console.error('Error saving news:', error);
      // Better error message extraction
      const errorMessage = error?.message || error?.error_description || JSON.stringify(error) || 'Unknown error occurred';
      alert(`Error saving news: ${errorMessage}`);
    } finally {
      setSubmitting(false);
    }
  };

  // Handle edit news
  const handleEditNews = (newsItem) => {
    setFormData(newsItem);
    setEditingNews(newsItem);
    setShowForm(true);
  };

  // Handle delete news
  const handleDeleteNews = async (newsId) => {
    if (!confirm('Are you sure you want to delete this news item?')) return;
    
    try {
      const { error } = await supabase
        .from('news')
        .delete()
        .eq('id', newsId);
      
      if (error) {
        console.error('Delete error:', error);
        throw error;
      }
      
      // Refresh news list
      await fetchNews();
      alert('News deleted successfully!');
    } catch (error) {
      console.error('Error deleting news:', error);
      const errorMessage = error?.message || error?.error_description || JSON.stringify(error) || 'Unknown error occurred';
      alert(`Error deleting news: ${errorMessage}`);
    }
  };

  return (
    <main className="bg-gray-50 min-h-screen pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 font-playfair">News Management</h1>
            <p className="text-gray-600 mt-1">Manage all news articles and add new ones</p>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            <FaPlus className="mr-2" />
            Add New News
          </button>
        </div>

        {/* News List */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-800">All News</h2>
          </div>
          
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <FaSpinner className="animate-spin text-blue-600 text-2xl mr-2" />
              <span className="text-gray-600">Loading news...</span>
            </div>
          ) : news.length === 0 ? (
            <div className="text-center py-12">
              <FaNewspaper className="text-gray-400 text-4xl mx-auto mb-4" />
              <p className="text-gray-500">No news found</p>
              <p className="text-sm text-gray-400 mt-2">Add your first news article to get started</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      News
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Author
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Category
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
                  {news.map((newsItem) => (
                    <tr key={newsItem.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            {newsItem.image ? (
                              <img className="h-10 w-10 rounded-full object-cover" src={newsItem.image} alt={newsItem.title} />
                            ) : (
                              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                <FaImage className="text-gray-400" />
                              </div>
                            )}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{newsItem.title}</div>
                            <div className="text-sm text-gray-500">{newsItem.excerpt ? newsItem.excerpt.substring(0, 50) + '...' : ''}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {newsItem.date}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {newsItem.author}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {newsItem.category}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {newsItem.is_featured ? (
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
                          onClick={() => handleEditNews(newsItem)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDeleteNews(newsItem.id)}
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

        {/* Add/Edit News Form Modal */}
        {showForm && (
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4" style={{ paddingTop: '80px', paddingBottom: '80px' }}>
            <div className="fixed inset-0 bg-black opacity-50" onClick={resetForm}></div>
            <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[calc(100vh-160px)] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 rounded-t-xl z-10">
                <div className="flex justify-between items-center">
                  <h3 className="text-2xl font-bold">
                    {editingNews ? 'Edit News' : 'Add New News'}
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
                      News Title *
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
                      {newsCategories.map(category => (
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
                      Author
                    </label>
                    <input
                      type="text"
                      name="author"
                      value={formData.author}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
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
                      SEO Title
                    </label>
                    <input
                      type="text"
                      name="seo_title"
                      value={formData.seo_title}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Excerpt
                  </label>
                  <textarea
                    name="excerpt"
                    value={formData.excerpt}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    SEO Description
                  </label>
                  <textarea
                    name="seo_description"
                    value={formData.seo_description}
                    onChange={handleInputChange}
                    rows={2}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_featured"
                    id="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    className="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="is_featured" className="ml-3 block text-sm text-gray-700">
                    Featured News
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
                        {editingNews ? 'Update News' : 'Create News'}
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