import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Category name is required.'],
      trim: true,
    },
  },
  { timestamps: true, collection: 'categories' },
);

// Names that differ only by letter case count as duplicates.
categorySchema.index(
  { name: 1 },
  {
    name: 'name_case_insensitive',
    unique: true,
    collation: { locale: 'en', strength: 2 },
  },
);

const Category = mongoose.model('Category', categorySchema);
export default Category;

