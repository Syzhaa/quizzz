import mongoose from 'mongoose';

export async function connectMongoDB(uri: string): Promise<void> {
  await mongoose.connect(uri);
}

export function isMongoDBConnected(): boolean {
  return mongoose.connection.readyState === 1;
}
