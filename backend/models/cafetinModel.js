import mongoose from 'mongoose';
const { Schema, Types } = mongoose;

const cafetinSchema = new Schema({
  owner_id: {
    type: Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  name: { 
    type: String, 
    required: true,
    trim: true
  },
  
  description: { 
    type: String, 
    default: '',
    trim: true
  },
  
  location: { 
    type: String, 
    required: true,
    trim: true
  },

  logo: { 
    type: String, 
    default: '' 
  },

  opening_hours: {
    monday: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '17:00' }
    },
    tuesday: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '17:00' }
    },
    wednesday: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '17:00' }
    },
    thursday: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '17:00' }
    },
    friday: {
      open: { type: String, default: '08:00' },
      close: { type: String, default: '17:00' }
    },
    saturday: {
      open: { type: String, default: null },
      close: { type: String, default: null }
    },
    sunday: {
      open: { type: String, default: null },
      close: { type: String, default: null }
    }
  },

  contact_phone: { 
    type: String, 
    default: '',
    trim: true
  },

  rating: { 
    type: Number, 
    default: 0, 
    min: 0, 
    max: 5 
  },

  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
    index: true
  },

  max_orders_per_time: { 
    type: Number, 
    default: 10,
    min: 0 
  },
  
  order_preparation_time: { 
    type: Number, 
    default: 15,
    min: 0 
  },

  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

// Middleware para actualizar fechas
cafetinSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});

cafetinSchema.pre(['updateOne', 'findOneAndUpdate'], function (next) {
  this.set({ updated_at: Date.now() });
  next();
});

// Modelo en lowercase (como en tu versión original)
const cafetinModel = mongoose.models.cafetin || mongoose.model('cafetin', cafetinSchema);

export default cafetinModel;