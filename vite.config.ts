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

function interpretApi(apiKey: string | undefined, model: string | undefined): Plugin {
  return {
    name: 'interpret-api',
    configureServer(server) {
      server.middlewares.use('/api/interpret', (req, res, next) => {
        if (req.method !== 'POST') {
          next();
          return;
        }
        void readBody(req)
          .then(async (raw) => {
            const body = raw ? (JSON.parse(raw) as { text?: string }) : {};
            const result = await interpretReceipt(body.text ?? '', { apiKey, model });
            const response = res as ServerResponse;
            response.statusCode = 200;
            response.setHeader('Content-Type', 'application/json; charset=utf-8');
            response.end(JSON.stringify(result));
          })
          .catch(next);
      });
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
