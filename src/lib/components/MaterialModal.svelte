<script>
  import { createEventDispatcher, onMount } from 'svelte';

  export let material = {
    judul: '',
    deskripsi: '',
    jumlah_video: 0,
    tingkat_kesulitan: '',
    durasi: '',
    tutor: '',
    apa_yang_akan_dipelajari: [],
    target_pembelajaran: [],
    prasyarat: [],
    url_video: ''
  };
  export let modul_id;
  export let isEditMode = false;

  const dispatch = createEventDispatcher();

  let learningItems = [''];
  let targetItems = [''];
  let prerequisiteItems = [''];

  onMount(() => {
    if (isEditMode) {
      learningItems = Array.isArray(material.apa_yang_akan_dipelajari) && material.apa_yang_akan_dipelajari.length 
        ? [...material.apa_yang_akan_dipelajari]
        : [''];
      
      targetItems = Array.isArray(material.target_pembelajaran) && material.target_pembelajaran.length
        ? [...material.target_pembelajaran]
        : [''];
      
      prerequisiteItems = Array.isArray(material.prasyarat) && material.prasyarat.length
        ? [...material.prasyarat]
        : [''];
    }
  });

  function addItem(type) {
    switch(type) {
      case 'learning':
        learningItems = [...learningItems, ''];
        break;
      case 'target':
        targetItems = [...targetItems, ''];
        break;
      case 'prerequisite':
        prerequisiteItems = [...prerequisiteItems, ''];
        break;
    }
  }

  function removeItem(type, index) {
    if (index === 0 && (
      (type === 'learning' && learningItems.length === 1) ||
      (type === 'target' && targetItems.length === 1) ||
      (type === 'prerequisite' && prerequisiteItems.length === 1)
    )) {
      return; // Jangan hapus jika hanya satu item tersisa
    }

    switch(type) {
      case 'learning':
        learningItems = learningItems.filter((_, i) => i !== index);
        break;
      case 'target':
        targetItems = targetItems.filter((_, i) => i !== index);
        break;
      case 'prerequisite':
        prerequisiteItems = prerequisiteItems.filter((_, i) => i !== index);
        break;
    }
  }

  function handleSubmit() {
    // Validasi data sebelum submit
    if (!material.judul || !material.deskripsi) {
      return;
    }

    const submittedData = {
      judul: material.judul,
      deskripsi: material.deskripsi,
      jumlah_video: material.jumlah_video,
      tingkat_kesulitan: material.tingkat_kesulitan,
      durasi: material.durasi,
      tutor: material.tutor,
      url_video: material.url_video,
      apa_yang_akan_dipelajari: learningItems.filter(item => item.trim()),
      target_pembelajaran: targetItems.filter(item => item.trim()),
      prasyarat: prerequisiteItems.filter(item => item.trim())
    };

    if (isEditMode) {
      submittedData.id = material.id;
    }
    
    dispatch('submit', submittedData);
  }

  function handleClose() {
    dispatch('close');
  }
</script>

