import mongoose from 'mongoose';

export async function connectDB() {
  const { MONGODB_URI: mongoUri } = process.env;
  if (!mongoUri) {
    throw new Error('MONGODB_URI is missing. Add it to backend/.env.');
  }

  await mongoose.connect(mongoUri);
  console.log(`MongoDB connected successfully to database: ${mongoose.connection.name}`);
}
