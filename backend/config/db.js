import mongoose from "mongoose";

export const connectDB = async () => {
  await mongoose.connect('mongodb+srv://mimamameama:mimamameamamucho@fastysserver.3roekkm.mongodb.net/fasty').then(()=>console.log("Db connected"));
}