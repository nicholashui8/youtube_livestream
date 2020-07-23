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


//tells user that a new user is joining, gives server username and room name
socket.emit('joinroom', {username, room});
console.log(username, room);
//set info on top right of screen
document.getElementById("current-user").textContent = username;
document.getElementById("current-room").textContent = room;


//ouputs all clients that are in the same room as new client
socket.on('outputLiveUsers', ({users, room}) => {
    deleteLiveUser();
    let numOfViewers = 0;
    for(let i = 0; i < users.length; i++){
        //only prints out username if clients are in the same room
        if(users[i].room === room){
            numOfViewers++;
            outputLiveUsers(users[i].username);
            console.log('Beep' + users[i].username);
        }
    }
    //set viewer count
    document.getElementById("num-live-viewers").textContent = numOfViewers;
});

/*--------------------------------------------------------------------------------------
--------------------------------------------------------------------------------------
Youtube API call
*/
const group = {
    itzy: 'fE2h3lGlOsk, zndvqTc4P9I, pNfTK39k55U',
    blackpink: '2S24-y0Ij3Y, 9pdj4iJD08s, dISNgvVpWlo, Amq-qlqbjYA',
    twice: 'mH0_XpSHkZo, kOHB85vDuow, i0p1bmr0EmE, Fm5iP0S1z9w, mAKsZ26SabQ, ePpPVE-GGJw',
    redvelvet: 'uR8Mrt1IpXg, J_CFBjAyPWE, 6uJf2IT2Zh8, IWJUPY-2EIM',
    bts: '7C2z4GqqS5E, kTlv5_Bs8aw, XsX3ATc3FbA, hmE9f-TEutc',
    niki: 'ErmgY5GX_wI, PjPy9XielsA, 5e6F1VA6WG4, mxyucLe9YE4, PjPy9XielsA'
    
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
  let w = window.innerWidth;
  let h = window.innerHeight;
  let setWidth;
  if(w >= 1360){
      setWidth = 1200;
  }
  //when width is less than 1360 make youtube player smaller
  if(w < 1360 && w >=1000){
      setWidth = 900;
  }
  if(w < 1000 && w >=750){     
      setWidth = 750;
  }
  if(w < 750){
      setWidth = 500;
  }
  player = new YT.Player('player', {
    height: '650',
    width: setWidth,
    //videoId: '2S24-y0Ij3Y',
    //video settings
    playerVars: {
        controls: 1,
        disablekb: 0,
        rel: 0,
        autoplay: 0,
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

let currentWidth;
let currentHeight;
//Resizes the youtube player and chat based on user's window size
window.addEventListener('resize', function(event){
    setPlayerSize();
    let h = window.innerHeight;
    document.getElementById("chat-messages-id").style.height = (h - 325) + "px";
});
let h = window.innerHeight;
document.getElementById("chat-messages-id").style.height = (h - 325) + "px";
function setPlayerSize(){
    let w = window.innerWidth;
    let h = window.innerHeight;
    console.log('Width: ' + w);
    console.log('Height: ' + h);
    let currentHeight = h - 300;
    console.log('Current width' + currentWidth);
    if(w > 1600){
        player.setSize(1250, currentHeight);
    }
    
    if(w >= 1350 && w <= 1600){
        player.setSize(1000, currentHeight);
    }
    //when width is less than 1360 make youtube player smaller
    if(w < 1350 && w >=1150){
        player.setSize(800, currentHeight);
    }
    if( w< 1150 && w >=1050){
        player.setSize(700, currentHeight);
    }
    if(w < 1050 && w >=950){
        player.setSize(600, currentHeight);
    }
    if(w < 950 && w >=750){
        player.setSize(575, currentHeight);
    }
    if(w < 750 && w >=600){
        player.setSize(525, currentHeight);
    }
    if(w < 600 && w >=400){
        player.setSize(450, currentHeight);
    }
    if(w < 400){
        player.setSize(300, currentHeight);
    }

}

//clicks "start live " automatically when user joins room
setTimeout(() => {
    let startButton = document.getElementById('start-live-button');
    startButton.click();
}, 800);