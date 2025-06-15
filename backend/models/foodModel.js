import mongoose from 'mongoose';
const { Schema, Types } = mongoose;

const foodSchema = new Schema({
  _id: { type: Types.ObjectId, required: true, auto: true },
  cafeteria_id: {
    type: Types.ObjectId,
    ref: 'cafetin',
    required: true
  },
  name: { type: String, required: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  category: {
    type: String,
    enum: ['Almuerzo','Bebida', 'Snack'],
    required: true
  },

  ingredients: { type: [String], default: [] },
  is_available: { type: Boolean, default: true },
  preparation_time: { type: Number, default: 0, min: 0 },
  daily_quantity: { type: Number, default: 0, min: 0 },
  image: { type: String, default: '' }
});

foodSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

const foodModel = mongoose.models.food || mongoose.model("food", foodSchema);

export default foodModel;