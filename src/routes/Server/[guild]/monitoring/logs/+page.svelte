<script lang="ts">
    import { page } from "$app/state";
    import { DBAPI } from "@daalbot/api";
    import { getCurrentGuild, getLogsChannel, getLogsState, setEventState, setLogsChannel, setLogsState } from "@daalbot/api/dist/src/modules";
    import type { GatewayEvent } from "@daalbot/api/dist/src/types";
    import { onMount } from "svelte";
    import { events } from './events.json';
    import type { CurrentGuildResponse } from "@daalbot/api/dist/src/modules/currentGuild";
    import { browser } from "$app/environment";

    let api: DBAPI;
    let loaded = false;
    let enabledEvents: GatewayEvent[] = [];
    let currentGuild: CurrentGuildResponse;
    let logsChannelId = '';

    onMount(async () => {
        const guildId = page.params.guild;
        api = new DBAPI({
            auth: {
                token: localStorage.getItem("accessToken") || "",
                type: "User"
            },
            guildId
        });

        getLogsChannel(api).then(channel => {
            if (channel) {
                logsChannelId = channel;
            } else {
                console.warn("No logs channel found for this guild.");
            }
        }).catch(err => {
            console.error("Failed to fetch logs channel:", err);
        });

        getCurrentGuild(api).then(guild => {
            currentGuild = guild;
        }).catch(err => {
            console.error("Failed to fetch current guild:", err);
        });
        
        const respEvents = await getLogsState(api) as unknown as Array<{ name: string, value: 'true' | 'false' }>;
        respEvents.forEach(event => {
            if (event.value == 'true') {
                enabledEvents.push(event.name as GatewayEvent);
            }
        });
        loaded = true;
    });

    async function toggleEvent(event: GatewayEvent) {
        setLogsState(api, event, !enabledEvents.includes(event)).then(() => {
            if (enabledEvents.includes(event)) {
                enabledEvents = enabledEvents.filter(e => e !== event);
            } else {
                enabledEvents.push(event);
            }
        }).catch(err => {
            console.error(`Failed to toggle event ${event}:`, err);
        });
    }
</script>

<svelte:head>
    <title>Logs - {currentGuild?.userData.name || 'Guild'}</title>
</svelte:head>

{#snippet gatewayEvent(event: { display: string, event: GatewayEvent, description: string })}
    <div class="event">
        <h2>
            {event.display || event.event}
        </h2>
        <p>{event.description}</p>
        <sl-visually-hidden>
            Should the {event.display || event.event} event be logged?
        </sl-visually-hidden>
        <input type="checkbox" checked={enabledEvents.find(e => e == event.event.toUpperCase()) ? true : false} on:click={() => {
            toggleEvent(event.event).then(() => {
                console.log(`Event ${event} toggled successfully.`);
            }).catch(err => {
                console.error(`Failed to toggle event ${event}:`, err);
            });
        }}>
    </div>

    <style>
        .event {
            padding: 1rem;
            border: none;

            border-radius: 0.5rem;
            background-color: #2f2f2f;
        }

        :root {
            --form-control-color: white;
            --form-control-disabled: #959495;
        }

        form {
            display: grid;
            place-content: center;
            min-height: 100vh;
        }

        .form-control {
            font-size: 2rem;
            font-weight: bold;
            line-height: 1.1;
            display: grid;
            grid-template-columns: 1em auto;
            gap: 0.5em;
        }

        .form-control + .form-control {
            margin-top: 1em;
        }

        .form-control--disabled {
            color: var(--form-control-disabled);
            cursor: not-allowed;
        }

        input[type="checkbox"] {
            /* Add if not using autoprefixer */
            -webkit-appearance: none;
            /* Remove most all native input styles */
            appearance: none;
            /* For iOS < 15 */
            background-color: var(--form-background);
            /* Not removed via appearance */
            margin: 0;

            font: inherit;
            color: currentColor;
            width: 1.15em;
            height: 1.15em;
            border: 0.15em solid currentColor;
            border-radius: 0.15em;
            transform: translateY(-0.075em);

            display: grid;
            place-content: center;
        }

        input[type="checkbox"]::before {
            content: "";
            width: 0.65em;
            height: 0.65em;
            transform: scale(0);
            transform-origin: bottom left;
            transition: 120ms transform ease-in-out;
            box-shadow: inset 1em 1em var(--form-control-color);
            /* Windows High Contrast Mode */
            background-color: CanvasText;
        }

        input[type="checkbox"]:checked::before {
            transform: scale(1);
        }

        input[type="checkbox"]:focus {
            outline: max(2px, 0.15em) solid currentColor;
            outline-offset: max(2px, 0.15em);
        }

        input[type="checkbox"]:disabled {
            --form-control-color: var(--form-control-disabled);

            color: var(--form-control-disabled);
            cursor: not-allowed;
        }
    </style>
{/snippet}

<div class="main">
    {#if !loaded}
        <h2>Loading events...</h2>
    {:else}
        <sl-tooltip content="Select a channel to log events to.">
            <h2>Destination</h2>
        </sl-tooltip>
        <div class="explained-input">
            <select bind:value={logsChannelId} on:change={async (e) => {
                if (!browser) return;
                logsChannelId = (e.target as HTMLSelectElement).value;

                try {
                    await setLogsChannel(api, logsChannelId);
                    console.log(`Logs channel set to ${logsChannelId}`);
                } catch (error) {
                    console.error("Failed to set logs channel:", error);
                }
            }}>
                <option value="" disabled selected>Select a channel</option>
                {#each currentGuild.channels.filter(c => c.type == 0) as channel}
                    <option value={channel.id}>
                        #{channel.name}
                    </option>
                {/each}
            </select>
            <button class="learn-more" on:click={() => {
                if (!browser) return;
                alert('The select menu next to this allows you to pick the channel where logs will be sent. You can select any text channel in your server.');
            }}>?</button>
        </div>
        <h2>Events</h2>
        <div class="events">
            {#each events as event}
                {@render gatewayEvent(event as { display: string, event: GatewayEvent, description: string })}
            {/each}
        </div>
    {/if}
</div>

<style>
    .events {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        justify-content: start;
        align-items: stretch;
        width: 100%;
        gap: 1rem;
    }

    .events h2 {
        display: flex;
    }

    select {
        width: 100%;
        padding: 0.5rem;
        font-size: 1rem;
        border-radius: 0.25rem;
        border: 1px solid #ccc;
        background-color: #3f3f3f;
        border: none;
    }

    .explained-input {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    .explained-input select {
        flex: 1;
    }

    button.learn-more {
        display: inline-block;
        width: 2.5rem;
        height: 2.5rem;
        background-color: #555;
        color: white;
        text-align: center;
        line-height: 1.5rem;
        border-radius: 0.5rem;
        cursor: pointer;

        font-size: 1.5rem;
        font-weight: bold;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);

        border: none;
    }
</style>