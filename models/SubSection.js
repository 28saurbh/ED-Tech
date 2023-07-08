const mongoose = require('mongoose')


const SubSectionSchema = new mongoose.Schema({

    title:{
        type: String,
        trim: true,
        required: true
    },

    timeDuration:{
        type: String,
        trim: true,
        required: true
    },

    description:{
        type: String,
        trim: true,
        required: true
    },

    videoUrl: {
        type: String,
    },

    additionUrl:{
        type: String,
    },

})

module.exports = mongoose.model('SubSection', SubSectionSchema)