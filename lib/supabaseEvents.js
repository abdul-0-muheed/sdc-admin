// lib/supabaseEvents.js
import { supabase } from './supabaseClient';

// Upload image to Supabase storage
export const uploadImageToSupabase = async (file, folder = 'main') => {
  if (!file) return null;
  
  const fileExt = file.name.split('.').pop();
  const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = `${folder}/${fileName}`;
  
  const { error: uploadError } = await supabase.storage
    .from('events')
    .upload(filePath, file);
  
  if (uploadError) {
    throw uploadError;
  }
  
  const { data } = supabase.storage
    .from('events')
    .getPublicUrl(filePath);
  
  return data.publicUrl;
};

// Fetch all events
export const fetchEvents = async () => {
  try {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('date', { ascending: true });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
};

// Create a new event
export const createEvent = async (eventData) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .insert(eventData);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating event:', error);
    throw error;
  }
};

// Update an existing event
export const updateEvent = async (id, eventData) => {
  try {
    const { data, error } = await supabase
      .from('events')
      .update(eventData)
      .eq('id', id);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating event:', error);
    throw error;
  }
};

// Delete an event
export const deleteEvent = async (id) => {
  try {
    const { error } = await supabase
      .from('events')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting event:', error);
    throw error;
  }
};