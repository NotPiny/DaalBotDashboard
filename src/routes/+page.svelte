<script lang="ts">
    import type { LocalUserData } from "$lib/types";
    import { DBAPI } from "@daalbot/api";
    import { getMutualGuilds } from "@daalbot/api/dist/src/modules/currentUser";
    import config from '$lib/config.json';
    import { onMount } from "svelte";
    import { browser } from "$app/environment";

    let mutualGuilds: string[] = [];
    let userData: LocalUserData = {
        guilds: [],
        id: "",
        username: "",
        discriminator: "",
        global_name: null,
        avatar: null
    };
    let unknownGuilds = 0;

    onMount(() => {
        if (sessionStorage.getItem('guild')) {
            const guild = sessionStorage.getItem('guild');
            sessionStorage.removeItem('guild');

            window.location.href = `/Server/${guild}`;
        }
        const api = new DBAPI({
            auth: {
                token: localStorage.getItem('accessToken') || '',
                type: 'User'
            },
            guildId: '0' // Required but not required for the routes we need here
        });

        userData = localStorage.getItem('user') ? JSON.parse(localStorage.getItem('user') ?? '') : null;
        if (!userData) {
            console.warn('User not found - localStorage.getItem failed');
            window.location.href = '/Error?src=home&message=' + encodeURIComponent('User not found - localStorage.getItem failed');
        }

        userData.guilds = userData.guilds.filter(g => parseInt(g.permissions) & 0x20); // Filter out guilds that the user does not have the MANAGE_GUILD permission

        // Fetch mutual guilds
        getMutualGuilds(api).then(guilds => {
            mutualGuilds = guilds;

            for (let i = 0; i < mutualGuilds.length; i++) {
                const guildId = mutualGuilds[i];
                if (!userData.guilds.find(g => g.id === guildId)) {
                    unknownGuilds++;
                }
            }
        });
    })
</script>

<svelte:head>
    <title>Select Server</title>
</svelte:head>

<h2>
    Servers
</h2>
{#if mutualGuilds.length > 0}
    <ul>
        {#each mutualGuilds as guildId}
        {#if userData.guilds.find(g => g.id === guildId)}
            <a href={`/Server/${guildId}`}>
                <li>
                    <strong>{userData.guilds.find(g => g.id === guildId)?.name}</strong>
                </li>
            </a>
        {/if}
        {/each}
    </ul>
    {#if unknownGuilds > 0}
        <p>If you can't find the server you're looking for? It's because we couldn't lookup the details of {unknownGuilds} servers.</p>
        <button on:click={() => {
            if (!browser) return;
            const notFoundGuilds = userData.guilds.filter(g => !mutualGuilds.includes(g.id));
            
            alert(`All unknown servers: ${notFoundGuilds.map(g => g.id).join(', ')}`);
        }}>
            List Unknown Servers
        </button>
    {/if}
{:else}
    <p>No servers found</p>
{/if}
<h2>
    Uninvited
</h2>
{#if mutualGuilds.length == 0}
    <p>No servers found</p>
{:else}
    <ul>
        {#each userData.guilds.filter(g => !mutualGuilds.includes(g.id)) as guild}
            <a href={`${config.authURLInvite}&guild_id=${guild.id}`}>
                <li>
                    <strong>{guild.name}</strong>
                </li>
            </a>
        {/each}
    </ul>
{/if}

<style>
    h2 {
        font-size: 1.5rem;
        margin: 1rem 0;
    }

    ul {
        list-style: none;
        padding: 0;

        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
        gap: 1rem;
    }

    li {
        padding: 0.75rem;
        background-color: #3f3f3f;
        border-radius: 0.5rem;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        color: white;
        transition: background-color 0.3s ease;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        font-size: 1rem;

        height: 3rem;
        width: 12rem;
    }

    li:hover {
        background-color: #555;
        border-radius: 0.25rem;
    }

    a {
        text-decoration: none;
        color: inherit;
    }

    strong {
        font-weight: bold;
    }

    button {
        background-color: #4f4f4f;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 0.25rem;
        cursor: pointer;
        transition: background-color 0.3s ease;
    }

    @media (max-width: 600px) {
        li {
            width: 92%;
        }
    }
</style>