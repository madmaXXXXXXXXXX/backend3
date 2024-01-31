import expresss from 'express'
import cors from 'cors'
import cookieParser from 'cookie-parser';

const app =  expresss();


app.use(cors({
    origin:process.env.CORS_ORIGIN,
    credentials:true
}))

//middlewares
app.use(expresss.json({limit:"16KB"}))  //size of json
app.use(expresss.urlencoded({extended:true,limit:"16Kb"})) //handling search url
app.use(expresss.static("public"))  //storing files in folder in local server
app.use(cookieParser())  //performing crud from server to client 


export {app}