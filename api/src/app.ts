import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import routes from './routes/index'
const app = express();

app.use(cors());
app.use(express.json());
app.use(routes);
// proteção básica contra brute force
app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

export default app;