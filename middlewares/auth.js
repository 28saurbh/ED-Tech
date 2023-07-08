const jwt = require('jsonwebtoken')
require('dotenv').config()

exports.auth = async (req, res, next) => {

    try{
        const token = req.cookies.token 
                        || req.body.token 
                        || req.header("Authorization")?.replace("Bearer ", "");

        if(!token){
            return res.status(500).json(
                {
                    success: false,
                    message: "Token Not Found"
                }
            )
        }

        //verify token
        try{
            const decode = jwt.verify(token, process.env.JWT_SECRETE_KEY)
            req.accountType = decode.accountType
            req._id = decode.id;
            // console.log("Decode Jwt ", decode)
            next()
        }
        catch(e){
            return res.status(500).json(
                {
                    success: false,
                    error: e.message,
                    message: "Token not valid"
                }
            )
        }
        
        
    }
    catch(e){
        console.log("Error in auth middleware: ", e.message)
        return res.status(500).json(
            {
                success: false,
                error: e.message,
                message: "Error in Auth middleware"
            }
        )
    }
}

exports.isStudent = async (req, res, next) => {

    try{
        if(req.accountType !== "Student"){
            return res.status(500).json(
                {
                    success: false,
                    message: "This Route is only for Students. You can not access this route"
                }
            )
        }
        next()
    }
    catch(e){
        console.log("Error in IsStudent middleware: ", e.message)
        return res.status(500).json(
            {
                success: false,
                error: e.message,
                message:'User role cannot be verified, please try again'
            }
        )
    }
}

exports.isInstructor = async (req, res, next) => {

    try{
        if(req.accountType !== "Instructor"){
            return res.status(500).json(
                {
                    success: false,
                    message: "This Route is only for Instructor. You can not access this route"
                }
            )
        }
        next()
    }
    catch(e){
        console.log("Error in Instructor middleware: ", e.message)
        return res.status(500).json(
            {
                success: false,
                error: e.message,
                message:'User role cannot be verified, please try again'
            }
        )
    }
}

exports.isAdmin = async (req, res, next) => {

    try{
        if(req.accountType !== "Admin"){
            return res.status(500).json(
                {
                    success: false,
                    message: "This Route is only for Admin. You can not access this route"
                }
            )
        }
        next()
    }
    catch(e){
        console.log("Error in Admin middleware: ", e.message)
        return res.status(500).json(
            {
                success: false,
                error: e.message,
                message:'User role cannot be verified, please try again'
            }
        )
    }
}