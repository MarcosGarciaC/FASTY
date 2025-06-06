import { log } from "console";
import cafetinModel from "../models/cafetinModel.js";
import fs from 'fs';

// Add cafetin
const addCafetin = async (req, res) => { 
  let logo_filename = req.file ? `${req.file.filename}` : '';

  const cafetin = new cafetinModel({
    owner_id: req.body.owner_id,
    name: req.body.name,
    description: req.body.description,
    location: req.body.location,
    logo: logo_filename,
    opening_hours: req.body.opening_hours || {},
    contact_phone: req.body.contact_phone,
    max_orders_per_time: req.body.max_orders_per_time,
    order_preparation_time: req.body.order_preparation_time
  });

  try {
    await cafetin.save();
    res.json({success: true, message: "Cafetin Added"});
  } catch (error) {
    console.log(error);
    res.json({success: false, message: "Error adding cafetin"});
  }
};

// Get all cafetins list
const listCafetin = async (req, res) => {
  try {
    const cafetins = await cafetinModel.find({});
    res.json({success: true, data: cafetins});
  } catch (error) {
    console.log(error);
    res.json({success: false, message: "Error fetching cafetins"});
  }
};

// Get single cafetin by ID
const getCafetin = async (req, res) => {
  try {
    const cafetin = await cafetinModel.findById(req.params.id);
    if (!cafetin) {
      return res.json({success: false, message: "Cafetin not found"});
    }
    res.json({success: true, data: cafetin});
  } catch (error) {
    console.log(error);
    res.json({success: false, message: "Error fetching cafetin"});
  }
};

// Update cafetin
const updateCafetin = async (req, res) => {
  try {
    const updateData = {...req.body};
    
    if (req.file) {
      // If new logo is uploaded, delete the old one
      const existing = await cafetinModel.findById(req.params.id);
      if (existing.logo) {
        fs.unlink(`uploads/${existing.logo}`, () => {});
      }
      updateData.logo = req.file.filename;
    }

    const updatedCafetin = await cafetinModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    res.json({success: true, message: "Cafetin Updated", data: updatedCafetin});
  } catch (error) {
    console.log(error);
    res.json({success: false, message: "Error updating cafetin"});
  }
};

// Remove cafetin
const removeCafetin = async (req, res) => {
  try {
    const cafetin = await cafetinModel.findById(req.params.id);
    
    // Delete the logo file if exists
    if (cafetin.logo) {
      fs.unlink(`uploads/${cafetin.logo}`, () => {});
    }

    await cafetinModel.findByIdAndDelete(req.params.id);
    res.json({success: true, message: "Cafetin Removed"});
  } catch (error) {
    console.log(error);
    res.json({success: false, message: "Error removing cafetin"});
  }
};

// Get cafetin by owner_id
const getCafetinByOwner = async (req, res) => {
  try {
    const { owner_id } = req.params;
    const cafetin = await cafetinModel.findOne({ owner_id });

    if (!cafetin) {
      return res.status(404).json({ success: false, message: "Cafetin no encontrado para este usuario" });
    }

    res.json({ success: true, data: cafetin });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Error al buscar cafetin por owner_id" });
  }
};



export { addCafetin, listCafetin, getCafetin, updateCafetin, removeCafetin, getCafetinByOwner};