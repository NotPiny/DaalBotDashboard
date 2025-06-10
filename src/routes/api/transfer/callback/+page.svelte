<script lang="ts">
    import { onMount } from "svelte";

    onMount(async() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('accesscode');
        const guild = params.get('guild');

        if (code) localStorage.setItem('accessToken', code);
        if (guild && guild != 'none') sessionStorage.setItem('guild', guild); // This will be wiped once they get redirected anyways

        // Get data from discord
        const guildData = await fetch(`https://discord.com/api/v10/users/@me/guilds`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            }
        })

        const userData = await fetch(`https://discord.com/api/v10/users/@me`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
            }
        })

        const guilds = await guildData.json();
        const user = await userData.json();

        localStorage.setItem('user', JSON.stringify({
            ...user,
            guilds,
        }))

        window.location.href = '/';
    });
</script>