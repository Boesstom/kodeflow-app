<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { userRole } from '$lib/stores/authStore';

  let isOpen = false;
  let isDropdownOpen = false;
  let isMobile = false;
  let isCollapsed = false;

  function toggleMenu() {
    isOpen = !isOpen;
  }

  function toggleDropdown() {
    isDropdownOpen = !isDropdownOpen;
  }

  function handleLogout() {
    supabase.auth.signOut();
  }

  onMount(() => {
    const checkMobile = () => {
      isMobile = window.innerWidth < 768;
      if (!isMobile) isOpen = false;
    };

    // Initialize sidebar state from localStorage
    const savedState = localStorage.getItem('sidebarCollapsed');
    if (savedState !== null) {
      isCollapsed = JSON.parse(savedState);
    }

    // Listen for sidebar state changes
    window.addEventListener('storage', (e) => {
      if (e.key === 'sidebarCollapsed') {
        isCollapsed = JSON.parse(e.newValue);
      }
    });

    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
      window.removeEventListener('storage', () => {});
    };
  });
</script>

<nav class="bg-white shadow-lg fixed top-0 right-0 left-0 z-20 transition-all duration-300" class:pl-64={!isCollapsed} class:pl-16={isCollapsed}>
  <div class="max-w-full px-4 sm:px-6 lg:px-8">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between h-16">
      <!-- Logo and App Name -->
      <div class="flex items-center">
        <div class="flex-shrink-0 flex items-center">
          <img class="h-8 w-8" src="/logo-kodeflow.png" alt="KodeFlow Logo" />
          <span class="ml-2 text-xl font-bold text-gray-800">KodeFlow</span>
        </div>
      </div>

      <!-- Desktop Menu -->
      <div class="hidden md:flex items-center space-x-4">
        <!-- Profile Dropdown -->
        <div class="relative">
          <button
            on:click={toggleDropdown}
            class="flex items-center space-x-2 text-gray-700 hover:text-gray-900 focus:outline-none"
          >
            <span>Profile</span>
            <svg
              class="h-5 w-5"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </button>

          {#if isDropdownOpen}
            <div
              class="absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5"
              role="menu"
            >
              <a
                href="/profile"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem">Your Profile</a
              >
              <a
                href="/settings"
                class="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem">Settings</a
              >
            </div>
          {/if}
        </div>

        <!-- Logout Button -->
        <button
          on:click={handleLogout}
          class="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          Logout
        </button>
      </div>

      <!-- Mobile Menu Button -->
      <div class="md:hidden flex items-center">
        <button
          on:click={toggleMenu}
          class="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none"
        >
          <svg
            class="h-6 w-6"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {#if isOpen}
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M6 18L18 6M6 6l12 12"
              />
            {:else}
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M4 6h16M4 12h16M4 18h16"
              />
            {/if}
          </svg>
        </button>
      </div>
    </div>
  </div>

  <!-- Mobile Menu -->
  {#if isOpen}
    <div class="md:hidden">
      <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
        <a
          href="/profile"
          class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
          >Profile</a
        >
        <a
          href="/settings"
          class="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
          >Settings</a
        >
        <button
          on:click={handleLogout}
          class="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:text-red-700 hover:bg-gray-50"
        >
          Logout
        </button>
      </div>
    </div>
  {/if}
</nav>