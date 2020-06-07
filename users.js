const users = [];

function userJoin(id, username, room){
    const user = {id, username, room};
    //adds user to array
    users.push(user);
    return user;
}

function getCurrentUser(id){
    return users.find(user => user.id === id);
}


module.exports = {
    userJoin,
    getCurrentUser,
    users
};