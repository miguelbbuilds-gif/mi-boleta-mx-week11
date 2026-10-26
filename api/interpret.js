import { interpretReceipt } from '../shared/interpret.mjs';

export const config = {
  api: {
    bodyParser: false,
  },
};

function textFromRaw(raw) {
  const source = String(raw ?? '');
  if (!source.trim()) return '';
  try {
    const parsed = JSON.parse(source);
    if (typeof parsed === 'string') return parsed;
    if (parsed && typeof parsed === 'object' && typeof parsed.text === 'string') return parsed.text;
  } catch {
    return source;
  }
  return source;
}

async function readRaw(req) {
  try {
    if (typeof req?.text === 'function') return await req.text();
  } catch {
    return '';
  }
  if (typeof req?.body === 'string') return req.body;
  if (req?.body && Buffer.isBuffer(req.body)) return req.body.toString('utf8');
  if (req?.body && typeof req.body === 'object') {
    try {
      return JSON.stringify(req.body);
    } catch {
      return '';
    }
  }
  try {
    const chunks = [];
    for await (const chunk of req) chunks.push(Buffer.from(chunk));
    return Buffer.concat(chunks).toString('utf8');
  } catch {
    return '';
  }
}

async function buildPayload(raw) {
  try {
    return await interpretReceipt(textFromRaw(raw), {
      apiKey: process.env.AI_API_KEY,
      model: process.env.AI_MODEL,
    });
  } catch {
    return interpretReceipt('', { apiKey: '' });
  }
}

function sendJson(res, payload) {
  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');
  res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
  const payload = await buildPayload(req?.method === 'POST' ? await readRaw(req) : '');
  if (res && typeof res.end === 'function') {
    sendJson(res, payload);
    return;
  }
  return new Response(JSON.stringify(payload), {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
