// components/navbar.js
"use client";

import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useAuth } from './AuthProvider';
import Link from 'next/link';

// Updated navigation data for admin panel
const navData = {
  topButtons: [
    { id: 'profile', label: 'Profile', url: '/admin/profile' },
    { id: 'help', label: 'Help', url: '/admin/help' },
    { id: 'logout', label: 'Logout', url: '#' },
  ],
  bottomLinks: [
    { 
      id: 'dashboard', 
      label: 'Dashboard', 
      url: '/admin' 
    },
    { 
      id: 'content', 
      label: 'Content Management', 
      url: '#',
      children: [
        { id: 'content-news', label: 'News Management', url: '/admin/content/news' },
        { id: 'content-events', label: 'Events Management', url: '/admin/content/events' },
        { id: 'content-banners', label: 'Banner/Slider', url: '/admin/content/banners' },
        { id: 'content-pages', label: 'Static Pages', url: '/admin/content/pages' },
        { id: 'content-gallery', label: 'Photo Gallery', url: '/admin/content/gallery' }
      ]
    },
    { 
      id: 'academics', 
      label: 'Academic Management', 
      url: '/admin/academics',
      children: [
        { id: 'academics-programs', label: 'Programs', url: '/admin/academics/programs' },
        { id: 'academics-departments', label: 'Departments', url: '/admin/academics/departments' },
        { id: 'academics-faculty', label: 'Faculty', url: '/admin/academics/faculty' },
        { id: 'academics-calendar', label: 'Academic Calendar', url: '/admin/academics/calendar' },
        { id: 'academics-timetable', label: 'Timetable', url: '/admin/academics/timetable' }
      ]
    },
    { 
      id: 'students', 
      label: 'Student Management', 
      url: '/admin/students',
      children: [
        { id: 'students-admissions', label: 'Admissions', url: '/admin/students/admissions' },
        { id: 'students-enrolled', label: 'Enrolled Students', url: '/admin/students/enrolled' },
        { id: 'students-placements', label: 'Placements', url: '/admin/students/placements' },
        { id: 'students-alumni', label: 'Alumni', url: '/admin/students/alumni' },
        { id: 'students-achievements', label: 'Achievements', url: '/admin/students/achievements' }
      ]
    },
    { 
      id: 'visitors', 
      label: 'Visitor Management', 
      url: '/admin/visitors',
      children: [
        { id: 'visitors-callbacks', label: 'Callback Requests', url: '/admin/visitors/callbacks' },
        { id: 'visitors-contacts', label: 'Contact Submissions', url: '/admin/visitors/contacts' },
        { id: 'visitors-inquiries', label: 'General Inquiries', url: '/admin/visitors/inquiries' },
      ]
    },
  ],
};

