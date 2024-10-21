import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  pots: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Pot' }] // Referencje do kolekcji Pot
}, 
{
    timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;
