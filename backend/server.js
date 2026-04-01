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

// App Config
const app = express();
const port = process.env.PORT || 3000;

// Connect DB
connectDB();

// Connect Cloudinary
connectCloudinary();

// Add Content Security Policy 
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.jsdelivr.net"], // ajusta según tus scripts
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https://res.cloudinary.com"],
        connectSrc: ["'self'", "https://api.ipify.org"], // según necesites
        frameAncestors: ["'none'"], // anti-clickjacking
      },
    },
    frameguard: { action: "deny" }, // X-Frame-Options
    noSniff: true, // X-Content-Type-Options
  })
);

// Middlewares
app.use(express.json());
app.use(cors());


// Api Endpoints
app.use("/api/user", userRouter);
app.use("/api/product", productRouter);
app.use("/api/cart", cartRouter);
app.use("/api/order", orderRouter);

app.get("/", (req, res) => {
  res.send("API WORKING");
});

app.listen(port, () => {
  console.log(`Server started at port ${port}`);
});