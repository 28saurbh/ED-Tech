const mailSender = require('../utils/mailSender')
const User = require('../models/User')
const crypto = require('crypto')
const bcrypt = require('bcrypt')

exports.resetPasswordToken = async (req, res) => {

    try{
        const {email} = req.body;

        //validation
        if(!email){
            return res.status(404).json(
                {
                    success:false,
                    message: "Please Enter Mail"
                }
            )
        }

        //find email exits or not in Db
        const user = await User.findOne({email});

        if(!user){
            return res.status(404).json(
                {
                    success:false,
                    message: "Email not found"
                }
            )
        }

        //create token
        const token = crypto.randomUUID();
        console.log("Reset Token: ", token)

        //bind with frontend url
        const url = `http://localhost:3000/update-password/${token}`

        //store token in user db
        const updatedUser = await User.findOneAndUpdate({email}, 
            {
                token: token,
                resetPasswordExpires: Date.now() + 5*60*100
            }, {new: true})

        //send mail to user with reset Link
        await mailSender(email, `Password Reset Link`, `Password Reset Link: ${url}`)

        return res.status(200).json(
            {
                success: true,
                token: token,
                message: "check your mail for reset link",
            }
        )

    }
    catch(e){
        return res.status(500).json(
            {
                success: false,
                
                Error: e.message
            }
        )
    }
}

exports.resetPassword = async (req, res) => {

    try{
        const {token, password, confirmPassword} = req.body

        //validation
        if(!token || !password || !confirmPassword){
            return res.status(500).json(
                {
                    success: false,
                    message: "Fill all the details"
                }
            )
        }

        //check password
        if(password !== confirmPassword){
            return res.status(500).json(
                {
                    success: false,
                    message: "Password no matched"
                }
            )
        }

        //check token valid or not in db
        const user = await User.findOne({token})

        if(!user){
            return res.status(500).json(
                {
                    success: false,
                    message: "Token Missing in Database"
                }
            )
        }

        //check time of token
        if(user.resetPasswordExpires < Date.now()){
            return res.status(500).json(
                {
                    success: false,
                    message: "Link Expire"
                }
            )
        }

        //hash password
        const hashPassword = await bcrypt.hash(password, 10)

        //update password in db
        const updateUser = await User.findOneAndUpdate({token}, {password: hashPassword}, {new:true})


        //return response
        return res.status(200).json(
            {
                success: true,
                message: "Password Reset successfully"
            }
        )
    }
    catch(e){
        console.log(e)
        return res.status(500).json(
            {
                success: true,
                Error: e.message
            }
        )
    }
}