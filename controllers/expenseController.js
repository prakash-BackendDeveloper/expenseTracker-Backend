import mongoose from "mongoose";
import Category from "../models/Category.js";
import Expense from "../models/Expense.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const sortableFields = {
  newest: { date: -1, createdAt: -1 },
  oldest: { date: 1, createdAt: 1 },
  highest: { amount: -1, date: -1 },
  lowest: { amount: 1, date: -1 },
};
const editableFields = [
  "title",
  "amount",
  "category",
  "date",
  "paymentMethod",
  "description",
];
const invalidRequest = (message) =>
  Object.assign(new Error(message), { status: 400 });
const notFound = () =>
  Object.assign(new Error("Expense not found."), { status: 404 });
const invalidId = (id) => !mongoose.isObjectIdOrHexString(id);

async function requireExistingCategory(value) {
  if (typeof value !== "string" || !value.trim()) return;

  const name = value.trim();
  const category = await Category.findOne({ name }).collation({
    locale: "en",
    strength: 2,
  });
  if (!category) {
    throw invalidRequest(
      `Category '${name}' does not exist. Please create the category before using it.`,
    );
  }
  return category.name;
}

export const createExpense = asyncHandler(async (request, response) => {
  const body = request.body || {};
  const expense = new Expense({
    title: body.title,
    amount: body.amount,
    category: body.category,
    date: body.date,
    paymentMethod: body.paymentMethod,
    description: body.description,
  });
  await expense.validate();
  expense.category = await requireExistingCategory(expense.category);
  await expense.save();
  response.status(201).json({ success: true, data: expense });
});

export const getExpenses = asyncHandler(async (request, response) => {
  const { search, category, month } = request.query;
  const sortName = request.query.sort || "newest";
  if (typeof sortName !== "string" || !sortableFields[sortName]) {
    throw invalidRequest("Sort must be newest, oldest, highest, or lowest.");
  }

  const filter = {};
  if (category) {
    if (typeof category !== "string")
      throw invalidRequest("Category must be a single value.");
    filter.category = category;
  }
  if (search) {
    if (typeof search !== "string")
      throw invalidRequest("Search must be a single value.");
    const escapedSearch = search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (escapedSearch) {
      const pattern = new RegExp(escapedSearch, "i");
      filter.$or = [
        { title: pattern },
        { category: pattern },
        { description: pattern },
      ];
    }
  }
  if (month) {
    if (typeof month !== "string" || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) {
      throw invalidRequest("Month must use YYYY-MM format.");
    }
    const [year, monthNumber] = month.split("-").map(Number);
    filter.date = {
      $gte: new Date(Date.UTC(year, monthNumber - 1, 1)),
      $lt: new Date(Date.UTC(year, monthNumber, 1)),
    };
  }

  const data = await Expense.find(filter).sort(sortableFields[sortName]);
  response.json({ success: true, count: data.length, data });
});

export const getExpense = asyncHandler(async (request, response) => {
  if (invalidId(request.params.id)) throw invalidRequest("Invalid expense ID.");
  const expense = await Expense.findById(request.params.id);
  if (!expense) throw notFound();
  response.json({ success: true, data: expense });
});

export const updateExpense = asyncHandler(async (request, response) => {
  if (invalidId(request.params.id)) throw invalidRequest("Invalid expense ID.");
  const expense = await Expense.findById(request.params.id);
  if (!expense) throw notFound();

  const body = request.body || {};
  for (const field of editableFields) {
    if (Object.hasOwn(body, field)) expense[field] = body[field];
  }
  await expense.validate();
  expense.category = await requireExistingCategory(expense.category);
  await expense.save();
  response.json({ success: true, data: expense });
});

export const deleteExpense = asyncHandler(async (request, response) => {
  if (invalidId(request.params.id)) throw invalidRequest("Invalid expense ID.");
  const expense = await Expense.findById(request.params.id);
  if (!expense) throw notFound();
  await expense.deleteOne();
  response.json({
    success: true,
    message: "Expense deleted successfully",
    data: expense,
  });
});


