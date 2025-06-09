<script lang="ts">
    import { page } from '$app/state';
    import { onMount } from 'svelte';

    onMount(() => {
        window.location.href = `/Error?src=svelte&message=${encodeURIComponent(page.error?.message || 'Unknown error')}`;
    });
</script>

<h1>
    {page.error?.message} - Redirecting...
</h1>