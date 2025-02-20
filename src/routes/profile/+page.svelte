<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { user, userRole } from '$lib/stores/authStore';

  let userData = null;
  let loading = true;
  let error = null;

  onMount(async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        userData = session.user;
      }
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  });
</script>

<div class="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-3xl mx-auto">
    <div class="bg-white shadow sm:rounded-lg">
      {#if loading}
        <div class="p-8 text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p class="mt-4 text-gray-600">Memuat profil...</p>
        </div>
      {:else if error}
        <div class="p-8 text-center text-red-600">
          {error}
        </div>
      {:else if userData}
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-2xl font-bold text-gray-900 mb-6">Informasi Profil</h3>
          
          <div class="space-y-6">
            <div>
              <h4 class="text-lg font-medium text-gray-700">Surel</h4>
              <p class="mt-1 text-gray-900">{userData.email}</p>
            </div>

            <div>
              <h4 class="text-lg font-medium text-gray-700">Peran</h4>
              <p class="mt-1 text-gray-900 capitalize">{$userRole}</p>
            </div>

            <div>
              <h4 class="text-lg font-medium text-gray-700">Account Created</h4>
              <p class="mt-1 text-gray-900">{new Date(userData.created_at).toLocaleDateString()}</p>
            </div>
          </div>
        </div>
      {:else}
        <div class="p-8 text-center text-gray-600">
          No profile information available
        </div>
      {/if}
    </div>
  </div>
</div>