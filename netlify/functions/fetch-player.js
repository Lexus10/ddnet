const ALLOWED_HOSTS = ['ddnet.org', 'api.steampowered.com'];

exports.handler = async (event, context) => {
  // Only allow GET requests
  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  const { path } = event.queryStringParameters || {};
  
  if (!path) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({ error: 'Missing path parameter' })
    };
  }

  // Parse URL and validate host
  let targetUrl;
  try {
    targetUrl = path.startsWith('http') ? new URL(path) : new URL(`https://${path}`);
    
    if (!ALLOWED_HOSTS.includes(targetUrl.hostname)) {
      return {
        statusCode: 403,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ error: 'Host not allowed' })
      };
    }
  } catch (e) {
    return {
      statusCode: 400,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({ error: 'Invalid URL format' })
    };
  }

  // Fetch with timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const response = await fetch(targetUrl.toString(), {
      signal: controller.signal,
      headers: {
        'User-Agent': 'DDNet-Archive/1.0',
        'Accept': 'application/json'
      }
    });

    clearTimeout(timeoutId);

    const statusCode = response.status;
    const contentType = response.headers.get('content-type') || '';

    // Handle different status codes
    if (statusCode === 404) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'public, max-age=60'
        },
        body: JSON.stringify({ error: 'Player not found', status: 404 })
      };
    }

    if (statusCode === 403 || statusCode === 429) {
      return {
        statusCode: statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ 
          error: statusCode === 403 ? 'Access forbidden' : 'Rate limited',
          status: statusCode 
        })
      };
    }

    if (!response.ok) {
      return {
        statusCode: statusCode >= 500 ? 502 : statusCode,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ 
          error: 'API unavailable',
          status: statusCode 
        })
      };
    }

    // Parse JSON response
    if (!contentType.includes('application/json')) {
      return {
        statusCode: 502,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ error: 'Invalid response format' })
      };
    }

    const data = await response.json();

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=90',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(data)
    };

  } catch (error) {
    clearTimeout(timeoutId);

    if (error.name === 'AbortError') {
      return {
        statusCode: 504,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify({ error: 'Request timeout', status: 504 })
      };
    }

    console.error('Proxy error:', error);
    return {
      statusCode: 502,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      body: JSON.stringify({ error: 'Proxy error', status: 502 })
    };
  }
};

