import { createApp } from './app';

const PORT = Number(process.env.PORT ?? 8080);

createApp().listen(PORT, () => {
  console.log(`API running at http://localhost:${PORT}`);
});
