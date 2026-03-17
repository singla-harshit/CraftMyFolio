import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { router as authRouter } from "./route/authRoutes.js";
import { router as folioRouter} from "./route/folioRoutes.js";
import { consoleLogger, fileLogger } from "./util/logger.js";



const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json());

// (Optional) If you're sending URL-encoded form data
app.use(express.urlencoded({ extended: true }));

app.use(express.static("public"));

app.set("trust proxy", true); 
app.use(consoleLogger); // clean console logs
app.use(fileLogger);    // file logs

app.use(cookieParser());

//routes
app.use("/", authRouter);
app.use("/folio", folioRouter);

// After all routes (Error Handling Middleware)
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? undefined : err.stack,
  });
});


export { app };
