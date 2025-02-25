<script>
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import Navbar from '$lib/components/Navbar.svelte';
  import Sidebar from '$lib/components/Sidebar.svelte';

  let loading = false;
  let error = null;
  let success = null;
  let activeTab = 'profile';
  let user = null;
  let formData = {
    profile: {
      name: '',
      email: '',
      phone: ''
    },
    appearance: {
      theme: 'light',
      language: 'id'
    },
    notifications: {
      email: true,
      push: true,
      schedule: true
    },
    security: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    }
  };

  onMount(async () => {
    const { data: { user: currentUser } } = await supabase.auth.getUser();
    if (currentUser) {
      user = currentUser;
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (data) {
        formData.profile = {
          ...formData.profile,
          name: data.full_name || '',
          phone: data.phone || ''
        };

        // Load saved notification preferences
        const savedNotifications = localStorage.getItem(`notifications_${user.id}`);
        if (savedNotifications) {
          formData.notifications = JSON.parse(savedNotifications);
        }
      }
    }
  });

  async function saveNotifications() {
    try {
      loading = true;
      error = null;
      success = null;

      // Save to localStorage
      localStorage.setItem(`notifications_${user.id}`, JSON.stringify(formData.notifications));

      // Save to Supabase
      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          notification_preferences: formData.notifications,
          updated_at: new Date()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;
      success = 'Notification preferences saved successfully';
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  async function saveAppearance() {
    try {
      loading = true;
      error = null;
      success = null;

      // Save to localStorage
      localStorage.setItem('theme', formData.appearance.theme);
      localStorage.setItem('language', formData.appearance.language);

      // Apply theme
      document.documentElement.classList.remove('light', 'dark');
      if (formData.appearance.theme === 'system') {
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.add(prefersDark ? 'dark' : 'light');
      } else {
        document.documentElement.classList.add(formData.appearance.theme);
      }

      success = 'Appearance settings saved';
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  async function updateProfile() {
    try {
      loading = true;
      error = null;
      success = null;

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.profile.name,
          phone: formData.profile.phone,
          updated_at: new Date()
        })
        .eq('id', user.id);

      if (updateError) throw updateError;
      success = 'Profile updated successfully';
    } catch (e) {
      error = e.message;
    } finally {
      loading = false;
    }
  }

  async function updatePassword() {
    try {
      loading = true;
      error = null;
      success = null;

      if (formData.security.newPassword !== formData.security.confirmPassword) {
        throw new Error('New passwords do not match');
      }

      const { error: passwordError } = await supabase.auth.updateUser({
        password: formData.security.newPassword
      });

      if (passwordError) throw passwordError;
      success = 'Password updated successfully';
      formData.security = {
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      };
    } catch (e) {
      error = e.message;
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
      <div class="mb-8">
        <h1 class="text-2xl font-semibold text-gray-900">Settings</h1>
      </div>

      <!-- Error/Success Messages -->
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

      {#if success}
        <div class="mb-4 bg-green-50 border-l-4 border-green-400 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <p class="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      {/if}

      <!-- Settings Navigation -->
      <div class="border-b border-gray-200">
        <nav class="-mb-px flex space-x-8">
          <button
            class="{activeTab === 'profile' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            on:click={() => activeTab = 'profile'}
          >
            Profile
          </button>
          <button
            class="{activeTab === 'appearance' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            on:click={() => activeTab = 'appearance'}
          >
            Appearance
          </button>
          <button
            class="{activeTab === 'notifications' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            on:click={() => activeTab = 'notifications'}
          >
            Notifications
          </button>
          <button
            class="{activeTab === 'security' ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'} whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm"
            on:click={() => activeTab = 'security'}
          >
            Security
          </button>
        </nav>
      </div>

      <!-- Settings Content -->
      <div class="mt-6">
        {#if activeTab === 'profile'}
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-medium leading-6 text-gray-900">Profile Information</h3>
              <p class="mt-1 text-sm text-gray-500">Update your personal information.</p>
            </div>

            <div class="grid grid-cols-1 gap-6">
              <div>
                <label for="name" class="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  id="name"
                  bind:value={formData.profile.name}
                  class="mt-1 block w-full h-12 px-4 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-base"
                />
              </div>

              <div>
                <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  id="email"
                  value={user?.email || ''}
                  disabled
                  class="mt-1 block w-full h-12 px-4 rounded-md border-gray-300 bg-gray-50 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-base"
                />
              </div>

              <div>
                <label for="phone" class="block text-sm font-medium text-gray-700">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  bind:value={formData.profile.phone}
                  class="mt-1 block w-full h-12 px-4 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-base"
                />
              </div>
            </div>

            <div class="flex justify-end">
              <button
                type="button"
                class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                on:click={updateProfile}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        {/if}

        {#if activeTab === 'appearance'}
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-medium leading-6 text-gray-900">Appearance Settings</h3>
              <p class="mt-1 text-sm text-gray-500">Customize your interface preferences.</p>
            </div>

            <div class="grid grid-cols-1 gap-6">
              <div>
                <label for="theme" class="block text-sm font-medium text-gray-700">Theme</label>
                <select
                  id="theme"
                  bind:value={formData.appearance.theme}
                  class="mt-1 block w-full h-12 px-4 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-base"
                >
                  <option value="light">Light</option>
                  <option value="dark">Dark</option>
                  <option value="system">System</option>
                </select>
              </div>

              <div>
                <label for="language" class="block text-sm font-medium text-gray-700">Language</label>
                <select
                  id="language"
                  bind:value={formData.appearance.language}
                  class="mt-1 block w-full h-12 px-4 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-base"
                >
                  <option value="id">Bahasa Indonesia</option>
                  <option value="en">English</option>
                </select>
              </div>
            </div>

            <div class="flex justify-end">
              <button
                type="button"
                class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                on:click={saveAppearance}
                disabled={loading}
              >
                Save Preferences
              </button>
            </div>
          </div>
        {/if}

        {#if activeTab === 'notifications'}
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-medium leading-6 text-gray-900">Notification Preferences</h3>
              <p class="mt-1 text-sm text-gray-500">Choose how you want to be notified.</p>
            </div>

            <div class="space-y-4">
              <div class="flex items-center">
                <input
                  type="checkbox"
                  id="emailNotifications"
                  bind:checked={formData.notifications.email}
                  class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label for="emailNotifications" class="ml-3">
                  <span class="text-sm font-medium text-gray-700">Email notifications</span>
                  <p class="text-sm text-gray-500">Receive updates via email</p>
                </label>
              </div>

              <div class="flex items-center">
                <input
                  type="checkbox"
                  id="pushNotifications"
                  bind:checked={formData.notifications.push}
                  class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label for="pushNotifications" class="ml-3">
                  <span class="text-sm font-medium text-gray-700">Push notifications</span>
                  <p class="text-sm text-gray-500">Receive updates on your device</p>
                </label>
              </div>

              <div class="flex items-center">
                <input
                  type="checkbox"
                  id="scheduleNotifications"
                  bind:checked={formData.notifications.schedule}
                  class="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded"
                />
                <label for="scheduleNotifications" class="ml-3">
                  <span class="text-sm font-medium text-gray-700">Schedule notifications</span>
                  <p class="text-sm text-gray-500">Receive schedule-related updates</p>
                </label>
              </div>
            </div>

            <div class="flex justify-end">
              <button
                type="button"
                class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                on:click={saveNotifications}
                disabled={loading}
              >
                Save Preferences
              </button>
            </div>
          </div>
        {/if}

        {#if activeTab === 'security'}
          <div class="space-y-6">
            <div>
              <h3 class="text-lg font-medium leading-6 text-gray-900">Security Settings</h3>
              <p class="mt-1 text-sm text-gray-500">Update your password and security preferences.</p>
            </div>

            <div class="grid grid-cols-1 gap-6">
              <div>
                <label for="currentPassword" class="block text-sm font-medium text-gray-700">Current Password</label>
                <input
                  type="password"
                  id="currentPassword"
                  bind:value={formData.security.currentPassword}
                  class="mt-1 block w-full h-12 px-4 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-base"
                />
              </div>

              <div>
                <label for="newPassword" class="block text-sm font-medium text-gray-700">New Password</label>
                <input
                  type="password"
                  id="newPassword"
                  bind:value={formData.security.newPassword}
                  class="mt-1 block w-full h-12 px-4 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-base"
                />
              </div>

              <div>
                <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm New Password</label>
                <input
                  type="password"
                  id="confirmPassword"
                  bind:value={formData.security.confirmPassword}
                  class="mt-1 block w-full h-12 px-4 rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 text-base"
                />
              </div>
            </div>

            <div class="flex justify-end">
              <button
                type="button"
                class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                on:click={updatePassword}
                disabled={loading || !formData.security.currentPassword || !formData.security.newPassword || !formData.security.confirmPassword}
              >
                {loading ? 'Updating...' : 'Update Password'}
              </button>
            </div>
          </div>
        {/if}

      </div>
    </div>
  </main>
</div>