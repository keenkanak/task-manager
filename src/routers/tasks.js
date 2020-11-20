const express = require('express')
const router = new express.Router()
const Task = require('../models/tasks')
const auth = require('../middleware/auth')


//-----------------------------------TASKS--------------------------------------------------
//Create Task
router.post('/tasks', auth, async (req, res) => {
    // const task = new Task(req.body)
    const task = new Task({
        ...req.body,
        owner: req.user._id
    })
    console.log(req.body)

    try {
        await task.save()
        res.status(201).send(task)
    } catch (e) {
        res.status(400).send(e)
    }

})
//Read all tasks
//Set query string completed=true,false 
//Set query strings limit,skip to integer values
// Set query string sortBy=createdAt:desc etc 

router.get('/tasks', auth, async (req, res) => {
    const match = {}
    const sort = {}
    if (req.query.completed) {
        match.completed = (req.query.completed === 'true') //return true or false
    }
    if (req.query.sortBy) {
        const parts = req.query.sortBy.split(':')
        sort[parts[0]] = parts[1] === 'desc' ? -1 : 1
    }
    try {
        // const tasks = await Task.find({ owner: req.user._id }) //Alternative
        // res.send(tasks)
        await req.user.populate({
            path: 'userTasks',
            match: match,
            options: {
                limit: parseInt(req.query.limit),
                skip: parseInt(req.query.skip),
                sort: sort
                // sort:{
                //     createdAt:1
                // }
            }
            // match:{
            //     completed:false
            // }
        }).execPopulate()
        res.send(req.user.userTasks)
    } catch (e) {
        res.status(500).send(e)
    }
})
//Get tasks by id
router.get('/tasks/:id', auth, async (req, res) => {

    const _id = req.params.id
    try {
        const task = await Task.findOne({ _id, owner: req.user._id })
        if (!task) {
            return res.status(404).send()
        }

        res.send(task)
    } catch (e) {
        res.status(500).send(e)
    }
})
//Update tasks by id
router.patch('/tasks/:id', auth, async (req, res) => {
    const updates = Object.keys(req.body)
    const allowedUpdates = ['description', 'completed']
    const isValidOperation = updates.every((update) => allowedUpdates.includes(update))

    if (!isValidOperation) {
        return res.status(400).send({ error: "Invalid updates" })
    }
    try {
        // const task = await Task.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
        const task = await Task.findOne({ _id: req.params.id, owner: req.user._id })
        if (!task) {
            res.status(404).send()
        }
        updates.forEach((update) => task[update] = req.body[update])
        await task.save()
        res.send(task)
    } catch (e) {
        res.status(400).send(e)
    }
})
//Delete tasks by id
router.delete('/tasks/:id', auth, async (req, res) => {
    try {
        // const task = await Task.findByIdAndDelete(req.params.id)
        const task = await Task.findOneAndDelete({ _id: req.params.id, owner: req.user._id })

        if (!task) {
            res.status(404).send()
        }
        res.send(task)

    } catch (e) {
        res.status(400).send(e)
    }
})

module.exports = router