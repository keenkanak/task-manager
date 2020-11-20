const mongoose = require('mongoose')
const validator = require('validator')

const taskSchema = mongoose.Schema({
    description: {
        type: String,
        trim: true,
        required: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    owner: {
        type: mongoose.Schema.Types.ObjectID,
        required: true,
        ref: 'User' //creates reference between 2 models
    }

}, { timestamps: true })

taskSchema.pre('save', function (next) {
    next()
})

const Task = mongoose.model('Tasks', taskSchema)

// const task = new Task({
//     description: "Get groceries",
//     completed: false
// })

// task.save().then(() => {
//     console.log(task)
// }).catch((error) => {
//     console.log("Error occurred", error)
// })

module.exports = Task