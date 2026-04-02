import jwt from "jsonwebtoken";
import userModel from "../models/userModel.js";

const authUser = async (req, res, next) => {
  const { token } = req.headers;

  if (!token) {
    return res.json({
      success: false,
      message: "Not Authorized",
    });
  }

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);
    req.body.userId = tokenDecode.id;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.json({
        success: false,
        message: "Token expired",
        code: "TOKEN_EXPIRED"
      });
    }
    console.log(error);
    res.json({
      success: false,
      message: error.message,
    });
  }
};

export default authUser;
