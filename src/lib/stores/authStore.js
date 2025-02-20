import { writable } from 'svelte/store';
import { supabase } from '$lib/supabaseClient';

export const user = writable(null);
export const userRole = writable(null);

// Navigation items for different roles
export const navigationItems = {
  admin: [
    { label: 'Dashboard', href: '/admin', icon: 'dashboard' },
    { label: 'Courses', href: '/admin/courses', icon: 'school' },
    { label: 'Teachers', href: '/admin/teachers', icon: 'people' },
    { label: 'Students', href: '/admin/students', icon: 'groups' },
    { label: 'Schedules', href: '/admin/schedules', icon: 'calendar_today' }
  ],
  guru: [
    { label: 'Dashboard', href: '/teacher', icon: 'dashboard' },
    { label: 'Schedule', href: '/teacher/schedule', icon: 'calendar_today' },
    { label: 'Materials', href: '/teacher/materials', icon: 'book' }
  ],
  siswa: [
    { label: 'Dashboard', href: '/student', icon: 'dashboard' },
    { label: 'Courses', href: '/student/courses', icon: 'school' },
    { label: 'Quizzes', href: '/student/quizzes', icon: 'quiz' }
  ]
};

// Function to fetch user role from Supabase
export async function fetchUserRole(userId) {
  try {
    const { data, error } = await supabase
      .from('user_role')
      .select('role')
      .eq('user_id', userId)
      .single();

    if (error) throw error;
    
    userRole.set(data.role);
    return data.role;
  } catch (error) {
    console.error('Error fetching user role:', error);
    return null;
  }
}

// Function to initialize auth state
export async function initializeAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session) {
    user.set(session.user);
    await fetchUserRole(session.user.id);
  }

  // Listen for auth state changes
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
      user.set(session.user);
      await fetchUserRole(session.user.id);
    } else if (event === 'SIGNED_OUT') {
      user.set(null);
      userRole.set(null);
    }
  });
}