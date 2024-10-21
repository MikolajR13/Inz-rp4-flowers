import mongoose from 'mongoose';

const wateringHistorySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  waterAmount: { type: Number, required: true }
}, 
{
    timestamps: true
});

export default wateringHistorySchema;
