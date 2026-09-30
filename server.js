import 'dotenv/config';
import cors from 'cors';
import express from 'express';
import { connectDB } from './config/db.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import categoryRoutes from './routes/categoryRoutes.js';
import dashboardRoutes from './routes/dashboardRoutes.js';
import expenseRoutes from './routes/expenseRoutes.js';
import reportRoutes from './routes/reportRoutes.js';

const app = express();
const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim());

app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('This origin is not allowed by the CORS configuration.'));
  },
}));
app.use(express.json());

app.get('/api/health', (request, response) => {
  response.json({ success: true, message: 'ExpenseFlow API is running' });
});
app.use('/api/expenses', expenseRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/categories', categoryRoutes);
app.use(notFoundHandler);
app.use(errorHandler);

async function startServer() {
  await connectDB();
  const port = Number(process.env.PORT) || 5000;
  app.listen(port, () => {
    console.log(`ExpenseFlow API running on port ${port}`);
  });
}

startServer().catch((error) => {
  console.error(`Unable to start ExpenseFlow API: ${error.message}`);
  process.exitCode = 1;
});

