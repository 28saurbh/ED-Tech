const RatingAndReviewSchema = require('../models/RatingAndReviews')
const Course = require("../models/Courses")
const User = require("../models/User")
const { default: mongoose } = require('mongoose')

//create Rating
exports.createRating = async (req, res) => {

    try {
        //fetch data course id, rating, review, user id
        const { rating, review, course_id } = req.body
        const user_id = req._id;

        //validate data
        if (!user_id || !rating || !review || !course_id) {
            return res.status(500).json({
                success: false,
                message: "All fields are required"
            })
        }

        //check course valid or not
        const courseDetails = await Course.findById(course_id)
        if (!courseDetails) {
            return res.status(500).json({
                success: false,
                message: "Course Not found.."
            })
        }

        //check user enrolled or not in the course
        if (!courseDetails.studentsEnrolled.includes(user_id)) {
            return res.status(500).json({
                success: false,
                message: "Student not enrolled into the course"
            })
        }

        //check user already reviewed or not
        const alreadyReviewed = await RatingAndReviewSchema.findOne(
            {
                User: user_id,
                course: course_id
            }
        )
        if (alreadyReviewed) {
            return res.status(500).json({
                success: false,
                message: "User Already review the course"
            })
        }



        //create rating and review
        const RatingDetails = await RatingAndReviewSchema.create({
            User: user_id,
            rating, review
            , course: course_id
        })

        //update course schemas
        await Course.findByIdAndUpdate(courseDetails._id, {
            $push: {
                RatingAndReviews: RatingDetails._id
            }
        }, { new: true })

        //return response
        return res.status(200).json({
            success: true,
            message: "Rating create Successfully",
            RatingDetails
        })



    } catch (e) {
        console.log(e);
        return res.status(500).json({
            success: false,
            Error: e.message
        })
    }
}


//getAvgRating
exports.getAverageRating = async (req, res) => {

    try {
        //fetch data
        const course_id = req.body.course_id;

        //validate data
        if (!course_id) {
            return res.status(404).json({
                success: false,
                message: "All fields are required"
            })
        }

        //aggregation
        const result = await RatingAndReviewSchema.aggregate(
            [
                { $match: { course: new mongoose.Types.ObjectId(course_id) } },
                { $group: { _id: null, averageRating: { $avg: "$rating" } } },
                
            ]
        )

        // console.log(result)

        if(result.length > 0){
            return res.status(200).json({
                success: true,
                rating: result[0].averageRating
            })
        }
        else{
            return res.status(200).json({
                success: true,
                rating: 0,
            })
        }
        //return response

    }
    catch (e) {
        console.log(e)
        return res.status(500).json({
            success: false,
            Error: e.message
        })
    }

}

//getAllRatings
exports.getAllRating = async(req, res) => {
    try{
        //fetch data
        const {course_id} = req.body

        //validate
        if (!course_id) {
            return res.status(404).json({
                success: false,
                message: "All fields are required"
            })
        }

        //search rating and review by course id 
        const result = await RatingAndReviewSchema.find(
                                            // {course: new mongoose.Types.ObjectId(course_id)},
                                        ).sort({rating: "desc"}).populate(
                                            {
                                                path: "User",
                                                select: "firstName lastName email image"
                                            }
                                        ).populate(
                                            {
                                                path: "course",
                                                select: "courseName"
                                            }
                                        ).exec()
        //

        return res.status(200).json({
            success: true,
            rating: result
        })
    }catch (e) {
        console.log(e)
        return res.status(500).json({
            success: false,
            Error: e.message
        })
    }
}