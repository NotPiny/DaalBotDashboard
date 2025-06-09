<script lang="ts">
    import type { LocalUserData } from "$lib/types";
    import { DBAPI } from "@daalbot/api";
    import { getMutualGuilds } from "@daalbot/api/dist/src/modules/currentUser";
    import config from '$lib/config.json';
    import { onMount } from "svelte";

    let mutualGuilds: string[] = [];
    let userData: LocalUserData = {
        guilds: [],
        id: "",
        username: "",
        discriminator: "",
        global_name: null,
        avatar: null
    };

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
            <a href={`/Server/${guildId}`}>
                <li>
                    {#if userData.guilds.find(g => g.id === guildId)}
                        <strong>{userData.guilds.find(g => g.id === guildId)?.name}</strong>
                    {:else}
                        <span>{guildId}</span>
                    {/if}
                </li>
            </a>
        {/each}
    </ul>
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

    span {
        font-weight: normal;
    }

    @media (max-width: 600px) {
        li {
            width: 92%;
        }
    }
</style>