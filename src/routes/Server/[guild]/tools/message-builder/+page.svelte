<script lang="ts">
    import { onMount } from 'svelte';
    import { page } from '$app/state';
    import { sendMessage, getCurrentGuild } from '@daalbot/api/dist/src/modules';
    import { DBAPI } from '@daalbot/api';
    import type { CurrentGuildResponse } from '@daalbot/api/dist/src/modules/currentGuild';
    import { browser } from '$app/environment';
    import { MessageFlags } from 'discord-api-types/v10';

    let api: DBAPI;
    let channels: NonNullable<CurrentGuildResponse['channels']> = [];
    let channelId = '';
    let data = JSON.parse(decodeURIComponent(atob(page.url.searchParams.get('json') ?? btoa('{}'))));

    onMount(async() => {
        const guildId = page.params.guild;
        api = new DBAPI({
            auth: {
                token: localStorage.getItem('accessToken') || '',
                type: 'User'
            },
            guildId
        });

        try {
            const currentGuild = await getCurrentGuild(api, ['channels']);
            if (currentGuild.channels) {
                channels = currentGuild.channels;
            }
        } catch (error) {
            console.error('Failed to fetch channels:', error);
        }
    });
</script>

<h2>Destination</h2>
<select bind:value={channelId}>
    <option value="" disabled selected>Select a channel</option>
    {#each channels.filter(c => c.type == 0) as channel}
        <option value={channel.id}>
            #{channel.name}
        </option>
    {/each}
</select>

<h2>Actions</h2>
<a href={`https://hex.daalbot.xyz/components?min=1&redir=${encodeURIComponent(page.url.href)}`} class="button">
    Edit using Hex (visual)
</a>
<!-- svelte-ignore a11y_invalid_attribute - I know this should really be a button -->
<a href="javascript:void(0);" class="button" on:click={() => {
    data = JSON.parse(prompt('Enter your custom JSON:', JSON.stringify(data)) || JSON.stringify(data));
    window.location.search = `?json=${encodeURIComponent(btoa(JSON.stringify(data)))}`;
}}>
    Input custom JSON (advanced)
</a>

<!-- svelte-ignore a11y_invalid_attribute -->
<a href="javascript:void(0);" class="button success" on:click={() => {
    if (!JSON.stringify(data).trim()) {
        alert('No data to send.');
        return;
    }
    
    if (!channelId) {
        alert('Please select a destination channel.');
        return;
    }

    console.table(data);
    console.log('Sending message to channel:', channelId);

    sendMessage(api, {
        flags: MessageFlags.IsComponentsV2,
        components: data
    }, channelId);
}}>
    Send
</a>

<style>
    select {
        width: 100%;
        padding: 0.5rem;
        font-size: 1rem;
        border-radius: 0.25rem;
        border: 1px solid #ccc;
        background-color: #3f3f3f;
        border: none;
    }

    .button {
        display: inline-block;
        padding: 0.5rem 1rem;
        background-color: #4a90e2;
        color: white;
        text-decoration: none;
        border-radius: 0.25rem;
        transition: background-color 0.3s ease;
    }

    .success {
        background-color: #28a745;
    }
</style>