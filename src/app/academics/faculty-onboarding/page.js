"use client";

import { useState, useEffect } from 'react';
import { supabase } from '../../../../lib/supabaseClient';
import { useAuth } from '../../../../componets/AuthProvider';
import { FaUserPlus, FaCheck, FaSpinner, FaChalkboardTeacher, FaTimes } from 'react-icons/fa';
import ImageUpload from '../../../../componets/ImageUpload';
import { useRouter } from 'next/navigation';

export default function FacultyOnboarding() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    role: '',
    department: 'BCA',
    image_src: '',
    bio: '',
    featured: false
  });

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signin');
    }
  }, [user, authLoading, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    try {
      setSubmitting(true);
      const { error } = await supabase
        .from('faculty')
        .insert([formData]);
      
      if (error) throw error;
      setSubmitted(true);
      resetForm();
    } catch (error) {
      alert('Error submitting form: ' + error.message);
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setFormData({
      name: '',
      role: '',
      department: 'BCA',
      image_src: '',
      bio: '',
      featured: false
    });
  }

  if (authLoading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><FaSpinner className="animate-spin text-blue-600 text-4xl" /></div>;

  if (submitted) {
    return (
      <main className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-10 text-center border border-gray-100">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FaCheck className="text-green-600 text-3xl" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 mb-4">Submission Successful!</h1>
          <p className="text-gray-600 mb-8 font-medium">Thank you for joining SDC. Your faculty profile has been created and is now awaiting administrative review.</p>
          <button 
            onClick={() => setSubmitted(false)}
            className="w-full bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-700 transition-all shadow-xl shadow-blue-200"
          >
            Submit Another Response
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 pt-20 pb-20 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
          {/* Header */}
          <div className="bg-blue-600 px-8 py-10 text-white relative">
            <div className="relative z-10">
              <h1 className="text-4xl font-black flex items-center gap-4 mb-2 text-white">
                <FaChalkboardTeacher />
                Faculty Onboarding
              </h1>
              <p className="text-blue-100 text-lg font-medium">Welcome to the SDC Academic Team. Please provide your profile details below.</p>
            </div>
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <FaUserPlus size={150} />
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 md:p-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {/* Left Column */}
              <div className="space-y-8">
                <section>
                  <h3 className="text-xs font-black text-gray-700 uppercase tracking-widest mb-6 border-b border-gray-200 pb-2">Profile Information</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-1">Full Name</label>
                      <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none font-bold text-gray-900 transition-all" placeholder="Dr. John Doe" />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-1">Role / Designation</label>
                      <input required type="text" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none font-bold text-gray-900 transition-all" placeholder="Assistant Professor" />
                    </div>
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-1">Department</label>
                      <select 
                        value={formData.department === 'BCA' || formData.department === 'BBA' || formData.department === 'BCOM' ? formData.department : 'Other'} 
                        onChange={(e) => {
                          const val = e.target.value;
                          if (val === 'Other') {
                            setFormData({...formData, department: ''});
                          } else {
                            setFormData({...formData, department: val});
                          }
                        }} 
                        className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none font-bold text-gray-900 transition-all"
                      >
                        <option value="BCA">BCA</option>
                        <option value="BBA">BBA</option>
                        <option value="BCOM">BCOM</option>
                        <option value="Other">Other / Custom</option>
                      </select>
                    </div>

                    {!(formData.department === 'BCA' || formData.department === 'BBA' || formData.department === 'BCOM') && (
                      <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                        <label className="block text-sm font-black text-gray-900 mb-1">Specify Department</label>
                        <input 
                          required 
                          type="text" 
                          value={formData.department} 
                          onChange={(e) => setFormData({...formData, department: e.target.value})} 
                          className="w-full px-4 py-3 border border-blue-300 bg-blue-50 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none font-bold text-gray-900 transition-all" 
                          placeholder="Enter department name" 
                        />
                      </div>
                    )}
                  </div>
                </section>
              </div>

              {/* Right Column */}
              <div className="space-y-8">
                <section>
                  <h3 className="text-xs font-black text-gray-700 uppercase tracking-widest mb-6 border-b border-gray-200 pb-2">Visual & Bio</h3>
                  <div className="space-y-6">
                    <ImageUpload label="Profile Portrait (Square/Vertical)" defaultValue={formData.image_src} onUpload={(url) => setFormData({...formData, image_src: url})} />
                    <div>
                      <label className="block text-sm font-black text-gray-900 mb-1">Short Biography</label>
                      <textarea rows="5" value={formData.bio} onChange={(e) => setFormData({...formData, bio: e.target.value})} className="w-full px-4 py-3 border border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-100 outline-none font-bold text-gray-900 transition-all" placeholder="Tell us about your research interests, publications, or teaching philosophy..."></textarea>
                    </div>
                  </div>
                </section>
              </div>
            </div>

            {/* Footer */}
            <div className="mt-12 pt-10 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-6">
              <p className="text-sm text-gray-500 font-medium italic">All submitted information will be reviewed by the administration before going live.</p>
              <button 
                type="submit" 
                disabled={submitting}
                className="w-full sm:w-auto bg-blue-600 text-white px-12 py-4 rounded-2xl font-black uppercase tracking-[0.2em] shadow-2xl shadow-blue-200 hover:bg-blue-700 hover:-translate-y-1 transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {submitting ? <FaSpinner className="animate-spin" /> : <FaCheck />}
                {submitting ? 'Submitting...' : 'Submit Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
