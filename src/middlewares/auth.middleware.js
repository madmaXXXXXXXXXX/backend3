// auth middleware

import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import jwt from "jsonwebtoken";


//if res is not used then you can replace it with _
export const verifyJWT = asyncHandler(async (req, res , next) => {
  try {
    // req accesstoken
    const token = req.cookies?.accessToken ||
      req.header("Authorization")?.replace("Bearer", "");

      console.log("token  ",token)

    // console.log("auth middleware")
    // console.log(req.cookies)

    if (!token) {
      throw new ApiError(401, "Unauthorized request");
    }

    //decode jwt token
    const decodedToken =  jwt.verify(token, "madmax");
    console.log("decode",decodedToken)
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken"
    );

    if (!user) {
      //TODO :discuss about frontend
      throw new ApiError(401, "Invalid access token");
    }

    //create user object in cookies
    req.user = user;
    next();
  } catch (error) {
   throw new ApiError(401,error || "invalid access token")
  }
});
