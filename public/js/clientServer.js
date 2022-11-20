// app.js

const socket = io(); // io function은 알아서 socket.io를 실행하고 있는 서버를 찾을 것이다!

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");



const call = document.getElementById("call");
const welcome = document.getElementById("welcome");
const form = welcome.querySelector("form");
const room = document.getElementById("room");

call.hidden = true;
room.hidden = true;
call.hidden = true;


// stream받기 : stream은 비디오와 오디오가 결합된 것
let myStream;
let roomName;
let muted = false; // 처음에는 음성을 받음
let cameraOff = false; // 처음에는 영상을 받음
let myPeerConnection; // 누군가 getMedia함수를 불렀을 때와 똑같이 stream을 공유하기 위한 변수
let myDataChannel; //데이터채널 저장용 변수 

async function getCameras(){
    try {
        const devices = await navigator.mediaDevices.enumerateDevices(); // 장치 리스트 가져오기
        const cameras = devices.filter(device => device.kind === "videoinput"); // 비디오인풋만 가져오기
        const currentCamera = myStream.getVideoTracks()[0]; // 비디오 트랙의 첫 번째 track 가져오기 : 이게 cameras에 있는 label과 같다면 그 label은 선택된 것이다!

        cameras.forEach(camera => {
            const option = document.createElement("option"); // 새로운 옵션 생성
            option.value = camera.deviceId; // 카메라의 고유 값을 value에 넣기
            option.innerText = camera.label; // 사용자가 선택할 때는 label을 보고 선택할 수 있게 만들기
            if(currentCamera.label === camera.label) { // 현재 선택된 카메라 체크하기
                option.selected = true;
            }
            camerasSelect.appendChild(option); // 카메라의 정보들을 option항목에 넣어주기
        })
    } catch (e) {
        console.log(e);
    }
}

// https://developer.mozilla.org/ko/docs/Web/API/MediaDevices/getUserMedia 사용 : 유저의 유저미디어 string을 받기위함
async function getMedia(deviceId){
    const initialConstraints = { // initialConstraints는 deviceId가 없을 때 실행
        audio: true,
        video: {facingMode: "user"}, // 카메라가 전후면에 달려있을 경우 전면 카메라의 정보를 받음 (후면의 경우 "environment")
    };
    const cameraConstraints = { // CameraConstraints는 deviceId가 있을 때 실행
        audio: true,
        video: {deviceId: {exact: deviceId}}, // exact를 쓰면 받아온 deviceId가 아니면 출력하지 않는다
    };

    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstraints : initialConstraints
        )
        myFace.srcObject = myStream;
        if (!deviceId) { // 처음 딱 1번만 실행! 우리가 맨 처음 getMedia를 할 때만 실행됨!!
            await getCameras();
        }
        
        
    } catch (e) {
        console.log(e);
    }
}

function handleMuteClick() {
    myStream.getAudioTracks().forEach(track => track.enabled = !track.enabled);
    if(!muted) {
        muteBtn.innerText = "Unmute";
        muted = true;
    }
    else {
        muteBtn.innerText = "Mute";
        muted = false;
    }
}

function handleCameraClick() {
    myStream.getVideoTracks().forEach(track => track.enabled = !track.enabled);
    if(cameraOff) {
        cameraBtn.innerText = "Turn Camera Off";
        cameraOff = false;
    }
    else {
        cameraBtn.innerText = "Turn Camera On";
        cameraOff = true;
    }
}


async function handleCameraChange() {
    // getMedia로 바꾼 카메라로 스트림 변경 
    await getMedia(camerasSelect.value);

    // 변경된 내용을 peer에게도 알려주기위함 
    if (myPeerConnection){
        const videoTrack = myStream.getVideoTracks()[0];

        //sender의 track.kind가 video인 부분을 replaceTrack으로 바꿔줌 
        const videoSender = myPeerConnection
            .getSenders()
            .find(sender=>sender.track.kind=="video");
        videoSender.replaceTrack(videoTrack);
    }
}

muteBtn.addEventListener("click", handleMuteClick);
cameraBtn.addEventListener("click", handleCameraClick);

// 카메라 변경 확인
camerasSelect.addEventListener("input", handleCameraChange);



// Welcome Form (join a room)

///////////////////방과 닉네임 이름 표시 코드 /////////////////////////////
function addMessage(message){
    const ul = room.querySelector("ul");
    const li = document.createElement("li");
    li.innerText = message;
    ul.appendChild(li);
}
function handleMessageSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#msg input");
    console.log(input)
    const value = input.value;
    socket.emit("new_message", input.value, roomName, ()=>{
        addMessage('You:'+value);
    });
    input.value = "";
}
function handleNicknameSubmit(event){
    event.preventDefault();
    const input = room.querySelector("#name input");
    socket.emit("nickname", input.value);
}


