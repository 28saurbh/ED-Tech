const User = require('../models/User')
const Category = require('../models/Category')
const Course = require('../models/Courses')
const {uploadInCloudinary} = require('../utils/Cloudinary.js')
require('dotenv').config()


//createCourse handler function

exports.createCourse = async (req, res) => {
    try {

        //fetch data 
        const {courseName, courseDescription, whatYouWillLearn, price, tags, category} = req.body;

        //get thumbnail
        const thumbnail = req.files.thumbnailImage;

        //validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !tags || !thumbnail || !category) {
            return res.status(400).json({
                success:false,
                message:'All fields are required',
            });
        }

        //check for instructor
        const instructorDetails = await User.findById(req._id)

        if(!instructorDetails){
            return res.status(400).json({
                success:false,
                message:'Instructor not present',
            });
        }
        
        //TODO: Verify that userId and instructorDetails._id  are same or different ?

        //check given tag is valid or not
        const CategoryDetails = await Category.findById(category);
        if(!CategoryDetails){
            return res.status(400).json({
                success:false,
                message:'Invalid Tag',
            });
        }

        //Upload Image top Cloudinary

        const UploadImg = await uploadInCloudinary(thumbnail, process.env.FOLDER_NAME)
        

        //create an entry for new Course
        const newCourse = await Course.create({courseName, courseDescription,
                                Instructor: instructorDetails._id,
                                whatYouWillLearn, 
                                price,
                                thumbnail: UploadImg.secure_url,
                                Tag:tags,
                                Category: CategoryDetails._id,
                                })

        //add the new course to the user schema of Instructor
        await User.findByIdAndUpdate(instructorDetails._id,
                    {
                        $push: {
                            courses: newCourse._id
                        }
                    }, {new: true})
                    

        // Add the new course to the Categories
		await Category.findByIdAndUpdate(
			{ _id: category },
			{
				$push: {
					course: newCourse._id,
				},
			},
			{ new: true }
		);
        

        //return response
        return res.status(200).json({
            success:true,
            message:"Course Created Successfully",
            data:newCourse,
        });

    }
    catch(error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:'Failed to create Course',
            error: error.message,
        })
    }
};


//getAllCourses handler function
exports.getAllCourses = async (req, res) => {
    try {
            //TODO: change the below statement incrementally
            const allCourses = await Course.find({}).populate('courseContent').exec()

            if(allCourses.length == 0){
                return res.status(404).json({
                    success:false,
                    message: "No course found",
                })
            }
            return res.status(200).json({
                success:true,
                Data:allCourses,
            })
    }
    catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Cannot Fetch course data',
            error:error.message,
        })
    }
}

//getCourseDetails

exports.getCourseDetails = async (req, res) => {

    try{
        //fetch course id
        const {course_id} = req.body;

        //validate data
        if(!course_id){
            return res.status(500).json({
                success: false,
                message: "All fields are required.."
            })
        }

        //check course id present or not
        const courseDetails = await Course.findById(course_id)
                                .populate(
                                    {
                                        path: "Instructor",
                                        populate: {
                                            path: "additionalDetails"
                                        }
                                    }
                                )
                                .populate(
                                    {
                                        path: "courseContent",
                                        populate: {
                                            path: "SubSection"
                                        }
                                    }
                                )
                                .populate("RatingAndReviews")
                                .populate("Category")
                                .populate(
                                    {
                                        path: "studentsEnrolled",
                                        populate: {
                                            path: "additionalDetails"
                                        }
                                    }
                                ).exec()

        

        if(!courseDetails){
            return res.status(404).json({
                success: false,
                message: "Course Not Found.."
            })
        }

        //return response
        return res.status(200).json({
            success: true,
            message: "Course Details Fetched successfully..",
            courseDetails
        })

    }catch(e){
        console.log(e);
        return res.status(500).json({
            success: false,
            Error: e.message
        })
    }
}