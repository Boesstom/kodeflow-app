<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import Navbar from '$lib/components/Navbar.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';

  let meetings = [];
  let loading = true;
  let error = null;
  let viewType = 'list'; // 'list' or 'calendar'
  let currentDate = new Date();
  let daysInMonth = [];

  $: {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const totalDays = lastDay.getDate();
    
    daysInMonth = Array.from({ length: startPadding }, () => null)
      .concat(Array.from({ length: totalDays }, (_, i) => i + 1));
  }

  function getMonthName(date) {
    return date.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  }

  function getMeetingsForDate(date) {
    return meetings.filter(meeting => {
      const meetingDate = new Date(meeting.tanggal);
      return meetingDate.getDate() === date &&
             meetingDate.getMonth() === currentDate.getMonth() &&
             meetingDate.getFullYear() === currentDate.getFullYear();
    });
  }

  function previousMonth() {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1);
  }

  function nextMonth() {
    currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1);
  }

  onMount(async () => {
    await loadMeetings();
  });

  async function loadMeetings() {
    try {
      loading = true;
      error = null;

      const { data, error: err } = await supabase
        .from('pertemuan')
        .select(`
          *,
          kelas:kelas_id(nama),
          guru:guru_id(nama)
        `)
        .order('tanggal', { ascending: true });

      if (err) throw err;

      meetings = data || [];
    } catch (e) {
      console.error('Error loading meetings:', e);
      error = e.message;
    } finally {
      loading = false;
    }
  }

  function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  function formatTime(timeString) {
    return timeString ? timeString.slice(0, 5) : '-';
  }

  function toggleView() {
    viewType = viewType === 'list' ? 'calendar' : 'list';
  }
</script>

<div class="min-h-screen bg-gray-50">
  <Navbar />
  <Sidebar />

  <main class="lg:pl-64 pt-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8 flex justify-between items-center">
        <h1 class="text-2xl font-semibold text-gray-900">Jadwal Pertemuan</h1>
        <button
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
          on:click={toggleView}
        >
          {viewType === 'list' ? 'Tampilan Kalender' : 'Tampilan List'}
        </button>
      </div>

      <!-- Error Display -->
      {#if error}
        <div class="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      {/if}

      <!-- Loading State -->
      {#if loading}
        <div class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
        </div>
      {:else}
        {#if viewType === 'list'}
          <!-- List View -->
          <div class="bg-white shadow overflow-hidden sm:rounded-lg">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jam</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guru</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Materi</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                {#each meetings as meeting}
                  <tr>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(meeting.tanggal)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatTime(meeting.jam)}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{meeting.kelas?.nama || '-'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{meeting.guru?.nama || '-'}</td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{meeting.materi || '-'}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                        {meeting.status === 'selesai' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                        {meeting.status || 'belum'}
                      </span>
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        {:else}
          <!-- Calendar View -->
          <div class="bg-white shadow overflow-hidden sm:rounded-lg p-4">
            <div class="flex justify-between items-center mb-4">
              <button
                class="p-2 rounded-md hover:bg-gray-100"
                on:click={previousMonth}
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 class="text-lg font-semibold text-gray-900">{getMonthName(currentDate)}</h2>
              <button
                class="p-2 rounded-md hover:bg-gray-100"
                on:click={nextMonth}
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div class="grid grid-cols-7 gap-4">
              {#each ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'] as day}
                <div class="text-center font-semibold text-gray-600 text-sm py-2">{day}</div>
              {/each}
              {#each daysInMonth as day}
                <div class="min-h-[100px] p-2 border border-gray-200 relative {day ? '' : 'bg-gray-50'}">
                  {#if day}
                    <span class="text-sm text-gray-500">{day}</span>
                    {#each getMeetingsForDate(day) as meeting}
                      <div class="mt-1 p-1 text-xs bg-purple-100 rounded truncate">
                        <div class="font-semibold">{formatTime(meeting.jam)}</div>
                        <div class="truncate">{meeting.kelas?.nama || '-'}</div>
                      </div>
                    {/each}
                  {/if}
                </div>
              {/each}
            </div>
          </div>
        {/if}
      {/if}
    </div>
  </main>
</div>