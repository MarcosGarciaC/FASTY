import mongoose from 'mongoose';
const { Schema, Types } = mongoose;

const userSchema = new Schema({
  _id: { type: Types.ObjectId, required: true, auto: true },

  full_name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true }, // Se recomienda almacenar hash

  phone: { type: String, default: '' },
  profile_image: { type: String, default: '' }, // URL de imagen

  role: {
    type: String,
    enum: ['customer', 'cafeteria_owner', 'admin'],
    default: 'customer'
  },
  
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }

  
}, {minimize:false});

userSchema.pre('save', function (next) {
  this.updated_at = Date.now();
  next();
});


const userModel = mongoose.models.user || mongoose.model('user', userSchema);

export default userModel;
