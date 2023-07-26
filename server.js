const path = require('path');
const express = require('express');
const http = require('http');
const socketio = require('socket.io');
const formatMassage = require('./utils/messages.js');
const { userJoin, getCurrentUser, userLeave, getRoomUsers } = require('./utils/users.js');


const botName = 'ChatCord Bot';

const app = express();

//The socketio() function in Socket.IO expects an HTTP server instance as an argument, not an Express application.
const server = http.createServer(app);
const io = socketio(server);
//Set the frotend directory to the express server
app.use(express.static(path.join(__dirname, 'public')));

// Run when client connects
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {
        const user = userJoin(socket.id, username, room);

        socket.join(user.room);

        //Welcome current client(only user)
        socket.emit('message', formatMassage(botName, 'Welcome to ChatCord!'));

        // Broadcast when a user connects(all clients accept the user)
        socket.broadcast
            .to(user.room)
            .emit('message', formatMassage(botName, `${user.username} joined the chat`));

        // Send users and room info
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        });
    });

    //Listen for chatMessage
    socket.on('chatMessage', (msg) => {
        const user = getCurrentUser(socket.id);

        //emit back to all clients(all clients)
        io.emit('message', formatMassage(user.username, msg));
    });

    // Runs when client disconnects(all clients accept the current client)
    socket.on('disconnect', () => {
        const user = userLeave(socket.id);

        if (user) {
            io.to(user.room).emit('message', formatMassage(botName, `${user.username} has left the chat`));
            // Send users and room info
            io.to(user.room).emit('roomUsers', {
                room: user.room,
                users: getRoomUsers(user.room)
            });
        }

    });
});

const PORT = 3000 || process.env.PORT;
//Start the server
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));