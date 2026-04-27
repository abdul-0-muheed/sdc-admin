"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../../../../lib/supabaseClient';
import { FaPlus, FaEdit, FaTrash, FaSpinner, FaPhotoVideo, FaCheck, FaTimes, FaYoutube, FaInstagram, FaCog, FaSearch, FaCloudDownloadAlt, FaStar, FaEye } from 'react-icons/fa';

/* ─────────────────────────────────────────────────────────────────────────────
   PREVIEW COMPONENTS (Mirrored from sdc-web/src/app/media/page.js)
   ───────────────────────────────────────────────────────────────────────────── */
const PlatformBadge = ({ platform }) => {
  const map = {
    youtube: { label: '▶ YouTube', bg: 'bg-red-600/90' },
    instagram: { label: '📸 Reel', bg: 'bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 opacity-90' },
  };
  const badge = map[platform];
  if (!badge) return null;
  return (
    <span className={`absolute top-3 left-3 z-20 ${badge.bg} text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg pointer-events-none uppercase`}>
      {badge.label}
    </span>
  );
};

const getYoutubeId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&?]+)/);
  return match ? match[1] : null;
};

const getInstagramId = (url) => {
  if (!url) return null;
  const match = url.match(/(?:instagram\.com\/(?:p|reel)\/)([^/?#&]+)/);
  return match ? match[1] : null;
};

const GridVideoCard = ({ item, isScraped, onFeature }) => {
  const ytId = item.platform === 'youtube' ? (item.ytId || getYoutubeId(item.src)) : null;
  const igId = item.platform === 'instagram' ? getInstagramId(item.src) : null;
  const aspect = item.aspect || '16/9';
  const formatClasses = aspect === '9/16' ? `aspect-[9/16]` : `aspect-video`;

  return (
    <div className={`relative rounded-2xl overflow-hidden bg-gray-900 group shadow-md border border-gray-100 ${formatClasses}`}>
      <PlatformBadge platform={item.platform} />
      
      {item.platform === 'youtube' && ytId ? (
        <img 
          src={`https://img.youtube.com/vi/${ytId}/maxresdefault.jpg`} 
          className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
          alt={item.title}
          onError={(e) => { e.target.src = `https://img.youtube.com/vi/${ytId}/0.jpg`; }}
        />
      ) : item.platform === 'instagram' && igId ? (
        <div className="absolute inset-0 overflow-hidden pointer-events-auto bg-black">
          <iframe
            className="absolute border-0 max-w-none w-[146%] left-[-23%] top-[-56px] h-[calc(100%+280px)]"
            src={`https://www.instagram.com/p/${igId}/embed/?hidecaption=true`}
            title={item.title}
            allowtransparency="true"
            allowFullScreen
            scrolling="no"
            frameBorder="0"
          />
        </div>
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
          <FaPhotoVideo size={40} />
        </div>
      )}

      {/* Hover Info Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-4">
        <h4 className="text-white text-xs font-bold line-clamp-2 mb-2">{item.title}</h4>
        <div className="flex gap-2">
          {isScraped && (
            <button 
              onClick={() => onFeature(item)}
              className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors flex-1 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-tighter"
            >
              <FaStar /> Add to Archive
            </button>
          )}
          <a 
            href={item.src} 
            target="_blank" 
            rel="noopener noreferrer"
            className="bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-2 rounded-lg transition-colors text-[10px] flex items-center justify-center"
          >
            <FaEye />
          </a>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────────────────────────────────────
   MAIN ADMIN COMPONENT
   ───────────────────────────────────────────────────────────────────────────── */
export default function MediaAdmin() {
  const [items, setItems] = useState([]); // Manual archive
  const [scrapedItems, setScrapedItems] = useState([]); // Temporary scraper results
  const [config, setConfig] = useState({ youtubeChannelUrls: [], instagramWidgetId: '' });
  const [loading, setLoading] = useState(true);
  const [scraping, setScraping] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [configModalOpen, setConfigModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    platform: 'youtube',
    src: '',
    featured: false,
    aspect: '16/9'
  });

  useEffect(() => {
    fetchMedia();
    fetchConfig();
  }, []);

  async function fetchMedia() {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('media_items')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error('Error fetching media:', error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchConfig() {
    const { data } = await supabase.from('site_settings').select('value').eq('key', 'media_config').single();
    if (data?.value) {
      setConfig(typeof data.value === 'string' ? JSON.parse(data.value) : data.value);
    }
  }

  async function handleScrape() {
    try {
      setScraping(true);
      setScrapedItems([]);
      
      const allScraped = [];
      for (const url of config.youtubeChannelUrls) {
        const res = await fetch(`/api/scrape-youtube?url=${encodeURIComponent(url)}`);
        const data = await res.json();
        if (Array.isArray(data)) {
          allScraped.push(...data);
        }
      }
      
      setScrapedItems(allScraped);
    } catch (error) {
      alert('Error scraping: ' + error.message);
    } finally {
      setScraping(false);
    }
  }

  async function handleFeatureFromScraper(scraped) {
    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('media_items')
        .insert([{
          title: scraped.title,
          platform: scraped.platform,
          src: scraped.src,
          featured: true, // Default to featured if manually archived
          aspect: '16/9'
        }]);

      if (error) throw error;
      alert('Added to archive!');
      fetchMedia();
    } catch (error) {
      alert('Error archiving: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setSubmitting(true);
      if (editingId) {
        const { error } = await supabase.from('media_items').update(formData).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('media_items').insert([formData]);
        if (error) throw error;
      }
      setModalOpen(false);
      resetForm();
      fetchMedia();
    } catch (error) {
      alert('Error saving: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function saveConfig(e) {
    e.preventDefault();
    try {
      setSubmitting(true);
      const { error } = await supabase.from('site_settings').upsert({ key: 'media_config', value: config });
      if (error) throw error;
      setConfigModalOpen(false);
    } catch (error) {
      alert('Error saving config: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!confirm('Are you sure?')) return;
    try {
      const { error } = await supabase.from('media_items').delete().eq('id', id);
      if (error) throw error;
      fetchMedia();
    } catch (error) {
      alert('Error deleting: ' + error.message);
    }
  }

  function handleEdit(item) {
    setFormData(item);
    setEditingId(item.id);
    setModalOpen(true);
  }

  function resetForm() {
    setFormData({ title: '', platform: 'youtube', src: '', featured: false, aspect: '16/9' });
    setEditingId(null);
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto px-4 py-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FaPhotoVideo className="text-blue-600" />
              Media Gallery Manager
            </h1>
            <p className="text-gray-700 font-medium mt-1">Manage permanent archive and scrape external feeds.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setConfigModalOpen(true)}
              className="bg-white text-gray-800 px-6 py-2.5 rounded-xl font-bold border border-gray-200 hover:bg-gray-50 flex items-center gap-2 shadow-sm"
            >
              <FaCog /> Setup Channels
            </button>
            <button 
              onClick={handleScrape}
              disabled={scraping}
              className="bg-white text-blue-600 px-6 py-2.5 rounded-xl font-bold border border-blue-200 hover:bg-blue-50 flex items-center gap-2 shadow-sm"
            >
              {scraping ? <FaSpinner className="animate-spin" /> : <FaCloudDownloadAlt />} Fetch Latest
            </button>
            <button 
              onClick={() => { resetForm(); setModalOpen(true); }}
              className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-700 flex items-center gap-2 shadow-lg"
            >
              <FaPlus /> Manual Entry
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Manual Archive */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Archive Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-6 border-b bg-gray-50 flex justify-between items-center">
                <h2 className="font-black text-gray-900 uppercase tracking-tighter flex items-center gap-2">
                  <FaStar className="text-yellow-500" /> Permanent Archive
                </h2>
                <span className="text-xs font-bold text-gray-400">{items.length} Items Total</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-gray-100 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-xs font-black text-gray-700 uppercase tracking-wider">Item</th>
                      <th className="px-6 py-4 text-xs font-black text-gray-700 uppercase tracking-wider">Platform</th>
                      <th className="px-6 py-4 text-xs font-black text-gray-700 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-xs font-black text-gray-700 uppercase tracking-wider text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {loading ? (
                      <tr><td colSpan="4" className="px-6 py-12 text-center"><FaSpinner className="animate-spin text-blue-600 text-2xl mx-auto" /></td></tr>
                    ) : items.length === 0 ? (
                      <tr><td colSpan="4" className="px-6 py-12 text-center text-gray-400 font-medium">No archived items yet.</td></tr>
                    ) : items.map((item) => (
                      <tr key={item.id} className="hover:bg-gray-50 group">
                        <td className="px-6 py-4">
                          <div className="text-sm font-black text-gray-900 leading-tight mb-1">{item.title}</div>
                          <div className="text-[10px] text-gray-500 truncate max-w-xs">{item.src}</div>
                        </td>
                        <td className="px-6 py-4">
                          {item.platform === 'youtube' ? 
                            <span className="text-red-600 text-[10px] font-black uppercase flex items-center gap-1"><FaYoutube /> YouTube</span> : 
                            <span className="text-pink-600 text-[10px] font-black uppercase flex items-center gap-1"><FaInstagram /> Instagram</span>
                          }
                        </td>
                        <td className="px-6 py-4">
                          {item.featured ? 
                            <span className="bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded text-[10px] font-black uppercase">Featured</span> : 
                            <span className="text-gray-300 text-[10px] font-black uppercase">Standard</span>
                          }
                        </td>
                        <td className="px-6 py-4 text-right space-x-3">
                          <button onClick={() => handleEdit(item)} className="text-blue-600 hover:text-blue-800"><FaEdit size={16} /></button>
                          <button onClick={() => handleDelete(item.id)} className="text-red-400 hover:text-red-600"><FaTrash size={16} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Live Preview Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
              <h2 className="font-black text-gray-900 uppercase tracking-tighter mb-6 flex items-center gap-2">
                <FaEye className="text-blue-600" /> Archive Preview
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {items.slice(0, 4).map(item => (
                  <GridVideoCard key={item.id} item={item} />
                ))}
              </div>
              <p className="mt-4 text-xs text-gray-400 italic">* Previewing top 4 items from the archive.</p>
            </div>
          </div>

          {/* Right Column: Scraper Results */}
          <div className="space-y-8">
            <div className="bg-gray-900 rounded-2xl shadow-xl overflow-hidden border border-gray-800">
              <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
                <h2 className="font-black text-white uppercase tracking-tighter flex items-center gap-2">
                  <FaSearch className="text-blue-400" /> External Feed
                </h2>
                {scraping && <FaSpinner className="animate-spin text-blue-400" />}
              </div>
              
              <div className="p-6 space-y-6 max-h-[1000px] overflow-y-auto">
                {scrapedItems.length === 0 ? (
                  <div className="text-center py-12">
                    <FaCloudDownloadAlt className="text-gray-700 text-4xl mx-auto mb-4" />
                    <p className="text-gray-500 text-sm font-medium">Click "Fetch Latest" to see videos from your configured channels.</p>
                  </div>
                ) : (
                  scrapedItems.map((scraped, idx) => (
                    <GridVideoCard 
                      key={`${scraped.ytId}-${idx}`} 
                      item={scraped} 
                      isScraped={true} 
                      onFeature={handleFeatureFromScraper} 
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Config Modal */}
      {configModalOpen && (
        <div className="fixed inset-0 z-[10000] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setConfigModalOpen(false)}></div>
            <div className="relative bg-white rounded-3xl shadow-2xl p-10 max-w-lg w-full">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">Feed Channels</h3>
                <button onClick={() => setConfigModalOpen(false)} className="text-gray-400 hover:text-gray-600"><FaTimes size={24} /></button>
              </div>
              <form onSubmit={saveConfig} className="space-y-6">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-3">YouTube Channel URLs (One per line)</label>
                  <textarea 
                    rows="5" 
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 outline-none"
                    placeholder="https://youtube.com/@username"
                    value={config.youtubeChannelUrls.join('\n')}
                    onChange={(e) => setConfig({...config, youtubeChannelUrls: e.target.value.split('\n').filter(l => l.trim())})}
                  ></textarea>
                </div>
                <div className="flex justify-end gap-4 pt-4">
                  <button type="button" onClick={() => setConfigModalOpen(false)} className="px-6 py-2 text-gray-600 font-bold uppercase text-xs tracking-widest">Cancel</button>
                  <button type="submit" disabled={submitting} className="bg-blue-600 text-white px-10 py-3 rounded-full font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg flex items-center gap-2">
                    {submitting ? <FaSpinner className="animate-spin" /> : <FaCheck />} Save Config
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[10000] overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setModalOpen(false)}></div>
            <div className="relative bg-white rounded-3xl shadow-2xl p-10 max-w-xl w-full">
              <div className="flex justify-between items-center mb-8">
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">{editingId ? 'Edit Entry' : 'New Manual Entry'}</h3>
                <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-gray-600"><FaTimes size={24} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-gray-700 uppercase mb-2">Video Title</label>
                    <input required type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 font-bold" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-xs font-black text-gray-700 uppercase mb-2">Platform</label>
                    <select className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 font-bold" value={formData.platform} onChange={(e) => setFormData({...formData, platform: e.target.value})}>
                      <option value="youtube">YouTube</option>
                      <option value="instagram">Instagram Reel</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-700 uppercase mb-2">Source URL</label>
                  <input required type="text" className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 font-bold" value={formData.src} onChange={(e) => setFormData({...formData, src: e.target.value})} placeholder="https://youtube.com/watch?v=..." />
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-black text-gray-700 uppercase mb-2">Aspect Ratio</label>
                    <select className="w-full px-4 py-3 border border-gray-200 rounded-xl text-gray-900 font-bold" value={formData.aspect} onChange={(e) => setFormData({...formData, aspect: e.target.value})}>
                      <option value="16/9">16:9 (Standard)</option>
                      <option value="9/16">9:16 (Short/Reel)</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-3 pt-6">
                    <input type="checkbox" id="feat" className="w-5 h-5 rounded border-gray-300" checked={formData.featured} onChange={(e) => setFormData({...formData, featured: e.target.checked})} />
                    <label htmlFor="feat" className="text-sm font-black text-gray-900 uppercase tracking-tighter">Feature on Home</label>
                  </div>
                </div>
                <div className="flex justify-end gap-4 pt-6">
                  <button type="button" onClick={() => setModalOpen(false)} className="px-6 py-2 text-gray-600 font-bold uppercase text-xs">Cancel</button>
                  <button type="submit" className="bg-blue-600 text-white px-10 py-3 rounded-full font-black uppercase tracking-widest hover:bg-blue-700 shadow-lg flex items-center gap-2">
                    {submitting ? <FaSpinner className="animate-spin" /> : <FaCheck />} Save Entry
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
