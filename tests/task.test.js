const request = require('supertest')
const app = require('../src/app')
const Task = require('../src/models/tasks')
const { setupDatabase,
    userId,
    userId1,
    defaultUser,
    defaultUser1,
    defaultTask,
    defaultTask1,
    defaultTask2 } = require('./fixtures/db')

beforeEach(setupDatabase)

test('Should create a new task for the user', async () => {
    const response = await request(app).post('/tasks')
        .set('Authorization', `Bearer ${defaultUser.tokens[0].token}`)
        .send({
            description: 'Test',
            completed: true
        })
        .expect(201)
    const task = await Task.findById(response.body._id)
    console.log(response.body)
    expect(task.description).toEqual(response.body.description)
})

test('Should return all the tasks of the authenticated user', async () => {
    const response = await request(app).get('/tasks')
        .set('Authorization', `Bearer ${defaultUser.tokens[0].token}`)
        .send()
        .expect(200)
    expect(response.body.length).toEqual(2)

})

test('User should be unable to delete tasks of another user', async () => {
    const response = await request(app).delete(`/tasks/${defaultUser1._id}`)
        .set('Authorization', `Bearer ${defaultUser.tokens[0].token}`)
        .send()
        .expect(404)

    const task = Task.findById(defaultTask2._id)
    expect(task).not.toBeNull()
})
