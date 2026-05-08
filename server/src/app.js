import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import ApiError from '#shared/utils/apiError.js';
import errorHandler from '#middlewares/errorHandler.js';


const app = express();


// dev logger
if(process.env.NODE_ENV === "development"){
   app.use(morgan("dev"));
}

app.use(cors({
    origin: process.env.CORS_ORIGIN, 
    credentials: true 
}));

app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}));

app.use(express.json({limit: "16kb"}));
app.use(express.static("public"));
app.use(cookieParser());


app.use((req, res, next) => {
    console.log("METHOD:", req.method);
    console.log("URL:", req.url);
    next();
});

import authRouter from '#auth/auth.routes.js';

import {
    accountRouter,
    addressRouter,
    phoneRouter,
    profileRouter,
    securityRouter
} from '#users/routes/index.js';


app.use("/api/v1/auth", authRouter);


app.use((req,res,next)=>{
    next(new ApiError(404, "Route not Found"));
});

app.use(errorHandler);


export default app;
