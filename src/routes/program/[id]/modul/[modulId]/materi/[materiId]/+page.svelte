<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import Navbar from '$lib/components/Navbar.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';

  export let data;

  let materi = null;
  let loading = true;
  let error = null;

  $: materiId = data.materiId;

  onMount(async () => {
    if (materiId) {
      await loadMateri();
    }
  });

  async function loadMateri() {
    try {
      loading = true;
      const { data, error: err } = await supabase
        .from('materi')
        .select('*')
        .eq('id', materiId)
        .single();

      if (err) throw err;
      materi = data;
    } catch (e) {
      error = e.message;
      console.error('Error loading materi:', e);
    } finally {
      loading = false;
    }
  }
</script>

<div class="min-h-screen bg-gray-50">
  <Navbar />
  <Sidebar />

  <main class="lg:pl-64 pt-16">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {#if loading}
        <div class="flex justify-center items-center h-64">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      {:else if error}
        <div class="rounded-md bg-red-50 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-800">Error</h3>
              <div class="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      {:else if materi}
        <div class="bg-white shadow overflow-hidden sm:rounded-lg">
          <div class="px-4 py-5 sm:px-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900">{materi.judul}</h3>
            <p class="mt-1 max-w-2xl text-sm text-gray-500">{materi.deskripsi}</p>
          </div>

          <!-- Video Player -->
          <div class="border-t border-gray-200">
            <div class="aspect-w-16 aspect-h-9">
              <iframe
                src={materi.url_video}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen
                class="w-full h-full"
              ></iframe>
            </div>
          </div>

          <div class="border-t border-gray-200">
            <dl>
              <!-- Basic Info -->
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Tutor</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{materi.tutor}</dd>
              </div>
              <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Durasi</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{materi.durasi}</dd>
              </div>
              <div class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt class="text-sm font-medium text-gray-500">Tingkat Kesulitan</dt>
                <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{materi.tingkat_kesulitan}</dd>
              </div>

              <!-- List Fields -->
              {#each ['apa_yang_akan_dipelajari', 'target_pembelajaran', 'prasyarat'] as field}
                <div class="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt class="text-sm font-medium text-gray-500 capitalize">{field.replace(/_/g, ' ')}</dt>
                  <dd class="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <ul class="border border-gray-200 rounded-md divide-y divide-gray-200">
                      {#each materi[field] as item}
                        <li class="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                          <div class="w-0 flex-1 flex items-center">
                            <svg class="flex-shrink-0 h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                            </svg>
                            <span class="ml-2 flex-1 w-0 truncate">{item}</span>
                          </div>
                        </li>
                      {/each}
                    </ul>
                  </dd>
                </div>
              {/each}
            </dl>
          </div>
        </div>
      {/if}
    </div>
  </main>
</div>
