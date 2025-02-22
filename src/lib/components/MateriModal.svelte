<script>
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';
  
  export let show = false;
  export let isEdit = false;
  export let modulId = null;
  export let materiData = {
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
    modul_id: null
  };

  let newListItem = {
    apa_yang_akan_dipelajari: '',
    target_pembelajaran: '',
    prasyarat: ''
  };

  const dispatch = createEventDispatcher();

  function closeModal() {
    show = false;
    dispatch('close');
  }

  function addListItem(field) {
    if (newListItem[field].trim()) {
      materiData[field] = [...materiData[field], newListItem[field].trim()];
      newListItem[field] = '';
    }
  }

  function removeListItem(field, index) {
    materiData[field] = materiData[field].filter((_, i) => i !== index);
  }

  function handleSubmit() {
    const formattedData = {
      ...materiData,
      jumlah_video: parseInt(materiData.jumlah_video) || 0,
      modul_id: modulId
    };
    
    if (!formattedData.judul) {
      alert('Judul materi tidak boleh kosong');
      return;
    }
    if (!formattedData.deskripsi) {
      alert('Deskripsi tidak boleh kosong');
      return;
    }
    if (!formattedData.url_video) {
      alert('URL video tidak boleh kosong');
      return;
    }
    
    dispatch('submit', formattedData);
  }

  $: if (!show) {
    materiData = {
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
  }
</script>

<div class:hidden={!show} class="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
  <div class="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
    <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" on:click={closeModal}></div>

    <div
      transition:fade
      class="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full sm:p-6"
    >
      <div class="sm:flex sm:items-start">
        <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
          <h3 class="text-lg leading-6 font-medium text-gray-900">
            {isEdit ? 'Edit Materi' : 'Tambah Materi Baru'}
          </h3>

          <div class="mt-6 space-y-6">
            <!-- Basic Info -->
            <div class="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-6">
              <div class="sm:col-span-6">
                <label for="judul" class="block text-sm font-medium text-gray-700">Judul</label>
                <input
                  type="text"
                  name="judul"
                  id="judul"
                  bind:value={materiData.judul}
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div class="sm:col-span-6">
                <label for="deskripsi" class="block text-sm font-medium text-gray-700">Deskripsi</label>
                <textarea
                  id="deskripsi"
                  name="deskripsi"
                  rows="3"
                  bind:value={materiData.deskripsi}
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                ></textarea>
              </div>

              <div class="sm:col-span-3">
                <label for="jumlah_video" class="block text-sm font-medium text-gray-700">Jumlah Video</label>
                <input
                  type="number"
                  name="jumlah_video"
                  id="jumlah_video"
                  min="0"
                  bind:value={materiData.jumlah_video}
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div class="sm:col-span-3">
                <label for="tingkat_kesulitan" class="block text-sm font-medium text-gray-700">Tingkat Kesulitan</label>
                <select
                  id="tingkat_kesulitan"
                  name="tingkat_kesulitan"
                  bind:value={materiData.tingkat_kesulitan}
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="Pemula">Pemula</option>
                  <option value="Menengah">Menengah</option>
                  <option value="Lanjutan">Lanjutan</option>
                </select>
              </div>

              <div class="sm:col-span-3">
                <label for="durasi" class="block text-sm font-medium text-gray-700">Durasi</label>
                <input
                  type="text"
                  name="durasi"
                  id="durasi"
                  bind:value={materiData.durasi}
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div class="sm:col-span-3">
                <label for="tutor" class="block text-sm font-medium text-gray-700">Tutor</label>
                <input
                  type="text"
                  name="tutor"
                  id="tutor"
                  bind:value={materiData.tutor}
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>

              <div class="sm:col-span-6">
                <label for="url_video" class="block text-sm font-medium text-gray-700">URL Video</label>
                <input
                  type="url"
                  name="url_video"
                  id="url_video"
                  bind:value={materiData.url_video}
                  class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>

            <!-- List Fields -->
            {#each ['apa_yang_akan_dipelajari', 'target_pembelajaran', 'prasyarat'] as field}
              <div class="space-y-2">
                <label class="block text-sm font-medium text-gray-700 capitalize">{field.replace(/_/g, ' ')}</label>
                <div class="flex space-x-2">
                  <input
                    type="text"
                    bind:value={newListItem[field]}
                    class="flex-1 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Tambah item baru..."
                  />
                  <button
                    type="button"
                    on:click={() => addListItem(field)}
                    class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Tambah
                  </button>
                </div>
                <ul class="mt-2 space-y-2">
                  {#each materiData[field] as item, index}
                    <li class="flex justify-between items-center py-2 px-3 bg-gray-50 rounded-md">
                      <span class="text-sm text-gray-900">{item}</span>
                      <button
                        type="button"
                        on:click={() => removeListItem(field, index)}
                        class="text-red-600 hover:text-red-900"
                      >
                        <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" />
                        </svg>
                      </button>
                    </li>
                  {/each}
                </ul>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <div class="mt-6 sm:flex sm:flex-row-reverse">
        <button
          type="button"
          on:click={handleSubmit}
          class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
        >
          {isEdit ? 'Simpan Perubahan' : 'Tambah Materi'}
        </button>
        <button
          type="button"
          on:click={closeModal}
          class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
        >
          Batal
        </button>
      </div>
    </div>
  </div>
</div>
