<script>
  import { createEventDispatcher } from 'svelte';
  import { supabase } from '$lib/supabaseClient';

  export let isOpen = false;
  export let meeting = null;
  export let kelasId;

  const dispatch = createEventDispatcher();

  let loading = false;
  let error = null;
  let teachers = [];
  
  let formData = {
    guru_id: '',
    tanggal: '',
    nomor_pertemuan: '',
    jam: '',
    waktu_mulai_realisasi: '',
    waktu_selesai_realisasi: '',
    gaji: '',
    materi: '',
    status_pembayaran: 'belum',
    status: 'belum'
  };

  $: if (meeting) {
    formData = {
      guru_id: meeting.guru_id || '',
      tanggal: meeting.tanggal || '',
      nomor_pertemuan: meeting.nomor_pertemuan || '',
      jam: meeting.jam || '',
      waktu_mulai_realisasi: meeting.waktu_mulai_realisasi || '',
      waktu_selesai_realisasi: meeting.waktu_selesai_realisasi || '',
      gaji: meeting.gaji || '',
      materi: meeting.materi || '',
      status_pembayaran: meeting.status_pembayaran || 'belum',
      status: meeting.status || 'belum'
    };
  }

  async function loadTeachers() {
    try {
      const { data, error: err } = await supabase
        .from('user_guru')
        .select('id, nama')
        .order('nama');

      if (err) throw err;
      teachers = data || [];
    } catch (e) {
      console.error('Error loading teachers:', e.message);
      error = 'Gagal memuat data guru';
    }
  }

  async function handleSubmit() {
    try {
      loading = true;
      error = null;

      const meetingData = {
        ...formData,
        kelas_id: kelasId,
        gaji: parseFloat(formData.gaji)
      };

      let result;
      if (meeting?.id) {
        // Update existing meeting
        result = await supabase
          .from('pertemuan')
          .update(meetingData)
          .eq('id', meeting.id);
      } else {
        // Create new meeting
        result = await supabase
          .from('pertemuan')
          .insert([meetingData]);
      }

      if (result.error) throw result.error;

      dispatch('success', {
        action: meeting?.id ? 'update' : 'create',
        meeting: result.data?.[0] || meetingData
      });
      closeModal();
    } catch (e) {
      console.error('Error saving meeting:', e.message);
      error = 'Gagal menyimpan data pertemuan';
    } finally {
      loading = false;
    }
  }

  function closeModal() {
    isOpen = false;
    formData = {
      guru_id: '',
      tanggal: '',
      nomor_pertemuan: '',
      jam: '',
      waktu_mulai_realisasi: '',
      waktu_selesai_realisasi: '',
      gaji: '',
      materi: '',
      status_pembayaran: 'belum',
      status: 'belum'
    };
    error = null;
  }

  $: if (isOpen) {
    loadTeachers();
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-8 border max-w-2xl shadow-lg rounded-md bg-white w-full m-4">
      <div class="mt-3">
        <h3 class="text-xl font-medium text-gray-900 mb-6">
          {meeting ? 'Edit Pertemuan' : 'Tambah Pertemuan'}
        </h3>

        {#if error}
          <div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative mb-6" role="alert">
            {error}
          </div>
        {/if}

        <form on:submit|preventDefault={handleSubmit} class="space-y-6">
          <div class="grid grid-cols-2 gap-6">
            <!-- Guru -->
            <div class="space-y-2">
              <label for="guru" class="block text-sm font-medium text-gray-700">Guru</label>
              <select
                id="guru"
                bind:value={formData.guru_id}
                required
                class="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="">Pilih Guru</option>
                {#each teachers as teacher}
                  <option value={teacher.id}>{teacher.nama}</option>
                {/each}
              </select>
            </div>

            <!-- Nomor Pertemuan -->
            <div class="space-y-2">
              <label for="nomor_pertemuan" class="block text-sm font-medium text-gray-700">Nomor Pertemuan</label>
              <input
                type="number"
                id="nomor_pertemuan"
                bind:value={formData.nomor_pertemuan}
                required
                min="1"
                class="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <!-- Tanggal -->
            <div class="space-y-2">
              <label for="tanggal" class="block text-sm font-medium text-gray-700">Tanggal</label>
              <input
                type="date"
                id="tanggal"
                bind:value={formData.tanggal}
                required
                class="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <!-- Jam -->
            <div class="space-y-2">
              <label for="jam" class="block text-sm font-medium text-gray-700">Jam</label>
              <input
                type="time"
                id="jam"
                bind:value={formData.jam}
                required
                class="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <!-- Waktu Mulai Realisasi -->
            <div class="space-y-2">
              <label for="waktu_mulai" class="block text-sm font-medium text-gray-700">Waktu Mulai Realisasi</label>
              <input
                type="time"
                id="waktu_mulai"
                bind:value={formData.waktu_mulai_realisasi}
                class="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <!-- Waktu Selesai Realisasi -->
            <div class="space-y-2">
              <label for="waktu_selesai" class="block text-sm font-medium text-gray-700">Waktu Selesai Realisasi</label>
              <input
                type="time"
                id="waktu_selesai"
                bind:value={formData.waktu_selesai_realisasi}
                class="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <!-- Gaji -->
            <div class="space-y-2">
              <label for="gaji" class="block text-sm font-medium text-gray-700">Gaji</label>
              <input
                type="number"
                id="gaji"
                bind:value={formData.gaji}
                step="0.01"
                required
                class="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={loading}
              />
            </div>

            <!-- Status Pertemuan -->
            <div class="space-y-2">
              <label for="status" class="block text-sm font-medium text-gray-700">Status Pertemuan</label>
              <select
                id="status"
                bind:value={formData.status}
                required
                class="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="belum">Belum</option>
                <option value="selesai">Selesai</option>
              </select>
            </div>

            <!-- Status Pembayaran -->
            <div class="space-y-2">
              <label for="status_pembayaran" class="block text-sm font-medium text-gray-700">Status Pembayaran</label>
              <select
                id="status_pembayaran"
                bind:value={formData.status_pembayaran}
                required
                class="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                disabled={loading}
              >
                <option value="belum">Belum</option>
                <option value="selesai">Selesai</option>
              </select>
            </div>
          </div>

          <!-- Materi -->
          <div class="space-y-2">
            <label for="materi" class="block text-sm font-medium text-gray-700">Materi</label>
            <textarea
              id="materi"
              bind:value={formData.materi}
              rows="3"
              class="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled={loading}
            ></textarea>
          </div>

          <div class="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              on:click={closeModal}
              class="px-6 py-3 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              Batal
            </button>
            <button
              type="submit"
              class="px-6 py-3 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={loading}
            >
              {#if loading}
                <span class="inline-flex items-center">
                  <svg class="w-4 h-4 mr-2 animate-spin" viewBox="0 0 24 24">
                    <circle
                      class="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      stroke-width="4"
                      fill="none"
                    />
                    <path
                      class="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Menyimpan...
                </span>
              {:else}
                {meeting ? 'Simpan Perubahan' : 'Simpan'}
              {/if}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
{/if}