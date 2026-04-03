import express from "express";
import passport from "passport";
import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const router = express.Router();

// Step 1: Redirect to Google
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Step 2: Callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
  }),
  async (req, res) => {
    // Successful authentication, create JWT tokens and redirect with them
    console.log("Google OAuth successful, user:", req.user);
    console.log("User ID:", req.user._id);

    const accessToken = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Store refresh token in database
    req.user.refreshTokens.push(refreshToken);
    await req.user.save();

    console.log("Generated JWT tokens");
    const redirectUrl = `http://localhost:5173?accessToken=${accessToken}&refreshToken=${refreshToken}&userName=${encodeURIComponent(req.user.name)}`;
    console.log("Redirecting to:", redirectUrl);
    res.redirect(redirectUrl);
  }
);

export default router;