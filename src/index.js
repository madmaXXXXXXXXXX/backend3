// require('dotenv').config({path:'./env'})
import dotenv from 'dotenv'


dotenv.config({path:'./env'})
import connectDB from "./db/index.js";







connectDB();



// 1st approach for connecting to DB->
// import express from "express";
// const app = express();

// async () => {
//   try {
//     await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`);
//     app.on("error", () => {
//       console.log("err");
//       throw error;
//     });

//     app.listen(process.env.PORT, () => {
//       console.log(`server running on http://localhost:${process.env.PORT}`);
//     });
//   } catch (error) {
//     console.log("ERROR", error);
//     throw err;
//   }
// };
