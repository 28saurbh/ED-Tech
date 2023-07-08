const mongoose = require('mongoose')


const CourseSchema = new mongoose.Schema({

    courseName: {
        type: String,
        trim: true,
        required: true
    },

    courseDescription: {
        type: String,
        trim: true,
        required: true
    },

    Instructor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    WhatYouWillLearn: {
        type: String,
    },

    courseContent: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Section"
        }
    ],

    RatingAndReviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RatingAndReview"
        }
    ],

    price: {
        type: Number,
        required: true
    },

    thumbnail: {
        type: String,
    },

    Tag: {
        type: [String],
        required: true
    },

    Category: {
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"Category",
    },
    
    studentsEnrolled: [{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User",
    }],
    status: {
		type: String,
		enum: ["Draft", "Published"],
	},
})

module.exports = mongoose.model('Course', CourseSchema)