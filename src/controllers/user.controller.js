import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken";
//generate access and refresh token->
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    //find user by id
    const user = await User.findById(userId);

    //store value of access anf refresh token in variable
    const accessToken = await user.generateAcceessToken();
    const refreshToken = await user.generateRefreshToken();
    console.log("function jwt", accessToken, refreshToken);
    // pitting value in variable from response from user

    user.refreshToken = refreshToken;

    //saving in database
    //validationBeforeSave -> saving without any validation . know what to do
    await user.save({ validateBeforeSave: false });

    //send as object
    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(500, "something went wrong");
  }
};

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

//login user

const loginUser = asyncHandler(async (req, res) => {
  //req body -> data
  //username or email
  //find the user
  //password check
  //access and refresh token
  //send through cookie

  const { email, username, password } = req.body;

  if (!(email || username)) {
    throw new ApiError(400, "username or email required");
  }

  const user = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (!user) {
    throw new ApiError(400, "user does not exsist");
  }

  const isPasswordValid = await user.isPassowrdCorrect(password);

  if (!isPasswordValid) {
    throw new ApiError(401, "invalid user credentials");
  }

  //function for generation of access  and refresh token
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id
  );

  console.log("raw", accessToken, refreshToken);
  //get user details by id and only show fields except password and refresh token
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken"
  );

  // res.json(loggedInUser)

  //send cookies ->

  //option is an object . httpOnly allow user not to edit cookies from frontend .only edited at backend
  const options = {
    httpOnly: true,
    secure: true,
  };

  // const accessToken = await user.generateAcceessToken(loggedInUser._id)
  // console.log(accessToken)

  return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken,
          refreshToken,
        },
        "user logged in successfully"
      )
    );
});

//logout user ->

const logoutUser = asyncHandler(async (req, res) => {
  User.findByIdAndUpdate(
    req.user._id,
    {
      $set: undefined, //set value of updated field
    },
    {
      new: true, //show updated result in response
    }
  );

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "user logged out"));
});

// refrsh token ->

const refreshToken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  if (!incomingRefreshToken) {
    throw new ApiError(401, "unauthorized request");
  }
  try {
    const decodedToken = jwt.verify(incomingRefreshToken, "madmax");

    const user = await User.findById(decodedToken?._id);

    if (!user) {
      throw new ApiError(401, "invalid refresh token");
    }

    if (incomingRefreshToken != user?.refreshToken) {
      throw new ApiError(401, " refresh token is expired");
    }

    const options = {
      httpOnly: true,
      secure: true,
    };

    const { newRefreshToken, accessToken } =
      await generateAccessAndRefreshTokens(user._id);
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)
      .cookie("refreshToken", refreshToken, options)
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },
          "Acceess token refreshed"
        )
      );
  } catch (error) {
    throw new ApiError(401, error?.message || "invalid  ");
  }
});

export { registerUser, loginUser, logoutUser, refreshToken };
