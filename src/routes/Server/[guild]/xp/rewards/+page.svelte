<script lang="ts">
    import { page } from "$app/state";
    import { DBAPI, modules } from "@daalbot/api";
    import type { CurrentGuildResponse } from "@daalbot/api/dist/src/modules/currentGuild";
    import { onMount } from "svelte";

    let api: DBAPI;
    let guildData: Partial<CurrentGuildResponse> & {
        roles: CurrentGuildResponse['roles'];
    };
    let roleIdConversion: { [key: string]: string } = {};
    let xpRewards: Array<{level: number, reward: string}> = [];
    let shouldRenderModal = '';
    let level = 0;
    let reward = '';

    onMount(async () => {
        api = new DBAPI({
            auth: {
                token: localStorage.getItem('accessToken') || '',
                type: 'User'
            },
            guildId: page.params.guild
        });

        guildData = await modules.getCurrentGuild(api);

        for (let i = 0; i < guildData.roles.length; i++) {
            roleIdConversion[guildData.roles[i].id] = guildData.roles[i].name;
            console.log(roleIdConversion)
        }

        // TODO (types): Library has incorrect typing for this function
        // @ts-ignore
        xpRewards = (await modules.getXPRewards(api)).sort((a, b) => a.level - b.level);
    });
</script>

<svelte:head>
    <title>
        XP Rewards - {guildData?.userData?.name}
    </title>
</svelte:head>

{#snippet creationModal()}
    <div class="modal">
        <div class="modal-content">
            <button on:click={() => { shouldRenderModal = ''; }}>Close</button>
            <h2>Create XP Reward</h2>
            <form on:submit={async(e) => {
                e.preventDefault();
                if (!level || !reward) return alert('Please fill in all fields');
                if (xpRewards.find(r => r.level === level) != undefined && !confirm('Level already exists, do you want to overwrite it?')) return;
                if (guildData.roles.find(r => r.id === reward) === undefined) return alert('Invalid role');

                await modules.addXPReward(api, level, reward);
                xpRewards.push({ level, reward });
                shouldRenderModal = '';
            }}>
                <input type="number" bind:value={level} placeholder="Enter level" />
                <select bind:value={reward} required>
                    <option value="" disabled selected>Select a role</option>
                    {#each guildData.roles as role}
                        <option value={role.id}>{role.name}</option>
                    {/each}
                </select>
                <button type="submit">Submit</button>
            </form>
        </div>
        <!-- svelte-ignore a11y_click_events_have_key_events a11y_no_static_element_interactions -->
        <div class="modal-overlay" on:click={() => { shouldRenderModal = ''; }}></div>
    </div>

    <style>
        .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
        }
        .modal-content {
            background-color: #2f2f2f;
            padding: 1rem;
            border-radius: 0.5rem;
            z-index: 1001;
        }
        .modal-overlay {
            position: absolute;
            top: 0;
            left: 0;
            z-index: 999;
            width: 100%;
            height: 100%;
            background-color: rgba(0, 0, 0, 0.5);
        }

        .modal button:first-child {
            margin-top: 0;
        }

        .modal button {
            background-color: #3f3f3f;
            border: none;
            border-radius: .75rem;
            width: 100%;
            padding: 0.5rem 2rem;

            cursor: pointer;

            margin-top: 1rem;
        }

        input:first-child {
            margin-top: 0;
        }

        input {
            background-color: #3f3f3f;
            color: white;
            border: none;
            padding: 0.75rem 1rem;
            border-radius: 0.5rem;
            width: 95%;
            margin-top: 1rem;
        }

        .modal button {
            background-color: #3f3f3f;
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

        select {
            background-color: #3f3f3f;
            color: white;
            border: none;
            padding: 0.75rem 1rem;
            border-radius: 0.5rem;
            width: 100%;
            margin-top: 1rem;
        }

        select:focus {
            outline: none;
            box-shadow: 0 0 0 2px #826ae3;
        }
    </style>
{/snippet}

<table>
    <thead>
        <tr>
            <th>Level</th>
            <th>Reward</th>
            <th>Actions</th>
        </tr>
    </thead>
    <tbody>
        {#if xpRewards.length > 0}
        {#each xpRewards as { level, reward }}
            <tr>
                <td>{level}</td>
                <td>@{roleIdConversion[reward]}</td>
                <td class="actions">
                    <button on:click={async () => {
                        await modules.deleteXPReward(api, level);
                        xpRewards = xpRewards.filter(r => r.level !== level);
                    }}>Remove</button>
                    <button on:click={() => {
                        shouldRenderModal = 'creation';
                        level = level;
                        reward = reward;
                    }}>Edit</button>
                </td>
            </tr>
        {/each}
        {:else}
            <tr>
                <td colspan="3">No XP rewards set / Still loading</td>
            </tr>
        {/if}
    </tbody>
</table>

<button on:click={() => { shouldRenderModal = 'creation'; }}>Create XP Reward</button>

{#if shouldRenderModal === 'creation'}
    {@render creationModal()}
{/if}

<style>
    table {
        width: 100%;
        border-collapse: collapse;
    }

    th, td {
        padding: 0.5rem;
        text-align: left;
        border-bottom: 1px solid #ddd;
    }

    th {
        background-color: #2f2f2f;
    }

    button {
        background-color: #826ae3;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        cursor: pointer;

        width: 100%;

        transition: background-color 0.3s ease;
    }

    button:hover {
        background-color: #6f5ce8;
    }

    .actions {
        display: flex;
        justify-content: space-between;

        align-items: center;
        gap: 1rem;
        flex-direction: row;
        flex-wrap: nowrap;
        width: 98.4%;
    }

    .actions button {
        background-color: #826ae3;
        color: white;
        border: none;
        padding: 0.5rem 1rem;
        border-radius: 0.5rem;
        cursor: pointer;

        flex: 1;
    }
</style>