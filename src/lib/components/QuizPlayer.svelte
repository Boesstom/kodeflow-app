<!-- QuizPlayer.svelte -->
<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { user } from '$lib/stores/authStore';

  export let quiz = null;
  export let materiId;

  let attempts = [];
  let remainingAttempts = 0;
  let bestScore = 0;
  let latestScore = 0;
  let loading = false;
  let error = null;
  let quizStarted = false;

  $: if (quiz?.id && $user?.id && !loading) {
    console.log('Loading quiz attempts for quiz:', quiz);
    loadAttempts();
  }

  async function loadAttempts() {
    try {
      loading = true;

      const { data, error: err } = await supabase
        .from('quiz_attempts')
        .select('*')
        .eq('quiz_id', quiz.id)
        .eq('user_id', $user.id)
        .order('created_at', { ascending: false });

      if (err) throw err;

      attempts = data || [];
      remainingAttempts = quiz.attempts_allowed - attempts.length;
      
      if (attempts.length > 0) {
        bestScore = Math.max(...attempts.map(a => a.score || 0));
        latestScore = attempts[0].score || 0;
      }
    } catch (e) {
      console.error('Error loading quiz attempts:', e);
      error = e.message;
    } finally {
      loading = false;
    }
  }

  async function startQuiz() {
    try {
      if (!quiz?.id) {
        throw new Error('Quiz data not available');
      }

      if (remainingAttempts <= 0) {
        throw new Error('Anda telah mencapai batas maksimum percobaan');
      }

      const { data, error: err } = await supabase
        .from('quiz_attempts')
        .insert([
          {
            quiz_id: quiz.id,
            user_id: $user.id,
            materi_id: materiId,
            status: 'in_progress'
          }
        ])
        .select()
        .single();

      if (err) throw err;

      quizStarted = true;
      window.addEventListener('message', handleH5PMessage);
    } catch (e) {
      error = e.message;
      console.error('Error starting quiz:', e);
    }
  }

  function handleH5PMessage(event) {
    if (event.data && event.data.statement) {
      const statement = event.data.statement;
      if (statement.verb.id === 'http://adlnet.gov/expapi/verbs/completed') {
        const score = statement.result.score.scaled * 100;
        saveQuizResult(score);
      }
    }
  }

  async function saveQuizResult(score) {
    try {
      const { error: err } = await supabase
        .from('quiz_attempts')
        .update({
          score: score,
          status: 'completed',
          completed_at: new Date().toISOString()
        })
        .eq('quiz_id', quiz.id)
        .eq('user_id', $user.id)
        .eq('status', 'in_progress');

      if (err) throw err;

      await loadAttempts();
      quizStarted = false;
    } catch (e) {
      error = e.message;
      console.error('Error saving quiz result:', e);
    }
  }

  onMount(() => {
    return () => {
      window.removeEventListener('message', handleH5PMessage);
    };
  });
</script>

<div class="bg-white shadow sm:rounded-lg">
  <div class="px-4 py-5 sm:p-6">
    {#if !quiz?.id}
      <div class="text-center text-gray-500">
        Quiz data not available
      </div>
    {:else if loading}
      <div class="flex justify-center items-center py-12">
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
    {:else if !quizStarted}
      <!-- Quiz Info -->
      <div class="mb-6 bg-blue-50 border-l-4 border-blue-400 p-4">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <p class="text-sm text-blue-700">
              Nilai minimum untuk lulus: <span class="font-medium">{quiz.min_score}%</span><br>
              Jumlah percobaan maksimal: <span class="font-medium">{quiz.attempts_allowed}</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Quiz Stats -->
      <div class="mb-6 grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div class="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
          <dt class="text-sm font-medium text-gray-500 truncate">Sisa Percobaan</dt>
          <dd class="mt-1 text-3xl font-semibold text-gray-900">{remainingAttempts}</dd>
        </div>
        <div class="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
          <dt class="text-sm font-medium text-gray-500 truncate">Nilai Terbaik</dt>
          <dd class="mt-1 text-3xl font-semibold text-gray-900">{bestScore}%</dd>
        </div>
        <div class="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6">
          <dt class="text-sm font-medium text-gray-500 truncate">Nilai Terakhir</dt>
          <dd class="mt-1 text-3xl font-semibold text-gray-900">{latestScore}%</dd>
        </div>
      </div>

      <!-- Start Quiz Button -->
      {#if remainingAttempts > 0}
        <div class="mt-6 flex justify-center">
          <button
            type="button"
            class="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            on:click={startQuiz}
          >
            <svg class="h-5 w-5 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clip-rule="evenodd" />
            </svg>
            Mulai Quiz
          </button>
        </div>
      {:else}
        <div class="mt-6 text-center">
          <p class="text-sm text-red-600 font-medium">
            Anda telah mencapai batas maksimum percobaan
          </p>
        </div>
      {/if}

      <!-- Attempt History -->
      {#if attempts.length > 0}
        <div class="mt-8">
          <h3 class="text-lg font-medium text-gray-900 mb-4">Riwayat Percobaan</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-300">
              <thead class="bg-gray-50">
                <tr>
                  <th class="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Tanggal</th>
                  <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Nilai</th>
                  <th class="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-200 bg-white">
                {#each attempts as attempt}
                  <tr>
                    <td class="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-gray-900">
                      {new Date(attempt.created_at).toLocaleDateString()}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {attempt.score ? `${attempt.score}%` : '-'}
                    </td>
                    <td class="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                      {attempt.status === 'completed' ? 'Selesai' : 'Sedang Berjalan'}
                    </td>
                  </tr>
                {/each}
              </tbody>
            </table>
          </div>
        </div>
      {/if}
    {:else}
      <!-- Quiz Player -->
      <div class="w-full max-w-4xl mx-auto">
        <div class="relative" style="padding-bottom: 75%;">
          <iframe
            title="H5P Quiz"
            src={quiz.h5p_file_url}
            class="absolute top-0 left-0 w-full h-full"
            allowfullscreen
          ></iframe>
        </div>
      </div>
    {/if}
  </div>
</div>
