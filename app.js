const express = require('express');
const http = require('http');
const socketio = require('socket.io');
//get module for formatting message
const formatMessage = require('./messages');
const {userJoin, getCurrentUser, users} = require('./users');

const app = express();

const server = app.listen(process.env.PORT || 3000, () => {console.log('listening at 3000!');});
//send frontend every file in folder: "public"
app.use(express.static('public'));

const io = socketio(server);


//run when a client connects, listens for a connection
io.on('connection', socket => {
    console.log('new web socket connection');

    //listens for when user joins a room
    socket.on('joinroom', ({username, room}) => {
        
        //pass user into "userJoin" to add user into array
        const user = userJoin(socket.id, username, room);
        socket.join(user.room);
        //tells all clients in room that a new user has joined
        socket.broadcast.to(user.room).emit('message', formatMessage(user.username, user.username + ' has joined the chat'));
        console.log(user.username + ' has joined ' + user.room);
        for(let i = 0; i < users.length; i++){
            console.log('UserL ' + i + ' ' + users[i].username);
        }
    });

    socket.on('checkIfDup', (targetUsername) => {
        console.log("Target: " + targetUsername);
        //looks through array to see if  username already exists
        let badName = users.some( el => {
            return el.username === targetUsername
        });
        
        socket.emit('checkIfDup', badName);
    });
    //here!
    //listening for when new client requests to join livestream
    socket.on('askForTime', (currentTime) => {
        //ask an old client for the time
        const user = getCurrentUser(socket.id);
        socket.broadcast.to(user.room).emit('getTime',)
        //socket.broadcast.emit('getTime', currentTime);
    });

    socket.on('askForVid', () => {
        //ask an old client for the time
        const user = getCurrentUser(socket.id);
        socket.broadcast.to(user.room).emit('getVidIndex',)
        //socket.broadcast.emit('getVidIndex', currentIndex);
    });
   
   //listen for when old client sends the time
    socket.on('heresTheTime', (time) => {
        //send time back to new client
        console.log('The time that we recived from old client ' + time);
       // socket.broadcast.emit('recieveTime', time);
        console.log('Time has been sent back to client');
        const user = getCurrentUser(socket.id);
        socket.to(user.room).emit('recieveTime', time);
    });
    //listen for when client sends which video they are on
    socket.on('heresTheIndex', (index) => {
        //send index back to new client
        console.log('The index that we recived from old client ' + index);
       // socket.broadcast.emit('recieveIndex', index);
        console.log('Index has been sent back to client');
        const user = getCurrentUser(socket.id);
        socket.to(user.room).emit('recieveIndex', index);
    });

    //listen for when client clicks play
    socket.on('playVid', () => {
        //tells all other clients to play video
        const user = getCurrentUser(socket.id);
        socket.broadcast.to(user.room).emit('playVid',)
        //socket.broadcast.emit('playVid', );
    });
    //listen for when client clicks pause    
    socket.on('pauseVid', () => {
         //tells all other clients to pause video
        const user = getCurrentUser(socket.id);
        socket.broadcast.to(user.room).emit('pauseVid',)
       // socket.broadcast.emit('pauseVid', );
    });
    //listen for when client clicks next
    socket.on('nextVid', () => {
        const user = getCurrentUser(socket.id);
        socket.broadcast.to(user.room).emit('nextVid',)
       // socket.broadcast.emit('nextVid', );
    });
    //listen for when client clicks previous
    socket.on('prevVid', () => {
        const user = getCurrentUser(socket.id);
        socket.broadcast.to(user.room).emit('prevVid',)
       // socket.broadcast.emit('prevVid', );
    });

    //listen for when for client sends a message
    socket.on('chatMessage', (msg) => {
        console.log('Message recieved: ' + msg);
        const user = getCurrentUser(socket.id);
        //send message to all clients in the same room
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });
});
