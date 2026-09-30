import "dotenv/config";
import cors from "cors";
import express from "express";

import { errorHandler, notFoundHandler } from "./middleware/errorHandler.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import expenseRoutes from "./routes/expenseRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

const app = express();

const allowedOrigins = (
  process.env.FRONTEND_URL || "http://localhost:5173,http://127.0.0.1:5173"
)
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(
        new Error("This origin is not allowed by the CORS configuration."),
      );
    },
  }),
);

app.use(express.json());

app.get("/api/health", (request, response) => {
  response.json({
    success: true,
    message: "ExpenseFlow API is running",
  });
});

app.use("/api/expenses", expenseRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/categories", categoryRoutes);

app.use(notFoundHandler);
app.use(errorHandler);



export default app;
