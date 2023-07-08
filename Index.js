const express = require('express')
require('dotenv').config()
var cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const {CloudinaryConnect} = require('./config/Cloudinary')

const {DBconnect} = require("./config/DBconnect")
const app = express()
const cors = require("cors");


const userRoutes = require("./routes/User");
const profileRoutes = require("./routes/Profile");
const paymentRoutes = require("./routes/Payments");
const courseRoutes = require("./routes/Course");

//use cookie parser
app.use(cookieParser())

//json
app.use(express.json())

//DB connection
DBconnect()

app.use(
	cors({
		origin:"http://localhost:3000",
		credentials:true,
	})
)


//take file from postman
app.use(fileUpload({
    useTempFiles : true,
    tempFileDir : '/tmp/'
}));

//connect cloudinary
CloudinaryConnect()


//routes
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/profile", profileRoutes);
app.use("/api/v1/course", courseRoutes);
app.use("/api/v1/payment", paymentRoutes);


//def route

app.get("/", (req, res) => {
	return res.json({
		success:true,
		message:'Your server is up and running....'
	});
});

//port running
const PORT = process.env.PORT
app.listen(PORT, () => {
    console.log("Sever Started..", PORT)
})
