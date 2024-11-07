import mongoose, { mongo } from 'mongoose';
import wateringHistorySchema from './WateringHistory.js';

const potSchema = new mongoose.Schema({
  potName: { type: String, required: true },
  flowerName: { type: String, required: true },
  waterAmount: { type: Number }, 
  wateringFrequency: { type: Number }, 
  potSize: { type: String, required: true },
  shape: { type: String, enum: ['cuboid', 'cylinder'], required: true },
  dimensions: {
    height: { type: Number, required: true },
    width: { type: Number, required: function() { return this.shape === 'cuboid'; } },
    depth: { type: Number, required: function() { return this.shape === 'cuboid'; } },
    diameter: { type: Number, required: function() { return this.shape === 'cylinder'; } }
  },
  otherParams: {
    sunlight: { type: String },
    soilType: { type: String },
    temperature: { type: String }
  },
  // Pola automatycznie pobrane z API
  autoWateringEnabled: { type: Boolean, default: false },
  autoWateringSent: { type: Boolean, default: false },
  plantSpecifications: {
    commonName: { type: String },
    ligneousType: { type: String },
    growthForm: { type: String },
    growthHabit: { type: String },
    growthRate: { type: String },
    averageHeight: { type: String },
    maximumHeight: { type: String },
    shapeAndOrientation: { type: String },
    toxicity: { type: String },
    daysToHarvest: { type: Number },
    soilRequirements: {
      phMin: { type: Number },
      phMax: { type: Number },
      soilNutriments: { type: String },
      soilSalinity: { type: String },
      soilTexture: { type: String },
      soilHumidity: { type: String }
    },
    lightRequirements: { type: String },
    atmosphericHumidity: { type: String },
    growthMonths: { type: String },
    bloomMonths: { type: String },
    fruitMonths: { type: String },
    precipitation: {
      min: { type: String },
      max: { type: String }
    },
    temperature: {
      min: { type: String },
      max: { type: String }
    }
  },
  wateringHistory: { type: [wateringHistorySchema], default: [] },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, 
{
  timestamps: true
});

const Pot = mongoose.model('Pot', potSchema);

export default Pot;

