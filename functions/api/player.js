export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const playerName = url.searchParams.get('name');
  
  // Validate name parameter
  if (!playerName || !playerName.trim()) {
    return new Response(JSON.stringify({ error: 'Missing or empty name parameter' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      }
    });
  }
  
  // Fetch from DDNet API
  const ddnetUrl = `https://ddnet.org/players/?json2=${encodeURIComponent(playerName.trim())}`;
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);
    
    const response = await fetch(ddnetUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'DDNet-Archive/1.0',
        'Accept': 'application/json'
      }
    });
    
    clearTimeout(timeoutId);
    
    const statusCode = response.status;
    const contentType = response.headers.get('content-type') || '';
    
    // Handle 404 (player not found)
    if (statusCode === 404) {
      return new Response(JSON.stringify({ error: 'Player not found', status: 404 }), {
        status: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=60'
        }
      });
    }
    
    // Handle other errors
    if (!response.ok) {
      return new Response(JSON.stringify({ 
        error: 'API error',
        status: statusCode 
      }), {
        status: statusCode >= 500 ? 502 : statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache'
        }
      });
    }
    
    // Validate JSON response
    if (!contentType.includes('application/json')) {
      return new Response(JSON.stringify({ error: 'Invalid response format' }), {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache'
        }
      });
    }
    
    const data = await response.json();
    
    // Return JSON with CORS and cache
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60'
      }
    });
    
  } catch (error) {
    if (error.name === 'AbortError') {
      return new Response(JSON.stringify({ error: 'Request timeout', status: 504 }), {
        status: 504,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache'
        }
      });
    }
    
    console.error('Player API error:', error);
    return new Response(JSON.stringify({ error: 'Proxy error', status: 502 }), {
      status: 502,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'no-cache'
      }
    });
  }
}

