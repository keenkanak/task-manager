const mongoose = require('mongoose')
const User = require('../models/users')
const Task = require('../models/tasks')

mongoose.connect(process.env.MONGODB_URL, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: true
})



