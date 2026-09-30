import { asyncHandler } from "../middleware/asyncHandler.js";
import {
  getCategorySummary,
  getMonthlySummary,
  getPaymentMethodSummary,
  getTopExpenses,
  getTotals,
} from "../services/summaryService.js";

export const getReportSummary = asyncHandler(async (_request, response) => {
  const [totals, monthlySummary, categorySummary, paymentMethodSummary, highestExpenses] =
    await Promise.all([
      getTotals(),
      getMonthlySummary(),
      getCategorySummary(),
      getPaymentMethodSummary(),
      getTopExpenses(),
    ]);

  response.json({
    success: true,
    data: {
      monthlySummary,
      categorySummary,
      paymentMethodSummary,
      highestExpenses,
      totalExpense: totals.totalExpense,
      transactionCount: totals.transactionCount,
    },
  });
});
