import mongoose from 'mongoose';

const HistorySchema = new mongoose.Schema({
  code: {
    type: String,
    required: true
  },
  codeB: {
    type: String,
    default: ''
  },
  language: {
    type: String,
    default: 'javascript'
  },
  personality: {
    type: String,
    default: 'Strict Senior Developer'
  },
  reviewType: {
    type: String,
    enum: ['review', 'compare'],
    default: 'review'
  },
  result: {
    type: mongoose.Schema.Types.Mixed,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('History', HistorySchema);
