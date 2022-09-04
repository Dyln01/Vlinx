const express = require('express');
const router = express.Router();
const passport = require("passport");
const bcrypt = require("bcrypt");
const socketIo = require("socket.io");
const { v4: uuidv4 } = require("uuid");
const {} = require("../modules/call-module")
const { makeMessage, getMessagesFromReceiverId, } = require("../modules/chat-module")
const { signIn, getOtherUsers, getUserFromEmail, getUserFromId, } = require("../modules/user-module")
const { checkAuthenticated, checkNotAuthenticated } = require("../modules/passport-modules")
const jwt_decode = require("jwt-decode");
const jwt_encode = require("jwt-encode");
const hop = require("@onehop/js")

/*const { Hop } = require("@onehop/js")

const hop = new Hop('tokenGenerator123!@gmail.com')*/

let server;

let io;

let succesSignIn;

const initializePassport = require("../passport-config");
initializePassport(
    passport,
    (email) => getUserFromEmail(email),
    (id) => getUserFromId(id),
);

router.get('/', checkAuthenticated, (req, res) => {
    server  = req.connection.server;
    io = socketIo(server);

    if (req.user) {
        let secret = 'HelloThisIsMySecretJwtToken@hello@gmail.com@Me!21432523121'
        let data = req.user
        let jwtData = jwt_encode(data, secret)

        io.sockets.on('connection', (socket) => {
            socket.on('sendMessage', async (info) => {
                let user_id = req.user.id;
                info.user_id = user_id;
                await makeMessage(info);

                consol.log(getMessagesFromReceiverId(1))

                socket.emit('messages', getMessagesFromReceiverId(1))
            })
            socket.emit('messages', getMessagesFromReceiverId(1))
            socket.emit('users', getOtherUsers(req.user))
        })

        res.render('chat.html', { jwt: JSON.stringify(jwtData) })
    } else {
        res.redirect('/login')
    }
})


router.get('/chat/:friend_id', checkAuthenticated, (req, res) => {
    console.log(req.isAuthenticated())
    if (req.user !== undefined) {
        if (req.isAuthenticated()) {
            let friend_id = parseInt(req.params.friend_id);
            let user_id = req.user.id;
        
            server  = req.connection.server;
            io = socketIo(server);
        
            io.sockets.on('connection', (socket) => {
                socket.on('sendMessage', async (info) => {
                    info.user_id = user_id;
                    await makeMessage(info);

                    var number = 0;
        
                    var wait500 = setInterval(() => {
                        if (number === 2) {
                            socket.emit('messages', getMessagesFromReceiverId(friend_id, user_id))
                            number = 0;
                            clearInterval(wait500);
                        } else {
                            number = number + 1;
                        }
                    }, 1000)

                    wait500
                })
                socket.emit('messages', getMessagesFromReceiverId(friend_id, user_id))
                socket.emit('users', getOtherUsers(req.user))
            })
        
            res.render('friend.html')
        } else {
            res.redirect('/login')
        }
    } else {
        res.redirect('/login')
    }
})

router.post('/chat/:friend_id', checkAuthenticated, async (req, res) => {
    let data = req.files.attach.data
    let stringedData = data.toString();

    let info = {
        message: stringedData,
        type: 'video',
        receiver_id: req.params.friend_id,
        user_id: req.user.id,
    }

    await makeMessage(info);

    res.redirect('/chat/' + req.params.friend_id)
})

router.get('/register', (req, res) => {
    if (req.isAuthenticated()) {
        res.redirect('/')
    } else {
        if (succesSignIn === true || succesSignIn === false) {
            res.render('register.html', { error: succesSignIn })
            succesSignIn = '';
        } else {
            res.render('register.html', { error: 'hello' })
        }
    }
})

router.post('/register', (req, res) => {
    if (req.body.token !== undefined) {
        let user = jwt_decode(req.body.token);

        req.login(user, function(err) {
            if (err) throw err;

            if (req.isAuthenticated()) {
                return res.redirect('/')
            }
        })
    } else {
        signIn(req, res);
    }
})

router.get('/login', (req, res) => {
    if (req.user) {
        if (req.isAuthenticated()) {
            res.redirect('/')
        } else {
            res.render('login.html')
        }
    } else {
        res.render('login.html')
    }
})

router.post('/login', (req, res, next) => {
    if (req.body.token !== undefined) {
        let user = jwt_decode(req.body.token);

        req.login(user, function(err) {
            if (err) throw err;

            if (req.isAuthenticated()) {
                return res.redirect('/')
            }
        })
    } else {
        passport.authenticate("local", {
            successRedirect: '/',
            failureRedirect: "/login",
            failureFlash: true,
        })(req, res, next);
    }
})

router.get('/logout', checkAuthenticated, (req, res) => {
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        res.redirect("/");
    });
})

module.exports = router;