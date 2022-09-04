const mysql = require('mysql');
const bcrypt = require('bcrypt');
const jwt_decode = require("jwt-decode");
const jwt_encode = require("jwt-encode");

const users = []

//Connect Mysql database to script
const pool = mysql.createPool({
    connectionLimit: 100,
    multipleStatements: true,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

function loadAllUsers() {
    pool.query('SELECT first_name, last_name, username, email, password, friends, id FROM user', (err, results) => {
        if (err) throw err;

        users.length = 0;

        for (let i = 0; i < results.length; i++) {
            let user = results[i];
            users.push(user);
        }
    })
}

loadAllUsers();

async function signIn(req, res) {
    const { first_name, last_name, username, email, password } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    pool.query("INSERT INTO user SET first_name = ?, last_name = ?, username = ?, email = ?, password = ?", [first_name, last_name, username, email, hashedPassword], (err, result) => {
        if (err) throw err;

        res.redirect('/login');
    })
};

function getOtherUsers(userw) {
    let otherUsers = [];

    let user_id = userw.id

    for (let user of users) {
        if (parseInt(user.id) !== parseInt(user_id)) {
            otherUsers.push(user);
        }
    }
    
    return otherUsers;
}

function getUserFromEmail(email) {
    if (users.find(user => user.email === email)) {
        return users.find(user => user.email === email);
    } else {
        return null;
    }
};

function getUserFromId(id) {
    if (users.find(user => user.id === id)) {
        return users.find(user => user.id === id);
    } else {
        return null;
    }
};

module.exports = {
    signIn,
    getOtherUsers,
    getUserFromEmail,
    getUserFromId,
}