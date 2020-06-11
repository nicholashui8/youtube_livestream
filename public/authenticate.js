const socket = io();

document.getElementById("join-room-btn").addEventListener("click", () => {
    let name = document.getElementById('username').value;
    let targetUsername = document.getElementById('username').value;
    let r = document.getElementById("room");
    let room = r.options[r.selectedIndex].value;
    console.log('The user entered... ' + targetUsername);
    //1. send new username to server to check if it is duplicate
    socket.emit('checkIfDup', targetUsername);
    console.log('check');
    //if badname is false, then allow user into room, if badname is true, ask user to enter a new username
    socket.on('returnIfDup', (badName) => {
        console.log(badName);
        console.log('repeat');
        if(badName === false){
            //?username=f&room=itzy
            window.location.href = "chat.html" + "?username=" + name + "&room=" + room;
        }
        if(badName === true){
            document.getElementById("username").value = '';
            document.getElementById("username-taken").style.display = "block";
        }
    });
});

    