<script>
  import Navbar from '$lib/components/Navbar.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import Footer from '$lib/components/Footer.svelte';
</script>

<Navbar />
<Sidebar />

<main class="ml-16 lg:ml-64 transition-all duration-300">
  <div class="p-6 max-w-7xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Welcome to KodeFlow</h1>

    <!-- Quick Access Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <h3 class="text-lg font-semibold text-gray-700 mb-2">My Courses</h3>
        <p class="text-gray-600 mb-4">Access your enrolled courses and continue learning</p>
        <a href="/courses" class="text-blue-600 hover:text-blue-700 font-medium">View Courses →</a>
      </div>

      <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Progress Tracker</h3>
        <p class="text-gray-600 mb-4">Track your learning progress and achievements</p>
        <a href="/progress" class="text-blue-600 hover:text-blue-700 font-medium">View Progress →</a>
      </div>

      <div class="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Community</h3>
        <p class="text-gray-600 mb-4">Connect with other learners and share experiences</p>
        <a href="/community" class="text-blue-600 hover:text-blue-700 font-medium">Join Discussion →</a>
      </div>
    </div>

    <!-- Featured Courses -->
    <div class="bg-white rounded-lg shadow p-6 mb-8">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Featured Courses</h2>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div class="border rounded-lg p-4 hover:border-blue-500 transition-colors">
          <h3 class="font-medium text-gray-800">Introduction to Web Development</h3>
          <p class="text-sm text-gray-600 mt-2">Learn the basics of HTML, CSS, and JavaScript</p>
        </div>
        <div class="border rounded-lg p-4 hover:border-blue-500 transition-colors">
          <h3 class="font-medium text-gray-800">Python Programming</h3>
          <p class="text-sm text-gray-600 mt-2">Master Python fundamentals and advanced concepts</p>
        </div>
        <div class="border rounded-lg p-4 hover:border-blue-500 transition-colors">
          <h3 class="font-medium text-gray-800">Data Science Essentials</h3>
          <p class="text-sm text-gray-600 mt-2">Explore data analysis and visualization</p>
        </div>
      </div>
    </div>

    <!-- Recent Activities -->
    <div class="bg-white rounded-lg shadow p-6">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Recent Activities</h2>
      <div class="space-y-4">
        <div class="border-b pb-4">
          <p class="text-gray-800">Completed Module: JavaScript Basics</p>
          <p class="text-sm text-gray-500 mt-1">2 hours ago</p>
        </div>
        <div class="border-b pb-4">
          <p class="text-gray-800">Started New Course: React Fundamentals</p>
          <p class="text-sm text-gray-500 mt-1">1 day ago</p>
        </div>
        <div class="pb-4">
          <p class="text-gray-800">Earned Certificate: HTML & CSS Mastery</p>
          <p class="text-sm text-gray-500 mt-1">3 days ago</p>
        </div>
      </div>
    </div>
  </div>
</main>
<Footer />
<style lang="postcss">
  @reference "tailwindcss/theme";
  :global(html) {
    background-color: theme(--color-gray-100);
  }
</style>