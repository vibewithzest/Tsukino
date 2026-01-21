// Video Proxy API - Forwards requests with required headers
export const prerender = false;

import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ request }) => {
    const url = new URL(request.url);
    const videoUrl = url.searchParams.get('url');
    const referer = url.searchParams.get('referer') || 'https://megacloud.tv/';

    if (!videoUrl) {
        return new Response(JSON.stringify({ error: 'Missing url parameter' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    try {
        // Generate a random IP for X-Forwarded-For to bypass simple IP rate limits/blocks
        const randomIP = Array(4).fill(0).map(() => Math.floor(Math.random() * 255)).join('.');

        // Fetch the video/manifest with enhanced browser-like headers
        const response = await fetch(videoUrl, {
            headers: {
                'Referer': referer,
                'Origin': new URL(referer).origin,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
                'Accept': '*/*',
                'Accept-Language': 'en-US,en;q=0.9',
                'Cache-Control': 'no-cache',
                'Pragma': 'no-cache',
                'Sec-Fetch-Dest': 'empty',
                'Sec-Fetch-Mode': 'cors',
                'Sec-Fetch-Site': 'cross-site',
                'X-Forwarded-For': randomIP,
                'X-Real-IP': randomIP
            },
        });

        if (!response.ok) {
            console.error('[Proxy] Upstream error:', response.status, response.statusText);
            return new Response(JSON.stringify({ error: `Upstream error: ${response.status}` }), {
                status: response.status,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Get content type
        const contentType = response.headers.get('content-type') || 'application/octet-stream';

        // For m3u8 manifests, we need to rewrite segment URLs to go through proxy
        if (contentType.includes('mpegurl') || videoUrl.includes('.m3u8')) {
            let manifest = await response.text();

            // Get base URL for relative paths
            const baseUrl = videoUrl.substring(0, videoUrl.lastIndexOf('/') + 1);

            // Rewrite segment URLs to use proxy
            manifest = manifest.split('\n').map(line => {
                const trimmed = line.trim();
                // Skip comments and empty lines
                if (trimmed.startsWith('#') || trimmed === '') {
                    return line;
                }
                // Handle relative URLs (segments, keys, etc)
                if (!trimmed.startsWith('http')) {
                    const fullUrl = baseUrl + trimmed;
                    return `/api/proxy?url=${encodeURIComponent(fullUrl)}&referer=${encodeURIComponent(referer)}`;
                }
                // Handle absolute URLs
                return `/api/proxy?url=${encodeURIComponent(trimmed)}&referer=${encodeURIComponent(referer)}`;
            }).join('\n');

            return new Response(manifest, {
                status: 200,
                headers: {
                    'Content-Type': 'application/vnd.apple.mpegurl',
                    'Access-Control-Allow-Origin': '*',
                    'Cache-Control': 'no-cache',
                }
            });
        }

        // For video segments (ts files), stream directly
        const headers = new Headers();
        headers.set('Content-Type', contentType);
        headers.set('Access-Control-Allow-Origin', '*');

        // Pass through content length if available
        const contentLength = response.headers.get('content-length');
        if (contentLength) {
            headers.set('Content-Length', contentLength);
        }

        return new Response(response.body, {
            status: 200,
            headers
        });

    } catch (error) {
        console.error('[Proxy] Error:', error);
        return new Response(JSON.stringify({ error: 'Proxy error' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
