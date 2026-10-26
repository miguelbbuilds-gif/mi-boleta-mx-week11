import type { IncomingMessage, ServerResponse } from 'node:http';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { loadEnv, type Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import { interpretReceipt } from './shared/interpret.mjs';

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer) => chunks.push(Buffer.from(chunk)));
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

function textFromRaw(raw: string) {
  if (!raw.trim()) return '';
  try {
    const parsed = JSON.parse(raw) as { text?: unknown } | string;
    if (typeof parsed === 'string') return parsed;
    if (parsed && typeof parsed.text === 'string') return parsed.text;
  } catch {
    return raw;
  }
  return raw;
}

function attachInterpret(apiKey: string | undefined, model: string | undefined) {
  return (req: IncomingMessage, res: ServerResponse) => {
    const send = (payload: unknown) => {
      res.statusCode = 200;
      res.setHeader('Content-Type', 'application/json; charset=utf-8');
      res.setHeader('Cache-Control', 'no-store');
      res.end(JSON.stringify(payload));
    };
    if (req.method !== 'POST') {
      void interpretReceipt('', { apiKey: '' }).then(send);
      return;
    }
    void readBody(req)
      .then((raw) => interpretReceipt(textFromRaw(raw), { apiKey, model }))
      .then(send)
      .catch(() => interpretReceipt('', { apiKey: '' }).then(send));
  };
}

function interpretApi(apiKey: string | undefined, model: string | undefined): Plugin {
  const handle = attachInterpret(apiKey, model);
  return {
    name: 'interpret-api',
    configureServer(server) {
      server.middlewares.use('/api/interpret', handle);
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/interpret', handle);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  return {
    plugins: [react(), tailwindcss(), interpretApi(env.AI_API_KEY, env.AI_MODEL)],
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    },
  };
});
