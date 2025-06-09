<script lang="ts">
    import { onMount } from "svelte";
    import { page } from "$app/state";
    import { DBAPI } from "@daalbot/api";
    import * as xp from "@daalbot/api/dist/src/modules/xp";
    import { getCurrentGuild } from "@daalbot/api/dist/src/modules";
    import type { CurrentGuildResponse } from "@daalbot/api/dist/src/modules/currentGuild";

    let loaded = false;
    let loadingState = 0;
    let startingUsers: Array<{
        user: string;
        xp: number;
    }> = [];
    let users: Array<{
        user: string;
        xp: number;
    }> = [];
    let guildData: CurrentGuildResponse;
    let searchInput = "";

    setInterval(() => {
        loadingState++;
        if (loadingState > 3) {
            loadingState = 0;
        }
    }, 300);

    onMount(async() => {
        const guildId = page.params.guild;

        const api = new DBAPI({
            auth: {
                token: localStorage.getItem("accessToken") || "",
                type: "User"
            },
            guildId
        });

        guildData = await getCurrentGuild(api);
        users = await xp.getUsersWithXP(api);
        startingUsers = users;

        users.sort((a, b) => b.xp - a.xp);
        if (users.length === 0) {
            users = [{ user: "No users found", xp: 0 }];
        }

        loaded = true;
    });
</script>

{#if !loaded}
    <h1>Loading{'.'.repeat(loadingState)}</h1>
{:else}
    <input placeholder="Search for a user..." type="text" bind:value={searchInput} on:input={() => {
        users = startingUsers.filter(user => {
            const member = guildData.members.find(m => m.userId == user.user);
            return member && (member.nickname?.toLowerCase().includes(searchInput.toLowerCase()) || member.displayName?.toLowerCase().includes(searchInput.toLowerCase()));
        });
    }} />
    <table>
        <thead>
            <tr>
                <th>User</th>
                <th>XP</th>
            </tr>
        </thead>
        <tbody>
            {#each users as user}
                <tr>
                    <td aria-label="User Name">{guildData.members.find(m => m.userId == user.user)?.nickname ?? guildData.members.find(m => m.userId == user.user)?.displayName ?? `Unknown [${user.user}]`}</td>
                    <td aria-label="User XP" on:click={() => {
                        const newValue = prompt("Enter new XP value for " + (guildData.members.find(m => m.userId == user.user)?.nickname ?? guildData.members.find(m => m.userId == user.user)?.displayName ?? `Unknown [${user.user}]`), user.xp.toString());
                        
                        if (newValue !== null && !isNaN(Number(newValue))) {
                            const api = new DBAPI({
                                auth: {
                                    token: localStorage.getItem("accessToken") || "",
                                    type: "User"
                                },
                                guildId: page.params.guild
                            });
                            xp.set(api, user.user, Number(newValue)).then(() => {
                                user.xp = Number(newValue);
                                users = users.sort((a, b) => b.xp - a.xp); // Re-sort the users after updating XP
                            }).catch(err => {
                                alert("Failed to update XP: " + err.message);
                            });
                        }
                    }}>{user.xp}<sl-visually-hidden><button>edit</button></sl-visually-hidden></td>
                </tr>
            {/each}
        </tbody>
    </table>
{/if}

<style>
    table {
        width: 100%;
        border-collapse: collapse;
    }

    th, td {
        padding: 8px;
        text-align: left;

        border-color: #3f3f3f;
        border-style: solid;
        border-width: 1px;
        color: #fff;
        background-color: #1f1f1f;
        font-size: 1rem;
        transition: background-color 0.3s ease;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    }

    th:hover, td:hover {
        background-color: #2f2f2f;
    }

    td[aria-label="User XP"] {
        cursor: pointer;
    }

    h1 {
        text-align: center;
        margin-top: 20px;
    }

    input {
        width: 100%;
        padding: 8px;
        margin-bottom: 20px;
        box-sizing: border-box;

        background-color: #2f2f2f;
        color: #fff;
        border: 1px solid #444;
        border-radius: 4px;
        font-size: 1rem;
        transition: border-color 0.3s ease;
    }
</style>