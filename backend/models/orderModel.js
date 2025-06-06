import mongoose from 'mongoose';
const { Schema, Types } = mongoose;

const orderSchema = new Schema({
  _id: { type: Types.ObjectId, required: true, auto: true },

  user_id: {
    type: Types.ObjectId,
    ref: 'user',
    required: true
  },

  cafeteria_id: {
    type: Types.ObjectId,
    ref: 'cafetin',
    required: true
  },

  items: [
    {
      food_id: {
        type: Types.ObjectId,
        ref: 'food',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1
      },
      price: {
        type: Number,
        required: false,
        min: 0
      },
      special_instructions: {
        type: String,
        default: ''
      }
    }
  ],

  total_amount: {
    type: Number,
    required: true,
    min: 0
  },

  pickup_time: {
    type: Date,
    required: true
  },

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'ready', 'completed', 'cancelled'],
    default: 'pending'
  },

  payment_method: {
    type: String,
    enum: ['cash', 'card', 'university_card'],
    required: true
  },

  payment_status: {
    type: String,
    enum: ['pending', 'paid', 'failed'],
    default: 'pending'
  },

  confirmation_code: {
    type: String,
    required: true,
    unique: true
  },

  rating: {
    type: Number,
    min: 1,
    max: 5,
    required: false
  },

  feedback: {
    type: String,
    default: '',
    required: false
  },

  created_at: {
    type: Date,
    default: Date.now
  },

  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Middleware para actualizar automáticamente updated_at antes de guardar
orderSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

const orderModel = mongoose.models.order || mongoose.model('order', orderSchema);

export default orderModel;
