<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import Navbar from '$lib/components/Navbar.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';
  import StudentDetailModal from '$lib/components/StudentDetailModal.svelte';

  let showDetailModal = false;
  let selectedStudent = null;

  let students = [];
  let loading = true;
  let error = null;
  let searchQuery = '';
  let selectedClass = 'all';
  let availableClasses = [];

  onMount(async () => {
    await Promise.all([loadStudents(), loadClasses()]);
  });

  async function loadClasses() {
    try {
      const { data, error: err } = await supabase
        .from('kelas')
        .select('id, nama')
        .order('nama');

      if (err) throw err;
      availableClasses = data || [];
    } catch (e) {
      console.error('Error loading classes:', e);
      error = e.message;
    }
  }

  async function loadStudents() {
    try {
      loading = true;
      error = null;

      // Menggunakan query SQL custom dengan rpc
      const { data, error: err } = await supabase
        .rpc('get_students_with_classes');

      if (err) {
        // Fallback ke pendekatan join manual jika rpc belum dibuat
        console.log("RPC tidak tersedia, menggunakan join manual");
        
        // Ambil user_peserta
        const { data: userPesertaData, error: upError } = await supabase
          .from('user_peserta')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (upError) throw upError;
        
        // Membuat mapping peserta
        const pesertaMap = {};
        userPesertaData.forEach(peserta => {
          pesertaMap[peserta.id] = {
            ...peserta,
            kelas_names: []
          };
        });
        
        // Ambil data kelas dari join kelas_peserta dan kelas menggunakan query yang benar
        const { data: kelasData, error: kelasError } = await supabase
          .from('kelas_peserta')
          .select(`
            peserta_id,
            kelas:kelas_id (nama)
          `);

          
        if (kelasError) throw kelasError;
        
        // Tambahkan informasi kelas ke setiap peserta
        kelasData.forEach(item => {
          if (pesertaMap[item.peserta_id] && item.kelas) {
            pesertaMap[item.peserta_id].kelas_names.push(item.kelas.nama);
          }
        });
        
        students = Object.values(pesertaMap);
      } else {
        // Reorganisasi data jika menggunakan rpc
        const studentMap = {};
        
        data.forEach(row => {
          if (!studentMap[row.id]) {
            studentMap[row.id] = {
              ...row,
              kelas_names: []
            };
          }
          
          if (row.class_name) {
            studentMap[row.id].kelas_names.push(row.class_name);
          }
        });
        
        students = Object.values(studentMap);
      }
      
      console.log('Loaded students:', students);
    } catch (e) {
      console.error('Error loading students:', e);
      error = e.message;
    } finally {
      loading = false;
    }
  }

  async function handleDelete(id) {
    if (!confirm('Apakah Anda yakin ingin menghapus peserta ini?')) return;

    try {
      loading = true;
      error = null;

      // Delete from kelas_peserta first (foreign key constraint)
      const { error: deleteEnrollmentError } = await supabase
        .from('kelas_peserta')
        .delete()
        .eq('peserta_id', id);

      if (deleteEnrollmentError) throw deleteEnrollmentError;

      // Then delete the student
      const { error: deleteStudentError } = await supabase
        .from('user_peserta')
        .delete()
        .eq('id', id);

      if (deleteStudentError) throw deleteStudentError;

      await loadStudents();
    } catch (e) {
      console.error('Error deleting student:', e);
      error = e.message;
    } finally {
      loading = false;
    }
  }

  function getEnrolledClasses(student) {
    if (!student.kelas_names || student.kelas_names.length === 0) return '-';
    return student.kelas_names.join(', ');
  }

  $: filteredStudents = students.filter(student => {
    const matchesSearch = searchQuery
      ? student.nama?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.telfon?.toLowerCase().includes(searchQuery.toLowerCase())
      : true;

    const matchesClass = selectedClass === 'all' ||
      (student.kelas_names && student.kelas_names.some(className => 
        className === selectedClass
      ));

    return matchesSearch && matchesClass;
  });
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
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      {/if}

      <!-- Header Section -->
      <div class="mb-6">
        <h1 class="text-2xl font-semibold text-gray-900">Daftar Peserta</h1>
      </div>

      <!-- Search and Filters -->
      <div class="mb-6 flex justify-between items-center space-x-4">
        <div class="flex-1 max-w-sm">
          <label for="search" class="sr-only">Search</label>
          <div class="relative">
            <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <svg class="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clip-rule="evenodd" />
              </svg>
            </div>
            <input
              id="search"
              bind:value={searchQuery}
              class="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-purple-500 focus:border-purple-500 sm:text-sm"
              placeholder="Cari peserta..."
              type="search"
            />
          </div>
        </div>

        <div class="flex-1 max-w-sm">
          <label for="class-filter" class="sr-only">Filter by Class</label>
          <select
            id="class-filter"
            bind:value={selectedClass}
            class="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm rounded-md"
          >
            <option value="all">Semua Kelas</option>
            {#each availableClasses as kelas}
              <option value={kelas.nama}>{kelas.nama}</option>
            {/each}
          </select>
        </div>
      </div>

      <!-- Loading indicator -->
      {#if loading}
        <div class="text-center py-4">
          <div class="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500"></div>
          <p class="mt-2 text-sm text-gray-500">Memuat data...</p>
        </div>
      {/if}

      <!-- Table -->
      {#if !loading}
        <div class="bg-white shadow overflow-hidden sm:rounded-lg">
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">No</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telepon</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kelas</th>
                  <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                {#each filteredStudents as student, i}
                  <tr class="hover:bg-gray-50">
                    <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{i + 1}</td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm font-medium text-gray-900">{student.nama || '-'}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">{student.email || '-'}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <div class="text-sm text-gray-900">{student.telfon || '-'}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap">
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {student.aktif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        {student.aktif ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </td>
                    <td class="px-6 py-4">
                      <div class="text-sm text-gray-900">{getEnrolledClasses(student)}</div>
                    </td>
                    <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div class="flex space-x-3">
                        <button
                          on:click={() => {
                            selectedStudent = student;
                            showDetailModal = true;
                          }}
                          aria-label="Lihat detail peserta"
                          class="inline-flex items-center p-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          on:click={() => handleDelete(student.id)}
                          aria-label="Hapus peserta"
                          class="inline-flex items-center p-2 border border-gray-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                {/each}

                {#if filteredStudents.length === 0}
                  <tr>
                    <td colspan="7" class="px-6 py-4 text-center text-sm text-gray-500">
                      {searchQuery ? 'Tidak ada peserta yang sesuai dengan pencarian' : 'Belum ada peserta'}
                    </td>
                  </tr>
                {/if}
              </tbody>
            </table>
          </div>
        </div>
      {/if}
    </div>
  </main>

  <StudentDetailModal
    bind:showModal={showDetailModal}
    student={selectedStudent}
  />
</div>