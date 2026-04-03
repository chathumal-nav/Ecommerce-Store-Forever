import express from "express";
import { loginUser, registerUser, adminLogin, refreshToken, logoutUser } from "../controllers/userController.js";

const userRouter = express.Router()

userRouter.post("/register", registerUser);
userRouter.post("/login",loginUser);
userRouter.post("/admin", adminLogin);
userRouter.post("/refresh", refreshToken);
userRouter.post("/logout", logoutUser);

export default userRouter;