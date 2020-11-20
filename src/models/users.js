const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const Task = require('./tasks')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        require: true,
        trim: true                //Properties are available in Mongoose documentation
    },
    age: {
        type: Number,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error("Age must be a positive integer")
            }
        }
    },
    email: {
        unique: true,
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("Invalid Email")
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 7,
        validate(value) {
            if (value.toLowerCase().includes("password")) {
                throw new Error("Password should not contain the term 'password'")
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }

}, { timestamps: true })

userSchema.virtual('userTasks', {  //associated with the populate function
    ref: 'Tasks',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function () {  //toJSON is called by express automatically during res.send so no need of getPublicProfile
    const user = this
    const userObj = user.toObject()
    delete userObj.password
    delete userObj.tokens
    delete userObj.avatar
    return userObj
}

userSchema.methods.generateAuthToken = async function () {       //methods for each instance of the model
    const user = this
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET)
    user.tokens = user.tokens.concat({ token: token }) //Object Destructuring
    await user.save()
    return token


}
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })
    if (!user) {
        throw new Error('Unable to login')
    }
    const isMatch = await bcrypt.compare(password, user.password)
    if (!isMatch) {
        throw new Error('Unable to login')
    }
    return user
}

//Hashing the plain text password
userSchema.pre('save', async function (next) {
    const user = this
    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8)
    }
    // console.log(user.password)
    console.log("user saving..")



    next()
})

//Delete users tasks when user is removed
userSchema.pre('remove', async function (next) {
    const user = this
    await Task.deleteMany({ owner: user._id })
    next()
})

const User = mongoose.model('User', userSchema)

// const me = new User({
//     name: "Kanak",
//     email: "kanak101.kd@gmail.com",
//     password: 'password123'
// })

// me.save().then(() => {
//     console.log(me)

// }).catch((error) => {
//     console.log(error)
// })

module.exports = User