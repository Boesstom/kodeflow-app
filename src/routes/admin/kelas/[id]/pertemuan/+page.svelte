<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { supabase } from '$lib/supabaseClient';
  import Navbar from '$lib/components/Navbar.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import MeetingModal from '$lib/components/MeetingModal.svelte';

  let meetings = [];
  let kelas = null;
  let loading = true;
  let error = null;
  let isModalOpen = false;
  let selectedMeeting = null;

  // Pagination state
  let currentPage = 1;
  let pageSize = 10;
  let pageSizeOptions = [5, 10, 25, 50];
  let totalPages = 0;
  let filteredMeetings = [];

  $: kelasId = $page.params.id;

  onMount(async () => {
    await Promise.all([fetchKelas(), fetchMeetings()]);
  });

  async function fetchKelas() {
    try {
      const { data, error } = await supabase
        .from('kelas')
        .select('*, program:program_id(nama)')
        .eq('id', kelasId)
        .single();

      if (error) throw error;
      kelas = data;
    } catch (error) {
      console.error('Error fetching class:', error.message);
    }
  }

  async function fetchMeetings() {
    try {
      const { data, error } = await supabase
        .from('pertemuan')
        .select(`
          *,
          guru:guru_id (id, nama)
        `)
        .eq('kelas_id', kelasId)
        .order('nomor_pertemuan', { ascending: true });

      if (error) throw error;

      meetings = data || [];
      filteredMeetings = meetings;
      updatePagination();
    } catch (error) {
      console.error('Error fetching meetings:', error.message);
    } finally {
      loading = false;
    }
  }

  function updatePagination() {
    totalPages = Math.ceil(filteredMeetings.length / pageSize);
    currentPage = Math.min(currentPage, totalPages) || 1;
  }

  $: paginatedMeetings = filteredMeetings.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  function goToPage(page) {
    currentPage = Math.max(1, Math.min(page, totalPages));
  }

  function handlePageSizeChange(event) {
    pageSize = Number(event.target.value);
    currentPage = 1;
    updatePagination();
  }

  async function handleDelete(meeting) {
    if (confirm('Apakah Anda yakin ingin menghapus pertemuan ini?')) {
      try {
        const { error } = await supabase
          .from('pertemuan')
          .delete()
          .eq('id', meeting.id);

        if (error) throw error;

        meetings = meetings.filter(m => m.id !== meeting.id);
        filteredMeetings = meetings;
        updatePagination();
      } catch (error) {
        console.error('Error deleting meeting:', error.message);
        alert('Gagal menghapus pertemuan. Silakan coba lagi.');
      }
    }
  }

  function openAddModal() {
    selectedMeeting = null;
    isModalOpen = true;
  }

  function openEditModal(meeting) {
    selectedMeeting = meeting;
    isModalOpen = true;
  }

  function handleModalSuccess(event) {
    const { action, meeting } = event.detail;
    if (action === 'create') {
      meetings = [...meetings, meeting];
    } else if (action === 'update') {
      meetings = meetings.map(m => m.id === meeting.id ? meeting : m);
    }
    filteredMeetings = meetings;
    updatePagination();
    isModalOpen = false;
    selectedMeeting = null;
  }

  function getStatusBadgeClass(status) {
    switch (status?.toLowerCase()) {
      case 'selesai':
        return 'bg-green-100 text-green-800';
      case 'berlangsung':
        return 'bg-blue-100 text-blue-800';
      case 'batal':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  }
</script>

<Navbar />
<Sidebar />

<main class="pt-16 ml-16 lg:ml-64 transition-all duration-300">
  <div class="p-6 max-w-7xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Daftar Pertemuan</h1>
        {#if kelas}
          <p class="text-gray-600 mt-1">Kelas: {kelas.nama} - {kelas.program?.nama || '-'}</p>
        {/if}
      </div>
      <button
        on:click={openAddModal}
        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
      >
        Buat Pertemuan
      </button>
    </div>

    <div class="bg-white rounded-lg shadow overflow-hidden">
      {#if loading}
        <div class="p-8 text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p class="mt-4 text-gray-600">Memuat data pertemuan...</p>
        </div>
      {:else}
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ke</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Guru</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tanggal</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Jam</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Materi</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each paginatedMeetings as meeting (meeting.id)}
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {meeting.nomor_pertemuan}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {meeting.guru?.nama || '-'}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {new Date(meeting.tanggal).toLocaleDateString('id-ID')}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {meeting.jam}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <span class={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(meeting.status)}`}>
                      {meeting.status || 'Belum mulai'}
                    </span>
                  </td>
                  <td class="px-6 py-4 text-sm text-gray-900">
                    <div class="max-w-xs truncate">{meeting.materi || '-'}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex items-center space-x-2">
                      <button
                        on:click={() => openEditModal(meeting)}
                        aria-label="Edit pertemuan"
                        class="inline-flex items-center p-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                      <button
                        on:click={() => handleDelete(meeting)}
                        aria-label="Hapus pertemuan"
                        class="inline-flex items-center p-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              {:else}
                <tr>
                  <td colspan="7" class="px-6 py-4 text-center text-gray-500">
                    Tidak ada data pertemuan yang ditemukan
                  </td>
                </tr>
              {/each}
            </tbody>
          </table>

          <!-- Pagination Controls -->
          <div class="px-6 py-4 flex items-center justify-between border-t border-gray-200">
            <div class="flex items-center">
              <select
                value={pageSize}
                on:change={handlePageSizeChange}
                class="border border-gray-300 rounded-md text-sm px-2 py-1 mr-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {#each pageSizeOptions as size}
                  <option value={size}>{size} per halaman</option>
                {/each}
              </select>
              <span class="text-sm text-gray-700">
                Menampilkan {(currentPage - 1) * pageSize + 1} - {Math.min(
                  currentPage * pageSize,
                  filteredMeetings.length
                )} dari {filteredMeetings.length} data
              </span>
            </div>

            <div class="flex items-center space-x-2">
              <button
                on:click={() => goToPage(1)}
                disabled={currentPage === 1}
                class="px-3 py-1 rounded-md text-sm {currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'} border border-gray-300"
              >
                &laquo;
              </button>
              <button
                on:click={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                class="px-3 py-1 rounded-md text-sm {currentPage === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'} border border-gray-300"
              >
                &lsaquo;
              </button>

              <span class="px-3 py-1 text-sm text-gray-700">
                Halaman {currentPage} dari {totalPages}
              </span>

              <button
                on:click={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                class="px-3 py-1 rounded-md text-sm {currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'} border border-gray-300"
              >
                &rsaquo;
              </button>
              <button
                on:click={() => goToPage(totalPages)}
                disabled={currentPage === totalPages}
                class="px-3 py-1 rounded-md text-sm {currentPage === totalPages
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white text-gray-700 hover:bg-gray-50'} border border-gray-300"
              >
                &raquo;
              </button>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</main>

<MeetingModal
  isOpen={isModalOpen}
  meeting={selectedMeeting}
  {kelasId}
  on:success={handleModalSuccess}
  on:close={() => {
    isModalOpen = false;
    selectedMeeting = null;
  }}
/>

<Footer />