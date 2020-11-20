const express = require('express')
const router = new express.Router()
const User = require('../models/users')
const auth = require('../middleware/auth')
const multer = require('multer')
const sharp = require('sharp')
const sendgrid = require('../emails/account')

//-----------------------------------USERS--------------------------------------------------
//Create User(Signup)
router.post('/users', async (req, res) => {
    const user = new User(req.body)
    // console.log(req.body)
    try {
        await user.save()
        sendgrid.sendWelcome(user.email, user.name)
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

//Login
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password)
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (e) {
        res.status(400).send(e)
    }
})

//Logout
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => token.token !== req.token)
        await req.user.save()
        res.status(200).send("Logout Successful")
    } catch (e) {
        res.status(500).send(e)
    }

})

//Logout of all sessions(All Tokens)
router.post('/users/logoutall', auth, async (req, res) => {
    try {
        req.user.tokens = []
        await req.user.save()
        res.status(200).send("Logged out of all sessions")
    } catch (e) {
        res.status(500).send(e)
    }

})

//Getting all users(Dev Only)
router.get('/users/', (req, res) => {

    User.find({}).then((users) => {
        res.send(users)
    }).catch((e) => {
        res.status(500).send(e)
    })
})
//Get Profile(Post Authentication)
router.get('/users/me', auth, (req, res) => {
    res.send(req.user)
})

// //Getting user by a single id using route parameters
// router.get('/users/:id', (req, res) => {
//     const _id = req.params.id

//     User.findById(_id).then((user) => {
//         if (!user) {
//             console.log("nothing")
//             res.status(404).send()
//         }

//         res.send(user)
//     }).catch((e) => {
//         res.status(500).send(e)
//     })

// })

//Updating a user

// router.patch('/users/:id', async (req, res) => {    //Before authentication was established
router.patch('/users/me', auth, async (req, res) => {                     //Using async-await instead of then-catch
    const updates = Object.keys(req.body)
    const allowedUpdates = ['name', 'age', 'email', 'password']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid updates" })
    }
    try {
        //const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })    //Bypasses middleware userSchema.pre
        // const user = await User.findById(req.params.id)
        updates.forEach((update) => req.user[update] = req.body[update])
        await req.user.save()

        // if (!user) {
        //     return res.status(404).send()
        // }

        res.send(req.user)

    } catch (e) {
        res.status(400).send(e)
    }
})

//Deleting a user
// router.delete('/users/:id', auth, async (req, res) => {
router.delete('/users/me', auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.user._id)
        // if (!user) {
        //     return res.status(404).send()
        // }
        await req.user.remove()
        sendgrid.sendGoodbye(req.user.email, req.user.name)
        res.send(req.user)
    } catch (e) {
        res.status(400).send(e)
    }
})

//Uploading user avatar
const upload = multer({
    // dest: 'avatars',  //removing this gives you access to the file in req
    limits: {
        filesize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error("Please use a jpg/jpeg/png file"))
        }
        cb(null, true)
    }
})

router.post('/users/me/avatar', auth, upload.single('avatar'), async (req, res) => {
    // const roundedCorners = Buffer.from(
    //     '<svg><rect x="0" y="0" width="200" height="200" rx="50" ry="50"/></svg>'
    // ); 
    // .composite([{
    //     input: roundedCorners,
    //     blend: 'dest-in'
    // }])                                  //Sharp Documentation

    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send("Avatar Updated")
}, (error, req, res, next) => {
    res.status(400).send(error.message)
})

//Deleting Avatars
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send("Avatar Deleted")
})

//Getting Avatars By Id
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const user = await User.findById(req.params.id)

        if (!user || !user.avatar) {
            throw new Error("Not found")
        }
        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})

module.exports = router