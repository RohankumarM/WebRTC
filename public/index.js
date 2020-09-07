
const socket = io('/');
const peers = {};


const DOMStrings = {
  videogrid: document.getElementById("video-grid"),
};

var peer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '443'
});

const myVideo = document.createElement('video');
myVideo.muted = true;
myVideo.volume = 0;

let myVideoStream;

const addVideo = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener('loadedmetadata', () => {
    video.play();
  })

  DOMStrings.videogrid.append(video);
};

const connectToNewUser = (userId, stream) => {
  var call = peer.call(userId, stream);
  const video = document.createElement('video');
  call.on('stream', userVideoStream => {
    addVideo(video, userVideoStream);
  });
  call.on('close', () => {
    video.remove();
  });

  peers[userId] = call;
};

let shouldFaceUser = true;

navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true,

}).then((stream) => {
  myVideoStream = stream;
  addVideo(myVideo, stream);

  peer.on('call', call => {
    call.answer(stream);
    const video = document.createElement('video');
    call.on('stream', userVideoStream => {
      addVideo(video, userVideoStream);
    });
  });

  //when user connects
  socket.on('user-connected', (userId) => {
    connectToNewUser(userId, stream);
  });

  let text = $('input');

  //when user sends message
  $('html').keydown((e) => {
    if (e.which == 13 && text.val().length !== 0) {
      socket.emit('message', text.val());
      text.val('');
    }
  });

  socket.on('createMessage', message => {
    console.log(message);
    $('ul').append(`<liclass="message"><b>user</b><br>${message}</li><br>`);
  });
})
  .catch(err => {
    alert("Please give permission to audio and video to start using the video app!", err)
  });



socket.on('user-disconnected', userId => {
  if (peers[userId]) peers[userId].close();
});

peer.on('open', id => {
  socket.emit('join-room', roomID, id);
});

const scrollToBottom = () => {
  var d = $('.main_chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}

const muteUnmuteVoice = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  }
  else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
};

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const playStopVideo = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();
  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
};

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `;
  document.querySelector('.main__video_button').innerHTML = html;
};

const setPlayVideo = () => {
  const html = `
  <i class="stopVideo stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `;
  document.querySelector('.main__video_button').innerHTML = html;
};

const leaveCall = () => {
  //when user disconnects
  socket.on('user-disconnected', userId => {
    if (peers[userId]) peers[userId].close();
  });
  window.close();
};


const showHideChat = () => {
  var rightSideChat = document.querySelector(".main__right");
  var leftSideChat = document.querySelector(".main__left");
  if (rightSideChat.style.display === "none") {
    rightSideChat.style.display = "block";
    leftSideChat.style.flex = "0.8";
    rightSideChat.style.flex = "0.2";

  } else {
    rightSideChat.style.display = "none";
    leftSideChat.style.flex = "1";
    rightSideChat.style.flex = "0";
  }
}
var fullScreen = true;

const getFullScreenElement = () => {
  return document.fullscreenElement || document.webkitFullscreenElement || document.mozFullscreenElement
  || document.msFullscreenElement;
};

const toggleFullScreen = () => {

  if (getFullScreenElement()) {
    document.exitFullscreen();
    showMaximizeButton();
  }
  else {
    document.documentElement.requestFullscreen();
    showMinimizeButton();
  }
};

const showFullScreen = () => {

  toggleFullScreen();
};

const showMinimizeButton = () => {
  const html = `
  <i class="fas fa-compress"></i>
    <span>Exit</span>
  `
  document.querySelector('.main_fullscreen_button').innerHTML = html;
  fullScreen = false;
};

const showMaximizeButton = () => {
  const html = `
  <i class="fas fa-expand"></i>
    <span>Full Screen</span>
  `
  document.querySelector('.main_fullscreen_button').innerHTML = html;
}

// const turnCamera = () => {
//   console.log("in turn camera");
//   // toggle \ flip
//   shouldFaceUser = !shouldFaceUser;
// }