const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const User = require('../../src/models/users')
const Task = require('../../src/models/tasks')

const userId = new mongoose.Types.ObjectId()  //to generate a custom token we need a custom user id
const defaultUser = {
    _id: userId,
    name: 'admin',
    email: 'admin@task-manager.com',
    password: 'rootadmin0',
    tokens: [{
        token: jwt.sign({ _id: userId }, process.env.JWT_SECRET)
    }]
}
const userId1 = new mongoose.Types.ObjectId()
const defaultUser1 = {
    _id: userId1,
    name: 'admin1',
    email: 'admin1@task-manager.com',
    password: 'rootadmin1',
    tokens: [{
        token: jwt.sign({ _id: userId1 }, process.env.JWT_SECRET)
    }]
}

const defaultTask = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Test Task0',
    owner: defaultUser._id
}

const defaultTask1 = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Test Task1',
    owner: defaultUser._id
}


const defaultTask2 = {
    _id: new mongoose.Types.ObjectId(),
    description: 'Test Task2',
    owner: defaultUser1._id
}


const setupDatabase = async () => {
    await User.deleteMany()
    await Task.deleteMany()
    await new User(defaultUser).save()
    await new User(defaultUser1).save()
    await new Task(defaultTask).save()
    await new Task(defaultTask1).save()
    await new Task(defaultTask2).save()
}

module.exports = {
    setupDatabase,
    userId,
    userId1,
    defaultUser,
    defaultUser1,
    defaultTask,
    defaultTask1,
    defaultTask2
}