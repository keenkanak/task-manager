require('./db/mongoose')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const jws = require('jsonwebtoken')
const auth = require('../src/middleware/auth')

const userRouter = require('./routers/users')
const taskRouter = require('./routers/tasks')
// const port = process.env.PORT || 3000
const port = process.env.PORT

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))
// parse application/json
app.use(bodyParser.json())

// //Middleware for maintenance
// app.use((req, res, next) => {
//     if (req.method) {
//         res.status(503).send("Server down for maintenance")
//     }
// })
// app.use(auth.hello)

app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log(`Server is up on port ${port}`)
})

//bcrypt for encrypting passwords
// const myFunction = async () => {
//     const password = "keenkanak"
//     const hashedPassword = await bcrypt.hash(password, 8)
//     console.log(hashedPassword)
//     const isMatch = await bcrypt.compare(password, hashedPassword)
//     console.log(isMatch)
// }

// myFunction()




