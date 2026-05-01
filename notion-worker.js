addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

async function handleRequest(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers: CORS });
  }
  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed' }, 405);
  }

  let parsed;
  try { parsed = await request.json(); } catch (e) { return json({ error: 'Invalid JSON' }, 400); }

  const { endpoint, method, body, token } = parsed;
  if (!token || !endpoint) return json({ error: 'Missing token or endpoint' }, 400);

  const headers = {
    'Authorization': `Bearer ${token}`,
    'Notion-Version': '2022-06-28',
  };
  if (body) headers['Content-Type'] = 'application/json';

  try {
    const res = await fetch(`https://api.notion.com/v1/${endpoint}`, {
      method: method || 'GET',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    return json(data, res.status);
  } catch (e) {
    return json({ error: e.message }, 500);
  }
}

function json(data, status) {
  return new Response(JSON.stringify(data), {
    status: status || 200,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}
