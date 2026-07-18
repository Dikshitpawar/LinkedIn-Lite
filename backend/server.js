require('dotenv').config();

const app = require("./src/app");
const http = require("http");
const connectDB = require('./src/db/db')
const {initializeSocket} = require("./src/socket")
const port = process.env.PORT || 8000;

const server = http.createServer(app);


connectDB()
initializeSocket(server)

server.listen(port , ()=>{
    console.log("Server is running..");
})