// Desktop Dropdown component
const DesktopDropdown = ({ item, topDivHidden }) => {
  return (
    <div className="relative group">
      <a
        href={item.url}
        className={`${topDivHidden ? 'text-base' : 'text-lg'} font-medium transition-colors duration-300 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:transition-all after:duration-300 hover:after:w-full tracking-wide font-playfair flex items-center hover:text-blue-600 after:bg-blue-600`}
        style={{ color: '#5B3FFF' }}
      >
        {item.label}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="ml-1 h-4 w-4 transition-colors duration-300"
          style={{ color: '#5B3FFF' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </a>

      {/* Enhanced Dropdown Menu */}
      <div className="absolute left-0 mt-2 w-56 bg-white text-gray-800 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform group-hover:translate-y-0 translate-y-2 z-50 overflow-hidden">
        <div className="py-2">
          {item.children.map((child) => (
            <a
              key={child.id}
              href={child.url}
              className="flex items-center px-5 py-3 text-sm font-medium text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all duration-200 font-inter group"
            >
              <span className="flex-1">{child.label}</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-1"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

// Mobile Dropdown component
const MobileDropdown = ({ item, isOpen, toggle }) => {
  return (
    <div className="w-full border-b border-gray-100 last:border-b-0">
      <button
        onClick={() => toggle(item.id)}
        className="flex items-center justify-between w-full py-3 text-left text-lg font-medium transition-colors duration-300 font-playfair hover:text-blue-600"
        style={{ color: '#5B3FFF' }}
      >
        <span>{item.label}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`h-5 w-5 transition-transform duration-300 ${isOpen ? 'rotate-180 text-blue-600' : ''}`}
          style={{ color: isOpen ? '#482FCC' : '#5B3FFF' }}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="pl-4 mt-2 mb-3 space-y-1 transition-all duration-300">
          {item.children.map((child) => (
            <a
              key={child.id}
              href={child.url}
              className="block py-2.5 px-4 text-base font-medium text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200 font-inter"
            >
              {child.label}
            </a>
          ))}
        </div>
      )}
    </div>
  );
};

// Desktop Navbar Component
function DesktopNavbar({ topDivHidden, user, signOut }) {
  return (
    <nav className="hidden md:block fixed w-full z-[9999] transition-all duration-500 ease-in-out bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className={`px-3 flex items-center justify-between transition-all duration-500 ease-in-out ${topDivHidden ? 'py-2' : 'py-3'}`}>
          {/* Left Section - Logo with Admin text */}
          <div className="flex items-center">
            <Link href="/admin" className="flex items-center">
              <img 
                src='/sdc-logo.png' 
                alt='logo' 
                className={`${topDivHidden ? 'w-10 h-10' : 'w-16 h-16'} transition-all duration-500 ease-in-out transform ${topDivHidden ? 'scale-90' : 'scale-100'} object-contain`}
              />
              <div className="flex items-center ml-3">
                <span className="mx-2" style={{ color: '#5B3FFF' }}>|</span>
                <span className="text-xl font-bold font-playfair" style={{ color: '#5B3FFF' }}>Admin</span>
              </div>
            </Link>
          </div>

          {/* Right Section - Contains Top and Bottom Navigation */}
          <div className="flex-1 flex flex-col items-end pl-6">
            {/* Top Navigation - Hidden after full screen scroll */}
            <div className={`pt-1 pb-2 flex items-center justify-end space-x-6 transition-all duration-500 ease-in-out transform ${topDivHidden ? 'opacity-0 -translate-y-4 h-0 overflow-hidden' : 'opacity-100 translate-y-0'}`}>
              {/* Top Buttons */}
              <div className="hidden md:flex flex-wrap gap-6">
                {user ? (
                  <>
                    {navData.topButtons.slice(0, 2).map((button) => (
                      <Link
                        key={button.id}
                        href={button.url}
                        className="text-sm font-light transition-colors duration-300 tracking-wider font-montserrat uppercase hover:text-blue-600"
                        style={{ color: '#5B3FFF' }}
                      >
                        {button.label}
                      </Link>
                    ))}
                    <button
                      onClick={signOut}
                      className="text-sm font-light transition-colors duration-300 tracking-wider font-montserrat uppercase hover:text-blue-600"
                      style={{ color: '#5B3FFF' }}
                    >
                      Logout
                    </button>
                  </>
                ) : (
                  <Link
                    href="/signin"
                    className="text-sm font-light transition-colors duration-300 tracking-wider font-montserrat uppercase hover:text-blue-600"
                    style={{ color: '#5B3FFF' }}
                  >
                    Sign In
                  </Link>
                )}
              </div>
            </div>

            {/* Line between top and bottom sections */}
            <div className={`relative w-full transition-all duration-500 ease-in-out ${topDivHidden ? 'opacity-0 h-0' : 'opacity-100'}`}>
              <div className="absolute right-0 top-0 h-px w-[70%] transition-all duration-500 ease-in-out" style={{ backgroundColor: '#E9EDF5' }}></div>
            </div>

            {/* Bottom Navigation */}
            <div className={`flex m-3 items-center justify-end transition-all duration-500 ease-in-out ${topDivHidden ? 'py-1' : 'py-2'}`}>
              {user ? (
                <div className="hidden md:flex space-x-8">
                  {navData.bottomLinks.map((link) => (
                    link.children ? (
                      <DesktopDropdown key={link.id} item={link} topDivHidden={topDivHidden} />
                    ) : (
                      <Link
                        key={link.id}
                        href={link.url}
                        className={`${topDivHidden ? 'text-base' : 'text-lg'} font-medium transition-colors duration-300 relative after:content-[''] after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:transition-all after:duration-300 hover:after:w-full tracking-wide font-playfair hover:text-blue-600 after:bg-blue-600`}
                        style={{ color: '#5B3FFF' }}
                      >
                        {link.label}
                      </Link>
                    )
                  ))}
                </div>
              ) : (
                <div className="text-sm" style={{ color: '#222222' }}>
                  Please sign in to access admin features
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

// Mobile Navbar Component
function MobileNavbar({ topDivHidden, user, signOut }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);

  const toggleDropdown = (id) => {
    setOpenDropdown(openDropdown === id ? null : id);
  };

  return (
    <nav className="md:hidden fixed w-full z-[9999] transition-all duration-500 ease-in-out bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className={`px-3 flex items-center justify-between transition-all duration-500 ease-in-out ${topDivHidden ? 'py-2' : 'py-3'}`}>
          {/* Logo with Admin text */}
          <div className="flex items-center">
            <Link href="/admin" className="flex items-center">
              <img 
                src='/sdc-logo.png' 
                alt='logo' 
                className={`${topDivHidden ? 'w-10 h-10' : 'w-16 h-16'} transition-all duration-500 ease-in-out transform ${topDivHidden ? 'scale-90' : 'scale-100'} object-contain`}
              />
              <div className="flex items-center ml-2">
                <span className="text-lg font-bold font-playfair" style={{ color: '#5B3FFF' }}>Admin</span>
                <span className="mx-1" style={{ color: '#5B3FFF' }}>|</span>
              </div>
            </Link>
          </div>

          {/* Right Section - Search and Menu Button */}
          <div className="flex items-center">
            {/* Mobile Menu Button */}
            <button
              className="transition-all duration-300 p-2"
              style={{ color: '#5B3FFF' }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className={`h-6 w-6 transition-all duration-500 ease-in-out ${topDivHidden ? 'scale-90' : 'scale-100'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="py-4 border-t" style={{ borderColor: '#E9EDF5' }}>
            {user ? (
              <div className="flex flex-col space-y-2">
                {navData.bottomLinks.map((link) => (
                  link.children ? (
                    <MobileDropdown
                      key={link.id}
                      item={link}
                      isOpen={openDropdown === link.id}
                      toggle={toggleDropdown}
                    />
                  ) : (
                    <Link
                      key={link.id}
                      href={link.url}
                      className="text-lg font-medium transition-colors duration-300 py-2 tracking-wide font-playfair hover:text-blue-600"
                      style={{ color: '#5B3FFF' }}
                    >
                      {link.label}
                    </Link>
                  )
                ))}
                <div className="pt-2 mt-2 border-t" style={{ borderColor: '#E9EDF5' }}>
                  {navData.topButtons.slice(0, 2).map((button) => (
                    <Link
                      key={button.id}
                      href={button.url}
                      className="block py-2 text-sm font-light transition-colors duration-300 tracking-wider font-montserrat uppercase hover:text-blue-600"
                      style={{ color: '#5B3FFF' }}
                    >
                      {button.label}
                    </Link>
                  ))}
                  <button
                    onClick={signOut}
                    className="block py-2 text-sm font-light transition-colors duration-300 tracking-wider font-montserrat uppercase hover:text-blue-600 text-left"
                    style={{ color: '#5B3FFF' }}
                  >
                    Logout
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col space-y-2">
                <div className="py-2 text-sm" style={{ color: '#222222' }}>
                  Please sign in to access admin features
                </div>
                <Link
                  href="/signin"
                  className="py-2 text-sm font-light transition-colors duration-300 tracking-wider font-montserrat uppercase hover:text-blue-600"
                  style={{ color: '#5B3FFF' }}
                >
                  Sign In
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}

export default function Navbar() {
  const [topDivHidden, setTopDivHidden] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { user, signOut } = useAuth();

  // Handle scroll event to hide top div
  useEffect(() => {
    // Mark component as mounted
    setIsMounted(true);
    
    const handleScroll = () => {
      // Set topDivHidden state when scrolled past full screen
      if (window.scrollY > 50) {
        setTopDivHidden(true);
      } else {
        setTopDivHidden(false);
      }
    };

    // Only add event listener and check scroll position after component mounts
    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial scroll position
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // During server rendering and initial client render, use default values
  // to prevent hydration mismatch
  if (!isMounted) {
    return (
      <>
        <Head>
          <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Montserrat:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
        </Head>
        <DesktopNavbar topDivHidden={false} user={null} signOut={() => {}} />
        <MobileNavbar topDivHidden={false} user={null} signOut={() => {}} />
      </>
    );
  }

  return (
    <>
      <Head>
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;700&family=Montserrat:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600&display=swap" rel="stylesheet" />
      </Head>
      <DesktopNavbar topDivHidden={topDivHidden} user={user} signOut={signOut} />
      <MobileNavbar topDivHidden={topDivHidden} user={user} signOut={signOut} />
    </>
  );
}