<div class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
  <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" on:click={handleClose}></div>

    <span class="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>

    <div class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
      <div class="absolute top-0 right-0 pt-4 pr-4">
        <button
          type="button"
          class="bg-white rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          on:click={handleClose}
        >
          <span class="sr-only">Close</span>
          <svg class="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div class="sm:flex sm:items-start">
        <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
          <h3 class="text-lg leading-6 font-medium text-gray-900" id="modal-title">
            {isEditMode ? 'Edit Materi' : 'Tambah Materi Baru'}
          </h3>

          <form on:submit|preventDefault={handleSubmit} class="mt-4 space-y-4">
            <div>
              <label for="judul" class="block text-sm font-medium text-gray-700">Judul</label>
              <input
                type="text"
                name="judul"
                id="judul"
                bind:value={material.judul}
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4"
                required
              />
            </div>

            <div>
              <label for="deskripsi" class="block text-sm font-medium text-gray-700">Deskripsi</label>
              <textarea
                name="deskripsi"
                id="deskripsi"
                bind:value={material.deskripsi}
                rows="3"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4"
                required
              ></textarea>
            </div>

            <div>
              <label for="jumlah_video" class="block text-sm font-medium text-gray-700">Jumlah Video</label>
              <input
                type="number"
                name="jumlah_video"
                id="jumlah_video"
                bind:value={material.jumlah_video}
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4"
                required
              />
            </div>

            <div>
              <label for="tingkat_kesulitan" class="block text-sm font-medium text-gray-700">Tingkat Kesulitan</label>
              <select
                name="tingkat_kesulitan"
                id="tingkat_kesulitan"
                bind:value={material.tingkat_kesulitan}
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4"
                required
              >
                <option value="">Pilih tingkat kesulitan</option>
                <option value="Pemula">Pemula</option>
                <option value="Menengah">Menengah</option>
                <option value="Lanjutan">Lanjutan</option>
              </select>
            </div>

            <div>
              <label for="durasi" class="block text-sm font-medium text-gray-700">Durasi</label>
              <input
                type="text"
                name="durasi"
                id="durasi"
                bind:value={material.durasi}
                placeholder="Contoh: 2 jam 30 menit"
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4"
                required
              />
            </div>

            <div>
              <label for="tutor" class="block text-sm font-medium text-gray-700">Tutor</label>
              <input
                type="text"
                name="tutor"
                id="tutor"
                bind:value={material.tutor}
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4"
                required
              />
            </div>

            <div>
              <label for="target_pembelajaran_0" class="block text-sm font-medium text-gray-700">
                Target Pembelajaran
              </label>
              {#each targetItems as item, i}
                <div class="flex gap-2 mt-1">
                  <input
                    type="text"
                    id={i === 0 ? 'target_pembelajaran_0' : `target_pembelajaran_${i}`}
                    bind:value={targetItems[i]}
                    placeholder="Masukkan target pembelajaran"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4"
                    required
                  />
                  {#if i === targetItems.length - 1}
                    <button
                      type="button"
                      aria-label="Tambah target pembelajaran"
                      on:click={() => addItem('target')}
                      class="inline-flex items-center p-2 text-blue-600 hover:text-blue-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  {:else}
                    <button
                      type="button"
                      aria-label="Hapus target pembelajaran"
                      on:click={() => removeItem('target', i)}
                      class="inline-flex items-center p-2 text-red-600 hover:text-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  {/if}
                </div>
              {/each}
            </div>

            <div>
              <label for="apa_yang_akan_dipelajari_0" class="block text-sm font-medium text-gray-700">
                Apa yang akan dipelajari
              </label>
              {#each learningItems as item, i}
                <div class="flex gap-2 mt-1">
                  <input
                    type="text"
                    id={i === 0 ? 'apa_yang_akan_dipelajari_0' : `apa_yang_akan_dipelajari_${i}`}
                    bind:value={learningItems[i]}
                    placeholder="Masukkan item pembelajaran"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4"
                    required
                  />
                  {#if i === learningItems.length - 1}
                    <button
                      type="button"
                      aria-label="Tambah item pembelajaran"
                      on:click={() => addItem('learning')}
                      class="inline-flex items-center p-2 text-blue-600 hover:text-blue-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  {:else}
                    <button
                      type="button"
                      aria-label="Hapus item pembelajaran"
                      on:click={() => removeItem('learning', i)}
                      class="inline-flex items-center p-2 text-red-600 hover:text-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  {/if}
                </div>
              {/each}
            </div>

            <div>
              <label for="prasyarat_0" class="block text-sm font-medium text-gray-700">
                Prasyarat
              </label>
              {#each prerequisiteItems as item, i}
                <div class="flex gap-2 mt-1">
                  <input
                    type="text"
                    id={i === 0 ? 'prasyarat_0' : `prasyarat_${i}`}
                    bind:value={prerequisiteItems[i]}
                    placeholder="Masukkan prasyarat"
                    class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4"
                    required
                  />
                  {#if i === prerequisiteItems.length - 1}
                    <button
                      type="button"
                      aria-label="Tambah prasyarat"
                      on:click={() => addItem('prerequisite')}
                      class="inline-flex items-center p-2 text-blue-600 hover:text-blue-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  {:else}
                    <button
                      type="button"
                      aria-label="Hapus prasyarat"
                      on:click={() => removeItem('prerequisite', i)}
                      class="inline-flex items-center p-2 text-red-600 hover:text-red-700"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                      </svg>
                    </button>
                  {/if}
                </div>
              {/each}
            </div>

            <div>
              <label for="url_video" class="block text-sm font-medium text-gray-700">URL Video</label>
              <input
                type="url"
                name="url_video"
                id="url_video"
                bind:value={material.url_video}
                class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm py-3 px-4"
                required
              />
            </div>

            <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
              <button
                type="submit"
                class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {isEditMode ? 'Simpan' : 'Tambah'}
              </button>
              <button
                type="button"
                class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                on:click={handleClose}
              >
                Batal
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</div>