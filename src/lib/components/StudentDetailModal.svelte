<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  
  export let student = null;
  export let showModal = false;
  let classes = [];

  $: if (showModal && student) {
    loadClasses();
  }

  async function loadClasses() {
    try {
      console.log('Loading classes for student ID:', student.id); // Debug log

      const { data, error } = await supabase
        .from('kelas_peserta')
        .select(`
          kelas_id,
          kelas:kelas_id (
            id,
            nama
          )
        `)
        .eq('peserta_id', student.id);

      if (error) throw error;

      console.log('Raw data from query:', data); // Debug log
      
      classes = data
        ?.filter(item => item.kelas) // Filter out any null kelas
        ?.map(item => item.kelas.nama)
        ?.filter(Boolean) || [];

      console.log('Processed classes:', classes); // Debug log
    } catch (e) {
      console.error('Error loading classes:', e);
      classes = [];
    }
  }

  function closeModal() {
    showModal = false;
    classes = [];
  }
</script>

{#if showModal && student}
  <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity z-50">
    <div class="fixed inset-0 z-50 overflow-y-auto">
      <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div class="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg">
          <div class="bg-white px-4 pb-4 pt-5 sm:p-6 sm:pb-4">
            <div class="sm:flex sm:items-start">
              <div class="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left w-full">
                <h3 class="text-xl font-semibold leading-6 text-gray-900 mb-4">
                  Detail Peserta
                </h3>
                <div class="mt-2 space-y-4">
                  <div>
                    <p class="text-sm font-medium text-gray-500">Nama</p>
                    <p class="text-base text-gray-900">{student.nama || '-'}</p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-500">Email</p>
                    <p class="text-base text-gray-900">{student.email || '-'}</p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-500">Telepon</p>
                    <p class="text-base text-gray-900">{student.telfon || '-'}</p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-500">Status</p>
                    <p class="text-base text-gray-900">
                      <span class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full {student.aktif ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                        {student.aktif ? 'Aktif' : 'Tidak Aktif'}
                      </span>
                    </p>
                  </div>
                  <div>
                    <p class="text-sm font-medium text-gray-500">Kelas yang Diikuti</p>
                    {#if classes.length > 0}
                      <ul class="mt-1 space-y-1">
                        {#each classes as kelas}
                          <li class="text-base text-gray-900">{kelas}</li>
                        {/each}
                      </ul>
                    {:else}
                      <p class="text-base text-gray-900">-</p>
                    {/if}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div class="bg-gray-50 px-4 py-3 sm:flex sm:flex-row-reverse sm:px-6">
            <button
              type="button"
              class="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
              on:click={closeModal}
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}