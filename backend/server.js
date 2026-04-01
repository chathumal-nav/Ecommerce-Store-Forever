import express from "express";
import cors from "cors";
import "dotenv/config";
import connectDB from "./configs/db.js";
import connectCloudinary from "./configs/cloudinary.js";
import userRouter from "./routes/userRoute.js";
import productRouter from "./routes/productRoute.js";
import cartRouter from "./routes/cartRoute.js";
import orderRouter from "./routes/orderRoute.js";
import helmet from "helmet";

// ADD THESE
import session from "express-session";
import passport from "./configs/passport.js";
import authRouter from "./routes/authRoute.js";

// App Config
const app = express();
const port = process.env.PORT || 3000;

// Connect DB
connectDB();

// Connect Cloudinary
connectCloudinary();

// Middlewares
app.use(helmet()); // Make sure helmet is applied globally, at the very top

// Add Content Security Policy with customized rules
app.use(express.json());
app.use(cors());
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"], // Allow content from same originn
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"], // Allow inline scripts and eval (modify if needed)
      styleSrc: ["'self'", "'unsafe-inline'"], // Allow inline styles
      imgSrc: ["'self'", "data:", "https://*"], // Allow images from self and external sources
      connectSrc: ["'self'", "http://localhost:3000"], // Allow connections to the backend API
      fontSrc: ["'self'", "https://fonts.googleapis.com"], // Allow Google Fonts (modify as needed)
      objectSrc: ["'none'"], // Disallow plugins (e.g. Flash)
      upgradeInsecureRequests: [], // Upgrade HTTP requests to HTTPS automatically
    },
  })
);

// Api Endpoints
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

// ADD AUTH ROUTE (OAuth)
app.use("/auth", authRouter);

app.get("/", (req, res) => {
  res.send("API WORKING");
});

app.listen(port, () => {
  console.log(`Server started at port ${port}`);
});
