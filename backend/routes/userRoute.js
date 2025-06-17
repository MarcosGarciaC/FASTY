import express from 'express'
import { loginUser, registerUser, updatePassword } from '../controllers/userController.js'

const userRouter = express.Router()

userRouter.post("/register", registerUser)
userRouter.post("/login", loginUser)
userRouter.post("/update", updatePassword)

export default userRouter