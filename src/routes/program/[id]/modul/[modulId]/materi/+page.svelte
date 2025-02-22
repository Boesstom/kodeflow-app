<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import Navbar from '$lib/components/Navbar.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import MateriModal from '$lib/components/MateriModal.svelte';
  import DeleteConfirmationModal from '$lib/components/DeleteConfirmationModal.svelte';

  export let data;

  let materi = [];
  let modul = null;
  let loading = true;
  let error = null;
  let viewType = 'card'; // 'card' or 'list'
  let showModal = false;
  let showDeleteModal = false;
  let isEditMode = false;
  let selectedMateri = null;
  let materiToDelete = null;

  $: modulId = data.modulId;
  $: programId = data.programId;

  onMount(async () => {
    if (modulId) {
      await Promise.all([loadModul(), loadMateri()]);
    }
  });

  async function loadModul() {
    try {
      const { data, error: err } = await supabase
        .from('modul')
        .select('*')
        .eq('id', modulId)
        .single();

      if (err) throw err;
      modul = data;
    } catch (e) {
      error = 'Error loading modul: ' + e.message;
      console.error('Error loading modul:', e);
    }
  }

  async function loadMateri() {
    try {
      loading = true;
      const { data, error: err } = await supabase
        .from('materi')
        .select('*')
        .eq('modul_id', modulId)
        .order('created_at', { ascending: true });

      if (err) throw err;
      materi = data || [];
    } catch (e) {
      error = e.message;
      console.error('Error loading materi:', e);
    } finally {
      loading = false;
    }
  }

  function toggleView() {
    viewType = viewType === 'card' ? 'list' : 'card';
  }

  function openAddModal() {
    isEditMode = false;
    selectedMateri = {
      judul: '',
      deskripsi: '',
      jumlah_video: 0,
      tingkat_kesulitan: 'Pemula',
      durasi: '',
      tutor: '',
      url_video: '',
      apa_yang_akan_dipelajari: [],
      target_pembelajaran: [],
      prasyarat: [],
      modul_id: modulId
    };
    error = null;
    showModal = true;
  }

  function openEditModal(materiItem) {
    isEditMode = true;
    selectedMateri = { ...materiItem };
    error = null;
    showModal = true;
  }

  function openDeleteModal(materiItem) {
    materiToDelete = materiItem;
    showDeleteModal = true;
  }

  async function handleDelete() {
    if (!materiToDelete) return;
    
    try {
      loading = true;
      const { error: err } = await supabase
        .from('materi')
        .delete()
        .eq('id', materiToDelete.id);

      if (err) throw err;
      
      await loadMateri();
      materiToDelete = null;
    } catch (e) {
      error = 'Error deleting materi: ' + e.message;
      console.error('Error deleting materi:', e);
    } finally {
      loading = false;
    }
  }

  async function handleMateriSubmit(event) {
    const materiData = event.detail;
    loading = true;
    error = null;
    
    try {
      if (isEditMode && selectedMateri?.id) {
        const { data, error: err } = await supabase
          .from('materi')
          .update({
            judul: materiData.judul,
            deskripsi: materiData.deskripsi,
            jumlah_video: materiData.jumlah_video,
            tingkat_kesulitan: materiData.tingkat_kesulitan,
            durasi: materiData.durasi,
            tutor: materiData.tutor,
            url_video: materiData.url_video,
            apa_yang_akan_dipelajari: materiData.apa_yang_akan_dipelajari,
            target_pembelajaran: materiData.target_pembelajaran,
            prasyarat: materiData.prasyarat
          })
          .eq('id', selectedMateri.id)
          .select();

        if (err) throw err;
        console.log('Updated materi:', data);
      } else {
        const { data, error: err } = await supabase
          .from('materi')
          .insert([{
            judul: materiData.judul,
            deskripsi: materiData.deskripsi,
            jumlah_video: materiData.jumlah_video,
            tingkat_kesulitan: materiData.tingkat_kesulitan,
            durasi: materiData.durasi,
            tutor: materiData.tutor,
            url_video: materiData.url_video,
            apa_yang_akan_dipelajari: materiData.apa_yang_akan_dipelajari,
            target_pembelajaran: materiData.target_pembelajaran,
            prasyarat: materiData.prasyarat,
            modul_id: modulId
          }])
          .select();

        if (err) throw err;
        console.log('Added new materi:', data);
      }

      showModal = false;
      await loadMateri();
    } catch (e) {
      error = e.message;
      console.error('Error saving materi:', e);
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-gray-50">
  <Navbar />
  <Sidebar />

  <main class="lg:pl-64 pt-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Error Display -->
      {#if error}
        <div class="mb-4 bg-red-50 border-l-4 border-red-400 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      {/if}

      <div class="flex justify-between items-center mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">{modul?.judul || 'Materi'}</h1>
        
        <div class="flex items-center space-x-4">
          <!-- View Toggle Button -->
          <button
            on:click={toggleView}
            class="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            {#if viewType === 'card'}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              List View
            {:else}
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              Card View
            {/if}
          </button>

          <!-- Add Materi Button -->
          <button
            on:click={openAddModal}
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            {loading ? 'Memproses...' : 'Tambah Materi'}
          </button>
        </div>
      </div>

      {#if loading}
        <div class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      {:else if materi.length === 0}
        <div class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Tidak ada materi</h3>
          <p class="mt-1 text-sm text-gray-500">Mulai dengan membuat materi baru.</p>
        </div>
      {:else}
        {#if viewType === 'card'}
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {#each materi as materiItem}
              <div class="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
                <div class="p-6">
                  <div class="flex-1">
                    <h3 class="text-lg font-medium text-gray-900 truncate">{materiItem.judul}</h3>
                    <p class="mt-1 text-sm text-gray-500 line-clamp-2">{materiItem.deskripsi}</p>
                  </div>
                </div>
                <div class="px-6 py-4 bg-gray-50 flex justify-between space-x-3">
                  <div class="flex space-x-3">
                    <a
                      href="/program/{programId}/modul/{modulId}/materi/{materiItem.id}"
                      class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Lihat
                    </a>
                    <button
                      on:click={() => openEditModal(materiItem)}
                      class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </button>
                  </div>
                  <button
                    on:click={() => openDeleteModal(materiItem)}
                    class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Hapus
                  </button>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="bg-white shadow overflow-hidden sm:rounded-md">
            <ul class="divide-y divide-gray-200">
              {#each materi as materiItem}
                <li>
                  <div class="px-4 py-4 sm:px-6">
                    <div class="min-w-0 flex-1">
                      <div class="flex items-center">
                        <p class="text-lg font-medium text-blue-600 truncate">{materiItem.judul}</p>
                      </div>
                      <p class="mt-1 text-sm text-gray-500 line-clamp-2">{materiItem.deskripsi}</p>
                    </div>
                    <div class="mt-4 flex items-center space-x-3">
                      <a
                        href="/program/{programId}/modul/{modulId}/materi/{materiItem.id}"
                        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Lihat
                      </a>
                      <button
                        on:click={() => openEditModal(materiItem)}
                        class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
                      </button>
                      <button
                        on:click={() => openDeleteModal(materiItem)}
                        class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Hapus
                      </button>
                    </div>
                  </div>
                </li>
              {/each}
            </ul>
          </div>
        {/if}
      {/if}
    </div>
  </main>
</div>

{#if showModal}
  <MateriModal
    show={showModal}
    isEdit={isEditMode}
    modulId={modulId}
    materiData={selectedMateri}
    on:submit={handleMateriSubmit}
    on:close={() => showModal = false}
  />
{/if}

{#if showDeleteModal}
  <DeleteConfirmationModal
    show={showDeleteModal}
    title="Hapus Materi"
    message="Apakah Anda yakin ingin menghapus materi ini? Tindakan ini tidak dapat dibatalkan."
    on:confirm={handleDelete}
    on:close={() => showDeleteModal = false}
  />
{/if}
