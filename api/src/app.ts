import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import routes from './routes/index'
import { env } from './config/env';
const app = express();

app.use(cors({
  origin: env.frontendUrl,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true
}));
app.use(express.json());
app.use(routes);
// proteção básica contra brute force
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

export default app;