
const User = require('../models/User')
const Profile = require('../models/Profile')
const Otp = require('../models/OTP')
const bcrypt = require('bcrypt')
const otpGenerator = require('otp-generator')
const jwt = require('jsonwebtoken')
const mailSender = require('../utils/mailSender')
require('dotenv').config()


//sendOTP
exports.sendotp = async (req, res) =>  {

    try {
        //fetch email from request ki body
        const {email} = req.body;

        //check if user already exist
        const checkUserPresent = await User.findOne({email});

        ///if user already exist , then return a response
        if(checkUserPresent) {
            return res.status(401).json({
                success:false,
                message:'User already registered',
            })
        }

        //generate otp
        var otp = otpGenerator.generate(6, {
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        console.log("OTP generated: ", otp );

        //check unique otp or not
        let result = await Otp.findOne({otp: otp});

        while(result) {
            otp = otpGenerator(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });
            result = await OTP.findOne({otp: otp});
        }

        const otpPayload = {email, otp};

        //create an entry for OTP
        const otpBody = await Otp.create(otpPayload);
        // console.log(otpBody);

        //return response successful
        res.status(200).json({
            success:true,
            message:'OTP Sent Successfully',
            otp,
        })
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:error.message,
        })

    }


};

//signUp
exports.signup = async (req, res) => {
    try {

        //data fetch from request ki body
        const {
            firstName,
            lastName, 
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber, 
            otp
        } = req.body;
        //validate krlo
        if(!firstName || !lastName || !email || !password || !confirmPassword
            || !otp) {
                return res.status(403).json({
                    success:false,
                    message:"All fields are required",
                })
        }


        //2 password match krlo
        if(password !== confirmPassword) {
            return res.status(400).json({
                success:false,
                message:'Password and ConfirmPassword Value does not match, please try again',
            });
        }

        //check user already exist or not
        const existingUser = await User.findOne({email});
        if(existingUser) {
            return res.status(400).json({
                success:false,
                message:'User is already registered',
            });
        }

        //find most recent OTP stored for the user
        const recentOtp = await Otp.findOne({email}).sort({createdAt:-1}).limit(1);
        console.log("Otp in DB ",recentOtp.otp);
        //validate OTP
        if(recentOtp.length == 0) {
            //OTP not found
            return res.status(400).json({
                success:false,
                message:'OTP not Found',
            })
        } else if(otp !== recentOtp.otp) {
            //Invalid OTP
            return res.status(400).json({
                success:false,
                message:"Invalid OTP",
            });
        }


        //Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        //entry create in DB

        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth: null,
            about:null,
            contactNumer:null,
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password:hashedPassword,
            accountType,
            additionalDetails:profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName}${lastName}`,
        })

        //return res
        return res.status(200).json({
            success:true,
            message:'User is registered Successfully',
            user,
        });
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"User cannot be registrered. Please try again",
        })
    }

}


//Login
exports.login = async (req, res) => {

    try{
        //take email and password from request
        const {email, password} = req.body

        //validation
        if(!email || !password){
            return res.status(403).json({
                success: false,
                message: "Fill all the details",
            })
        } 

        //find email exits or not
        const userData = await User.findOne({email}).populate('additionalDetails').exec()
        

        if(!userData){
            return res.status(402).json({
                success: false,
                message: "Email not found",
            })
        }

        //compare password
        if(await bcrypt.compare(password, userData.password)){
            //password matched
            console.log("Password matched")
            const payload = {
                id: userData._id,
                email: userData.email,
                accountType: userData.accountType
            }

            //create JWT token
            const token = jwt.sign(payload, process.env.JWT_SECRETE_KEY, {
                expiresIn: '2h'
            })
            userData.token = token
            userData.password = null

            //create cookie and send response
            const options = {
                expires: new Date(Date.now() + 3*24*60*60*1000),
                httpOnly:true,
            }
            // console.log("token ", token)
            return res.cookie("token", token, options).status(200).json({
                success:true,
                token,
                userData,
                message:'Logged in successfully',
            })
        }
        else{
            //password not matched
            return res.status(402).json({
                success: false,
                message: "Password not matched..",
            })
        }

    }catch(e){
        console.log(e.message)
        return res.status(500).json({
            success: false,
            message: "something went wrong",
            error : e
        })
    }
}

//changePassword
exports.changePassword = async (req, res) => {

    try{
        //get data from req body
        //get oldPassword, newPassword, confirmNewPassword
        const {email, oldPassword, newPassword, confirmNewPassword} = req.body
        //validation
        if(!email || !oldPassword || !newPassword || !confirmNewPassword){
            return res.status(402).json({
                success: false,
                message: "Fill all the details carefully",
            })
        }

        //check passwords
        if(newPassword !== confirmNewPassword){
            return res.status(402).json({
                success: false,
                message: "NewPassword and ConfirmPassword not matched..",
            })
        }

        //compare old password
        const user = await User.findOne({email})
        if(!user){
            return res.status(402).json({
                success: false,
                message: "Email not found",
            })
        }

        if(await bcrypt.compare(oldPassword, user.password)){

            const hashPassword = await bcrypt.hash(newPassword, 10)
            //update pwd in DB
            const updateUser = await User.findOneAndUpdate({email}, 
                {
                    password: hashPassword
                }, {new: true})

            //send mail - Password updated
            const mailBody = `<h3>Dear ${user.firstName} Password Updated Successfully</h3>`
            await mailSender(email, "Password Changed Successfully", mailBody)

            //return response
            return res.status(402).json({
                success: true,
                message: "Password updated Successfully",
                updateUser,

            })
        }
        else{
            return res.status(402).json({
                success: false,
                message: "Current Password Not Matched",
            })
        }
        

    }
    catch(e){
        console.log("Error in change Password ", e.message)
        return res.status(402).json({
            success: false,
            message: "Fill all the details",
        })
    }
    
}