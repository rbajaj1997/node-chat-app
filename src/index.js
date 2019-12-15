const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('../src/utils/messages');
const { addUser, removeUser, getUser, getUsersInRoom } = require('../src/utils/user');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

const publicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(publicDirectoryPath));

const port = process.env.PORT || 8090;

//socket.emit, io.emit, socket.brodcast.emit
//io.to.emit, socket.broadcast.to.emit

io.on('connection', (socket) => {
    console.log('New Websocket Connection');

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room });
        if (error) {
            return callback(error);
        }
        socket.join(user.room);
        socket.emit('message', generateMessage('Admin', 'Welcome!'));
        socket.broadcast.to(user.room).emit('message', generateMessage(`${user.username} has joined!`));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback();
    });

    socket.on('sendMessage', (userText, callback) => {
        const filter = new Filter();
        if (filter.isProfane(userText)) {
            return callback('Profanity is not allowed');
        }
        const user = getUser(socket.id);
        io.to(user.room).emit('message', generateMessage(user.username, userText));
        callback();
    })

    socket.on('sendLocation', (location, callback) => {
        const user = getUser(socket.id);
        if(!user){
            callback(error);
        }
        io.to(user.room).emit('location-message', generateLocationMessage(user.username, `https://www.google.com/maps?q=${location.latitude},${location.longitude}`));
        callback();
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if(user){
            io.to(user.room).emit('message', generateMessage('Admin', `${user.username} has left the chat`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
})

server.listen(port, () => {
    console.log(`Listening to port ${port}`);
})