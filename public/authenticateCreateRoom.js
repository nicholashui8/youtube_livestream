const socket = io();

document.getElementById("create-room-btn").addEventListener("click", () => {
    let name = document.getElementById('username').value;
    let targetUsername = document.getElementById('username').value;
    let targetRoom = document.getElementById('room').value;
    let url = document.getElementById("link").value;
    console.log(url);
    url.indexOf('v');
    videoID = url.substr( url.indexOf('v')+ 2, 11);    
    
    //1. send new username to server to check if it is duplicate
    socket.emit('checkIfDup', targetUsername);

    socket.on('returnIfDup', (badName) => {
        
        if(badName === false){
            socket.emit('checkIfRoomIsDup', targetRoom);

            socket.on('checkIfRoomIsDup', (badRoomName) => {
                if(badRoomName === false){
                    console.log('Username and roomname are good!');
                    window.location.href = "chat_custom.html" + "?username=" + name + "&room=" + targetRoom + "&id=" + videoID;
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