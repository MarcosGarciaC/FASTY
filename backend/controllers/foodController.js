import { log } from "console";
import foodModel from "../models/foodModel.js";
import fs from 'fs'

// add food item
const addFood = async (req, res) => {  
  let image_filename = `${req.file.filename}`;
  const food = new foodModel({
    name: req.body.name,
    description: req.body.description,
    price: req.body.price,
    category: req.body.category,
    ingredients: req.body.ingredients,
    is_available: req.body.is_available,
    preparation_time: req.body.preparation_time,
    daily_quantity: req.body.daily_quantity,
    cafeteria_id: req.body.cafeteria_id,
    image: image_filename
  })
  try {
    await food.save();
    res.json({ success: true, message: "Food Added" })
  } catch (error) {
    console.log(error)
    res.json({ success: false, message: "Error" })
  }
}

// all food list
const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find({});
    res.json({ success: true, data: foods })
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" })
  }
}

// remove food item
const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.body.id);
    fs.unlink(`uploads/${food.image}`, () => {})
    await foodModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Food Removed" })
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" })
  }
}

// List food items by cafeteria ID
const listFoodByCafeteriaId = async (req, res) => {
  const cafeteriaId = req.params.cafeteria_id;
  try {
    const foods = await foodModel.find({ cafeteria_id: cafeteriaId });
    res.json({ success: true, data: foods });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching food by cafeteria ID" });
  }
};

// Update food item
const updateFood = async (req, res) => {
  try {
    console.log("Datos recibidos en updateFood:", req.body, req.file); // Para depuración
    const { id } = req.body;
    let updateData = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      ingredients: req.body.ingredients ? JSON.parse(req.body.ingredients) : [],
      is_available: req.body.is_available,
      preparation_time: req.body.preparation_time,
      daily_quantity: req.body.daily_quantity
    };

    if (req.file) {
      const food = await foodModel.findById(id);
      if (food.image) {
        fs.unlink(`uploads/${food.image}`, () => {});
      }
      updateData.image = req.file.filename;
    }

    const updatedFood = await foodModel.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    if (!updatedFood) {
      return res.json({ success: false, message: "Comida no encontrada" });
    }

    res.json({ success: true, message: "Comida actualizada", data: updatedFood });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error al actualizar la comida" });
  }
};

export { addFood, listFood, removeFood, listFoodByCafeteriaId, updateFood };