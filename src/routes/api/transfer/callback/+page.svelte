<script lang="ts">
    import { onMount } from "svelte";

    // Helper function to handle API requests with rate limit handling
    async function fetchWithRateLimitHandling(url: string, token: string, maxRetries = 3) {
        let retries = 0;
        
        while (retries <= maxRetries) {
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                }
            });
            
            // Check if rate limited
            if (response.status === 429) {
                retries++;
                
                // Get retry-after header (in seconds)
                const retryAfter = parseInt(response.headers.get('Retry-After') || '1');
                
                // Wait for the specified time
                await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
                continue;
            }
            
            // Check for other errors
            if (!response.ok) {
                throw new Error(`API error: ${response.status} ${await response.text()}`);
            }
            
            return await response.json();
        }
        
        throw new Error('Max retries exceeded for API request');
    }

    onMount(async() => {
        const params = new URLSearchParams(window.location.search);
        const code = params.get('accesscode');
        const guild = params.get('guild');

        if (code) localStorage.setItem('accessToken', code);
        if (guild && guild != 'none') sessionStorage.setItem('guild', guild); // This will be wiped once they get redirected anyways

        try {
            const token = localStorage.getItem('accessToken');
            if (!token) throw new Error('No access token available');
            
            // Get data from discord with rate limit handling
            const guilds = await fetchWithRateLimitHandling('https://discord.com/api/v10/users/@me/guilds', token);
            const user = await fetchWithRateLimitHandling('https://discord.com/api/v10/users/@me', token);

            localStorage.setItem('user', JSON.stringify({
                ...user,
                guilds,
            }));

            window.location.href = '/';
        } catch (error) {
            console.error('Error fetching user data:', error);
            alert('Failed to fetch user data. Please try again later.');
        }
    });
</script>