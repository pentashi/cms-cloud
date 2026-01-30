import 'dotenv/config'; // Load .env variables
import express from 'express';
import type { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { setupRoutes } from './routes/index.ts';
import { errorHandler } from './middleware/errorHandler.ts';

const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'));

// Load OpenAPI spec and mount Swagger UI at /docs
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const swaggerPath = path.join(__dirname, 'docs', 'swagger.json');
let swaggerSpec: any = {};
try {
  swaggerSpec = JSON.parse(fs.readFileSync(swaggerPath, 'utf-8'));
} catch (err) {
  // If spec can't be read, continue without crashing; log a warning.
  // The UI will show an empty spec.
  // eslint-disable-next-line no-console
  console.warn('Could not load swagger.json at', swaggerPath, err);
}

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

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
