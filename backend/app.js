import express from 'express';
import morgan from 'morgan';
import { connect } from './db/db.js';
import userRoutes from './routes/user.routes.js'
import cookieParser from 'cookie-parser';
import cors from 'cors';
import projectRoutes from './routes/project.routes.js'
import aiRoutes from './routes/ai.routes.js'

connect();

const app = express();

// WebContainer requires every document and same-origin resource to opt in to
// cross-origin isolation. Keep these headers ahead of static files and routes.
app.use((req, res, next) => {
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');
  res.setHeader('Cross-Origin-Embedder-Policy', 'require-corp');
  next();
});

app.use(cookieParser());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true}));
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));

app.use('/users', userRoutes);
app.use('/projects', projectRoutes);
app.use('/ai', aiRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use(express.static('public'));

// Serve the React application for browser routes without intercepting API
// endpoints above. This is needed for refreshes on client-side routes.
app.get('*splat', (req, res, next) => {
  if (req.accepts('html')) {
    return res.sendFile('index.html', { root: 'public' });
  }

  next();
});

export default app;
