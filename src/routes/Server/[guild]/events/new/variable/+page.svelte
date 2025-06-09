<script lang="ts">
    import { browser } from "$app/environment";
    import { page } from "$app/state";
    import { DBAPI, modules } from "@daalbot/api";
    import type { Event } from "@daalbot/api/dist/src/modules/events";
    import { onMount } from "svelte";

    let api: DBAPI;
    let events: Event[] = [];
    let scope = 'global';
    let value = '';
    let name = '';

    onMount(async() => {
        api = new DBAPI({
            auth: {
                token: localStorage.getItem('accessToken') || '',
                type: 'User'
            },
            guildId: page.params.guild
        });

        events = await modules.getEvents(api);
    })
</script>

<form on:submit={async() => {
    if (!browser) return;
    if (!name || !value || !scope) return alert('Please fill in all fields');
    if (scope != 'global' && events.find(e => e.id === scope) === undefined) return alert('Invalid scope (must be a valid event ID or "global")');
    await modules.setEventVariable(api, scope, name, value);

    window.location.href = `/Server/${page.params.guild}/events#variables`;
}}>
    <input type="text" class="input" bind:value={name} placeholder="Enter variable name" />
    <input type="text" class="input" bind:value={value} placeholder="Enter variable value" />
    <input type="text" class="input" bind:value={scope} placeholder="Enter variable scope" />
    <button type="submit">Submit</button>
</form>

<style>
    input:first-child {
        margin-top: 0;
    }

    input {
        background-color: #2f2f2f;
        color: white;
        border: none;
        padding: 0.75rem 1rem;
        border-radius: 0.5rem;
        width: 98.4%;
        margin-top: 1rem;
    }

    button {
        background-color: #826ae3;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        cursor: pointer;
        font-weight: bolder;
        font-size: 1.25rem;
        transition: background-color 0.3s ease;
        margin-top: 1rem;
        width: 100%;

        flex: 1;
    }
</style>