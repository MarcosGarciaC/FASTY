import { log } from "console";
import foodModel from "../models/foodModel.js";
import fs from 'fs'

// add food item

const addFood = async (req, res ) => {  

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

  try{
    await food.save();
    res.json({success:true, message: "Food Added"})
  } catch (error) {
    console.log(error)
    res.json({success:false, message:"Error"})
  }

}

// all food list
const listFood = async (req,res) => {
  try {
    const foods = await foodModel.find({});
    res.json({success:true,data:foods})
  } catch (error) {
    console.log(error);
    res.json({success:false, message:"Error"})
  }
}

// remove food item
 const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.body.id);
    fs.unlink(`uploads/${food.image}`, ()=>{})

    await foodModel.findByIdAndDelete(req.body.id);
    res.json({success:true, message:"Food Removed"})
  } catch (error) {
    console.log(error);
    res.json({success:false, message:"Error"})
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



export {addFood, listFood,removeFood, listFoodByCafeteriaId}