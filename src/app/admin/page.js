// app/admin/page.jsx
"use client";

import { useState, useEffect } from 'react';
import { FaUsers, FaCalendarAlt, FaEnvelopeOpenText, FaNewspaper, FaUserGraduate, FaChalkboardTeacher, FaBuilding, FaTools, FaClock, FaSpinner } from 'react-icons/fa';
import { supabase } from '../../../lib/supabaseClient';

export default function DashboardPage() {
  const [isMounted, setIsMounted] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);
  const [newsCount, setNewsCount] = useState(0);
  const [eventsCount, setEventsCount] = useState(0);
  const [upcomingEventsCount, setUpcomingEventsCount] = useState(0);

  useEffect(() => {
    // Mark component as mounted
    setIsMounted(true);
    
    // Fetch data from Supabase
    const fetchData = async () => {
      try {
        // Get current date for filtering upcoming events
        const today = new Date().toISOString().split('T')[0];
        
        // Fetch total news count
        const { count: newsTotal, error: newsError } = await supabase
          .from('news')
          .select('*', { count: 'exact', head: true });
        
        if (newsError) {
          console.error('Error fetching news count:', newsError);
        } else {
          setNewsCount(newsTotal || 0);
        }
        
        // Fetch total events count
        const { count: eventsTotal, error: eventsError } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true });
        
        if (eventsError) {
          console.error('Error fetching events count:', eventsError);
        } else {
          setEventsCount(eventsTotal || 0);
        }
        
        // Fetch upcoming events count
        const { count: upcomingTotal, error: upcomingError } = await supabase
          .from('events')
          .select('*', { count: 'exact', head: true })
          .gte('date', today); // Events with date >= today
        
        if (upcomingError) {
          console.error('Error fetching upcoming events count:', upcomingError);
        } else {
          setUpcomingEventsCount(upcomingTotal || 0);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setDataLoading(false);
      }
    };
    
    fetchData();
  }, []);

  return (
    <main className="bg-gray-50 min-h-screen pt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 font-playfair">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Welcome back, Admin! Here's what's happening at your college today.</p>
          {isMounted && (
            <p className="text-sm text-gray-500 mt-2 flex items-center">
              <FaTools className="mr-2" />
              System Under Development
            </p>
          )}
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-full">
                <FaNewspaper className="text-blue-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total News</p>
                {dataLoading ? (
                  <div className="flex items-center">
                    <FaSpinner className="animate-spin text-gray-400 mr-2" />
                    <p className="text-2xl font-bold text-gray-400">Loading...</p>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{newsCount}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-full">
                <FaCalendarAlt className="text-green-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                {dataLoading ? (
                  <div className="flex items-center">
                    <FaSpinner className="animate-spin text-gray-400 mr-2" />
                    <p className="text-2xl font-bold text-gray-400">Loading...</p>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{eventsCount}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-full">
                <FaClock className="text-yellow-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Upcoming Events</p>
                {dataLoading ? (
                  <div className="flex items-center">
                    <FaSpinner className="animate-spin text-gray-400 mr-2" />
                    <p className="text-2xl font-bold text-gray-400">Loading...</p>
                  </div>
                ) : (
                  <p className="text-2xl font-bold text-gray-900">{upcomingEventsCount}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md border-2 border-dashed border-gray-300">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-full">
                <FaEnvelopeOpenText className="text-purple-600 text-xl" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Callback Requests</p>
                <p className="text-2xl font-bold text-gray-400">--</p>
                <p className="text-xs text-gray-500 mt-1">Building...</p>
              </div>
            </div>
          </div>
        </div>

        {/* Building Process Notice */}
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8 rounded-lg">
          <div className="flex items-center">
            <FaBuilding className="text-yellow-600 text-xl mr-3" />
            <div>
              <h3 className="text-lg font-semibold text-yellow-800">Admission Details</h3>
              <p className="text-yellow-700 mt-1">This section is currently under building process. We're working hard to bring you comprehensive admission management features.</p>
            </div>
          </div>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white p-6 rounded-lg shadow-md border-2 border-dashed border-gray-300">
          <h2 className="text-xl font-bold text-gray-800 mb-4 font-playfair flex items-center">
            <FaTools className="mr-2 text-gray-500" />
            Recent Callback Requests
          </h2>
          <div className="text-center py-8">
            <FaTools className="text-gray-400 text-4xl mx-auto mb-4" />
            <p className="text-gray-500">This section is under development</p>
            <p className="text-sm text-gray-400 mt-2">Callback request management features will be available soon</p>
          </div>
        </div>

        {/* Additional Development Notice */}
        <div className="mt-8 text-center">
          <div className="inline-flex items-center px-4 py-2 bg-blue-50 rounded-lg">
            <FaTools className="text-blue-600 mr-2" />
            <span className="text-blue-700 font-medium">Dashboard features are currently being developed</span>
          </div>
        </div>
      </div>
    </main>
  );
}