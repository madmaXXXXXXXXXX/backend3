import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerUser = asyncHandler(async (req, res) => {
  //dummy data
  // res.status(200).json({
  //   message: "madmax",
  // });

  //steps ->
  // get user detail
  //validation - not empty
  //check if user already exsist :email ,username
  // check for images ,check for avatar
  //upload to cloudinary , avtar
  //cretae user object - create entry in db
  //remove password and refresh token from response
  //check for user creation
  //return res

  const { username, fullname, password, email } = req.body;
  console.log("email", email);
  console.log(req.body);

  if (
    [fullname, email, username, password].some((field) => field?.trim() === "")
  ) {
    throw new ApiError(400, " all fields are required");
  }

  const exsistingUser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (exsistingUser) {
    throw new ApiError(409, "user with username or email allready exsist");
  }

  const avatarLocalPath = req.files?.avatar[0]?.path;
  console.log(avatarLocalPath);
  // const coverImageLocalPath = req.files?.coverImage[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.lenght > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

  if (!avatarLocalPath) {
    throw new ApiError(400, "Avatar file is required");
  } else {
    console.log("images path", avatarLocalPath);
    console.log("coverimages path", coverImageLocalPath);
  }

  
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  console.log("avatar image", avatar);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);
  // if (!avatar) {
  //   throw new ApiError(400, "Avatar file is required");
  // }

  //error facing -> image caanot be staored  -> imagepath is not recieving by cloudinary model

  const user = await User.create({
    fullname,
    avatar: avatar.url || "",
    coverImage: coverImage?.url || "",
    email,
    password,
    username: username.toLowerCase(),
  });
  const createdUser = await User.findById(user._id).select(
    " -password -refreshtoken"
  );
  if (!createdUser) {
    throw new ApiError(500, "something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "registered succesfully"));
});



const loginUser = asyncHandler(async (req,res)=>{

})


export { registerUser };
