import userModel from "../models/userModel.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import validator from 'validator'
import crypto from 'crypto';
import nodemailer from 'nodemailer';

const sendVerificationEmail = async (user) => {
  const token = crypto.randomBytes(32).toString('hex');
  user.verificationToken = token;
  await user.save();

  const link = `${process.env.FRONTEND_URL}/verify-email?token=${token}&email=${user.email}`;

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: '"FASTY" <no-reply@fasty.com>',
    to: user.email,
    subject: 'Confirma tu cuenta',
    html: `<p>Gracias por registrarte. Haz clic en el siguiente enlace para activar tu cuenta:</p>
           <a href="${link}">${link}</a>`
  };

  await transporter.sendMail(mailOptions);
};


// login user
const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await userModel.findOne({ email });
    if (!user) {
      return res.json({ success: false, message: "User Doesn't exist" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Invalid credentials" });
    }

    if (user.status !== 'active') {
      return res.json({ success: false, message: "Debes confirmar tu correo para iniciar sesión" });
    }


    const token = createToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
      }
    });
  }
  catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" })
  }
}

const createToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET)
}


// register user
const registerUser = async (req, res) => {
  const { full_name, email, password, phone, profile_image, role } = req.body;
  try {
    // Verificar si ya existe
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "El usuario ya existe" });
    }

    // Validaciones básicas
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Correo inválido" });
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "La contraseña debe tener al menos 8 caracteres" });
    }

    // Encriptar la contraseña
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Crear nuevo usuario con estado pending
    const newUser = new userModel({
      full_name,
      email,
      password: hashedPassword,
      phone,
      profile_image,
      role,
      status: 'pending'
    });

    await newUser.save(); // guardar primero

    // Enviar correo de verificación
    await sendVerificationEmail(newUser);

    // Respuesta sin token (porque aún no está verificado)
    res.json({ success: true, message: "Te hemos enviado un correo para verificar tu cuenta" });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error durante el registro" });
  }
};

// update password
const updatePassword = async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  try {
    const user = await userModel.findOne({ email });

    if (!user) {
      return res.json({ success: false, message: "User not found" });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.json({ success: false, message: "Current password is incorrect" });
    }

    if (newPassword.length < 8) {
      return res.json({ success: false, message: "New password must be at least 8 characters" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    user.password = hashedPassword;
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });

  } catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error updating password" });
  }
};


const verifyEmail = async (req, res) => {
  const { token, email } = req.query;

  try {
    const user = await userModel.findOne({ email, verificationToken: token });
    if (!user) {
      return res.status(400).json({ success: false, message: "Token inválido o expirado" });
    }

    user.status = 'active';
    user.verificationToken = undefined;
    await user.save();

    res.json({ success: true, message: "Cuenta verificada exitosamente. Ya puedes iniciar sesión." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Error al verificar la cuenta" });
  }
};


export { loginUser, registerUser, updatePassword, verifyEmail }