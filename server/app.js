import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { registerApiRoutes } from './routes/api.js';
const app = express();
app.use(cors());
app.use(express.json({ limit: '100kb' }));
registerApiRoutes(app);

export { app };
export default app;
