import mongoose, { Schema, Document } from 'mongoose';

export interface Choice {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  durationSeconds: number;
  choices: Choice[];
  correctChoiceId: string;
  mediaUrl?: string; // Tahap 3
}

export interface QuizDocument extends Document {
  ownerId: mongoose.Types.ObjectId;
  title: string;
  questions: Question[];
  createdAt: Date;
  updatedAt: Date;
}

const choiceSchema = new Schema<Choice>(
  {
    id: { type: String, required: true },
    text: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const questionSchema = new Schema<Question>(
  {
    id: { type: String, required: true },
    text: { type: String, required: true, trim: true },
    durationSeconds: { type: Number, required: true, default: 20, min: 5 },
    choices: { type: [choiceSchema], required: true },
    correctChoiceId: { type: String, required: true },
    mediaUrl: { type: String },
  },
  { _id: false }
);

const quizSchema = new Schema<QuizDocument>(
  {
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    questions: { type: [questionSchema], default: [] },
  },
  { timestamps: true }
);

export const Quiz = mongoose.model<QuizDocument>('Quiz', quizSchema);
