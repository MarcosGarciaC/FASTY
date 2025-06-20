import userModel from "../models/userModel.js";
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import validator from 'validator'


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
    // cheking if user already exists
    const exists = await userModel.findOne({ email });
    if (exists) {
      return res.json({ success: false, message: "User aready exists" })
    }
    // validate email format & strong password
    if (!validator.isEmail(email)) {
      return res.json({ success: false, message: "Please enter a valid email" })
    }

    if (password.length < 8) {
      return res.json({ success: false, message: "Please enter a strong password" })
    }


    // hashing user password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new userModel({
      full_name: full_name,
      email: email,
      password: hashedPassword,
      phone: phone,
      profile_image: profile_image,
      role: role
    })

    const user = await newUser.save()
    const token = createToken(user._id)
    res.json({ success: true, token })
  }
  catch (error) {
    console.log(error);
    res.json({ success: false, message: "Error" })

  }
}

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


export { loginUser, registerUser, updatePassword }