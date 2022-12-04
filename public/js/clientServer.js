//닉네임 내 세션에서 닉네임 가져와서 사용하게하고 
//방 새로 만드는거는 이렇게 방이름 넣어서 하면되고 
//방 db 만들어서 거기다 추가하고
//이미 있는방은 누르면 그 방으로 들어가게하면되고 
//내가 이미 들어가있는 방들 표시되게 

//let myPeerConnection;

//>>>>>
screenId = ""

const socket = io();

//>>>>>> 배열만듬 
let peerConnectionObjArr = [];

const myFace = document.querySelector("#myFace");
const muteBtn = document.querySelector("#mute");
const muteIcon = muteBtn.querySelector(".muteIcon");
const unMuteIcon = muteBtn.querySelector(".unMuteIcon");
const cameraBtn = document.querySelector("#camera");
const cameraIcon = cameraBtn.querySelector(".cameraIcon");
const unCameraIcon = cameraBtn.querySelector(".unCameraIcon");
const camerasSelect = document.querySelector("#cameras");

const call = document.querySelector("#call");
const welcome = document.querySelector("#welcome");

const HIDDEN_CN = "hidden";

let myStream;
let muted = true;
unMuteIcon.classList.add(HIDDEN_CN);
let cameraOff = false;
unCameraIcon.classList.add(HIDDEN_CN);
let roomName = "";
let nickname = "";
let peopleInRoom = 1;



// //화면에 대한 미디어 스트림 얻기 
// navigator.mediaDevices.getDisplayMedia({
//   audio : true;
// })




let pcObj = {
  // remoteSocketId: pc
};

async function getCameras() {
  try {
    //videoinput인 device를 가져와서 카메라 선택 
    const devices = await navigator.mediaDevices.enumerateDevices();
    const cameras = devices.filter((device) => device.kind === "videoinput");
    const currentCamera = myStream.getVideoTracks()[0];
    cameras.forEach((camera) => {
      const option = document.createElement("option");
      option.value = camera.deviceId;
      option.innerText = camera.label;
      option.id = "camera";

      if (currentCamera.label == camera.label) {
        option.selected = true;
      }

      //카메라선택차에 추가해줌 
      camerasSelect.appendChild(option);

      // //>>>>>화면공유
      //getScreens();

    });
  } catch (error) {
    console.log(error);
  }
}

async function getMedia(deviceId, id) {
  
  console.log(`getMedia 진입`);

  //초기
  const initialConstraints = {
    audio: true,
    video: { facingMode: "user" },
  };
  //카메라 가져왔을때 deviceId로 cameraConstraint 의 video 필드 설정 
  const cameraConstraints = {
    audio: true,
    video: { deviceId: { exact: deviceId } },
  };

  try {
    //constraint로 stream 얻기 - 인자로 전달한 deviceId가 있으면 cameraConstraints 아니면 initialConstraints임 
    myStream = await navigator.mediaDevices.getUserMedia( 
      //카메라선택했으면 
      id === "camera" ? cameraConstraints : initialConstraints
    );
    if (id==="screen"){ //스크린선택했으면 
      myStream = await navigator.mediaDevices.getDisplayMedia({
        cursor : true,
        audio : true,
        video : true
      });
    }

    // stream을 mute하는 것이 아니라 HTML video element를 mute한다.
    myFace.srcObject = myStream;
    
    myFace.muted = true;

    if (!deviceId) {
      // mute default 음소거로시작 
      myStream 
        .getAudioTracks()
        .forEach((track) => (track.enabled = false));

      await getCameras();
      await  getScreens();
    }
  } catch (error) {
    console.log(error); 
    //>>>>> screen share 선택하면 overConstrained error : 존재하지 않는 기기 타입을 찾는 constraints 전달할경우 
  }
}

//mute클릭 
function handleMuteClick() {
  myStream //
    .getAudioTracks()
    .forEach((track) => (track.enabled = !track.enabled)); 
  if (muted) { //음소거->해제
    unMuteIcon.classList.remove(HIDDEN_CN);
    muteIcon.classList.add(HIDDEN_CN);
    muted = false;
  } else {//해제->음소거 
    muteIcon.classList.remove(HIDDEN_CN);
    unMuteIcon.classList.add(HIDDEN_CN);
    muted = true;
  }
}

