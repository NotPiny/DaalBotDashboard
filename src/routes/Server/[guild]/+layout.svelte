<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { state } from '$lib/state.svelte';
    import { DBAPI, modules } from '@daalbot/api';

    onMount(async() => {
        const guildId = page.params.guild;
        const newApi = new DBAPI({
            auth: {
                token: localStorage.getItem('accessToken') || '',
                type: 'User'
            },
            guildId
        });
        
        const currentGuild = await modules.getCurrentGuild(newApi);
        if (!currentGuild) {
            alert('Guild not found - modules.getCurrentGuild failed');
            window.location.href = '/Error?type=failed';
        }

        state.guild = currentGuild;
        state.api = newApi;
    });
</script>

<slot />