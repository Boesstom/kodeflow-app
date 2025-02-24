<script>
  import { onMount } from 'svelte';
  import { page } from '$app/stores';
  import { supabase } from '$lib/supabaseClient';
  import Navbar from '$lib/components/Navbar.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import ModuleModal from '$lib/components/ModuleModal.svelte';
  import DeleteConfirmationModal from '$lib/components/DeleteConfirmationModal.svelte';

  export let data;

  let modules = [];
  let program = null;
  let loading = true;
  let error = null;
  let showModal = false;
  let showDeleteModal = false;
  let isEditMode = false;
  let selectedModule = null;
  let moduleToDelete = null;

  // Get program ID from route data
  $: programId = data.programId;

  onMount(async () => {
    if (programId) {
      await Promise.all([loadProgram(), loadModules()]);
    }
  });

  async function loadProgram() {
    try {
      const { data, error: err } = await supabase
        .from('program')
        .select('*')
        .eq('id', programId)
        .single();

      if (err) throw err;
      program = data;
    } catch (e) {
      error = 'Error loading program: ' + e.message;
      console.error('Error loading program:', e);
    }
  }

  async function loadModules() {
    try {
      loading = true;
      const { data, error: err } = await supabase
        .from('modul')
        .select('*')
        .eq('program_id', programId)
        .order('pertemuan', { ascending: true });

      if (err) throw err;
      modules = data || [];
    } catch (e) {
      error = e.message;
      console.error('Error loading modules:', e);
    } finally {
      loading = false;
    }
  }

  function openAddModal() {
    isEditMode = false;
    selectedModule = {
      judul: '',
      deskripsi: '',
      pertemuan: modules.length + 1,
      gambar: '',
      program_id: programId
    };
    error = null;
    showModal = true;
  }

  function openEditModal(module) {
    isEditMode = true;
    selectedModule = { ...module };
    error = null;
    showModal = true;
  }

  function openDeleteModal(module) {
    moduleToDelete = module;
    showDeleteModal = true;
  }

  async function handleDelete() {
    if (!moduleToDelete) return;
    
    try {
      loading = true;
      const { error: err } = await supabase
        .from('modul')
        .delete()
        .eq('id', moduleToDelete.id);

      if (err) throw err;
      
      await loadModules();
      moduleToDelete = null;
    } catch (e) {
      error = 'Error deleting module: ' + e.message;
      console.error('Error deleting module:', e);
    } finally {
      loading = false;
    }
  }

  async function handleModuleSubmit(event) {
    const moduleData = event.detail;
    loading = true;
    error = null;
    
    try {
      if (isEditMode && selectedModule?.id) {
        const { data, error: err } = await supabase
          .from('modul')
          .update({
            judul: moduleData.judul,
            deskripsi: moduleData.deskripsi,
            pertemuan: moduleData.pertemuan,
            gambar: moduleData.gambar
          })
          .eq('id', selectedModule.id)
          .select();

        if (err) {
          throw new Error(err.message || 'Gagal menyimpan modul');
        }
        
        if (!data || data.length === 0) {
          throw new Error('Tidak ada data yang berhasil diperbarui');
        }
      } else {
        const { data, error: err } = await supabase
          .from('modul')
          .insert([{
            judul: moduleData.judul,
            deskripsi: moduleData.deskripsi,
            pertemuan: moduleData.pertemuan,
            gambar: moduleData.gambar,
            program_id: programId
          }])
          .select();

        if (err) {
          throw new Error(err.message || 'Gagal menambah modul');
        }
        
        if (!data || data.length === 0) {
          throw new Error('Gagal menambah modul baru');
        }
      }

      showModal = false;
      await loadModules();
    } catch (e) {
      error = e.message || 'Terjadi kesalahan saat menyimpan modul';
      console.error('Error saving module:', e);
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
        <div>
          <h1 class="text-2xl font-semibold text-gray-900">Modul {program?.nama || ''}</h1>
          <p class="mt-1 text-sm text-gray-500">Total {modules.length} modul</p>
        </div>
        
        <button
          on:click={openAddModal}
          class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Tambah Modul
        </button>
      </div>

      {#if loading}
        <div class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      {:else if modules.length === 0}
        <div class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Belum ada modul</h3>
          <p class="mt-1 text-sm text-gray-500">Mulai dengan menambahkan modul pertama untuk program ini.</p>
          <div class="mt-6">
            <button
              on:click={openAddModal}
              class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg class="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
              </svg>
              Tambah Modul
            </button>
          </div>
        </div>
      {:else}
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
          <ul class="divide-y divide-gray-200">
            {#each modules as module}
              <li>
                <div class="px-4 py-4 flex items-center sm:px-6">
                  <div class="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-10 w-10 flex items-center justify-center bg-blue-100 rounded-lg">
                          <span class="text-lg font-medium text-blue-600">{module.pertemuan}</span>
                        </div>
                        <div class="ml-4">
                          <h3 class="text-lg font-medium text-gray-900">{module.judul}</h3>
                          <p class="mt-1 text-sm text-gray-500 line-clamp-2">{module.deskripsi}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="ml-5 flex-shrink-0 space-x-2">
                    <a
                      aria-label="View module materials"
                      href="/admin/program/{programId}/modul/{module.id}/materi"
                      class="inline-flex items-center p-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </a>
                    <button
                      on:click={() => openEditModal(module)}
                      aria-label="Edit module"
                      class="inline-flex items-center p-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button
                      aria-label="Delete module"
                      on:click={() => openDeleteModal(module)}
                      class="inline-flex items-center p-2 border border-gray-300 text-sm font-medium rounded-md text-red-600 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </li>
            {/each}
          </ul>
        </div>
      {/if}
    </div>
  </main>
</div>

{#if showModal}
  <ModuleModal
    bind:show={showModal}
    isEdit={isEditMode}
    moduleData={selectedModule}
    programId={programId}
    on:close={() => showModal = false}
    on:submit={handleModuleSubmit}
  />
{/if}

{#if showDeleteModal}
  <DeleteConfirmationModal
    show={showDeleteModal}
    title="Hapus Modul"
    message="Apakah Anda yakin ingin menghapus modul ini? Semua materi dalam modul ini juga akan dihapus. Tindakan ini tidak dapat dibatalkan."
    on:confirm={handleDelete}
    on:close={() => showDeleteModal = false}
  />
{/if}