//카메라 활성화 비활성화 
function handleCameraClick() {
  console.log(`카메라끔`);
  myStream //
    .getVideoTracks()
    .forEach((track) => (track.enabled = !track.enabled));
  if (cameraOff) {
    cameraIcon.classList.remove(HIDDEN_CN);
    unCameraIcon.classList.add(HIDDEN_CN);
    cameraOff = false;
  } else {
    unCameraIcon.classList.remove(HIDDEN_CN);
    cameraIcon.classList.add(HIDDEN_CN);
    cameraOff = true;
  }
}

//카메라 변경 
async function handleCameraChange() {
  try {
    console.log(`카메라 변경 시도`);

    //카메라 id 받아옴 
    const id = camerasSelect.options[camerasSelect.selectedIndex].id;

    //>>>>>여기서 호출하면서 문제발생하는걸로 예상 
    //camerasSelect의 value를 인자로 전달함 , camerasSelect는 뷰페이저의 #cameras
    //getMedia 안에서 constraint를 설정함 
    await getMedia(camerasSelect.value,id);
    console.log(`getMedia 탈출`);

    //카메라->화면공유 로 변경이 안되니까 화면변경해도 계속 카메라로보임 
    //getMedia 진입 -> 탈출 성공 

    // if (myPeerConnection) {
    //   const videosender = myPeerConnection
    //     .getSenders()
    //     .find((sender) => sender.track.kind === "video");
    //   const videoTrack = myStream.getVideoTracks()[0];
    //   videosender.replaceTrack(videoTrack);
    // }


    //peerConnectionObjArr의 인원들을 대상으로 카메라 변경함 (정상작동)
    //나중에들어온애들은 기존에 있던 애들이 peerConnectionObjArr에 포함이 안되고 얘내들 걸 바꿀수가 없음 
    if (peerConnectionObjArr.length > 0) {
      var videosender;
      peerConnectionObjArr.forEach((peerConnectionObj) => {
         videosender = peerConnectionObj.getSenders().find((sender)=> sender.track.kind==="video");
      const videoTrack = myStream.getVideoTracks()[0];
      videosender.replaceTrack(videoTrack);
      });
    }
  } catch (error) {
    console.log(error);
  }
}

//음량, 화면, 카메라선택 버튼에 이벤트리스너 등록 
muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);
camerasSelect.addEventListener("input", handleCameraChange);



/////////////////////////////////// prototype
// Screen Sharing

let captureStream = null;

// //>>>>>화면공유
// async function startCapture() {
//   try {
//     captureStream = await navigator.mediaDevices.getDisplayMedia({
//       video: true,
//       audio: true,
//     });


//     const screenVideo = document.querySelector("#screen");
//     screenVideo.srcObject = captureStream;
//   } catch (error) {
//     console.error(error);
//   }
// }




async function getScreens() {
 
    //스크린을가져와서 screen에 저장 
  const screen = await navigator.mediaDevices.getUserMedia({
    video: { mediaSource: "screen" }
  });
  screenId = screen.id; //screen.id 얻어옴 

  //뷰페이저의 카메라셀렉트에 screen share를 선택할 수 있게 추가해줌 
  const option = document.createElement("option");
  option.value = screenId;
  option.id = "screen";
  option.innerText = "Screen Share";
  camerasSelect.appendChild(option);

 


}






// Welcome Form (choose room)

call.classList.add(HIDDEN_CN);
// welcome.hidden = true;

const welcomeForm = welcome.querySelector("form");

async function initCall() {
  console.log(`initcall`);
  welcome.hidden = true;
  call.classList.remove(HIDDEN_CN);
  //미디어스트림 
  await getMedia();
  //makeConnections();
}


//입력해서 들어갈
async function handleWelcomeSubmit(event) {
  event.preventDefault();

  if (socket.disconnected) {
    socket.connect();
  }

  //방이름, 닉네임
  const welcomeRoomName = welcomeForm.querySelector("#roomName");
  const welcomeNickname = welcomeForm.querySelector("#nickname");
  const nicknameContainer = document.querySelector("#userNickname");
  roomName = welcomeRoomName.value;
  welcomeRoomName.value = "";
  nickname = welcomeNickname.value;
  welcomeNickname.value = "";
  nicknameContainer.innerText = nickname;
  //입력폼에 입력한거 받아서 join_room 하기 
  socket.emit("join_room", roomName, nickname);
}

