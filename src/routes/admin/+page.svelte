<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import Navbar from '$lib/components/Navbar.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import Footer from '$lib/components/Footer.svelte';

  let stats = {
    totalCourses: 0,
    totalTeachers: 0,
    totalStudents: 0
  };

  let recentNotifications = [];
  let loading = true;
  let viewType = 'list'; // 'list' or 'calendar'
  let schedules = [];

  function toggleView() {
    viewType = viewType === 'list' ? 'calendar' : 'list';
  }

  onMount(async () => {
    // Simulated data loading
    // TODO: Replace with actual data fetching from Supabase
    setTimeout(() => {
      stats = {
        totalCourses: 25,
        totalTeachers: 12,
        totalStudents: 150
      };
      recentNotifications = [
        { id: 1, message: 'New course added: Introduction to JavaScript', time: '2 hours ago' },
        { id: 2, message: 'Student enrollment increased by 15%', time: '5 hours ago' },
        { id: 3, message: 'New teacher registration: Sarah Johnson', time: '1 day ago' }
      ];
      schedules = [
        { id: 1, title: 'Introduction to JavaScript', instructor: 'John Doe', date: '2024-01-15', time: '09:00-11:00', room: 'Room 101' },
        { id: 2, title: 'Web Development Basics', instructor: 'Jane Smith', date: '2024-01-15', time: '13:00-15:00', room: 'Room 102' },
        { id: 3, title: 'Python Programming', instructor: 'Mike Johnson', date: '2024-01-16', time: '10:00-12:00', room: 'Room 103' }
      ];
      loading = false;
    }, 1000);
  });
</script>

<Navbar />
<Sidebar />

<main class="ml-16 lg:ml-64 transition-all duration-300">
  <div class="p-6 max-w-7xl mx-auto">
    <h1 class="text-3xl font-bold text-gray-900 mb-8">Admin Dashboard</h1>

    <!-- Statistics Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Total Courses</h3>
        {#if loading}
          <div class="animate-pulse h-8 bg-gray-200 rounded w-24"></div>
        {:else}
          <p class="text-3xl font-bold text-blue-600">{stats.totalCourses}</p>
        {/if}
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Total Teachers</h3>
        {#if loading}
          <div class="animate-pulse h-8 bg-gray-200 rounded w-24"></div>
        {:else}
          <p class="text-3xl font-bold text-green-600">{stats.totalTeachers}</p>
        {/if}
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-semibold text-gray-700 mb-2">Total Students</h3>
        {#if loading}
          <div class="animate-pulse h-8 bg-gray-200 rounded w-24"></div>
        {:else}
          <p class="text-3xl font-bold text-purple-600">{stats.totalStudents}</p>
        {/if}
      </div>
    </div>

    <!-- Activity Chart Placeholder -->
    <div class="bg-white rounded-lg shadow p-6 mb-8">
      <h2 class="text-xl font-semibold text-gray-800 mb-4">Activity Overview</h2>
      <div class="h-64 bg-gray-50 rounded flex items-center justify-center">
        <p class="text-gray-500">Chart will be implemented here</p>
      </div>
    </div>

    <!-- Notifications and Schedule Grid Container -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <!-- Recent Notifications -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-6">
          <h2 class="text-xl font-semibold text-gray-800 mb-4">Recent Notifications</h2>
          {#if loading}
            <div class="space-y-4">
              {#each Array(3) as _}
                <div class="animate-pulse flex space-x-4">
                  <div class="flex-1 space-y-2 py-1">
                    <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div class="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <div class="divide-y divide-gray-200">
              {#each recentNotifications as notification (notification.id)}
                <div class="py-4">
                  <p class="text-gray-800">{notification.message}</p>
                  <p class="text-sm text-gray-500 mt-1">{notification.time}</p>
                </div>
              {/each}
            </div>
          {/if}
        </div>
      </div>

      <!-- Schedule Section -->
      <div class="bg-white rounded-lg shadow">
        <div class="p-6">
          <div class="flex justify-between items-center mb-6">
            <h2 class="text-2xl font-semibold text-gray-900">Schedule</h2>
            <button
              on:click={toggleView}
              class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              {viewType === 'list' ? 'Switch to Calendar' : 'Switch to List'}
            </button>
          </div>

          {#if loading}
            <div class="flex justify-center items-center h-64">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          {:else}
            {#if viewType === 'list'}
              <!-- List View -->
              <div class="overflow-x-auto">
                <table class="min-w-full divide-y divide-gray-200">
                  <thead class="bg-gray-50">
                    <tr>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Instructor</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                      <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Room</th>
                    </tr>
                  </thead>
                  <tbody class="bg-white divide-y divide-gray-200">
                    {#each schedules as schedule}
                      <tr>
                        <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{schedule.title}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{schedule.instructor}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{schedule.date}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{schedule.time}</td>
                        <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{schedule.room}</td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            {:else}
              <!-- Calendar View -->
              <div class="grid grid-cols-7 gap-2">
                <div class="text-center font-semibold p-2 bg-gray-50">Sun</div>
                <div class="text-center font-semibold p-2 bg-gray-50">Mon</div>
                <div class="text-center font-semibold p-2 bg-gray-50">Tue</div>
                <div class="text-center font-semibold p-2 bg-gray-50">Wed</div>
                <div class="text-center font-semibold p-2 bg-gray-50">Thu</div>
                <div class="text-center font-semibold p-2 bg-gray-50">Fri</div>
                <div class="text-center font-semibold p-2 bg-gray-50">Sat</div>
                
                {#each Array(35) as _, i}
                  <div class="border p-2 min-h-[100px] relative">
                    <span class="text-sm text-gray-500">{i + 1}</span>
                    {#each schedules.filter(s => new Date(s.date).getDate() === (i + 1)) as schedule}
                      <div class="mt-1 p-1 text-xs bg-blue-100 text-blue-800 rounded">
                        {schedule.title}
                      </div>
                    {/each}
                  </div>
                {/each}
              </div>
            {/if}
          {/if}
        </div>
      </div>
    </div>
  </div>
</main>
<Footer />