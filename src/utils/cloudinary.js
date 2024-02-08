import { v2 as cloudinary } from "cloudinary";

import fs from "fs";

// cloudinary.config({
//   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_SECRET,
// });


//error credention not applying from env

// import {v2 as cloudinary} from 'cloudinary';
          
cloudinary.config({ 
  cloud_name: 'itsmadmax', 
  api_key: '674543892357131', 
  api_secret: '_TRnyO9U7BWxIFczczVZndJ5k1I' 
});

//function for saving file
const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;
    // upload  the file on cloudinary
    const response = await cloudinary.uploader.upload(localFilePath)
    //file has been uploaded successfully
    console.log("file has been uploaded successfully", response.url);
    console.log("cloudinary localpath",localFilePath)
    console.log(response)

  fs.unlinkSync(localFilePath)
    return response;
  } catch (error) {
    fs.unlinkSync(localFilePath); // remove the locally saved temporary file as the upload operation got failed
    return null;
  }
};



export {uploadOnCloudinary}