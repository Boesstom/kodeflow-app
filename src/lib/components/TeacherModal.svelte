<script>
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';
  
  export let show = false;
  export let teacherData = {
    nama: '',
    email: '',
    telfon: '',
    alamat: '',
    gambar: '',
    gaji_per_pertemuan: 0,
    sudah_isi_profil: false
  };

  const dispatch = createEventDispatcher();

  function closeModal() {
    show = false;
    dispatch('close');
  }

  function handleSubmit() {
    // Format and validate the data
    const formattedData = {
      nama: teacherData.nama?.trim() || '',
      email: teacherData.email?.trim() || '',
      telfon: teacherData.telfon?.trim() || '',
      alamat: teacherData.alamat?.trim() || '',
      gambar: teacherData.gambar?.trim() || null,
      gaji_per_pertemuan: Number(teacherData.gaji_per_pertemuan) || 0,
      sudah_isi_profil: true
    };
    
    // Validate required fields
    if (!formattedData.nama) {
      alert('Nama tidak boleh kosong');
      return;
    }
    if (!formattedData.email) {
      alert('Email tidak boleh kosong');
      return;
    }
    if (!formattedData.telfon) {
      alert('Nomor telepon tidak boleh kosong');
      return;
    }
    if (!formattedData.alamat) {
      alert('Alamat tidak boleh kosong');
      return;
    }
    
    console.log('Submitting teacher data:', formattedData);
    dispatch('submit', formattedData);
  }

  // Reset form when modal is closed
  $: if (!show) {
    teacherData = {
      nama: '',
      email: '',
      telfon: '',
      alamat: '',
      gambar: '',
      gaji_per_pertemuan: 0,
      sudah_isi_profil: false
    };
  }
</script>

{#if show}
  <div class="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center" transition:fade>
    <div class="bg-white rounded-lg p-6 w-full max-w-lg mx-4" transition:fade>
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Edit Data Guru</h2>
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
          <label for="nama" class="block text-sm font-medium text-gray-700 mb-1">Nama Lengkap</label>
          <input
            type="text"
            id="nama"
            bind:value={teacherData.nama}
            class="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            minlength="1"
            maxlength="255"
            placeholder="Masukkan nama lengkap"
          />
        </div>

        <div class="space-y-1.5">
          <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            id="email"
            bind:value={teacherData.email}
            class="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            placeholder="contoh@email.com"
          />
        </div>

        <div class="space-y-1.5">
          <label for="telfon" class="block text-sm font-medium text-gray-700 mb-1">Nomor Telepon</label>
          <input
            type="tel"
            id="telfon"
            bind:value={teacherData.telfon}
            class="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            placeholder="08xxxxxxxxxx"
          />
        </div>

        <div class="space-y-1.5">
          <label for="alamat" class="block text-sm font-medium text-gray-700 mb-1">Alamat</label>
          <textarea
            id="alamat"
            bind:value={teacherData.alamat}
            rows="3"
            class="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            required
            placeholder="Masukkan alamat lengkap"
          ></textarea>
        </div>

        <div class="space-y-1.5">
          <label for="gaji_per_pertemuan" class="block text-sm font-medium text-gray-700 mb-1">Gaji per Pertemuan</label>
          <div class="relative rounded-md shadow-sm">
            <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
              <span class="text-gray-500 sm:text-sm">Rp</span>
            </div>
            <input
              type="number"
              id="gaji_per_pertemuan"
              bind:value={teacherData.gaji_per_pertemuan}
              min="0"
              step="1000"
              class="block w-full pl-12 pr-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              placeholder="0"
            />
          </div>
        </div>

        <div class="space-y-1.5">
          <label for="gambar" class="block text-sm font-medium text-gray-700 mb-1">URL Foto (Opsional)</label>
          <input
            type="url"
            id="gambar"
            bind:value={teacherData.gambar}
            class="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="https://example.com/photo.jpg"
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
            Simpan Perubahan
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
