import path from 'path';
import foodModel from "../models/foodModel.js";
import { supabase } from '../supabaseClient.js'; // Asegúrate de exportar supabase correctamente desde ese archivo
import { v4 as uuidv4 } from 'uuid';

// Agregar nuevo alimento con imagen subida a Supabase Storage
const addFood = async (req, res) => {
  try {
    const file = req.file;
    if (!file) {
      return res.status(400).json({ success: false, message: "No image uploaded" });
    }

    // Crear nombre único para la imagen
    const fileExt = path.extname(file.originalname);
    const image_filename = `${uuidv4()}${fileExt}`;

    // Subir imagen a Supabase
    const { error: uploadError } = await supabase.storage
      .from('foods')
      .upload(image_filename, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError) {
      console.error('Error uploading image to Supabase:', uploadError);
      return res.status(500).json({ success: false, message: 'Error uploading image' });
    }

    // Obtener URL pública
    const { data } = supabase.storage.from('foods').getPublicUrl(image_filename);
    const publicUrl = data.publicUrl;

    // Crear documento en MongoDB
    const food = new foodModel({
      name: req.body.name,
      description: req.body.description,
      price: Number(req.body.price),
      category: req.body.category,
      ingredients: req.body.ingredients,
      is_available: req.body.is_available === 'true' || req.body.is_available === true,
      preparation_time: Number(req.body.preparation_time),
      daily_quantity: Number(req.body.daily_quantity),
      cafeteria_id: req.body.cafeteria_id,
      image: publicUrl,
    });

    await food.save();

    res.json({ success: true, message: "Food Added", data: food });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error adding food" });
  }
};

// Listar todos los alimentos
const listFood = async (req, res) => {
  try {
    const foods = await foodModel.find({});
    res.json({ success: true, data: foods });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching foods" });
  }
};

// Eliminar alimento y su imagen en Supabase Storage
const removeFood = async (req, res) => {
  try {
    const food = await foodModel.findById(req.body.id);
    if (!food) {
      return res.status(404).json({ success: false, message: "Food not found" });
    }

    // Extraer nombre de archivo de la URL pública
    const imageUrl = food.image;
    const fileName = imageUrl.split('/').pop();

    // Eliminar imagen del bucket Supabase
    const { error: deleteError } = await supabase.storage.from('foods').remove([fileName]);
    if (deleteError) {
      console.error('Error deleting image from Supabase:', deleteError);
      // No necesariamente bloquea la eliminación del documento
    }

    // Eliminar documento de MongoDB
    await foodModel.findByIdAndDelete(req.body.id);
    res.json({ success: true, message: "Food Removed" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error removing food" });
  }
};

// Listar alimentos por ID de cafetería
const listFoodByCafeteriaId = async (req, res) => {
  const cafeteriaId = req.params.cafeteria_id;
  try {
    const foods = await foodModel.find({ cafeteria_id: cafeteriaId });
    res.json({ success: true, data: foods });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error fetching food by cafeteria ID" });
  }
};

// Actualizar alimento y su imagen (si se envía nueva imagen)
const updateFood = async (req, res) => {
  try {
    const { id } = req.body;
    let updateData = {
      name: req.body.name,
      description: req.body.description,
      price: Number(req.body.price),
      category: req.body.category,
      ingredients: req.body.ingredients,
      is_available: req.body.is_available === 'true' || req.body.is_available === true,
      preparation_time: Number(req.body.preparation_time),
      daily_quantity: Number(req.body.daily_quantity),
    };

    if (req.file) {
      // Buscar alimento actual
      const food = await foodModel.findById(id);
      if (!food) {
        return res.status(404).json({ success: false, message: "Food not found" });
      }

      // Borrar imagen anterior de Supabase
      if (food.image) {
        const oldFileName = food.image.split('/').pop();
        const { error: deleteError } = await supabase.storage.from('foods').remove([oldFileName]);
        if (deleteError) {
          console.error('Error deleting old image from Supabase:', deleteError);
        }
      }

      // Subir nueva imagen
      const fileExt = path.extname(req.file.originalname);
      const newImageName = `${uuidv4()}${fileExt}`;
      const { error: uploadError } = await supabase.storage
        .from('foods')
        .upload(newImageName, req.file.buffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });

      if (uploadError) {
        console.error('Error uploading new image:', uploadError);
        return res.status(500).json({ success: false, message: "Error uploading new image" });
      }

      // Obtener URL pública nueva
      const { data } = supabase.storage.from('foods').getPublicUrl(newImageName);
      updateData.image = data.publicUrl;
    }

    const updatedFood = await foodModel.findByIdAndUpdate(id, updateData, { new: true });
    if (!updatedFood) {
      return res.status(404).json({ success: false, message: "Food not found" });
    }

    res.json({ success: true, message: "Food updated", data: updatedFood });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error updating food" });
  }
};

export { addFood, listFood, removeFood, listFoodByCafeteriaId, updateFood };
