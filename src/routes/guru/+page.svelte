<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import Navbar from '$lib/components/Navbar.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import TeacherModal from '$lib/components/TeacherModal.svelte';

  let teachers = [];
  let loading = true;
  let viewType = 'card'; // 'card' or 'list'
  let error = null;
  let showModal = false;
  let selectedTeacher = null;

  onMount(async () => {
    await loadTeachers();
  });

  async function loadTeachers() {
    try {
      loading = true;
      const { data, error: err } = await supabase
        .from('user_guru')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;
      console.log('Loaded teachers:', data);
      teachers = data || [];
    } catch (e) {
      error = e.message;
      console.error('Error loading teachers:', e);
    } finally {
      loading = false;
    }
  }

  function toggleView() {
    viewType = viewType === 'card' ? 'list' : 'card';
  }

  function openEditModal(teacher) {
    selectedTeacher = { ...teacher };
    error = null;
    showModal = true;
  }

  async function handleTeacherSubmit(event) {
    const teacherData = event.detail;
    loading = true;
    error = null;
    
    try {
      console.log('Handling teacher submit:', teacherData);

      const { data, error: err } = await supabase
        .from('user_guru')
        .update({
          nama: teacherData.nama,
          email: teacherData.email,
          telfon: teacherData.telfon,
          alamat: teacherData.alamat,
          gambar: teacherData.gambar,
          gaji_per_pertemuan: teacherData.gaji_per_pertemuan,
          sudah_isi_profil: true
        })
        .eq('id', selectedTeacher.id)
        .select();

      if (err) {
        console.error('Error updating teacher:', err);
        throw new Error(err.message || 'Gagal menyimpan data guru');
      }
      
      if (!data || data.length === 0) {
        throw new Error('Tidak ada data yang berhasil diperbarui');
      }
      
      console.log('Updated teacher:', data);

      // Close the modal first
      showModal = false;
      
      // Then reload teachers to get the updated list
      await loadTeachers();
    } catch (e) {
      error = e.message || 'Terjadi kesalahan saat menyimpan data';
      console.error('Error saving teacher:', e);
    } finally {
      loading = false;
    }
  }

  function formatCurrency(amount) {
    return new Intl.NumberFormat('id-ID', {
      style: 'currency',
      currency: 'IDR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount);
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
        <h1 class="text-2xl font-semibold text-gray-900">Data Guru</h1>
        
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
        </div>
      </div>

      {#if loading}
        <div class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      {:else if teachers.length === 0}
        <div class="text-center py-12">
          <svg class="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <h3 class="mt-2 text-sm font-medium text-gray-900">Tidak ada data guru</h3>
          <p class="mt-1 text-sm text-gray-500">Belum ada guru yang terdaftar dalam sistem.</p>
        </div>
      {:else}
        {#if viewType === 'card'}
          <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {#each teachers as teacher}
              <div class="bg-white overflow-hidden shadow rounded-lg">
                <div class="p-6">
                  <div class="flex items-center">
                    <div class="flex-shrink-0 h-20 w-20">
                      {#if teacher.gambar}
                        <img class="h-20 w-20 rounded-full object-cover" src={teacher.gambar} alt={teacher.nama} />
                      {:else}
                        <div class="h-20 w-20 rounded-full bg-gray-200 flex items-center justify-center">
                          <svg class="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      {/if}
                    </div>
                    <div class="ml-4">
                      <h3 class="text-lg font-medium text-gray-900">{teacher.nama}</h3>
                      <p class="text-sm text-gray-500">{teacher.email}</p>
                    </div>
                  </div>
                  <div class="mt-4 space-y-2">
                    <p class="text-sm text-gray-500">
                      <span class="font-medium">Telepon:</span> {teacher.telfon}
                    </p>
                    <p class="text-sm text-gray-500">
                      <span class="font-medium">Gaji per Pertemuan:</span> {formatCurrency(teacher.gaji_per_pertemuan)}
                    </p>
                    <p class="text-sm text-gray-500">
                      <span class="font-medium">Status Profil:</span>
                      {#if teacher.sudah_isi_profil}
                        <span class="text-green-600">Lengkap</span>
                      {:else}
                        <span class="text-yellow-600">Belum Lengkap</span>
                      {/if}
                    </p>
                  </div>
                  <button
                    on:click={() => openEditModal(teacher)}
                    class="mt-4 w-full inline-flex justify-center items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    disabled={loading}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                    </svg>
                    Edit Data
                  </button>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="bg-white shadow overflow-hidden sm:rounded-md">
            <ul class="divide-y divide-gray-200">
              {#each teachers as teacher}
                <li>
                  <div class="px-4 py-4 flex items-center sm:px-6">
                    <div class="min-w-0 flex-1 sm:flex sm:items-center sm:justify-between">
                      <div class="flex items-center">
                        <div class="flex-shrink-0 h-12 w-12">
                          {#if teacher.gambar}
                            <img class="h-12 w-12 rounded-full object-cover" src={teacher.gambar} alt={teacher.nama} />
                          {:else}
                            <div class="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                              <svg class="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                              </svg>
                            </div>
                          {/if}
                        </div>
                        <div class="ml-4">
                          <h3 class="text-lg font-medium text-gray-900">{teacher.nama}</h3>
                          <div class="mt-1 text-sm text-gray-500">
                            <p>{teacher.email} • {teacher.telfon}</p>
                            <p class="mt-1">{formatCurrency(teacher.gaji_per_pertemuan)} per pertemuan</p>
                          </div>
                        </div>
                      </div>
                      <div class="mt-4 sm:mt-0 sm:ml-5">
                        <button
                          on:click={() => openEditModal(teacher)}
                          class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          disabled={loading}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                          Edit Data
                        </button>
                      </div>
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

<TeacherModal
  bind:show={showModal}
  teacherData={selectedTeacher}
  on:close={() => showModal = false}
  on:submit={handleTeacherSubmit}
/>
