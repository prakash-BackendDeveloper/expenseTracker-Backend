import mongoose from "mongoose";
import Category from "../models/Category.js";
import Expense from "../models/Expense.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

const invalidRequest = (message) =>
  Object.assign(new Error(message), { status: 400 });
const notFound = () =>
  Object.assign(new Error("Category not found."), { status: 404 });
const duplicateName = () =>
  Object.assign(new Error("A category with that name already exists."), {
    status: 409,
  });
const invalidId = (id) => !mongoose.isObjectIdOrHexString(id);
const cleanName = (name) => {
  if (typeof name !== "string" || !name.trim())
    throw invalidRequest("Category name is required.");
  return name.trim();
};
const categoryWithName = (name, filter = {}) =>
  Category.findOne({ ...filter, name }).collation({
    locale: "en",
    strength: 2,
  });

export const createCategory = asyncHandler(async (request, response) => {
  const name = cleanName(request.body?.name);
  if (await categoryWithName(name)) throw duplicateName();
  const category = await Category.create({ name });
  response.status(201).json({ success: true, data: category });
});

export const getCategories = asyncHandler(async (request, response) => {
  const data = await Category.find().sort({ name: 1 });
  response.json({ success: true, count: data.length, data });
});

export const getCategory = asyncHandler(async (request, response) => {
  if (invalidId(request.params.id))
    throw invalidRequest("Invalid category ID.");
  const category = await Category.findById(request.params.id);
  if (!category) throw notFound();
  response.json({ success: true, data: category });
});

export const updateCategory = asyncHandler(async (request, response) => {
  if (invalidId(request.params.id))
    throw invalidRequest("Invalid category ID.");
  const name = cleanName(request.body?.name);
  const category = await Category.findById(request.params.id);
  if (!category) throw notFound();

  const duplicate = await categoryWithName(name, {
    _id: { $ne: category._id },
  });
  if (duplicate) throw duplicateName();
  category.name = name;
  await category.save();
  response.json({ success: true, data: category });
});

export const deleteCategory = asyncHandler(async (request, response) => {
  if (invalidId(request.params.id))
    throw invalidRequest("Invalid category ID.");
  const category = await Category.findById(request.params.id);
  if (!category) throw notFound();

  const categoryInUse = await Expense.exists({
    category: category.name,
  }).collation({
    locale: "en",
    strength: 2,
  });
  if (categoryInUse) {
    throw Object.assign(
      new Error(
        "This category is used by one or more expenses and cannot be deleted.",
      ),
      { status: 409 },
    );
  }

  await category.deleteOne();
  response.json({
    success: true,
    message: "Category deleted successfully",
    data: category,
  });
});
