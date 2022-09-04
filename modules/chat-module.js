const mysql = require('mysql');
const { Hop } = require('@onehop/js');

const hop = new Hop('ptk_c19mMDQ3ZDFjZmNkYzI2MjM5MzczYjU4MTNjMDRiZTQ0N181MDk5OTQzNDUxMTQwOTE5MA');

const messages = []

//Connect Mysql database to script
const pool = mysql.createPool({
    connectionLimit: 100,
    multipleStatements: true,
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME,
});

async function loadAllMessages() {
    await pool.query("SELECT message, receiver_id, user_id, message_id FROM message", (err, results) => {
        if (err) throw err;

        messages.length = 0;

        for (let i = 0; i < results.length; i++) {
            let message = results[i];
            messages.push(message);
        }
    })
}

loadAllMessages()

function makeMessage(info) {
    return new Promise((resolve) => {
        const { message, type, receiver_id, user_id } = info;
        pool.query('INSERT INTO message SET message = ?, type = ?, receiver_id = ?, user_id = ?', [message, type, receiver_id, user_id], async (err, result) => {
            if (err) throw err;

            pool.query('SELECT message, receiver_id, user_id, message_id FROM message WHERE message_id = ?', [result.insertId], (err, results) => {
                if (err) throw err;

                console.log(results)

                messages.push(results[0]);
            })
        })
    })
}

function sendFromHop(message) {
    let info = {
        stream: message.message,
    }
    hop.channels.publishMessage('channel_NTA5NzAyNTY1NzY5NzUzODc', "MESSAGE_CREATE", info)
}

function getMessagesFromReceiverId(receiver_id, user_id) {
    const selectedMessages = [];

    for (const message of messages) {
        if (message.receiver_id === receiver_id && message.user_id === user_id) {
            if (message.user_id === user_id) {
                message.role = 'you'
            }
            selectedMessages.push(message);
        } else if (message.receiver_id === user_id && receiver_id === receiver_id){
            if (message.user_id === user_id) {
                message.role = ''
            }
            selectedMessages.push(message);
        }
    }

    return selectedMessages;
}

module.exports = {
    makeMessage,
    getMessagesFromReceiverId,
}