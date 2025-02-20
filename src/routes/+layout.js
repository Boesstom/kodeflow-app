import { supabase } from '$lib/supabaseClient';
import { redirect } from '@sveltejs/kit';
import { initializeAuth, userRole } from '$lib/stores/authStore';
import { get } from 'svelte/store';

export const load = async ({ url }) => {
  const { data: { session } } = await supabase.auth.getSession();

  // List of public and protected routes
  const publicRoutes = ['/login', '/register', '/forgot-password'];
  const protectedRoutes = ['/profile'];
  const isPublicRoute = publicRoutes.some(route => url.pathname.startsWith(route));
  const isProtectedRoute = protectedRoutes.some(route => url.pathname.startsWith(route));

  // Handle public routes
  if (session && isPublicRoute && url.pathname !== '/login' && url.pathname !== '/logout') {
    throw redirect(303, '/');
  }

  // Initialize auth state if session exists
  if (session) {
    if (!get(userRole)) {
      await initializeAuth();
    }
    const role = get(userRole);

    // Role-based route protection
    if (role) {
      const adminRoutes = ['/admin'];
      const teacherRoutes = ['/teacher'];
      const studentRoutes = ['/student'];
      const isAdminRoute = adminRoutes.some(route => url.pathname.startsWith(route));
      const isTeacherRoute = teacherRoutes.some(route => url.pathname.startsWith(route));
      const isStudentRoute = studentRoutes.some(route => url.pathname.startsWith(route));

      if (isAdminRoute && role !== 'admin') {
        throw redirect(303, `/${role}`);
      }
      if (isTeacherRoute && role !== 'guru') {
        throw redirect(303, `/${role}`);
      }
      if (isStudentRoute && role !== 'siswa') {
        throw redirect(303, `/${role}`);
      }

      // Redirect to role-specific dashboard if on root path
      if (url.pathname === '/') {
        if (role === 'admin') throw redirect(303, '/admin');
        if (role === 'guru') throw redirect(303, '/teacher');
        if (role === 'siswa') throw redirect(303, '/student');
      }
    }
  } else if (!isPublicRoute && !isProtectedRoute) {
    // Only redirect to login if not on a public route and no session
    throw redirect(303, '/login');
  }

  return {
    session
  };
};