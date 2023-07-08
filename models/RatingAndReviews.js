const mongoose = require('mongoose')


const RatingAndReviewSchema = new mongoose.Schema({

    User:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },

    rating:{
        type: Number,
    },

    review:{
        type: String,
    }
    ,
	course: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "Course",
		index: true,
	},


})

module.exports = mongoose.model('RatingAndReview', RatingAndReviewSchema)