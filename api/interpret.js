import { extractReceiptSuggestions, interpretReceipt } from '../shared/interpret.mjs';

function send(res, status, payload) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  res.end(JSON.stringify(payload));
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    send(res, 405, { error: 'Método no permitido' });
    return;
  }
  try {
    const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body ?? {});
    const result = await interpretReceipt(String(body.text ?? ''), {
      apiKey: process.env.AI_API_KEY,
      model: process.env.AI_MODEL,
    });
    send(res, 200, result);
  } catch {
    const fallback = extractReceiptSuggestions('');
    send(res, 200, {
      mode: 'simulacion',
      fallback: true,
      disclaimer: 'No se pudo leer el texto. Ninguna boleta cambió.',
      suggestions: fallback.suggestions,
      unmatched: fallback.unmatched,
    });
  }
}
