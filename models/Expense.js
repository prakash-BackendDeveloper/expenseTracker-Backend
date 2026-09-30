import mongoose from 'mongoose';

const paymentMethods = ['UPI', 'Cash', 'Debit Card', 'Credit Card', 'Net Banking'];

const expenseSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Expense title is required.'], trim: true },
    // Expense amounts are stored in Indian Rupees (INR).
    amount: {
      type: Number,
      required: [true, 'Expense amount is required.'],
      min: [Number.EPSILON, 'Expense amount must be greater than 0.'],
    },
    category: { type: String, required: [true, 'Expense category is required.'], trim: true },
    date: { type: Date, required: [true, 'Expense date is required.'] },
    paymentMethod: {
      type: String,
      required: [true, 'Payment method is required.'],
      enum: { values: paymentMethods, message: 'Payment method must be UPI, Cash, Debit Card, Credit Card, or Net Banking.' },
    },
    description: { type: String, trim: true, default: '' },
  },
  { timestamps: true, collection: 'ExpenseTracker' },
);

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
