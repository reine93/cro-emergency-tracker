import { createApp } from './app';

const PORT = Number(process.env.PORT ?? 8080);

const server = createApp().listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});

process.on('SIGINT', () => {
  server.close(() => {
    console.log('API server closed');
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  server.close(() => {
    console.log('API server closed');
    process.exit(0);
  });
});
