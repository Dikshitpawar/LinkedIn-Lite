const express = require("express");
const morgan = require("morgan")
const cors = require("cors")
const indexRoutes = require("./routes/index")
const cookieParser = require("cookie-parser")
const {errorMiddleware} = require("./middlewares/errorMiddleware")

const app = express();
app.use(express.json());
app.use(cookieParser())
app.use(cors({
    origin : "http://localhost:5173",
    credentials : true
}))
app.use(morgan('dev'))
app.use("/api" , indexRoutes)
app.use(errorMiddleware)

module.exports = app;