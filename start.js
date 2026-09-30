import 'dotenv/config';
import app from './server.js';
import { connectDB } from './config/db.js';

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