<script>
  import { userRole } from '$lib/stores/authStore';
  
  export let href = '';
  export let icon = '';
  export let label = '';
  export let isCollapsed = false;
  export let allowedRoles = ['admin', 'guru', 'siswa'];

  $: isVisible = allowedRoles.includes($userRole);
</script>

{#if isVisible}
  <a
    {href}
    class="flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-gray-100 text-gray-600 hover:text-gray-900"
  >
    {@html icon}
    {#if !isCollapsed}
      <span class="ml-3">{label}</span>
    {/if}
  </a>
{/if}