<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import Navbar from '$lib/components/Navbar.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';

  export let data;

  let loading = true;
  let error = null;
  
  // Dummy teacher data
  let teacherData = {
    nama: 'John Doe',
    email: 'john.doe@example.com',
    telfon: '08123456789',
    alamat: 'Jl. Example Street No. 123',
    gambar: 'https://example.com/photo.jpg',
    gaji_per_pertemuan: 150000,
    sudah_isi_profil: true
  };

  // Dummy salary data
  let salaryData = {
    total_gaji: 1500000,
    gaji_terbayar: 900000,
    gaji_belum_terbayar: 600000,
    riwayat_pembayaran: [
      { tanggal: '2024-01-15', jumlah: 450000, status: 'Terbayar' },
      { tanggal: '2024-01-01', jumlah: 450000, status: 'Terbayar' },
      { tanggal: '2023-12-15', jumlah: 300000, status: 'Belum Terbayar' },
      { tanggal: '2023-12-01', jumlah: 300000, status: 'Belum Terbayar' }
    ]
  };

  onMount(() => {
    loading = false;
  });
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

      {#if loading}
        <div class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      {:else if materi}
        <div class="space-y-8">
          <!-- Video Player Container -->
          {#if videoId}
            <div class="bg-white shadow rounded-lg overflow-hidden">
              <div class="relative w-full" style="padding-top: 75%;">
                <iframe
                  src="https://www.youtube.com/embed/{videoId}"
                  title="YouTube video player"
                  frameborder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowfullscreen
                  class="absolute top-0 left-0 w-full h-full"
                ></iframe>
              </div>
            </div>
          {/if}

          <!-- Tabs -->
          <div class="border-b border-gray-200 mt-8">
            <nav class="-mb-px flex space-x-8" aria-label="Tabs">
              <button
                class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm {activeTab === 'materi' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
                on:click={() => activeTab = 'materi'}
              >
                Materi
              </button>
              <button
                class="whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm {activeTab === 'quiz' ? 'border-blue-500 text-blue-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
                on:click={() => activeTab = 'quiz'}
              >
                Quiz
              </button>
            </nav>
          </div>

          <!-- Tab Content -->
          {#if activeTab === 'materi'}
            <div class="mt-8">
              <!-- Materi Details -->
              <div class="bg-white shadow rounded-lg overflow-hidden">
                <div class="p-6 space-y-6">
                  <div>
                    <h1 class="text-2xl font-bold text-gray-900">{materi.judul}</h1>
                    <p class="mt-2 text-gray-600">{materi.deskripsi}</p>
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div class="bg-gray-50 p-4 rounded-lg">
                      <h3 class="text-sm font-medium text-gray-500">Tingkat Kesulitan</h3>
                      <p class="mt-1 text-lg font-semibold text-gray-900">{materi.tingkat_kesulitan}</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                      <h3 class="text-sm font-medium text-gray-500">Durasi</h3>
                      <p class="mt-1 text-lg font-semibold text-gray-900">{materi.durasi}</p>
                    </div>
                    <div class="bg-gray-50 p-4 rounded-lg">
                      <h3 class="text-sm font-medium text-gray-500">Tutor</h3>
                      <p class="mt-1 text-lg font-semibold text-gray-900">{materi.tutor}</p>
                    </div>
                  </div>

                  <div class="space-y-4">
                    <div>
                      <h2 class="text-lg font-medium text-gray-900">Apa yang akan dipelajari</h2>
                      <ul class="mt-2 list-disc list-inside space-y-1">
                        {#each materi.apa_yang_akan_dipelajari as item}
                          <li class="text-gray-600">{item}</li>
                        {/each}
                      </ul>
                    </div>

                    <div>
                      <h2 class="text-lg font-medium text-gray-900">Target Pembelajaran</h2>
                      <ul class="mt-2 list-disc list-inside space-y-1">
                        {#each materi.target_pembelajaran as target}
                          <li class="text-gray-600">{target}</li>
                        {/each}
                      </ul>
                    </div>

                    <div>
                      <h2 class="text-lg font-medium text-gray-900">Prasyarat</h2>
                      <ul class="mt-2 list-disc list-inside space-y-1">
                        {#each materi.prasyarat as prasyarat}
                          <li class="text-gray-600">{prasyarat}</li>
                        {/each}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          {:else if activeTab === 'quiz'}
            <div class="mt-8">
              {#if materi.url_quiz}
                <div class="bg-white shadow rounded-lg overflow-hidden">
                  <div class="p-6">
                    <!-- H5P Content -->
                    <div class="relative w-full" style="padding-top: 75%;">
                      <iframe
                        src={materi.url_quiz}
                        class="absolute top-0 left-0 w-full h-full"
                        frameborder="0"
                        allowfullscreen="allowfullscreen"
                        allow="geolocation *; microphone *; camera *; midi *; encrypted-media *"
                        title="H5P Interactive Content"
                      ></iframe>
                      <script src="https://app.lumi.education/api/v1/h5p/core/js/h5p-resizer.js" charset="UTF-8"></script>
                    </div>
                  </div>
                </div>
              {:else}
                <div class="text-center py-12">
                  <p class="text-gray-500">Tidak ada quiz untuk materi ini</p>
                </div>
              {/if}
            </div>
          {/if}
        </div>
      {:else}
        <div class="text-center py-12">
          <p class="text-gray-500">Materi tidak ditemukan</p>
        </div>
      {/if}
    </div>
  </main>
</div>