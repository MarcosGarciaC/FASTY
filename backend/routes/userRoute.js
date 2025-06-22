import express from 'express'
import { loginUser, registerUser, updatePassword, verifyEmail } from '../controllers/userController.js'

const userRouter = express.Router()

userRouter.post("/register", registerUser)
userRouter.post("/login", loginUser)
userRouter.post("/update", updatePassword)
userRouter.get('/verify-email', verifyEmail);
export default userRouter