//입장하면 handleWelcomeSubmit 호출 
welcomeForm.addEventListener("submit", handleWelcomeSubmit);

// Chat Form

//뷰페이저 채팅 
const chatForm = document.querySelector("#chatForm");
const chatBox = document.querySelector("#chatBox");

const MYCHAT_CN = "myChat";
const NOTICE_CN = "noticeChat";

//채팅 입력하면 handleChatSubmit 
chatForm.addEventListener("submit", handleChatSubmit);


//채팅입력 
function handleChatSubmit(event) {

  event.preventDefault();

//메세지가져와서 chat emit 함 
  const chatInput = chatForm.querySelector("input");
  const message = chatInput.value;
  chatInput.value = "";
  socket.emit("chat", `${nickname}: ${message}`, roomName);
  writeChat(`You: ${message}`, MYCHAT_CN);
}

//뷰페이저에 채팅 추가함 
function writeChat(message, className = null) {
  const li = document.createElement("li");
  const span = document.createElement("span");
  span.innerText = message;
  li.appendChild(span);
  li.classList.add(className);
  chatBox.prepend(li);
}

// Leave Room 방 나갈때 

const leaveBtn = document.querySelector("#leave");

function leaveRoom() {
  socket.disconnect();

  call.classList.add(HIDDEN_CN);
  welcome.hidden = false;

  peerConnectionObjArr = [];
  peopleInRoom = 1;
  nickname = "";

  myStream.getTracks().forEach((track) => track.stop());
  const nicknameContainer = document.querySelector("#userNickname");
  nicknameContainer.innerText = "";

  myFace.srcObject = null;
  clearAllVideos();
  clearAllChat();
}

function removeVideo(leavedSocketId) {
  const streams = document.querySelector("#streams");
  const streamArr = streams.querySelectorAll("div");
  streamArr.forEach((streamElement) => {
    if (streamElement.id === leavedSocketId) {
      streams.removeChild(streamElement);
    }
  });
}

function clearAllVideos() {
  const streams = document.querySelector("#streams");
  const streamArr = streams.querySelectorAll("div");
  streamArr.forEach((streamElement) => {
    if (streamElement.id != "myStream") {
      streams.removeChild(streamElement);
    }
  });
}

function clearAllChat() {
  const chatArr = chatBox.querySelectorAll("li");
  chatArr.forEach((chat) => chatBox.removeChild(chat));
}

leaveBtn.addEventListener("click", leaveRoom);

// Modal code 
//?
const modal = document.querySelector(".modal");
const modalText = modal.querySelector(".modal__text");
const modalBtn = modal.querySelector(".modal__btn");

function paintModal(text) {
  modalText.innerText = text;
  modal.classList.remove(HIDDEN_CN);

  modal.addEventListener("click", removeModal);
  modalBtn.addEventListener("click", removeModal);
  document.addEventListener("keydown", handleKeydown);
}

function removeModal() {
  modal.classList.add(HIDDEN_CN);
  modalText.innerText = "";
}

function handleKeydown(event) {
  if (event.code === "Escape" || event.code === "Enter") {
    removeModal();
  }
}

// Socket code

//방꽉차서 입장 X 
socket.on("reject_join", () => {
  // Paint modal
  paintModal("Sorry, The room is already full.");

  // Erase names
  const nicknameContainer = document.querySelector("#userNickname");
  nicknameContainer.innerText = "";
  roomName = "";
  nickname = "";
});

//방입장 
socket.on("accept_join", async (userObjArr) => {
  await initCall();

  const length = userObjArr.length;
  if (length === 1) {
    return;
  }

  writeChat("Notice!", NOTICE_CN);
  

  //방에 있는 유저들에 대해 peerConnectionObjArr에 추가함 

  console.log(`@@@@@@@@ACCEPT JOIN@@@@@@`);

  for (let i = 0; i < length - 1; ++i) {
    try {
      const newPC = createConnection(
        userObjArr[i].socketId,
        userObjArr[i].nickname
      );
      //>>>>>>>>>>>>>>> 배열에추가 

      //새로 연결된 브라우저는 본인의 peerConnectionObj에 방에 있는 유저들과의 RTCpeerConnection을 만들어서 추가한다
      peerConnectionObjArr.push(newPC);
      console.log(`!!!rtcConnection배열!!!`);
      console.log(peerConnectionObjArr);
      const offer = await newPC.createOffer();
      
      await newPC.setLocalDescription(offer);
      socket.emit("offer", offer, userObjArr[i].socketId, nickname);
      writeChat(`__${userObjArr[i].nickname}__`, NOTICE_CN);
    } catch (err) {
      console.error(err);
    }
  }
  //test
  let i =1;
  peerConnectionObjArr.forEach(users =>{
    console.log("방에 있는 사람 : "+i);
    i++;
  })
  writeChat("is in the room.", NOTICE_CN);
});

