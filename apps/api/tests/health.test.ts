import { describe, it, expect, vi } from 'vitest';
import { createApp } from '../src/app';

describe('GET /health', () => {
  it('returns ok true', async () => {
    const app = createApp();

    type ExpressLayer = {
      route?: {
        path: string;
        methods: Record<string, boolean>;
        stack: Array<{ handle: (req: unknown, res: { json: (body: unknown) => void }) => void }>;
      };
    };

    const stack = (app as unknown as { _router?: { stack?: ExpressLayer[] } })._router?.stack ?? [];
    const healthLayer = stack.find(
      (layer) => layer.route?.path === '/health' && layer.route.methods.get,
    );

    expect(healthLayer).toBeDefined();

    const json = vi.fn();
    healthLayer?.route?.stack[0]?.handle({}, { json });

    expect(json).toHaveBeenCalledWith({ ok: true, service: '@cro/api' });
  });
});
