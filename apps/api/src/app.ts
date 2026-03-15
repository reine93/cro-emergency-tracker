import express from 'express';
import cors from 'cors';
import {
  getRecentEarthquakesHandler,
  injectDebugEarthquakeHandler,
} from './controllers/earthquakes.controller';
import {
  previewGamificationRemindersHandler,
  registerExpoPushTokenHandler,
} from './controllers/notifications.controller';

export function createApp() {
  const app = express();

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  app.get('/health', (_req, res) => {
    res.json({ ok: true, service: '@cro/api' });
  });

  app.get('/api/earthquakes/recent', getRecentEarthquakesHandler);
  app.post('/api/debug/earthquakes/inject', injectDebugEarthquakeHandler);
  app.post('/api/notifications/expo/register', registerExpoPushTokenHandler);
  app.get('/api/debug/notifications/reminders/preview', previewGamificationRemindersHandler);

  return app;
}
