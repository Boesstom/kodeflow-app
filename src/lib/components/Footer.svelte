<script>
  import { onMount } from 'svelte';
  let isCollapsed = false;
  const currentYear = new Date().getFullYear();
  onMount(() => {
    // Initialize from localStorage if available
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

    return () => {
      window.removeEventListener('storage', () => {});
    };
  });
</script>

<footer class="bg-white border-t border-gray-200 transition-all duration-300 fixed bottom-0 z-10 w-full" style="left: {isCollapsed ? '4rem' : '16rem'}; right: 0;">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
    <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
      <div class="text-sm text-gray-500">
        © {currentYear} KodeFlow. All rights reserved.
      </div>
      <div class="flex space-x-6">
        <a
          href="/terms"
          class="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200"
        >
          Ketentuan Layanan
        </a>
        <a
          href="/privacy"
          class="text-sm text-gray-500 hover:text-gray-900 transition-colors duration-200"
        >
          Kebijakan Privasi
        </a>
      </div>
    </div>
  </div>
</footer>