<script>
  import { createEventDispatcher } from 'svelte';
  import { fade } from 'svelte/transition';
  import { supabase } from '$lib/supabaseClient';
  
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
  let unpaidSalary = 0;
  let paidSalary = 0;

  async function fetchSalaryInfo() {
    if (!teacherData.id) return;

    try {
      // Fetch unpaid salary
      const { data: unpaidData, error: unpaidError } = await supabase
        .from('pertemuan')
        .select('gaji')
        .eq('guru_id', teacherData.id)
        .eq('status_pembayaran', 'Belum');

      if (unpaidError) throw unpaidError;

      // Fetch paid salary
      const { data: paidData, error: paidError } = await supabase
        .from('pertemuan')
        .select('gaji')
        .eq('guru_id', teacherData.id)
        .eq('status_pembayaran', 'Selesai');

      if (paidError) throw paidError;

      // Calculate totals
      unpaidSalary = unpaidData.reduce((total, meeting) => total + (meeting.gaji || 0), 0);
      paidSalary = paidData.reduce((total, meeting) => total + (meeting.gaji || 0), 0);
    } catch (error) {
      console.error('Error fetching salary info:', error.message);
    }
  }

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
    unpaidSalary = 0;
    paidSalary = 0;
  }

  // Fetch salary info when teacherData changes
  $: if (show && teacherData.id) {
    fetchSalaryInfo();
  }
</script>

{#if show}
  <div class="fixed inset-0 bg-black bg-opacity-50 z-40 flex items-center justify-center" transition:fade>
    <div class="bg-white rounded-lg p-6 w-full max-w-lg mx-4" transition:fade>
      <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-bold text-gray-900">Detail Guru</h2>
        <button aria-label="Close modal"
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
        <!-- Profile Section -->
        <div class="flex items-center space-x-4 mb-6">
          <div class="flex-shrink-0">
            <img
              src={teacherData.gambar || 'https://via.placeholder.com/64'}
              alt="Profile"
              class="w-16 h-16 rounded-full object-cover"
            />
          </div>
          <div>
            <h3 class="text-lg font-semibold text-gray-900">{teacherData.nama || 'Nama'}</h3>
            <p class="text-sm text-gray-500">{teacherData.email || 'email@email.com'}</p>
          </div>
        </div>

        <!-- Profile Form -->
        <div class="space-y-4">
          <div class="space-y-1.5">
            <label for="alamat" class="block text-sm font-medium text-gray-700">Alamat</label>
            <input
              type="text"
              id="alamat"
              bind:value={teacherData.alamat}
              class="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              placeholder="[alamat]"
            />
          </div>

          <div class="space-y-1.5">
            <label for="telfon" class="block text-sm font-medium text-gray-700">Whatsapp</label>
            <input
              type="tel"
              id="telfon"
              bind:value={teacherData.telfon}
              class="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              placeholder="-"
            />
          </div>

          <div class="space-y-1.5">
            <label for="gaji_per_pertemuan" class="block text-sm font-medium text-gray-700">Gaji per pertemuan</label>
            <input
              type="number"
              id="gaji_per_pertemuan"
              bind:value={teacherData.gaji_per_pertemuan}
              min="0"
              step="1000"
              class="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              required
              placeholder="0"
            />
          </div>
        </div>

        <!-- Salary Cards -->
        <div class="grid grid-cols-2 gap-4 mt-6">
          <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-medium text-gray-700">Gaji</h4>
              <button 
                aria-label="Lihat pertemuan belum dibayar" 
                class="text-purple-600 hover:text-purple-700"
                on:click={() => {
                  window.location.href = `/admin/pertemuan?guru_id=${teacherData.id}&status_pembayaran=Belum`;
                }}
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
            <p class="text-lg font-semibold mt-1">Rp {unpaidSalary.toLocaleString('id-ID')}</p>
            <p class="text-sm text-gray-500">Belum terbayar</p>
          </div>
          
          <div class="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
            <div class="flex items-center justify-between">
              <h4 class="text-sm font-medium text-gray-700">Gaji</h4>
              <button 
                aria-label="Lihat pertemuan sudah dibayar" 
                class="text-purple-600 hover:text-purple-700"
                on:click={() => {
                  window.location.href = `/admin/pertemuan?guru_id=${teacherData.id}&status_pembayaran=Selesai`;
                }}
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
            <p class="text-lg font-semibold mt-1">Rp {paidSalary.toLocaleString('id-ID')}</p>
            <p class="text-sm text-gray-500">Sudah terbayar</p>
          </div>
        </div>

        <div class="flex justify-end space-x-3 pt-6">
          <button
            type="button"
            class="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            on:click={closeModal}
          >
            Tutup
          </button>
          <button
            type="submit"
            class="px-6 py-2 text-sm font-medium text-white bg-purple-600 rounded-md hover:bg-purple-700"
          >
            Simpan
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
