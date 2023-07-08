const { default: mongoose } = require('mongoose')
const Category = require('../models/Category')
const Course = require('../models/Courses')


//create Category
exports.createCategory = async (req, res) => {
    try {

        //fetch data
        const { name, description } = req.body

        //validation
        if (!name || !description) {
            return res.status(400).json({
                success: false,
                message: "All fields are required"
            })
        }

        const categoryDetails = await Category.create({ name, description });
        // console.log("Category Details: ", CategoryDetails)

        return res.status(200).json({
            success: true,
            message: "Category created successfully",
            Data: categoryDetails,
        })


    } catch (e) {
        console.log("error in Category ", e)
        return res.status(500).json({
            success: false,
            message: e.message,
        })
    }

}

//get All Category
exports.showAllCategories = async (req, res) => {
    try {
        const allCategory = await Category.find({});

        //check Category found or not
        if (allCategory.length == 0) {
            return res.status(500).json({
                success: false,
                message: "Category not found",
            })
        }

        return res.status(200).json({
            success: true,
            Data: allCategory,
        })
    }
    catch (e) {
        console.log("Error in Get all Category ", e);
        return res.status(500).json({
            success: false,
            message: e.message,
        })
    }
}

//category page Details
exports.categoryPageDetails = async (req, res) => {

    try {
        //fetch category id
        const { categoryId } = req.body

        //valid course id
        if (!categoryId) {
            return res.status(500).json({
                success: false,
                message: "All field required..",
            })
        }

        //find course with category id
        const categories = await Category.findById(categoryId).populate("course").exec()

        //similar course but diff category
        const diffCategories = await Category.find({ _id: { $ne: categoryId } }).populate("course").exec()

        //here is the different way to find course with diff category
        // const diffCategoriesCourse = await Course.find({ Category: { $ne: new mongoose.Types.ObjectId(categoryId) } })
        //     .populate(
        //         {
        //             path: "Category",
        //             select: "name"
        //         }
        //     ).exec()

        //top selling course
        
        const topSellingCourses = await Course.find({});

        // console.log(topSellingCourses.length);

        const result = []

        topSellingCourses.forEach((course) => {
           
            const numberOfStudents = course.studentsEnrolled.length;

            const courseInfo = {
                course,
                numberOfStudents,
              };
        
              // Push the object to the result array
              result.push(courseInfo);
        })
        result.sort((a, b) => b.numberOfStudents - a.numberOfStudents)
        result.length = 10

        //return response
        return res.status(200).json({
            success: true,
            Data: {
                categories,
                diffCategories,
                // diffCategoriesCourse,
                topSellingCourses: result
            }
        })

    } catch (e) {
        console.log("Error in Get all Category ", e);
        return res.status(500).json({
            success: false,
            message: e.message,
        })
    }
}