//offer , answer, ice
socket.on("offer", async (offer, remoteSocketId, remoteNickname) => {
  try {
    const newPC = createConnection(remoteSocketId, remoteNickname);
    await newPC.setRemoteDescription(offer);
    const answer = await newPC.createAnswer();
    await newPC.setLocalDescription(answer);
    socket.emit("answer", answer, remoteSocketId);
    writeChat(`notice! __${remoteNickname}__ joined the room`, NOTICE_CN);
  } catch (err) {
    console.error(err);
  }
});

socket.on("answer", async (answer, remoteSocketId) => {
  await pcObj[remoteSocketId].setRemoteDescription(answer);
});

socket.on("ice", async (ice, remoteSocketId) => {
  await pcObj[remoteSocketId].addIceCandidate(ice);
});

//chat, leave_room

socket.on("chat", (message) => {
  writeChat(message);
});

socket.on("leave_room", (leavedSocketId, nickname) => {
  removeVideo(leavedSocketId);
  writeChat(`notice! ${nickname} leaved the room.`, NOTICE_CN);
  --peopleInRoom;
  sortStreams();
});


// RTC code
function createConnection(remoteSocketId, remoteNickname) {
  console.log(`createConnection`);
  const myPeerConnection = new RTCPeerConnection({
    iceServers: [
      {
        urls: [
          "stun:stun.l.google.com:19302",
          "stun:stun1.l.google.com:19302",
          "stun:stun2.l.google.com:19302",
          "stun:stun3.l.google.com:19302",
          "stun:stun4.l.google.com:19302",
        ],
      },
    ],
  });
  
  myPeerConnection.addEventListener("icecandidate", (event) => {
    handleIce(event, remoteSocketId);
  });
  myPeerConnection.addEventListener("addstream", (event) => {
    handleAddStream(event, remoteSocketId, remoteNickname);
  });
  // myPeerConnection.addEventListener(
  //   "iceconnectionstatechange",
  //   handleConnectionStateChange
  // );
  myStream //
    .getTracks()
    .forEach((track) => myPeerConnection.addTrack(track, myStream));

  pcObj[remoteSocketId] = myPeerConnection;

  ++peopleInRoom;
  sortStreams();
  return myPeerConnection;
}

function handleIce(event, remoteSocketId) {
  if (event.candidate) {
    socket.emit("ice", event.candidate, remoteSocketId);
  }
}

function handleAddStream(event, remoteSocketId, remoteNickname) {
  const peerStream = event.stream;
  paintPeerFace(peerStream, remoteSocketId, remoteNickname);
}

function paintPeerFace(peerStream, id, remoteNickname) {
  const streams = document.querySelector("#streams");
  const div = document.createElement("div");
  div.id = id;
  const video = document.createElement("video");
  video.autoplay = true;
  video.playsInline = true;
  video.width = "400";
  video.height = "400";
  video.srcObject = peerStream;
  const nicknameContainer = document.createElement("h3");
  nicknameContainer.id = "userNickname";
  nicknameContainer.innerText = remoteNickname;

  div.appendChild(video);
  div.appendChild(nicknameContainer);
  streams.appendChild(div);
  sortStreams();
}

function sortStreams() {
  const streams = document.querySelector("#streams");
  const streamArr = streams.querySelectorAll("div");
  streamArr.forEach((stream) => (stream.className = `people${peopleInRoom}`));
}
/*
function handleConnectionStateChange(event) {
  console.log(`${pcObjArr.length - 1} CS: ${event.target.connectionState}`);
  console.log(`${pcObjArr.length - 1} ICS: ${event.target.iceConnectionState}`);
  if (event.target.iceConnectionState === "disconnected") {
  }
}
*/