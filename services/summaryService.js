import Expense from "../models/Expense.js";

export async function getTotals() {
  const [totals] = await Expense.aggregate([
    {
      $group: {
        _id: null,
        totalExpense: { $sum: "$amount" },
        transactionCount: { $sum: 1 },
      },
    },
  ]);
  return {
    totalExpense: totals?.totalExpense || 0,
    transactionCount: totals?.transactionCount || 0,
  };
}

export function getCategorySummary() {
  return Expense.aggregate([
    {
      $group: {
        _id: "$category",
        amount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { amount: -1, _id: 1 } },
    { $project: { _id: 0, category: "$_id", amount: 1, count: 1 } },
  ]);
}

export function getMonthlySummary() {
  return Expense.aggregate([
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m", date: "$date", timezone: "UTC" },
        },
        amount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, month: "$_id", amount: 1, count: 1 } },
  ]);
}

export function getPaymentMethodSummary() {
  return Expense.aggregate([
    {
      $group: {
        _id: "$paymentMethod",
        amount: { $sum: "$amount" },
        count: { $sum: 1 },
      },
    },
    { $sort: { amount: -1, _id: 1 } },
    { $project: { _id: 0, paymentMethod: "$_id", amount: 1, count: 1 } },
  ]);
}

export function getTopExpenses() {
  return Expense.aggregate([
    { $sort: { amount: -1, date: -1, _id: -1 } },
    { $limit: 5 },
    { $project: { title: 1, amount: 1, category: 1, date: 1, paymentMethod: 1 } },
  ]);
}

export function getRecentExpenses() {
  return Expense.find()
    .select("title amount category date paymentMethod")
    .sort({ date: -1, _id: -1 })
    .limit(5)
    .lean();
}
