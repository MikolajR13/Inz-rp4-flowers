import mongoose from 'mongoose';

const potSchema = new mongoose.Schema({
  potName: { type: String, required: true },
  flowerName: { type: String, required: true },
  waterAmount: { type: Number, required: true },
  wateringFrequency: { type: Number, required: true },
  potSize: { type: String, required: true }, // dodatkowy opis np. mała, średnia
  shape: { type: String, enum: ['cuboid', 'cylinder'], required: true },
  dimensions: {
    height: { type: Number, required: true }, // Wysokość jest wymagana dla obu kształtów
    width: { type: Number, required: function() { return this.shape === 'cuboid'; } }, // Szerokość tylko dla prostopadłościanu
    depth: { type: Number, required: function() { return this.shape === 'cuboid'; } }, // Głębokość tylko dla prostopadłościanu
    diameter: { type: Number, required: function() { return this.shape === 'cylinder'; } } // Średnica tylko dla walca
  },
  otherParams: {
    sunlight: String,
    soilType: String,
    temperature: String
  },
  wateringHistory: { type: [mongoose.Schema.Types.ObjectId], ref: 'WateringHistory', default: [] }
}, 
{
    timestamps: true
});

const Pot = mongoose.model('Pot', potSchema);

export default Pot;
