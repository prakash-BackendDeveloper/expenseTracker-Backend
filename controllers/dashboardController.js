import Expense from "../models/Expense.js";
import { asyncHandler } from "../middleware/asyncHandler.js";
import {
  getCategorySummary,
  getMonthlySummary,
  getRecentExpenses,
  getTotals,
} from "../services/summaryService.js";

const roundAmount = (amount) => Math.round((amount + Number.EPSILON) * 100) / 100;

export const getDashboardSummary = asyncHandler(async (_request, response) => {
  // Expenses use date-only values stored at UTC midnight, so calendar boundaries are UTC.
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const nextMonthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  const tomorrowStart = new Date(todayStart);
  tomorrowStart.setUTCDate(tomorrowStart.getUTCDate() + 1);

  const [totals, [periodTotals], recentExpenses, categorySummary, monthlySummary] =
    await Promise.all([
      getTotals(),
      Expense.aggregate([
        {
          $group: {
            _id: null,
            currentMonthExpenses: {
              $sum: {
                $cond: [
                  { $and: [{ $gte: ["$date", monthStart] }, { $lt: ["$date", nextMonthStart] }] },
                  "$amount",
                  0,
                ],
              },
            },
            todayExpenses: {
              $sum: {
                $cond: [
                  { $and: [{ $gte: ["$date", todayStart] }, { $lt: ["$date", tomorrowStart] }] },
                  "$amount",
                  0,
                ],
              },
            },
            averageExpense: { $avg: "$amount" },
          },
        },
      ]),
      getRecentExpenses(),
      getCategorySummary(),
      getMonthlySummary(),
    ]);

  response.json({
    success: true,
    data: {
      totalExpenses: totals.totalExpense,
      currentMonthExpenses: periodTotals?.currentMonthExpenses || 0,
      todayExpenses: periodTotals?.todayExpenses || 0,
      transactionCount: totals.transactionCount,
      averageExpense: roundAmount(periodTotals?.averageExpense || 0),
      recentExpenses,
      categorySummary,
      monthlySummary,
    },
  });
});
