import { log } from "console";
import foodModel from "../models/foodModel.js";
import { v4 as uuidv4 } from 'uuid';
import supabase from "../config/supabaseClient.js";

const addFood = async (req, res) => {
  try {
    let imageUrl = '';

    if (req.file) {
      // Validate file buffer
      if (!req.file.buffer || req.file.buffer.length === 0) {
        console.error("Empty file buffer received");
        return res.status(400).json({ success: false, message: "Uploaded file is empty" });
      }

      const ext = req.file.originalname.split('.').pop();
      const filePath = `foods/${uuidv4()}.${ext}`;

      console.log("Uploading file to Supabase:", {
        filePath,
        mimeType: req.file.mimetype,
        bufferSize: req.file.buffer.length,
      });

      const { data, error } = await supabase.storage
        .from('foods')
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (error) {
        console.error("Supabase Upload Error:", error.message, error);
        return res.status(500).json({ success: false, message: "Error uploading image", error: error.message });
      }

      const { data: publicUrlData } = supabase.storage
        .from('foods')
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
        console.error("Failed to retrieve public URL");
        return res.status(500).json({ success: false, message: "Failed to retrieve image URL" });
      }

      imageUrl = publicUrlData.publicUrl;
    } else {
      console.error("No file provided in request");
      return res.status(400).json({ success: false, message: "No image file provided" });
    }

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
      image: imageUrl,
    });

    await food.save();
    res.json({ success: true, message: "Food Added" });
  } catch (error) {
    console.error("Add Food Error:", error);
    res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
  }
};

const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find({});
    res.json({ success: true, data: foods });
  } catch (error) {
    console.error("List Food Error:", error);
    res.json({ success: false, message: "Error fetching food list" });
  }
};

const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.body.id);
    if (!food) {
      return res.status(404).json({ success: false, message: "Food not found" });
    }

    if (food.image) {
      // Extract file path from Supabase URL
      const filePath = food.image.split('/').slice(-2).join('/');
      const { error } = await supabase.storage
        .from('foods')
        .remove([filePath]);
      if (error) {
        console.error("Supabase Delete Error:", error.message, error);
      }
    }

    await foodModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Food Removed" });
  } catch (error) {
    console.error("Remove Food Error:", error);
    res.json({ success: false, message: "Error removing food" });
  }
};

const listFoodByCafeteriaId = async (req, res) => {
  const cafeteriaId = req.params.cafeteria_id;
  try {
    const foods = await foodModel.find({ cafeteria_id: cafeteriaId });
    res.json({ success: true, data: foods });
  } catch (error) {
    console.error("List Food by Cafeteria Error:", error);
    res.json({ success: false, message: "Error fetching food by cafeteria ID" });
  }
};

const updateFood = async (req, res) => {
  try {
    console.log("Datos recibidos en updateFood:", req.body, req.file);
    const { id } = req.body;
    let updateData = {
      name: req.body.name,
      description: req.body.description,
      price: req.body.price,
      category: req.body.category,
      ingredients: req.body.ingredients ? JSON.parse(req.body.ingredients) : [],
      is_available: req.body.is_available,
      preparation_time: req.body.preparation_time,
      daily_quantity: req.body.daily_quantity,
    };

    if (req.file) {
      // Validate file buffer
      if (!req.file.buffer || req.file.buffer.length === 0) {
        console.error("Empty file buffer received");
        return res.status(400).json({ success: false, message: "Uploaded file is empty" });
      }

      const food = await foodModel.findById(id);
      if (food?.image) {
        // Delete old image from Supabase
        const oldFilePath = food.image.split('/').slice(-2).join('/');
        const { error } = await supabase.storage
          .from('foods')
          .remove([oldFilePath]);
        if (error) {
          console.error("Supabase Delete Error:", error.message, error);
        }
      }

      // Upload new image
      const ext = req.file.originalname.split('.').pop();
      const filePath = `foods/${uuidv4()}.${ext}`;
      const { data, error } = await supabase.storage
        .from('foods')
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (error) {
        console.error("Supabase Upload Error:", error.message, error);
        return res.status(500).json({ success: false, message: "Error uploading new image" });
      }

      const { data: publicUrlData } = supabase.storage
        .from('foods')
        .getPublicUrl(filePath);
      if (!publicUrlData?.publicUrl) {
        console.error("Failed to retrieve public URL");
        return res.status(500).json({ success: false, message: "Failed to retrieve image URL" });
      }

      updateData.image = publicUrlData.publicUrl;
    }

    const updatedFood = await foodModel.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedFood) {
      return res.json({ success: false, message: "Comida no encontrada" });
    }

    res.json({ success: true, message: "Comida actualizada", data: updatedFood });
  } catch (error) {
    console.error("Update Food Error:", error);
    res.json({ success: false, message: "Error al actualizar la comida" });
  }
};

export { addFood, listFood, removeFood, listFoodByCafeteriaId, updateFood };