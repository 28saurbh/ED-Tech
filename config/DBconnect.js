const mongoose = require('mongoose')
require('dotenv').config()

const URL = process.env.DB_URL

exports.DBconnect = async() => {
    mongoose.connect(URL, 
        {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        .then(() => console.log("DB connected Successfully"))
        .catch( (error) => {
            console.log("DB Connection Failed");
            console.error(error);
            process.exit(1);
        } )
    };