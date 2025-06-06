import express from "express";
import { addCafetin, listCafetin, removeCafetin, updateCafetin, getCafetinByOwner } from "../controllers/cafetinController.js";
import multer from 'multer';

const cafetinRouter = express.Router();

// Image Storage Engine
const storage = multer.diskStorage({
  destination: "uploads/cafetins",
  filename: (req, file, cb) => {
    return cb(null, `${Date.now()}${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// Solo para el archivo 'logo'
const logoUpload = upload.single('logo');

cafetinRouter.post("/add", logoUpload, addCafetin); // Solo se sube 'logo'
cafetinRouter.get("/list", listCafetin);
cafetinRouter.post("/remove", removeCafetin);
cafetinRouter.put("/update/:id", upload.single("logo"), updateCafetin);
cafetinRouter.get("/by-owner/:owner_id", getCafetinByOwner);


export default cafetinRouter;
