import express from 'express';
import { addFood, listFood, removeFood, listFoodByCafeteriaId, updateFood } from '../controllers/foodController.js';
import multer from 'multer';

// Use memory storage instead of disk storage
const upload = multer({ storage: multer.memoryStorage() });

const foodRouter = express.Router();

foodRouter.post("/add", upload.single("image"), addFood);
foodRouter.get("/list", listFood);
foodRouter.post("/remove", removeFood);
foodRouter.get("/list/by-cafeteria/:cafeteria_id", listFoodByCafeteriaId);
foodRouter.put("/update", upload.single("image"), updateFood);

export default foodRouter;