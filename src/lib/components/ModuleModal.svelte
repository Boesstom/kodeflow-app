<script>
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';
  
  export let show = false;
  export let isEdit = false;
  export let programId = null;
  export let moduleData = {
    judul: '',
    deskripsi: '',
    pertemuan: 1,
    gambar: '',
    program_id: null
  };

  const dispatch = createEventDispatcher();

  function closeModal() {
    show = false;
    dispatch('close');
  }

  function handleSubmit() {
    // Format and validate the data
    const formattedData = {
      judul: moduleData.judul?.trim() || '',
      deskripsi: moduleData.deskripsi?.trim() || '',
      pertemuan: parseInt(moduleData.pertemuan) || 1,
      gambar: moduleData.gambar?.trim() || null,
      program_id: programId
    };
    
    // Validate required fields
    if (!formattedData.judul) {
      alert('Judul modul tidak boleh kosong');
      return;
    }
    if (!formattedData.deskripsi) {
      alert('Deskripsi tidak boleh kosong');
      return;
    }
    if (!formattedData.program_id) {
      alert('Program ID tidak valid');
      return;
    }
    
    console.log('Submitting module data:', formattedData);
    dispatch('submit', formattedData);
  }

  // Reset form when modal is closed
  $: if (!show) {
    moduleData = {
      judul: '',
      deskripsi: '',
      pertemuan: 1,
      gambar: '',
      program_id: programId
    };
  }
</script>

{#if show}
  <div class="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center" transition:fade>
    <div class="bg-white rounded-lg p-6 w-full max-w-lg mx-4" transition:fade>
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Modul' : 'Tambah Modul Baru'}
        </h2>
        <button 
          type="button"
          class="text-gray-400 hover:text-gray-600" 
          on:click={closeModal}
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <form on:submit|preventDefault={handleSubmit} class="space-y-6">
        <div class="space-y-1.5">
          <label for="judul" class="block text-sm font-medium text-gray-700 mb-1">Judul Modul</label>
          <input
            type="text"
            id="judul"
            bind:value={moduleData.judul}
            class="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            minlength="1"
            maxlength="255"
            placeholder="Masukkan judul modul"
          />
        </div>

        <div class="space-y-1.5">
          <label for="deskripsi" class="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
          <textarea
            id="deskripsi"
            bind:value={moduleData.deskripsi}
            rows="3"
            class="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            minlength="1"
            placeholder="Masukkan deskripsi modul"
          ></textarea>
        </div>

        <div class="space-y-1.5">
          <label for="pertemuan" class="block text-sm font-medium text-gray-700 mb-1">Pertemuan Ke-</label>
          <input
            type="number"
            id="pertemuan"
            bind:value={moduleData.pertemuan}
            min="1"
            class="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            placeholder="Masukkan nomor pertemuan"
          />
        </div>

        <div class="space-y-1.5">
          <label for="gambar" class="block text-sm font-medium text-gray-700 mb-1">URL Gambar (Opsional)</label>
          <input
            type="url"
            id="gambar"
            bind:value={moduleData.gambar}
            class="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div class="flex justify-end space-x-3 pt-6">
          <button
            type="button"
            class="px-6 py-3 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
            on:click={closeModal}
          >
            Batal
          </button>
          <button
            type="submit"
            class="px-6 py-3 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md"
          >
            {isEdit ? 'Simpan Perubahan' : 'Tambah Modul'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
