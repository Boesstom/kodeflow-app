<script>
  import { onMount } from 'svelte';
  import { userRole } from '$lib/stores/authStore';
  import NavLink from './NavLink.svelte';

  let isCollapsed = false;

  function toggleSidebar() {
    isCollapsed = !isCollapsed;
  }

  onMount(() => {
    // Initialize from localStorage if available
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      isCollapsed = JSON.parse(savedState);
    }
  });

  $: {
    // Save state to localStorage when it changes
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebarCollapsed', JSON.stringify(isCollapsed));
    }
  }
</script>

<div class="h-screen fixed left-0 top-0 z-30 transition-all duration-300 ease-in-out flex flex-col bg-white border-r border-gray-200"
     class:w-64={!isCollapsed}
     class:w-16={isCollapsed}>
  
  <!-- Toggle Button -->
  <button
    on:click={toggleSidebar}
    class="absolute -right-3 top-16 bg-white border border-gray-200 rounded-full p-1.5 hover:bg-gray-100 transition-colors duration-200"
    aria-label="Toggle sidebar"
  >
    <svg
      xmlns="http://www.w3.org/2000/svg"
      class="h-4 w-4 text-gray-600 transition-transform duration-300"
      class:rotate-180={isCollapsed}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
    >
      <path
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="2"
        d="M15 19l-7-7 7-7"
      />
    </svg>
  </button>

  <!-- Sidebar Content -->
  <div class="flex-1 overflow-y-auto py-4">
    <div class="px-3 mb-6">
      <img
        src="/logo-kodeflow.png"
        alt="KodeFlow Logo"
        class="h-8 w-8 mx-auto"
      />
    </div>

    <!-- Navigation Links -->
    <nav class="space-y-1 px-2">
      <!-- Admin Navigation -->
      <NavLink
        href="/admin"
        icon="<svg xmlns='http://www.w3.org/2000/svg' class='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' /></svg>"
        label="Dashboard"
        {isCollapsed}
        allowedRoles={['admin']}
      />

      <NavLink
        href="/program"
        icon="<svg xmlns='http://www.w3.org/2000/svg' class='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' /></svg>"
        label="Program"
        {isCollapsed}
        allowedRoles={['admin']}
      />

      <NavLink
        href="/guru"
        icon="<svg xmlns='http://www.w3.org/2000/svg' class='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z' /></svg>"
        label="Guru"
        {isCollapsed}
        allowedRoles={['admin']}
      />

      <NavLink
        href="/admin/students"
        icon="<svg xmlns='http://www.w3.org/2000/svg' class='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' /></svg>"
        label="Peserta"
        {isCollapsed}
        allowedRoles={['admin']}
      />

      <NavLink
        href="/admin/schedules"
        icon="<svg xmlns='http://www.w3.org/2000/svg' class='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' /></svg>"
        label="Jadwal"
        {isCollapsed}
        allowedRoles={['admin']}
      />

      <!-- Teacher Navigation -->
      <NavLink
        href="/teacher"
        icon="<svg xmlns='http://www.w3.org/2000/svg' class='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' /></svg>"
        label="Dashboard"
        {isCollapsed}
        allowedRoles={['guru']}
      />

      <NavLink
        href="/teacher/schedule"
        icon="<svg xmlns='http://www.w3.org/2000/svg' class='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' /></svg>"
        label="Schedule"
        {isCollapsed}
        allowedRoles={['guru']}
      />

      <NavLink
        href="/teacher/materials"
        icon="<svg xmlns='http://www.w3.org/2000/svg' class='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' /></svg>"
        label="Materials"
        {isCollapsed}
        allowedRoles={['guru']}
      />

      <!-- Student Navigation -->
      <NavLink
        href="/student"
        icon="<svg xmlns='http://www.w3.org/2000/svg' class='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' /></svg>"
        label="Dashboard"
        {isCollapsed}
        allowedRoles={['siswa']}
      />

      <NavLink
        href="/student/courses"
        icon="<svg xmlns='http://www.w3.org/2000/svg' class='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z' /></svg>"
        label="Projects"
        {isCollapsed}
        allowedRoles={['siswa']}
      />

      <!-- Settings (available for all roles) -->
      <NavLink
        href="/settings"
        icon="<svg xmlns='http://www.w3.org/2000/svg' class='h-5 w-5' fill='none' viewBox='0 0 24 24' stroke='currentColor'><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z' /><path stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M15 12a3 3 0 11-6 0 3 3 0 016 0z' /></svg>"
        label="Settings"
        {isCollapsed}
        allowedRoles={['admin', 'guru', 'siswa']}
      />
    </nav>
  </div>
</div>