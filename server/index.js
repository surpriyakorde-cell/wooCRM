import app from './app.js';

const port = Number(process.env.PORT || 4000);
if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => console.log(`WooCRM API running at http://localhost:${port}`));
}

export { app };
