const socket = io();
//get username and room from URL
//https://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}
let username = getParameterByName('username');
let room = getParameterByName('room');


//join room with username and room
socket.emit('joinroom', {username, room});
console.log(username, room);

//ouputs all clients that are in the same room as new client
socket.on('outputLiveUsers', ({users, room}) => {
    deleteLiveUser();
    for(let i = 0; i < users.length; i++){
        //only prints out username if clients are in the same room
        if(users[i].room === room){
            outputLiveUsers(users[i].username);
            console.log('Beep' + users[i].username);
        }
    }
});
/*prob dont need th
//something is wrong with this
//updates every client's 'live user' page that new user has joined
socket.on('updateLiveUsers', (users) => {
        //output only the new client
        outputLiveUsers(users[users.length - 1].username);
});
*/
/*--------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------
Youtube API call
*/
const group = {
    itzy: 'fE2h3lGlOsk, zndvqTc4P9I, pNfTK39k55U',
    blackpink: '2S24-y0Ij3Y, 9pdj4iJD08s, dISNgvVpWlo',
    twice: 'kOHB85vDuow, i0p1bmr0EmE, Fm5iP0S1z9w',
    redvelvet: 'uR8Mrt1IpXg, J_CFBjAyPWE, 6uJf2IT2Zh8'
}
// 2. This code loads the IFrame Player API code asynchronously.
var tag = document.createElement('script');

tag.src = "https://www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

// 3. This function creates an <iframe> (and YouTube player)
//    after the API code downloads.
var player;

//this function executes by itself. not sure why
function onYouTubeIframeAPIReady() {
  console.log('jh');
  player = new YT.Player('player', {
    height: '390',
    width: '640',
    //videoId: '2S24-y0Ij3Y',
    //video settings
    playerVars: {
        controls: 1,
        disablekb: 0,
        rel: 0,
        autoplay: 1,
        modestbranding: 1,
        loop: 1,
        playlist: group[room]
    },
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    }
  });
}

// 4. The API will call this function when the video player is ready.
function onPlayerReady(event) {
  event.target.playVideo();
}

// 5. The API calls this function when the player's state changes.
//    The function indicates that when playing a video (state=1),
//    the player should play for six seconds and then stop.
var done = false;
function onPlayerStateChange(event) {
  if (event.data == YT.PlayerState.PLAYING && !done) {
      
    //setTimeout(player.pauseVideo, 6000);

    done = true;
  }
}
function stopVideo() {
  player.stopVideo();
}

//event listeners for buttons
document.getElementById("play-button").addEventListener("click", () => {
    player.playVideo();
    socket.emit('playVid',);
});
document.getElementById("pause-button").addEventListener("click", () => {
    player.pauseVideo();
    socket.emit('pauseVid',);
});

document.getElementById("next-button").addEventListener("click", () => {
    player.nextVideo();
    socket.emit('nextVid');
});
document.getElementById("previous-button").addEventListener("click", () => {
    player.previousVideo();
    socket.emit('prevVid');
});





//syncs clients videos with each other
document.getElementById("start-live-button").addEventListener("click", () => {
    //1 Ask server for video
    socket.emit('askForVid',);
    //1.5 Ask server for time
    let currentTime = -1;
    socket.emit('askForTime', currentTime);
    
    
    socket.on('recieveIndex', index => {
        console.log('Index recieved from server');
        //2.Recieve Time from server
        socket.on('recieveTime', time => {
            console.log('Time recieved from server');
            time += 1.5;
            console.log('Time to sync with:' + time);
            
            player.playVideoAt(index);
            

            //play video at the time we recieved
            player.seekTo(time, true);
        });  
    });
});
socket.on('getTime', currentTime => {
    console.log('Sending: ' + player.getCurrentTime());
    socket.emit('heresTheTime',player.getCurrentTime());
});
//get the id of the current video
socket.on('getVidIndex', currentIndex => {
    let index = player.getPlaylistIndex();

    console.log('Sending index: ' + index);
    socket.emit('heresTheIndex',index);
    
});
socket.on('playVid', () => {
    player.playVideo(); 
});
socket.on('pauseVid', () => {
    player.pauseVideo(); 
});
socket.on('nextVid', () => {
    player.nextVideo(); 
});
socket.on('prevVid', () => {
    player.previousVideo(); 
});

const chatMessages = document.querySelector('.chat-messages');
//listen for incoming chat messages from any client
socket.on('message', message => {
    outputMessage(message);

    //when we get a new message scroll down to recent message
    chatMessages.scrollTop = chatMessages.scrollHeight;
});
//listen for when user clicks "send"
document.getElementById('chat-form').addEventListener('submit', (e) => {
    //dont let it submit as a file
    e.preventDefault();
    //get the content of what the user selects
    const msg = e.target.elements.message.value;
    console.log(msg);

    //send chat to server
    socket.emit('chatMessage', msg);

    //clear chat input text field
    e.target.elements.message.value = '';
    e.target.elements.message.focus();
});
//dom manipulation adds new messages
function outputMessage(message){
    //message is an object and its properties are details of the mesesage. ex. username, message, time
    const div = document.createElement('div');
    //adding onto the class of "message"
    div.classList.add('message');
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
       ${message.text}
    </p>`;
    document.querySelector('.chat-messages').appendChild(div);             
}

function outputLiveUsers(name){
    const div = document.createElement('div');
    div.classList.add('a-user');
    div.innerHTML = `<p> ${name}</p>`;
    document.querySelector('.live-users').appendChild(div);
}

function deleteLiveUser(){
    document.getElementById("change").remove();
    const div = document.createElement('div');
    div.classList.add('live-users');
    div.id = "change";
    document.querySelector('.live-user-container').appendChild(div);
}

socket.on('deleteFromLive', ({users, room}) => {
    deleteLiveUser();
    for(let i = 0; i < users.length; i++){
        //only prints out username if clients are in the same room
        if(users[i].room === room){
            outputLiveUsers(users[i].username);
            console.log('Beep' + users[i].username);
        }
    }
});