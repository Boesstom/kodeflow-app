<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import Navbar from '$lib/components/Navbar.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import MaterialModal from '$lib/components/MaterialModal.svelte';

  export let data;

  let materi = [];
  let modul = null;
  let loading = true;
  let error = null;
  let showModal = false;
  let selectedMaterial = null;
  let isEditMode = false;
  let newItem = '';

  $: modulId = data.modulId;
  $: programId = data.programId;

  onMount(async () => {
    if (modulId) {
      try {
        await Promise.all([loadModul(), loadMateri()]);
      } catch (e) {
        error = e.message;
        console.error('Error loading initial data:', e);
      } finally {
        loading = false;
      }
    } else {
      loading = false;
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

  function openAddModal() {
    selectedMaterial = {
      judul: '',
      deskripsi: '',
      jumlah_video: 0,
      tingkat_kesulitan: '',
      durasi: '',
      tutor: '',
      apa_yang_akan_dipelajari: [''],
      target_pembelajaran: [''],
      prasyarat: [''],
      url_video: '',
      modul_id: modulId
    };
    isEditMode = false;
    showModal = true;
  }

  function openEditModal(material) {
    selectedMaterial = {
      ...material,
      apa_yang_akan_dipelajari: Array.isArray(material.apa_yang_akan_dipelajari) ? 
        material.apa_yang_akan_dipelajari : [''],
      target_pembelajaran: Array.isArray(material.target_pembelajaran) ? 
        material.target_pembelajaran : [''],
      prasyarat: Array.isArray(material.prasyarat) ? 
        material.prasyarat : ['']
    };
    isEditMode = true;
    showModal = true;
  }

  async function handleMaterialSubmit(event) {
    const materialData = event.detail;
    loading = true;
    error = null;
    
    try {
      if (isEditMode) {
        const { error: err } = await supabase
          .from('materi')
          .update({
            judul: materialData.judul,
            deskripsi: materialData.deskripsi,
            jumlah_video: materialData.jumlah_video,
            tingkat_kesulitan: materialData.tingkat_kesulitan,
            durasi: materialData.durasi,
            tutor: materialData.tutor,
            url_video: materialData.url_video,
            apa_yang_akan_dipelajari: materialData.apa_yang_akan_dipelajari,
            target_pembelajaran: materialData.target_pembelajaran,
            prasyarat: materialData.prasyarat,
            updated_at: new Date().toISOString()
          })
          .eq('id', selectedMaterial.id);

        if (err) throw err;
      } else {
        const { error: err } = await supabase
          .from('materi')
          .insert({
            judul: materialData.judul,
            deskripsi: materialData.deskripsi,
            jumlah_video: materialData.jumlah_video,
            tingkat_kesulitan: materialData.tingkat_kesulitan,
            durasi: materialData.durasi,
            tutor: materialData.tutor,
            url_video: materialData.url_video,
            apa_yang_akan_dipelajari: materialData.apa_yang_akan_dipelajari,
            target_pembelajaran: materialData.target_pembelajaran,
            prasyarat: materialData.prasyarat,
            modul_id: parseInt(modulId),
            created_at: new Date().toISOString()
          });

        if (err) throw err;
      }

      await loadMateri();
      showModal = false;
    } catch (e) {
      error = e.message;
      console.error('Error saving material:', e);
    } finally {
      loading = false;
    }
  }

  function addItem() {
    if (newItem) {
      selectedMaterial.apa_yang_akan_dipelajari.push(newItem);
      selectedMaterial.target_pembelajaran.push(newItem);
      selectedMaterial.prasyarat.push(newItem);
      newItem = '';
    }
  }

  async function deleteMaterial(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus materi ini?')) return;
    
    try {
      loading = true;
      const { error: err } = await supabase
        .from('materi')
        .delete()
        .eq('id', id);

      if (err) throw err;
      await loadMateri();
    } catch (e) {
      error = e.message;
      console.error('Error deleting material:', e);
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
        <button
          on:click={openAddModal}
          class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Tambah Materi
        </button>
      </div>

      {#if loading}
        <div class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      {:else if materi.length === 0}
        <div class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Belum ada materi</h3>
          <p class="mt-1 text-sm text-gray-500">Mulai dengan menambahkan materi baru untuk modul ini.</p>
        </div>
      {:else}
        <div class="bg-white shadow overflow-hidden sm:rounded-md">
          <ul class="divide-y divide-gray-200">
            {#each materi as material}
              <li>
                <div class="px-4 py-4 sm:px-6">
                  <div class="flex items-center justify-between">
                    <div class="flex-1 min-w-0">
                      <h3 class="text-lg font-medium text-gray-900 truncate">{material.judul}</h3>
                      <p class="mt-1 text-sm text-gray-500">{material.deskripsi}</p>
                    </div>
                    <div class="flex-shrink-0 flex space-x-3">
                      <button
                        on:click={() => openEditModal(material)}
                        class="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-blue-600 hover:bg-blue-50 hover:border-blue-200 transition-colors duration-200"
                        aria-label="Edit materi"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>
                      <button
                        on:click={() => deleteMaterial(material.id)}
                        class="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-red-600 hover:bg-red-50 hover:border-red-200 transition-colors duration-200"
                        aria-label="Hapus materi"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd" />
                        </svg>
                      </button>
                      <a
                        href="/admin/program/{programId}/modul/{modulId}/materi/{material.id}/"
                        class="w-10 h-10 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-colors duration-200"
                        aria-label="Lihat detail materi"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                        </svg>
                      </a>
                    </div>
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
  <MaterialModal
    material={selectedMaterial}
    {isEditMode}
    modul_id={modulId}
    on:submit={handleMaterialSubmit}
    on:close={() => showModal = false}
  />
{/if}