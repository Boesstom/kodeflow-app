<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import Navbar from '$lib/components/Navbar.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';

  export let data;

  let materi = null;
  let loading = true;
  let error = null;
  let videoId = '';
  let activeTab = 'materi';
  let quiz = null;

  $: materiId = data.materiId;

  onMount(async () => {
    await Promise.all([loadMateri(), loadQuiz()]);
  });

  async function loadMateri() {
    try {
      const { data: materiData, error: err } = await supabase
        .from('materi')
        .select('*')
        .eq('id', materiId)
        .single();

      if (err) throw err;
      
      materi = materiData;
      // Extract YouTube video ID from URL
      if (materi.url_video) {
        const url = new URL(materi.url_video);
        if (url.hostname.includes('youtube.com')) {
          videoId = url.searchParams.get('v');
        } else if (url.hostname.includes('youtu.be')) {
          videoId = url.pathname.substring(1);
        }
      }
    } catch (e) {
      error = e.message;
      console.error('Error loading materi:', e);
    } finally {
      loading = false;
    }
  }

  async function loadQuiz() {
    try {
      const { data: quizData, error: err } = await supabase
        .from('quiz')
        .select('*')
        .eq('materi_id', materiId)
        .single();

      if (err) throw err;

      // Karena file sudah public, kita bisa langsung menggunakan URL-nya
      if (quizData) {
        quiz = quizData;
        console.log('Quiz loaded:', quiz); // untuk debugging
      }
    } catch (e) {
      console.error('Error loading quiz:', e);
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
              {#if quiz}
                <div class="bg-white shadow rounded-lg overflow-hidden">
                  <div class="p-6">
                    <div class="mb-4">
                      <div class="flex items-center space-x-4 mb-6">
                        <div class="bg-gray-50 px-4 py-2 rounded-lg">
                          <span class="text-sm text-gray-500">Percobaan yang diizinkan:</span>
                          <span class="ml-2 text-lg font-semibold text-gray-900">{quiz.attempts_allowed}x</span>
                        </div>
                        <div class="bg-gray-50 px-4 py-2 rounded-lg">
                          <span class="text-sm text-gray-500">Skor minimum:</span>
                          <span class="ml-2 text-lg font-semibold text-gray-900">{quiz.min_score}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <!-- H5P Content from Lumi -->
                    <div class="relative w-full" style="padding-top: 75%;">
                      <iframe
                        src={quiz.h5p_file_url}
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