<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import Navbar from '$lib/components/Navbar.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import { page } from '$app/stores';

  let meetings = [];
  let loading = true;
  let error = null;
  let currentPage = 1;
  let pageSize = 10;
  let totalMeetings = 0;

  // Get URL parameters
  $: guruId = $page.url.searchParams.get('guru_id');
  $: statusPembayaran = $page.url.searchParams.get('status_pembayaran');

  onMount(async () => {
    await loadMeetings();
  });

  async function loadMeetings() {
    try {
      loading = true;
      error = null;

      // Build the query
      let query = supabase
        .from('pertemuan')
        .select(`
          *,
          kelas:kelas_id(nama),
          guru:guru_id(nama)
        `, { count: 'exact' })
        .order('tanggal', { ascending: false })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

      // Apply filters if they exist
      if (guruId) {
        query = query.eq('guru_id', guruId);
      }
      if (statusPembayaran) {
        query = query.eq('status_pembayaran', statusPembayaran);
      }

      const { data, count, error: err } = await query;

      if (err) throw err;

      meetings = data || [];
      totalMeetings = count || 0;
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

  function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
  }

  $: totalPages = Math.ceil(totalMeetings / pageSize);
  $: startIndex = (currentPage - 1) * pageSize + 1;
  $: endIndex = Math.min(startIndex + pageSize - 1, totalMeetings);

  function changePage(newPage) {
    if (newPage >= 1 && newPage <= totalPages) {
      currentPage = newPage;
      loadMeetings();
    }
  }
</script>

<div class="min-h-screen bg-gray-50">
  <Navbar />
  <Sidebar />

  <main class="lg:pl-64 pt-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-semibold text-gray-900">
          Daftar Pertemuan
          {#if statusPembayaran}
            - Status: {statusPembayaran}
          {/if}
        </h1>
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
        <!-- Meetings Table -->
        <div class="bg-white shadow overflow-hidden sm:rounded-lg">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guru</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Materi</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Gaji</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each meetings as meeting}
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatDate(meeting.tanggal)}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{meeting.guru?.nama || '-'}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{meeting.kelas?.nama || '-'}</td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{meeting.materi || '-'}</td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                      {meeting.status_pembayaran === 'Selesai' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}">
                      {meeting.status_pembayaran}
                    </span>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{formatCurrency(meeting.gaji || 0)}</td>
                </tr>
              {/each}
            </tbody>
          </table>
        </div>

        <!-- Pagination -->
        {#if totalMeetings > 0}
          <div class="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div class="flex-1 flex justify-between sm:hidden">
              <button
                class="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                disabled={currentPage === 1}
                on:click={() => changePage(currentPage - 1)}
              >
                Previous
              </button>
              <button
                class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                disabled={currentPage === totalPages}
                on:click={() => changePage(currentPage + 1)}
              >
                Next
              </button>
            </div>
            <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p class="text-sm text-gray-700">
                  Showing <span class="font-medium">{startIndex}</span> to <span class="font-medium">{endIndex}</span> of{' '}
                  <span class="font-medium">{totalMeetings}</span> results
                </p>
              </div>
              <div>
                <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                  <button
                    class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    disabled={currentPage === 1}
                    on:click={() => changePage(currentPage - 1)}
                  >
                    <span class="sr-only">Previous</span>
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>
                  {#each Array(totalPages) as _, i}
                    <button
                      class="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium
                        {currentPage === i + 1 ? 'text-purple-600 border-purple-500 z-10' : 'text-gray-700 hover:bg-gray-50'}"
                      on:click={() => changePage(i + 1)}
                    >
                      {i + 1}
                    </button>
                  {/each}
                  <button
                    class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50"
                    disabled={currentPage === totalPages}
                    on:click={() => changePage(currentPage + 1)}
                  >
                    <span class="sr-only">Next</span>
                    <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                    </svg>
                  </button>
                </nav>
              </div>
            </div>
          </div>
        {/if}
      {/if}
    </div>
  </main>
</div>