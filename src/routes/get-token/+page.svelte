<svelte:head>
    <title>DaalBot - Access Request</title>
    <meta name="description" content="Allow a website to manage DaalBot on your behalf">
</svelte:head>

<script>
    import { onMount } from 'svelte';
    import { browser } from '$app/environment';

    /**
     * @type {URL | null}
    */
    let returnURL = null;

    /**
     * @type {string}
    */
    let returnName = 'Loading...';

    /**
     * @type {string}
    */
    let hiddenName = 'Loading...';

    let ignoreWarning = false;
    const ignoreWarningText = `I understand the risks and want to continue, even though this service is not hosted on the official DaalBot domain. (${Math.floor(Math.random() * 1000)})`;
    
    onMount(async () => {
        const urlSearchParams = new URLSearchParams(window.location.search);

        const returnValue = urlSearchParams.get('return');
        const nameValue = urlSearchParams.get('name');

        returnURL = new URL(returnValue ?? 'https://daalbot.xyz/show');

        returnName = nameValue ? `${nameValue} (${returnURL.hostname})` : returnURL.hostname;

        hiddenName = nameValue ?? returnURL.hostname; // Dont show the full URL if the name is provided
    });

    /**
     * @param {boolean} allow
    */
    async function returnData(allow) {
        if (!browser) return;

        if (returnURL?.href === 'https://daalbot.xyz/show') {
            alert(localStorage.getItem('accessToken'));
        } else {
            window.location.href = `${returnURL?.href}?accesscode=${allow ? localStorage.getItem('accessToken') : 'denied'}&guild=none`
        }
    }
</script>

<main>
    {#if returnURL?.href === 'https://daalbot.xyz/show'}
        <h1>Access Code</h1>
        <p class="warning" style="text-align: center; margin-top: 0;"><b>
            If you do not know what this is, do not share it with anyone. <br/>Your access code is a secret key that allows any application such as this site to control DaalBot on your behalf.
        </b></p>
    {:else}
        {#if hiddenName.toLowerCase().includes('daalbot') && (!returnURL?.hostname?.match(/\bdaalbot\.xyz/) || !returnURL?.hostname?.endsWith('daalbot.xyz')) && !ignoreWarning}
            <h1>⚠️ This service may be trying to impersonate DaalBot</h1>
            <p>
                This service has called itself "<b>{hiddenName}</b>"; however, it is hosted on "{returnURL?.hostname}" which <b>is not</b> the official DaalBot domain. <br/>
                If you are <b>ABSOLUTELY SURE</b> that you want to authorize this service, you can ignore this warning by typing
            </p>
            <code>{ignoreWarningText}</code>
            <p>
                into the box that appears when you click the button below. <br/>
            </p>
            <b style="color:red">Doing so may result in the service doing ANYTHING DaalBot related on your behalf</b> <br/>
            <button style="background-color: #2f2f2f" on:click={() => {
                const input = prompt('Type the following text to ignore this warning: ' + ignoreWarningText);
                if (input === ignoreWarningText) {
                    ignoreWarning = true;
                } else {
                    alert('You did not type the correct text. Please try again.');
                }
            }}>
                Ignore Warning
            </button>
        {:else}
        <h1>{returnName} is requesting access to manage DaalBot</h1>
        <p>Do you want to grant access to this website?</p>
        <p class="warning"><b>Granting access will allow "{hiddenName}" to act on your behalf and manage ALL of your servers</b></p>
        <div class="control_buttons">
            <button on:click={() => returnData(true)}>
                {returnURL?.href === 'https://daalbot.xyz/show' ? 'Show Access Code' : 'Grant Access'}
            </button>
            {#if returnURL?.href !== 'https://daalbot.xyz/show'}
                <button on:click={() => returnData(false)}>Deny Access</button>
            {/if}
        </div>
        <a href="https://docs.daalbot.xyz/docs/api/auth">
            <sub>
                Learn More
            </sub>
        </a>
        {/if}
    {/if}
</main>

<style>
    main {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background-color: transparent;
        padding: 2rem;

        text-align: center;

        font-family: Poppins, sans-serif;
    }

    h1 {
        font-size: 2rem;
        color: white;
    }

    p {
        font-size: 1.5rem;
        color: white;
    }

    .control_buttons {
        display: flex;
        gap: 1rem;
    }

    button {
        padding: 0.5rem 1rem;
        font-size: 1rem;
        color: white;
        background-color: cornflowerblue;
        border: none;
        border-radius: 5px;
        cursor: pointer;

        transition: background-color 0.3s ease;
    }

    button:hover {
        background-color: #4c72b8;
    }

    .warning {
        color: #64200b;
    }

    b {
        font-weight: bolder;
    }

    code {
        background-color: #333;
        color: #f8f8f2;
        padding: 0.5rem;
        border-radius: 5px;
    }
</style>