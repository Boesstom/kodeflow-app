<script>
  import { createEventDispatcher } from 'svelte';
  import { supabase } from '$lib/supabaseClient';

  export let isOpen = false;
  export let editingClass = null;

  const dispatch = createEventDispatcher();

  let loading = false;
  let error = null;
  let programs = [];
  let formData = {
    nama: '',
    program_id: ''
  };

  $: if (editingClass) {
    formData = {
      nama: editingClass.nama,
      program_id: editingClass.program_id
    };
  }

  async function fetchPrograms() {
    try {
      loading = true;
      const { data, error } = await supabase
        .from('program')
        .select('id, nama')
        .order('nama');

      if (error) throw error;
      programs = data || [];
    } catch (err) {
      console.error('Error fetching programs:', err.message);
      error = 'Failed to load programs';
    } finally {
      loading = false;
    }
  }

  async function handleSubmit() {
    try {
      loading = true;
      error = null;

      if (!formData.nama.trim() || !formData.program_id) {
        throw new Error('Please fill in all required fields');
      }

      const { data, error: dbError } = editingClass
        ? await supabase
            .from('kelas')
            .update({
              nama: formData.nama,
              program_id: formData.program_id,
              updated_at: new Date().toISOString()
            })
            .eq('id', editingClass.id)
            .select()
        : await supabase
            .from('kelas')
            .insert([
              {
                nama: formData.nama,
                program_id: formData.program_id
              }
            ])
            .select();

      if (dbError) throw dbError;

      dispatch('success', {
        action: editingClass ? 'update' : 'create',
        kelas: data[0]
      });
      closeModal();
    } catch (err) {
      console.error('Error saving class:', err.message);
      error = err.message;
    } finally {
      loading = false;
    }
  }

  function closeModal() {
    formData = {
      nama: '',
      program_id: ''
    };
    error = null;
    dispatch('close');
  }

  $: if (isOpen) {
    fetchPrograms();
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
    <div class="relative top-20 mx-auto p-8 border max-w-2xl shadow-lg rounded-md bg-white w-full m-4">
      <div class="mt-3">
        <h3 class="text-xl font-medium text-gray-900 mb-6">
          {editingClass ? 'Edit Kelas' : 'Tambah Kelas Baru'}
        </h3>
        <form on:submit|preventDefault={handleSubmit} class="space-y-6">
          {#if error}
            <div class="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded relative" role="alert">
              {error}
            </div>
          {/if}

          <div class="space-y-2">
            <label for="nama" class="block text-sm font-medium text-gray-700">Nama Kelas</label>
            <input
              type="text"
              id="nama"
              bind:value={formData.nama}
              class="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Masukkan nama kelas"
              disabled={loading}
            />
          </div>

          <div class="space-y-2">
            <label for="program" class="block text-sm font-medium text-gray-700">Program</label>
            <select
              id="program"
              bind:value={formData.program_id}
              class="block w-full px-4 py-3 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              disabled={loading}
            >
              <option value="">Pilih Program</option>
              {#each programs as program}
                <option value={program.id}>{program.nama}</option>
              {/each}
            </select>
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
              {loading ? 'Menyimpan...' : editingClass ? 'Simpan' : 'Tambah'}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
{/if}