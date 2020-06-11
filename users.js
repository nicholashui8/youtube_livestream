//stores all current users
const users = [];
const rooms = [];

function userJoin(id, username, room){
    const user = {id, username, room};
    //adds user to array
    users.push(user);
    return user;
}

function getCurrentUser(id){
    return users.find(user => user.id === id);
}

function createRoom(room){
    rooms.push(room);
}


module.exports = {
    userJoin,
    getCurrentUser,
    createRoom,
    users,
    rooms
};