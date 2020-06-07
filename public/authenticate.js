const socket = io();


document.getElementById("join-room-btn").addEventListener("click", () => {
    let name = document.getElementById('username').value;
    let targetUsername = document.getElementById('username').value;
    let r = document.getElementById("room");
    let room = r.options[r.selectedIndex].value;
    console.log('The user entered... ' + targetUsername);
    //1. get all usernames from server
    socket.emit('checkIfDup', targetUsername);

    socket.on('checkIfDup', (badName) => {
        if(badName === false){
            //?username=f&room=itzy
            window.location.href = "chat.html" + "?username=" + name + "&room=" + room;
        }
        else{
            alert('This username has been taken!')
            console.log('This username has been taken!');
        }
    });
});
