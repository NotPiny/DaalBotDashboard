<script>
    import { page } from '$app/state';
    import { error } from '@sveltejs/kit';

    const message = page.url.searchParams.get('message') || 'Unknown error';
</script>
<svelte:head>
    <title>Error</title>
</svelte:head>

<h1>
    Woah there! Something went wrong.
</h1>
<br>
Here's what we know:
<h2>Where did the error happen?</h2>
{page.url.searchParams.get('src') || 'Unknown'}
<h2>What was the error?</h2>
{message}
{#if message === 'User not found - localStorage.getItem failed'}
    <br>
    This usually means that you are not logged in. Please log in again.
{:else if message === 'Not Found'}
    <br>
    This usually is equivalent to a 404 error. Please check the URL you we're trying to access and try again.
{:else}
    <br>
    Unknown error. Please report this to us.
{/if}

<h2>What can I do?</h2>
<a href="/">Go back home</a>
If the error persists, please report the bug in our <a href="https://go.daalbot.xyz/HQ">support server</a>