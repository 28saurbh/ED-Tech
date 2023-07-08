const Section = require('../models/Section')
const Course = require('../models/Courses')

//create section
exports.createSection = async(req, res) => {

    try{
        //fetch data 
        const {sectionName, courseId} = req.body;

        //data validation
        if(!sectionName || !courseId){
            return res.status(500).json({
                success: false,
                message: "All field required.."
            })
        }

        //create section in db
        const newSection = await Section.create({sectionName})

        //map section to course
        const updateCourse = await Course.findByIdAndUpdate(courseId, 
            {
                $push: {
                    courseContent: newSection._id
                }
            }, {new: true}).populate('courseContent').exec()

        //HW: use populate to replace sections/sub-sections both in the updatedCourseDetails
        //return response
        return res.status(200).json({
            success: true,
            message: "Section created successfully",
            updateCourse
        })
    }
    catch(e){
        console.log(e)
        return res.status(500).json({
            success: false,
            Error: e.message
        })
    }
}

//update section
exports.updateSection = async(req, res) => {

    try{
        //fetch data 
        const {sectionId, sectionName} = req.body;

        //data validation
        if(!sectionId ){
            return res.status(500).json({
                success: false,
                message: "All field required.."
            })
        }

        //update section in db
        const updateSection = await Section.findByIdAndUpdate(sectionId, {sectionName}, {new: true})

        //return response
        return res.status(200).json({
            success: true,
            message: "Section created successfully",
            updateSection
        })
    }
    catch(e){
        console.log(e)
        return res.status(500).json({
            success: false,
            Error: e.message
        })
    }
}

//delete section
exports.deleteSection = async(req, res) => {

    try{
        //fetch data 
        const {sectionId} = req.body;

        //data validation
        if(!sectionId ){
            return res.status(500).json({
                success: false,
                message: "All field required.."
            })
        }

        //update section in db
        const updateSection = await Section.findByIdAndDelete(sectionId, {new: true})

        //update course schema
        //TODO[Testing]: do we need to delete the entry from the course schema ??

        //return response
        return res.status(200).json({
            success: true,
            message: "Section deleted successfully",
            updateSection
        })
    }
    catch(e){
        console.log(e)
        return res.status(500).json({
            success: false,
            Error: e.message
        })
    }
}