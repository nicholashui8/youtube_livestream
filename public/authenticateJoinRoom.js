const socket = io();

document.getElementById("join-room-btn").addEventListener("click", () => {
    let name = document.getElementById('username').value;
    let targetUsername = document.getElementById('username').value;
    let targetRoom = document.getElementById('room').value;
    console.log('Button has been clicked!:  ' + targetUsername + ' ' + targetRoom);
    
    
    //1. send new username to server to check if it is duplicate
    socket.emit('checkIfDup', targetUsername);

    socket.on('returnIfDup', (badName) => {
        
        if(badName === false){
            socket.emit('checkIfRoomIsDup', targetRoom);

            socket.on('checkIfRoomIsDup', (roomExist) => {
                //if room is duplicate, it exists, send user there
                if(roomExist === true){
                    console.log('Username and roomname are good!');
                    window.location.href = "chat_custom.html" + "?username=" + name + "&room=" + targetRoom;
                }
                else{
                    document.getElementById("room").value = '';
                    document.getElementById("roomname-taken").style.display = "block";
                }
            });
        }
        else{
            document.getElementById("username").value = '';
            document.getElementById("username-taken").style.display = "block";
        }
    });
    /*
    console.log(badUserName);
    if(badUserName === true){
        alert('This username has been taken!')
        console.log('This username has been taken!');
    }
    if(badRoomName === true){
        alert('Room name already exists!')
        console.log('Room name already exists!');
    }
    //if username and room name is unique, send user to that room
    if((badUserName === false) && (badRoomName === false)){
        
    }
    */
});