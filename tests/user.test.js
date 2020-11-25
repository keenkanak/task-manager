const request = require('supertest')
const app = require('../src/app')
const User = require('../src/models/users')
const { setupDatabase, userId, defaultUser } = require('./fixtures/db')

beforeEach(setupDatabase)                     //start with a fresh database every time a test is run
                                              //Create one user for routers that require a user already in the database)
test('Should sign up a new user', async () => {
    await request(app).post('/users').send({
        name: 'Ravi',
        email: 'nimbu@gmail.com',
        password: 'Bhosdika1'
    }).expect(201)
})

test('Should login an existing user', async () => {
    const response = await request(app).post('/users/login').send({
        email: defaultUser.email,
        password: defaultUser.password
    }).expect(200)
    const user = await User.findById(userId)
    expect(response.body.token).toBe(user.tokens[1].token)
})

test('Should not login an invalid user', async () => {
    await request(app).post('/users/login').send({
        email: 'kanak101.kd@gmail.com',
        password: defaultUser.password
    }).expect(400)
})

test('Should get profile for authenticated user', async () => {          //using the token created
    await request(app).get('/users/me')
        .set('Authorization', `Bearer ${defaultUser.tokens[0].token}`)
        .send()
        .expect(200)
})

test('Should not get profile for unauthenticated user', async () => {          //not setting any authentication header
    await request(app).get('/users/me')
        .send()
        .expect(401)
})

test('Should delete profile for authenticated user', async () => {
    await request(app).delete('/users/me')
        .set('Authorization', `Bearer ${defaultUser.tokens[0].token}`)
        .send()
        .expect(200)
    const user = await User.findById(userId)
    expect(user).toBeNull()
})

test('Should not delete profile for unauthenticated user', async () => {          //not setting any authentication header
    await request(app).delete('/users/me')
        .send()
        .expect(401)
})

test('Should upload avatar image for authenticated user', async () => {
    await request(app).post('/users/me/avatar')
        .set('Authorization', `Bearer ${defaultUser.tokens[0].token}`)
        .attach('avatar', 'tests/fixtures/testimg.jpg')
        .expect(200)
    const user = await User.findById(userId)
    expect(user.avatar).toEqual(expect.any(Buffer))
})

test('Should update profile for authenticated user', async () => {
    await request(app).patch('/users/me')
        .set('Authorization', `Bearer ${defaultUser.tokens[0].token}`)
        .send({
            name: 'updatedAdmin'
        })
        .expect(200)
    const user = await User.findById(userId)
    expect(user.name).toEqual('updatedAdmin')
})

test('Should not update invalid profile fields', async () => {
    await request(app).patch('/users/me')
        .set('Authorization', `Bearer ${defaultUser.tokens[0].token}`)
        .send({
            location: 'Kashmir'
        })
        .expect(400)
})

