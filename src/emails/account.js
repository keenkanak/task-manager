const sgmail = require('@sendgrid/mail');
// const sendgridAPIkey = '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'

sgmail.setApiKey(process.env.SENDGRID_API_KEY)
const sendWelcome = (email, name) => {
    const msg = {
        to: email,
        from: 'kanak101.kd@gmail.com',
        subject: `Welcome ${name}`,
        text: `Hello ${name},hope you like the app.`
    }

    try {
        sgmail.send(msg)
        console.log("Email sent")
    } catch (e) {
        throw new Error("Couldn't send email")
    }
}

const sendGoodbye = (email, name) => {
    const msg = {
        to: email,
        from: 'kanak101.kd@gmail.com',
        subject: `Sorry to see you go ${name}!`,
        text: `Please tell us what we could have done to keep you with us.`
    }

    try {
        sgmail.send(msg)
        console.log("Email sent")
    } catch (e) {
        throw new Error("Couldn't send email")
    }
}

module.exports = {
    sendWelcome,
    sendGoodbye
}

