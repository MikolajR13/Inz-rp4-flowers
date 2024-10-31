import mongoose from 'mongoose';

const wateringHistorySchema = new mongoose.Schema({
  date: { type: Date, required: true },
  waterAmount: { type: Number, required: false },
  soilMoisture: { type: Number, default: null }
}, 
{
    timestamps: true
});

export default wateringHistorySchema;
