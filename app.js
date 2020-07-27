const express = require('express');
const http = require('http');
const socketio = require('socket.io');
//get module for formatting message
const formatMessage = require('./messages');
const {userJoin, getCurrentUser, createRoom, users, rooms} = require('./users');

const app = express();

const server = app.listen(process.env.PORT || 3000, () => {console.log('listening at 3000!');});
//send frontend every file in folder: "public"
app.use(express.static('public'));

const io = socketio(server);


//run when a client connects, listens for a connection
io.on('connection', socket => {
    console.log('new web socket connection');

    socket.on('disconnect', () => {
        const user = getCurrentUser(socket.id);
        //since client has left, remove their username from array
        //we have the socketid of client that just left
        console.log('Has left: ' + socket.id);
        //get index of user that just left
        let userToRemove = users.findIndex((user) => {
            return user.id === socket.id;
        });
        //remove that user from array of users, userToRemove isn't -1
        //if it is -1, the id that just left wasnt in the array
        //must be a ghost connection
        if(userToRemove !== -1){
            //io.sockets.emit('deleteFromLive', );
            //get room of the user we're about to remove
            let room = users[userToRemove].room;
            //remove user that just disconnected
            users.splice(userToRemove, 1);
            //update "live users" in room that client just disconnected from
            io.sockets.in(user.room).emit('outputLiveUsers', {users, room});

            //We also need to delete rooms when they are empty. We can check if rooms are empty by seeing if anyone
            //is in the room that the most recent user just disconnected from
            let anyoneStillInRoom = users.includes(room);
            //if no one is in the room, remove room from array of rooms
            if(anyoneStillInRoom === false){
                console.log('Room: ' + room + ' has been removed');
                rooms.pop(room);
            }
        }
        console.log(users); 
    });

    //listens for when user joins a room
    socket.on('joinroom', ({username, room}) => {
        console.log(users);
        //pass user into "userJoin" to add user into array
        const user = userJoin(socket.id, username, room);
        createRoom(user.room);
        //puts client into room that they selected
        socket.join(user.room);
        console.log('User is joining: ' + user.room);
        console.log('User joined: ' + socket.id);
        //tells all clients in room that a new user has joined
        socket.broadcast.to(user.room).emit('message', formatMessage(user.username, user.username + ' has joined the chat'));
        console.log(user.username + ' has joined ' + user.room);
        for(let i = 0; i < rooms.length; i++){
            console.log('Name of room ' + i + ': ' + rooms[i]);
        }
        //when user joins room we want to update the live user section
        //update all other clients of the new client
        io.sockets.in(user.room).emit('outputLiveUsers', {users, room});
        
        //output all live users for the new client
        

    });

    socket.on('checkIfDup', (targetUsername) => {
        //looks through array to see if  username already exists
        let badName = users.some( el => {
            return el.username === targetUsername;
        });
        console.log(badName);
        console.log('CHECK');
        socket.emit('returnIfDup', badName);
    });
    //for users creating custom rooms. checks if room name already exists
    socket.on('checkIfRoomIsDup', (targetRoomname) => {
        let badRoomname = rooms.some( el => {
            return el === targetRoomname;
        });
        socket.emit('checkIfRoomIsDup', badRoomname);
    });
    
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
    socket.on('join-live!', () => {
        const user = getCurrentUser(socket.id);
        socket.broadcast.to(user.room).emit('join-live!',);
    });

    socket.on('askForVidID', () => {
        const user = getCurrentUser(socket.id);
        console.log('This is the current user: ' + user.username);
        socket.broadcast.to(user.room).emit('getVidID',)
    });

    socket.on('heresTheID', (ID) => {
        const user = getCurrentUser(socket.id);
        socket.to(user.room).emit('recieveVidID', ID);
    });
   
   //listen for when old client sends the time
    socket.on('heresTheTime', (time) => {
        //send time back to new client
       // socket.broadcast.emit('recieveTime', time);
        const user = getCurrentUser(socket.id);
        socket.to(user.room).emit('recieveTime', time);
    });
    //listen for when client sends which video they are on
    socket.on('heresTheIndex', (index) => {
        //send index back to new client
       // socket.broadcast.emit('recieveIndex', index);
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
        const user = getCurrentUser(socket.id);
        //send message to all clients in the same room
        io.to(user.room).emit('message', formatMessage(user.username, msg));
    });
});
