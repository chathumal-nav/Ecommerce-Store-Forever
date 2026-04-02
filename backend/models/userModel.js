import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: function() { return !this.googleId; } }, // password required only for non-Google users
    googleId: { type: String, sparse: true }, // Google OAuth ID
    cartData: { type: Object, default: {} },
    refreshTokens: [{ type: String }], // Array of refresh tokens for revocation
  },
  { minimize: false }
);

const userModel = mongoose.models.user || mongoose.model("user", userSchema);

export default userModel;
