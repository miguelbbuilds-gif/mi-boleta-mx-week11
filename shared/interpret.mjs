/** Deterministic text extractor. This is not a language model. */

export const SAMPLE_TEXTS = [
  {
    id: 'pet',
    label: 'Ejemplo PET',
    text: 'Patio: Acopio Esperanza (demo)\nAlias: Don Ernesto\nMaterial: PET\nPeso: 12.5 kg\nPrecio: 8.50 por kilo\nNotas: lectura manual de báscula analógica',
  },
  {
    id: 'carton',
    label: 'Ejemplo cartón',
    text: 'Cartón 40 kg a 2.20 el kilo. Alias Nube. Pago pendiente.',
  },
  {
    id: 'cobre',
    label: 'Ejemplo cobre',
    text: 'Material: Cobre\nPeso: 1.25 kg\nPrecio: $145.00 por kilo\nAlias: Alias Río\nPagado',
  },
];

const MATERIALS = [
  ['pet', 'PET'],
  ['cartón', 'Cartón'],
  ['carton', 'Cartón'],
  ['aluminio', 'Aluminio'],
  ['cobre', 'Cobre'],
  ['fierro', 'Fierro'],
  ['hierro', 'Fierro'],
  ['vidrio', 'Vidrio'],
  ['otro', 'Otro'],
];

const ALLOWED = new Set([
  'material',
  'weightKg',
  'pricePerKg',
  'recyclerAlias',
  'yardName',
  'paymentStatus',
  'notes',
]);

export function sanitizeSuggestionInput(input) {
  const source = input && typeof input === 'object' ? input : {};
  const suggestions = {};
  for (const key of ALLOWED) {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) {
      suggestions[key] = value.trim().slice(0, 500);
    }
  }
  if (suggestions.paymentStatus) {
    const status = suggestions.paymentStatus.toLowerCase();
    if (status === 'pagado' || status === 'pendiente' || status === 'parcial') {
      suggestions.paymentStatus = status;
    } else {
      delete suggestions.paymentStatus;
    }
  }
  return suggestions;
}

export function extractReceiptSuggestions(text) {
  const raw = String(text ?? '').slice(0, 2000);
  const lower = raw.toLowerCase();
  const suggestions = {};
  const unmatched = [];

  let material = null;
  for (const [needle, label] of MATERIALS) {
    if (lower.includes(needle)) {
      material = label;
      break;
    }
  }
  if (material) suggestions.material = material;
  else unmatched.push('material');

  const weight = raw.match(/(?:peso\s*[:\-]?\s*)?(\d{1,4}(?:[.,]\d{1,3})?)\s*(?:kg|kilos?)\b/i);
  if (weight) suggestions.weightKg = weight[1].replace(',', '.');
  else unmatched.push('peso');

  const price = raw.match(
    /(?:precio\s*[:\-]?\s*|\$\s*|a\s+)(\d{1,4}(?:[.,]\d{1,2})?)(?:\s*(?:por kilo|el kilo|\/\s*kg|mxn))?/i,
  );
  if (price) suggestions.pricePerKg = price[1].replace(',', '.');
  else unmatched.push('precio');

  const alias = raw.match(/alias\s*[:\-]?\s*([A-Za-zÁÉÍÓÚÜÑáéíóúüñ0-9 .'-]{2,40})/i);
  if (alias) suggestions.recyclerAlias = alias[1].trim();

  const yard = raw.match(/patio\s*[:\-]\s*([^\n]{2,80})/i);
  if (yard) suggestions.yardName = yard[1].trim();

  const notes = raw.match(/notas?\s*[:\-]\s*([^\n]{2,500})/i);
  if (notes) suggestions.notes = notes[1].trim();

  if (lower.includes('pendiente')) suggestions.paymentStatus = 'pendiente';
  else if (lower.includes('parcial')) suggestions.paymentStatus = 'parcial';
  else if (lower.includes('pagado')) suggestions.paymentStatus = 'pagado';

  return { suggestions: sanitizeSuggestionInput(suggestions), unmatched };
}

export async function interpretReceipt(text, options = {}) {
  const extracted = extractReceiptSuggestions(text);
  const apiKey = options.apiKey || '';
  const simulation = {
    mode: 'simulacion',
    fallback: false,
    disclaimer:
      'SIMULACIÓN: no hay una clave de IA en el servidor. Las sugerencias salen de reglas fijas sobre el texto. No es un modelo de lenguaje y no modifican una boleta guardada.',
    suggestions: extracted.suggestions,
    unmatched: extracted.unmatched,
  };
  if (!apiKey) return simulation;

  try {
    const fetchImpl = options.fetchImpl ?? fetch;
    const model = options.model || 'gpt-4o-mini';
    const response = await fetchImpl('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        temperature: 0,
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'Extrae campos de una boleta de reciclaje. Responde solo JSON con las claves material, weightKg, pricePerKg, recyclerAlias, yardName, paymentStatus y notes. Usa null si falta el dato. No calcules ni incluyas el total. Materiales: PET, Cartón, Aluminio, Cobre, Fierro, Vidrio, Otro. paymentStatus: pagado, pendiente o parcial.',
          },
          { role: 'user', content: String(text ?? '').slice(0, 2000) },
        ],
      }),
    });
    if (!response.ok) throw new Error('provider');
    const payload = await response.json();
    const content = payload.choices?.[0]?.message?.content ?? '{}';
    const parsed = JSON.parse(String(content).replace(/```json|```/g, ''));
    return {
      mode: 'llm',
      fallback: false,
      disclaimer:
        'Sugerencia de un modelo configurado en el servidor. No se aplica sola. El total lo calcula este sistema, no el modelo.',
      suggestions: sanitizeSuggestionInput(parsed),
      unmatched: [],
    };
  } catch {
    return {
      ...simulation,
      fallback: true,
      disclaimer:
        'La llamada al modelo falló. Se muestran sugerencias de SIMULACIÓN. Ninguna boleta guardada cambió.',
    };
  }
}
