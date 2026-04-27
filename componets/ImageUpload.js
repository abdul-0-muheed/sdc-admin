"use client";

import { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { FaCloudUploadAlt, FaSpinner, FaCheckCircle } from 'react-icons/fa';

export default function ImageUpload({ onUpload, defaultValue, label = "Upload Image" }) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState(defaultValue);
  const [success, setSuccess] = useState(false);

  async function handleUpload(event) {
    try {
      setUploading(true);
      setSuccess(false);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `images/${fileName}`;

      let { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      setPreview(data.publicUrl);
      onUpload(data.publicUrl);
      setSuccess(true);
    } catch (error) {
      alert('Error uploading image: ' + error.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      
      <div className="flex items-center gap-6">
        {preview ? (
          <div className="relative group">
            <img 
              src={preview} 
              alt="Preview" 
              className="w-24 h-24 object-cover rounded-xl border-2 border-blue-100 shadow-sm" 
            />
            {success && (
              <div className="absolute -top-2 -right-2 bg-green-500 text-white rounded-full p-1 shadow-lg">
                <FaCheckCircle size={14} />
              </div>
            )}
          </div>
        ) : (
          <div className="w-24 h-24 rounded-xl border-2 border-dashed border-gray-200 flex items-center justify-center bg-gray-50 text-gray-400">
            <FaCloudUploadAlt size={24} />
          </div>
        )}

        <div className="flex-1">
          <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none transition-colors">
            <span className="inline-flex items-center px-4 py-2 border border-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-50">
              {uploading ? (
                <>
                  <FaSpinner className="animate-spin mr-2" />
                  Uploading...
                </>
              ) : (
                'Select File'
              )}
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="sr-only"
            />
          </label>
          <p className="mt-1 text-xs text-gray-700 font-medium">PNG, JPG, WEBP up to 5MB</p>
        </div>
      </div>
    </div>
  );
}
