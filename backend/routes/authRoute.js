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
    // Successful authentication, create JWT tokens and set secure cookies
    console.log("Google OAuth successful, user:", req.user);
    console.log("User ID:", req.user._id);

    const accessToken = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });
    const refreshToken = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    // Store refresh token in database
    req.user.refreshTokens.push(refreshToken);
    await req.user.save();

    console.log("Generated JWT tokens");
    
    // Set secure HTTP-only cookies instead of URL parameters
    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'lax',
      maxAge: 15 * 60 * 1000, // 15 minutes
    });
    
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production', // HTTPS only in production
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    res.cookie('userName', req.user.name, {
      httpOnly: false, // Allow access from JavaScript
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    
    console.log("Cookies set, redirecting to home");
    res.redirect('http://localhost:5173/');
  }
);

export default router;