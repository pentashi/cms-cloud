import 'dotenv/config'; // Load .env variables
import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { setupRoutes } from './routes/index.ts';
import { errorHandler } from './middleware/errorHandler.ts';

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// Health check
app.get('/', (req: Request, res: Response) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// Setup all routes
setupRoutes(app);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = parseInt(process.env.PORT || '3000', 10);
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