// 서버는 back-end에서 function을 호출하지만 function은 front-end에서 실행됨!!

form.addEventListener("submit", handleWelcomeSubmit);

socket.on("welcome", (user) => {
    addMessage(`${user} arrived!`);
})

socket.on("bye", (left) => {
    addMessage(`${left} left ㅠㅠ`);
})

socket.on("new_message", addMessage);
///////////////////////////////////////////////////////////////////////
async function initCall(){
    // 방 입력란은 숨기고 화면 표시란은 보여지게 한다
    welcome.hidden = true;
    room.hidden = false;
    call.hidden = false;
    const h3 = room.querySelector("h3");
    h3.innerText=roomName; //저장한 방 이름을 pug의 요소에 전달함
    const msgForm = room.querySelector("#msg");
    const nameForm = room.querySelector("#name");
    msgForm.addEventListener("submit", handleMessageSubmit);
    nameForm.addEventListener("submit", handleNicknameSubmit);

    
    await getMedia();
    makeConnection();
}

//클라이언트가 방 이름 입력해서 접속 -> 
async function handleWelcomeSubmit(event){
    event.preventDefault();
    
    const input = form.querySelector("input");
    await initCall();

    //join_room 이벤트 발생시킴, 
    socket.emit("join_room", input.value, ); // 서버로 input value를 보내는 과정!! initCall 함수도 같이 보내준다!
    roomName = input.value; // 방에 참가했을 때 나중에 쓸 수 있도록 방 이름을 변수에 저장
    input.value = "";
}

//welcomeForm.addEventListener("submit", handleWelcomeSubmit);


// Socket Code

socket.on("welcome", async () => {
    
    //offer를 만드는 peer가 DataChannel 만듬 
    myDataChannel = myPeerConnection.createDataChannel(`chat`);
    //메세지를 받으면 이벤트처리 (콘솔에출력)
    myDataChannel.addEventListener(`message`,event=>console.log(event.data));
    console.log(`made data channel`);

    const offer = await myPeerConnection.createOffer(); // 다른 사용자를 초대하기 위한 초대장!! (내가 누구인지를 알려주는 내용이 들어있음!)
    myPeerConnection.setLocalDescription(offer); // myPeerConnection에 내 초대장의 위치 정보를 연결해 주는 과정 https://developer.mozilla.org/ko/docs/Web/API/RTCPeerConnection/setLocalDescription
    console.log("sent the offer");
    socket.emit("offer", offer, roomName);
})

socket.on("offer", async (offer) => {

    //offer를 받는 쪽에서는 새로운 dataChannel이 있을 때 eventListener 추가함 
    myPeerConnection.addEventListener(`datachannel`,event=>{
        myDataChannel = event.channel;
        myDataChannel.addEventListener(`message`,event=>console.log(event.data)); //메세지 받을 때 이벤트처리 (콘솔에출력)
    });



    console.log("received the offer");
    myPeerConnection.setRemoteDescription(offer); // 다른 브라우저의 위치를 myPeerConnection에 연결해 주는 과정
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer); // 현재 브라우저에서 생성한 answer를 현재 브라우저의 myPeerConnection의 LocalDescription으로 등록!!
    socket.emit("answer", answer, roomName);
    console.log("sent the answer");
})

socket.on("answer", answer => {
    console.log("received the answer");
    myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", ice => {
    console.log("received candidate");
    myPeerConnection.addIceCandidate(ice);
})

// RTC code

function makeConnection() {
    myPeerConnection = new RTCPeerConnection(); // peerConnection을 각각의 브라우저에 생성 https://developer.mozilla.org/ko/docs/Web/API/RTCPeerConnection 참조
    //icecandidate 이벤트 등록 
    myPeerConnection.addEventListener("icecandidate", handleIce);
    //addStream 이벤트 등록 , 다른 사람의 스트림 정보를 받아와서 처리할 내용 (handleAddStream 함수)
    myPeerConnection.addEventListener("addstream", handleAddStream);
    myStream.getTracks().forEach(track => myPeerConnection.addTrack(track, myStream)); // 영상과 음성 트랙을 myPeerConnection에 추가해줌 -> Peer-to-Peer 연결!!
}

function handleIce(data){
    console.log("sent candidate");
    socket.emit("ice", data.candidate, roomName);
}

function handleAddStream(data){
    // 뷰페이저에 다른 사람의 스트림을 받아와서 표시 (다른 사람 화면 표시)
    const peersFace = document.getElementById("peersFace");
    peersFace.srcObject = data.stream;
}
