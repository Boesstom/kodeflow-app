<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import Navbar from '$lib/components/Navbar.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import Footer from '$lib/components/Footer.svelte';
  import ClassModal from '$lib/components/ClassModal.svelte';

  let classes = [];
  let loading = true;
  let searchQuery = '';
  let filteredClasses = [];
  let isModalOpen = false;
  let editingClass = null;

  // Pagination state
  let currentPage = 1;
  let pageSize = 10;
  let pageSizeOptions = [5, 10, 25, 50];
  let totalPages = 0;

  onMount(async () => {
    await fetchClasses();
  });

  async function fetchClasses() {
    try {
      const { data, error } = await supabase
        .from('kelas')
        .select(`
          id,
          nama,
          created_at,
          program_id,
          program:program_id (nama)
        `);

      if (error) throw error;

      classes = data || [];
      filterClasses();
    } catch (error) {
      console.error('Error fetching classes:', error.message);
    } finally {
      loading = false;
    }
  }

  function filterClasses() {
    if (!searchQuery.trim()) {
      filteredClasses = classes;
    } else {
      const query = searchQuery.toLowerCase();
      filteredClasses = classes.filter(
        (kelas) =>
          kelas.nama.toLowerCase().includes(query) ||
          (kelas.program?.nama || '').toLowerCase().includes(query)
      );
    }
    totalPages = Math.ceil(filteredClasses.length / pageSize);
    currentPage = Math.min(currentPage, totalPages) || 1;
  }

  $: searchQuery, filterClasses();
  $: paginatedClasses = filteredClasses.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  function goToPage(page) {
    currentPage = Math.max(1, Math.min(page, totalPages));
  }

  function handlePageSizeChange(event) {
    pageSize = Number(event.target.value);
    currentPage = 1;
    filterClasses();
  }

  function openAddModal() {
    editingClass = null;
    isModalOpen = true;
  }

  function openEditModal(kelas) {
    editingClass = kelas;
    isModalOpen = true;
  }

  async function handleDelete(kelas) {
    if (confirm('Apakah Anda yakin ingin menghapus kelas ini?')) {
      try {
        const { error } = await supabase
          .from('kelas')
          .delete()
          .eq('id', kelas.id);

        if (error) throw error;

        classes = classes.filter(c => c.id !== kelas.id);
        filterClasses();
      } catch (error) {
        console.error('Error deleting class:', error.message);
        alert('Gagal menghapus kelas. Silakan coba lagi.');
      }
    }
  }

  function handleModalSuccess(event) {
    const { action, kelas } = event.detail;
    if (action === 'create') {
      classes = [...classes, kelas];
    } else if (action === 'update') {
      classes = classes.map(c => c.id === kelas.id ? kelas : c);
    }
    filterClasses();
    isModalOpen = false;
  }
</script>

<Navbar />
<Sidebar />

<main class="ml-16 lg:ml-64 transition-all duration-300">
  <div class="p-6 max-w-7xl mx-auto">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-900">Daftar Kelas</h1>
      <button
        on:click={openAddModal}
        class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
      >
        Tambah Kelas
      </button>
    </div>

    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="p-4 border-b flex justify-between items-center gap-4">
        <input
          type="text"
          placeholder="Cari kelas..."
          bind:value={searchQuery}
          class="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          on:click={openAddModal}
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span class="hidden sm:inline">Tambah Kelas</span>
          <span class="sm:hidden">+</span>
        </button>
      </div>

      {#if loading}
        <div class="p-8 text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
          <p class="mt-4 text-gray-600">Memuat data kelas...</p>
        </div>
      {:else}
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Nama Kelas
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Program
                </th>
                <th
                  class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              {#each paginatedClasses as kelas (kelas.id)}
                <tr class="hover:bg-gray-50">
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm font-medium text-gray-900">{kelas.nama}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap">
                    <div class="text-sm text-gray-500">{kelas.program?.nama || '-'}</div>
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm font-medium flex items-center gap-2">
                    <button
                      on:click={() => openEditModal(kelas)}
                      aria-label="Edit kelas"
                      class="inline-flex items-center p-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      on:click={() => handleDelete(kelas)}
                      aria-label="Hapus kelas"
                      class="inline-flex items-center p-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                    <button
                      on:click={() => window.location.href = `/admin/kelas/${kelas.id}/pertemuan`}
                      aria-label="Masuk ke kelas"
                      class="inline-flex items-center p-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                    </button>
                  </td>
                </tr>
              {:else}
                <tr>
                  <td colspan="3" class="px-6 py-4 text-center text-gray-500">
                    Tidak ada data kelas yang ditemukan
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
                  filteredClasses.length
                )} dari {filteredClasses.length} data
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

<Footer />

<ClassModal
  bind:isOpen={isModalOpen}
  bind:editingClass
  on:success={handleModalSuccess}
  on:close={() => isModalOpen = false}
/>