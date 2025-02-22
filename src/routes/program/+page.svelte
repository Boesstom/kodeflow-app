<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import Navbar from '$lib/components/Navbar.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import ProgramModal from '$lib/components/ProgramModal.svelte';

  let programs = [];
  let loading = true;
  let viewType = 'card'; // 'card' or 'list'
  let error = null;
  let showModal = false;
  let isEditMode = false;
  let selectedProgram = null;

  onMount(async () => {
    await loadPrograms();
  });

  async function loadPrograms() {
    try {
      loading = true;
      const { data, error: err } = await supabase
        .from('program')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      console.log('Loaded programs:', data);
      programs = data || [];
    } catch (e) {
      error = e.message;
      console.error('Error loading programs:', e);
    } finally {
      loading = false;
    }
  }

  function toggleView() {
    viewType = viewType === 'card' ? 'list' : 'card';
  }

  function openAddModal() {
    isEditMode = false;
    selectedProgram = {
      nama: '',
      deskripsi: '',
      pertemuan: 1,
      gambar: ''
    };
    error = null;
    showModal = true;
  }

  function openEditModal(program) {
    isEditMode = true;
    selectedProgram = { ...program };
    error = null;
    showModal = true;
  }

  async function handleProgramSubmit(event) {
    const programData = event.detail;
    loading = true;
    error = null;
    
    try {
      console.log('Handling program submit:', { isEditMode, programData });

      if (isEditMode && selectedProgram?.id) {
        // Update existing program
        const { data, error: err } = await supabase
          .from('program')
          .update({
            nama: programData.nama,
            deskripsi: programData.deskripsi,
            pertemuan: programData.pertemuan,
            gambar: programData.gambar
          })
          .eq('id', selectedProgram.id)
          .select();

        if (err) {
          console.error('Error updating program:', err);
          throw err;
        }
        console.log('Updated program:', data);
      } else {
        // Add new program
        try {
          const newProgram = {
            nama: programData.nama,
            deskripsi: programData.deskripsi,
            pertemuan: programData.pertemuan,
            gambar: programData.gambar
          };
          
          console.log('Inserting new program:', newProgram);
          
          const { data, error: err } = await supabase
            .from('program')
            .insert([newProgram])
            .select();

          if (err) {
            console.error('Error inserting program:', err);
            throw err;
          }
          
          console.log('Added new program:', data);
          
          if (!data || data.length === 0) {
            throw new Error('No data returned after insert');
          }
        } catch (insertError) {
          console.error('Detailed insert error:', insertError);
          throw insertError;
        }
      }

      // Close the modal first
      showModal = false;
      
      // Then reload programs to get the updated list
      await loadPrograms();
    } catch (e) {
      error = e.message;
      console.error('Error saving program:', e);
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
        <h1 class="text-2xl font-semibold text-gray-900">Program</h1>
        
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

          <!-- Add Program Button -->
          <button
            on:click={openAddModal}
            class="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            disabled={loading}
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
            </svg>
            {loading ? 'Memproses...' : 'Tambah Program'}
          </button>
        </div>
      </div>

      {#if loading}
        <div class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      {:else if programs.length === 0}
        <div class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Tidak ada program</h3>
          <p class="mt-1 text-sm text-gray-500">Mulai dengan membuat program baru.</p>
        </div>
      {:else}
        {#if viewType === 'card'}
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {#each programs as program}
              <div class="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
                <div class="p-6">
                  <div class="flex-1">
                    <div class="flex items-center justify-between">
                      <h3 class="text-lg font-medium text-gray-900 truncate">{program.nama}</h3>
                      <p class="text-sm text-gray-500">{program.pertemuan} Pertemuan</p>
                    </div>
                    <div class="mt-1 text-sm text-gray-500 line-clamp-3">{program.deskripsi}</div>
                  </div>
                </div>
                <div class="px-6 py-4 bg-gray-50 flex justify-between space-x-3">
                  <a
                    href="/program/{program.id}/modul"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Masuk
                  </a>
                  <button
                    on:click={() => openEditModal(program)}
                    class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Edit
                  </button>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="bg-white shadow overflow-hidden sm:rounded-md">
            <ul class="divide-y divide-gray-200">
              {#each programs as program}
                <li>
                  <div class="px-4 py-4 flex items-center sm:px-6">
                    <div class="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <div class="flex items-center">
                          <p class="text-lg font-medium text-blue-600 truncate">{program.nama}</p>
                          <p class="ml-3 text-sm text-gray-500">{program.pertemuan} Pertemuan</p>
                        </div>
                        <div class="mt-1 text-sm text-gray-500 line-clamp-2">{program.deskripsi}</div>
                      </div>
                    </div>
                    <div class="ml-5 flex-shrink-0 flex space-x-3">
                      <a
                        href="/program/{program.id}/modul"
                        class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        Masuk
                      </a>
                      <button
                        on:click={() => openEditModal(program)}
                        class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        Edit
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

<ProgramModal
  bind:show={showModal}
  isEdit={isEditMode}
  programData={selectedProgram}
  on:close={() => showModal = false}
  on:submit={handleProgramSubmit}
/>