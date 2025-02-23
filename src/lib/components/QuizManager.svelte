<!-- QuizManager.svelte -->
<script>
  import { supabase } from '$lib/supabaseClient';
  import { onMount } from 'svelte';
  import { user } from '$lib/stores/authStore';

  export let quiz = {};
  export let materiId;

  let loading = false;
  let error = null;
  let stats = {
    totalAttempts: 0,
    averageScore: 0,
    passRate: 0,
    totalParticipants: 0
  };
  let attempts = [];

  // Search and filter states
  let searchQuery = '';
  let statusFilter = 'all'; // 'all', 'completed', 'in_progress'
  let dateFilter = 'all'; // 'all', 'today', 'week', 'month'
  let sortField = 'created_at';
  let sortDirection = 'desc';

  $: filteredAttempts = filterAttempts(attempts, searchQuery, statusFilter, dateFilter);
  $: sortedAttempts = sortAttempts(filteredAttempts, sortField, sortDirection);

  function filterAttempts(attempts, query, status, date) {
    return attempts.filter(attempt => {
      const matchesSearch = query === '' || 
        attempt.users?.full_name?.toLowerCase().includes(query.toLowerCase()) ||
        attempt.users?.email?.toLowerCase().includes(query.toLowerCase());

      const matchesStatus = status === 'all' || attempt.status === status;

      const attemptDate = new Date(attempt.created_at);
      const today = new Date();
      const matchesDate = date === 'all' ||
        (date === 'today' && attemptDate.toDateString() === today.toDateString()) ||
        (date === 'week' && attemptDate >= new Date(today - 7 * 24 * 60 * 60 * 1000)) ||
        (date === 'month' && attemptDate >= new Date(today.setMonth(today.getMonth() - 1)));

      return matchesSearch && matchesStatus && matchesDate;
    });
  }

  function sortAttempts(attempts, field, direction) {
    return [...attempts].sort((a, b) => {
      let aValue = field === 'created_at' ? new Date(a[field]) : (a[field] || 0);
      let bValue = field === 'created_at' ? new Date(b[field]) : (b[field] || 0);
      
      if (field === 'users') {
        aValue = a.users?.full_name?.toLowerCase() || '';
        bValue = b.users?.full_name?.toLowerCase() || '';
      }
      
      return direction === 'asc' 
        ? aValue > bValue ? 1 : -1
        : aValue < bValue ? 1 : -1;
    });
  }

  function toggleSort(field) {
    if (sortField === field) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortField = field;
      sortDirection = 'desc';
    }
  }

  onMount(async () => {
    await loadQuizStats();
  });

  async function loadQuizStats() {
    try {
      loading = true;

      // Get all attempts for this quiz
      const { data: attemptsData, error: attemptsError } = await supabase
        .from('quiz_attempts')
        .select(`
          *,
          users:user_id (
            full_name,
            email
          )
        `)
        .eq('quiz_id', quiz.id)
        .order('created_at', { ascending: false });

      if (attemptsError) throw attemptsError;

      attempts = attemptsData || [];

      // Calculate statistics
      const completedAttempts = attempts.filter(a => a.status === 'completed');
      stats.totalAttempts = completedAttempts.length;
      stats.totalParticipants = new Set(attempts.map(a => a.user_id)).size;
      
      if (completedAttempts.length > 0) {
        const totalScore = completedAttempts.reduce((sum, a) => sum + (a.score || 0), 0);
        stats.averageScore = Math.round(totalScore / completedAttempts.length);
        
        const passedAttempts = completedAttempts.filter(a => a.score >= quiz.min_score);
        stats.passRate = Math.round((passedAttempts.length / completedAttempts.length) * 100);
      }

    } catch (e) {
      error = 'Error loading quiz statistics: ' + e.message;
      console.error('Error loading quiz statistics:', e);
    } finally {
      loading = false;
    }
  }

  async function resetAttempts(userId) {
    if (!confirm('Apakah Anda yakin ingin mereset semua percobaan quiz untuk peserta ini?')) {
      return;
    }

    try {
      loading = true;

      const { error: deleteError } = await supabase
        .from('quiz_attempts')
        .delete()
        .eq('quiz_id', quiz.id)
        .eq('user_id', userId);

      if (deleteError) throw deleteError;

      await loadQuizStats();
    } catch (e) {
      error = 'Error resetting attempts: ' + e.message;
      console.error('Error resetting attempts:', e);
    } finally {
      loading = false;
    }
  }

  function exportToCSV() {
    // Prepare data for CSV
    const csvData = sortedAttempts.map(attempt => ({
      'Nama Peserta': attempt.users?.full_name || 'Unknown',
      'Email': attempt.users?.email || 'Unknown',
      'Tanggal': new Date(attempt.created_at).toLocaleDateString(),
      'Waktu': new Date(attempt.created_at).toLocaleTimeString(),
      'Nilai': attempt.score || 0,
      'Status': attempt.status === 'completed' ? 'Selesai' : 'Dalam Proses',
      'Lulus': (attempt.score || 0) >= quiz.min_score ? 'Ya' : 'Tidak'
    }));

    // Convert to CSV string
    const headers = Object.keys(csvData[0]);
    const csvString = [
      headers.join(','),
      ...csvData.map(row => headers.map(header => JSON.stringify(row[header])).join(','))
    ].join('\n');

    // Create and download file
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `quiz-statistics-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }
</script>

<div class="bg-white shadow sm:rounded-lg">
  <div class="px-4 py-5 sm:p-6">
    {#if loading}
      <div class="flex justify-center">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    {:else if error}
      <div class="rounded-md bg-red-50 p-4">
        <div class="flex">
          <div class="ml-3">
            <h3 class="text-sm font-medium text-red-800">Error</h3>
            <div class="mt-2 text-sm text-red-700">
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    {:else}
      <!-- Quiz Statistics with Enhanced Visualization -->
      <div class="mb-6">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Statistik Quiz</h3>
        
        <!-- Statistics Cards -->
        <div class="grid grid-cols-1 gap-5 sm:grid-cols-4 mb-8">
          <div class="px-4 py-5 bg-gradient-to-br from-blue-500 to-blue-600 shadow rounded-lg overflow-hidden sm:p-6">
            <dt class="text-sm font-medium text-white truncate">Total Percobaan</dt>
            <dd class="mt-1 text-3xl font-semibold text-white">{stats.totalAttempts}</dd>
          </div>
          <div class="px-4 py-5 bg-gradient-to-br from-green-500 to-green-600 shadow rounded-lg overflow-hidden sm:p-6">
            <dt class="text-sm font-medium text-white truncate">Rata-rata Nilai</dt>
            <dd class="mt-1 text-3xl font-semibold text-white">{stats.averageScore}%</dd>
          </div>
          <div class="px-4 py-5 bg-gradient-to-br from-yellow-500 to-yellow-600 shadow rounded-lg overflow-hidden sm:p-6">
            <dt class="text-sm font-medium text-white truncate">Tingkat Kelulusan</dt>
            <dd class="mt-1 text-3xl font-semibold text-white">{stats.passRate}%</dd>
          </div>
          <div class="px-4 py-5 bg-gradient-to-br from-purple-500 to-purple-600 shadow rounded-lg overflow-hidden sm:p-6">
            <dt class="text-sm font-medium text-white truncate">Total Peserta</dt>
            <dd class="mt-1 text-3xl font-semibold text-white">{stats.totalParticipants}</dd>
          </div>
        </div>

        <!-- Progress Bar -->
        <div class="bg-gray-100 rounded-full h-4 mb-8">
          <div
            class="bg-green-500 h-4 rounded-full transition-all duration-500"
            style="width: {stats.passRate}%"
          >
          </div>
        </div>
      </div>

      <!-- Search and Filter Controls -->
      <div class="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <!-- Search -->
        <div class="relative">
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Cari nama atau email..."
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <!-- Status Filter -->
        <div>
          <select
            bind:value={statusFilter}
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="all">Semua Status</option>
            <option value="completed">Selesai</option>
            <option value="in_progress">Dalam Proses</option>
          </select>
        </div>

        <!-- Date Filter -->
        <div>
          <select
            bind:value={dateFilter}
            class="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="all">Semua Waktu</option>
            <option value="today">Hari Ini</option>
            <option value="week">Minggu Ini</option>
            <option value="month">Bulan Ini</option>
          </select>
        </div>

        <!-- Export Button -->
        <div>
          <button
            type="button"
            on:click={exportToCSV}
            class="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Export CSV
          </button>
        </div>
      </div>

      <!-- Attempts Table -->
      <div class="mt-8">
        <h3 class="text-lg font-medium text-gray-900 mb-4">Riwayat Percobaan</h3>
        <div class="flex flex-col">
          <div class="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
              <div class="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg">
                <table class="min-w-full divide-y divide-gray-300">
                  <thead class="bg-gray-50">
                    <tr>
                      <th 
                        scope="col" 
                        class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-6 cursor-pointer"
                        on:click={() => toggleSort('users')}
                      >
                        Peserta
                        {#if sortField === 'users'}
                          <span class="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        {/if}
                      </th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Email</th>
                      <th 
                        scope="col" 
                        class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                        on:click={() => toggleSort('created_at')}
                      >
                        Tanggal
                        {#if sortField === 'created_at'}
                          <span class="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        {/if}
                      </th>
                      <th 
                        scope="col" 
                        class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900 cursor-pointer"
                        on:click={() => toggleSort('score')}
                      >
                        Nilai
                        {#if sortField === 'score'}
                          <span class="ml-1">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                        {/if}
                      </th>
                      <th scope="col" class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                      <th scope="col" class="relative py-3.5 pl-3 pr-4 sm:pr-6">
                        <span class="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-200 bg-white">
                    {#each sortedAttempts as attempt}
                      <tr>
                        <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-gray-900 sm:pl-6">
                          {attempt.users?.full_name || 'Unknown'}
                        </td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {attempt.users?.email || 'Unknown'}
                        </td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {new Date(attempt.created_at).toLocaleString()}
                        </td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                          {attempt.score ? `${attempt.score}%` : '-'}
                        </td>
                        <td class="whitespace-nowrap px-3 py-4 text-sm">
                          {#if attempt.status === 'completed'}
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {attempt.score >= quiz.min_score ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}">
                              {attempt.score >= quiz.min_score ? 'Lulus' : 'Tidak Lulus'}
                            </span>
                          {:else}
                            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                              Dalam Proses
                            </span>
                          {/if}
                        </td>
                        <td class="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                          <button
                            type="button"
                            on:click={() => resetAttempts(attempt.user_id)}
                            class="text-red-600 hover:text-red-900"
                          >
                            Reset
                          </button>
                        </td>
                      </tr>
                    {/each}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </div>
</div>
