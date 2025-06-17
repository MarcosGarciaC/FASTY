import { log } from "console";
import cafetinModel from "../models/cafetinModel.js";
import { v4 as uuidv4 } from 'uuid';
import supabase from "../config/supabaseClient.js";

// Add cafetin
const addCafetin = async (req, res) => {
  try {
    let logoUrl = '';

    if (req.file) {
      // Validate file buffer
      if (!req.file.buffer || req.file.buffer.length === 0) {
        console.error("Empty file buffer received");
        return res.status(400).json({ success: false, message: "Uploaded file is empty" });
      }

      const ext = req.file.originalname.split('.').pop();
      const filePath = `cafetins/${uuidv4()}.${ext}`;

      console.log("Uploading file to Supabase:", {
        filePath,
        mimeType: req.file.mimetype,
        bufferSize: req.file.buffer.length,
      });

      const { data, error } = await supabase.storage
        .from('cafetins')
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (error) {
        console.error("Supabase Upload Error:", error.message, error);
        return res.status(500).json({ success: false, message: "Error uploading logo", error: error.message });
      }

      const { data: publicUrlData } = supabase.storage
        .from('cafetins')
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
        console.error("Failed to retrieve public URL");
        return res.status(500).json({ success: false, message: "Failed to retrieve logo URL" });
      }

      logoUrl = publicUrlData.publicUrl;
    }

    const cafetin = new cafetinModel({
      owner_id: req.body.owner_id,
      name: req.body.name,
      description: req.body.description,
      location: req.body.location,
      logo: logoUrl,
      opening_hours: req.body.opening_hours || {},
      contact_phone: req.body.contact_phone,
      max_orders_per_time: req.body.max_orders_per_time,
      order_preparation_time: req.body.order_preparation_time
    });

    await cafetin.save();
    res.json({ success: true, message: "Cafetin Added" });
  } catch (error) {
    console.error("Add Cafetin Error:", error);
    res.json({ success: false, message: "Error adding cafetin" });
  }
};

// Get all cafetins list
const listCafetin = async (req, res) => {
  try {
    const cafetins = await cafetinModel.find({});
    res.json({ success: true, data: cafetins });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching cafetins" });
  }
};

// Get single cafetin by ID
const getCafetin = async (req, res) => {
  try {
    const cafetin = await cafetinModel.findById(req.params.id);
    if (!cafetin) {
      return res.json({ success: false, message: "Cafetin not found" });
    }
    res.json({ success: true, data: cafetin });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error fetching cafetin" });
  }
};

// Update cafetin
const updateCafetin = async (req, res) => {
  try {
    const updateData = { ...req.body };

    if (req.file) {
      // Validate file buffer
      if (!req.file.buffer || req.file.buffer.length === 0) {
        console.error("Empty file buffer received");
        return res.status(400).json({ success: false, message: "Uploaded file is empty" });
      }

      const existing = await cafetinModel.findById(req.params.id);
      if (existing?.logo) {
        // Delete old logo from Supabase
        const oldFilePath = existing.logo.split('/').slice(-2).join('/');
        const { error } = await supabase.storage
          .from('cafetins')
          .remove([oldFilePath]);
        if (error) {
          console.error("Supabase Delete Error:", error.message, error);
        }
      }

      // Upload new logo
      const ext = req.file.originalname.split('.').pop();
      const filePath = `cafetins/${uuidv4()}.${ext}`;
      const { data, error } = await supabase.storage
        .from('cafetins')
        .upload(filePath, req.file.buffer, {
          contentType: req.file.mimetype,
        });

      if (error) {
        console.error("Supabase Upload Error:", error.message, error);
        return res.status(500).json({ success: false, message: "Error uploading new logo" });
      }

      const { data: publicUrlData } = supabase.storage
        .from('cafetins')
        .getPublicUrl(filePath);
      if (!publicUrlData?.publicUrl) {
        console.error("Failed to retrieve public URL");
        return res.status(500).json({ success: false, message: "Failed to retrieve logo URL" });
      }

      updateData.logo = publicUrlData.publicUrl;
    }

    const updatedCafetin = await cafetinModel.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!updatedCafetin) {
      return res.json({ success: false, message: "Cafetin not found" });
    }

    res.json({ success: true, message: "Cafetin Updated", data: updatedCafetin });
  } catch (error) {
    console.error("Update Cafetin Error:", error);
    res.json({ success: false, message: "Error updating cafetin" });
  }
};

// Remove cafetin
const removeCafetin = async (req, res) => {
  try {
    const cafetin = await cafetinModel.findById(req.params.id);
    if (!cafetin) {
      return res.json({ success: false, message: "Cafetin not found" });
    }

    if (cafetin.logo) {
      // Delete logo from Supabase
      const filePath = cafetin.logo.split('/').slice(-2).join('/');
      const { error } = await supabase.storage
        .from('cafetins')
        .remove([filePath]);
      if (error) {
        console.error("Supabase Delete Error:", error.message, error);
      }
    }

    await cafetinModel.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Cafetin Removed" });
  } catch (error) {
    console.error("Remove Cafetin Error:", error);
    res.json({ success: false, message: "Error removing cafetin" });
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

export { addCafetin, listCafetin, getCafetin, updateCafetin, removeCafetin, getCafetinByOwner };