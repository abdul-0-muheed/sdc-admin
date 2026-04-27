// components/AuthProvider.js
"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useRouter, usePathname } from 'next/navigation';

const AuthContext = createContext();

// List of protected routes
const protectedRoutes = ['/admin', '/admin/profile', '/admin/content', '/admin/academics', '/admin/students', '/admin/visitors'];

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check active sessions and sets the user
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      setLoading(false);
    };

    getSession();

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Check if current route is protected
  useEffect(() => {
    if (!loading) {
      const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
      const isFacultyUser = user?.email === 'faculty@sdc.com';
      
      if (isProtectedRoute && !user) {
        router.push('/signin');
        return;
      }

      // If faculty user tries to access admin, redirect to onboarding
      if (isFacultyUser && pathname.startsWith('/admin')) {
        router.push('/academics/faculty-onboarding');
        return;
      }
      
      // If user is logged in and tries to access signin page, redirect appropriately
      if (user && pathname === '/signin') {
        if (isFacultyUser) {
          router.push('/academics/faculty-onboarding');
        } else {
          router.push('/admin');
        }
      }
    }
  }, [user, loading, pathname, router]);

  const signIn = async (email, password) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }
    
    // Redirect based on user role
    if (email === 'faculty@sdc.com') {
      router.push('/academics/faculty-onboarding');
    } else {
      router.push('/admin');
    }
    
    return { error: null };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  return useContext(AuthContext);
};