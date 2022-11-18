// app.js

const socket = io(); // io function은 알아서 socket.io를 실행하고 있는 서버를 찾을 것이다!

//video 요소 가져옴 
const myFace = document.getElementById('myFace');
const muteBtn = document.getElementById(`mute`);
const cameraBtn = document.getElementById(`camera`);
//카메라 목록 선택하는 요소 
const camerasSelect = document.getElementById('cameras');

//stream : 비디오와 오디오가 결합된 것 
let myStream;
//처음에 화면 키면 기본으로 음성, 영상 받게 설정 
let muted = false;
let cameraOff =false;

//유저의 유저미디어 string을 받음 
// async function getMedia(){
//     try {
//         //스트림 받아옴( api 사용해서 유저미디어의 string을 받아옴) 
//         myStream = await navigator.mediaDevices.getUserMedia({
//             audio:true,
//             video:true,
//         })
//         // video 요소에 넣어줌 
//         myFace.srcObject = myStream;
//         //getCameras await로 비동기 호출 
//         await getCameras();
//     } catch(e){
//         console.log(e);
//     }
// }

//유저의 유저미디어 string 받기 
async function getMedia(deviceId){
    const initalConstraints = { //deviceId가 없을 때 
        audio : true,
        video : {facingMode : "user"}, //카메라가 전, 후면에 둘다 있을 경우 전면 카메라를 선택, 후면은 "environment"
    }
    const cameraConstraints = { // cameraConstraints는 deviceId가 있을 때 실행 
        audio : true,
        video : {deviceId : {exact:deviceId}}, //exact를 쓰면 받아온 deviceId가 아니면 출력 X
    }

    try{
        //getUserMedai에 constraint 객체를 전달함. constraint객체는 video와 audio로 구성 
        //요청할 미디어 유형에 대해 설명함 
        //카메라 정보를 얻어왔으니 video를 설정해주기 위함 
  
        myStream = await navigator.mediaDevices.getUserMedia( 
            //deviceId가 있는지에 따라 
            deviceId ? cameraConstraints : initalConstraints
        )
       
        
        myFace.srcObject = myStream; //가져온 video 정보로 뷰페이저의 video 요소 지정 
        if (!deviceId){ // 맨 처음 접속할 때만 (맨 처음 getMedia를 호출할 때)
            await getCameras();
        }
    }

    catch(e){
        console.log(e);
    }
}

//사용자 장치 받아오기 
async function getCameras(){
    try {
        //장치 리스트 가져오기 
        const devices = await navigator.mediaDevices.enumerateDevices();
        //비디오만 골라오기 
        const cameras = devices.filter(device=>device.kind=="videoinput");
        // 카메라 목록을 pug파일에 표시하기 위함 
        cameras.forEach(camera=>{
            const option =document.createElement("option"); //새로운 옵션 생성 
            option.value=camera.deviceId; //카메라의 deviceId를 value로 설정 
            option.innerText = camera.label; //사용자가 선택할 때는 label을 보고 선택 (label이 보기는 더좋지만 고유하지는 않아서 value는 deviceId로 해줘야함)
            camerasSelect.appendChild(option); //카메라의 정보들을 option 항목에 넣어줌 
        })
    }
    catch (e){
        console.log(e);
    }
}

//사용자가 카메라를 선택하면 바꿔주기 위한 함수 
async function handleCameraChange(){
    //선택한 카메라의 고유 값이 value 에 담겨있고 getMedia 에 인자로 전달 
    await getMedia(camerasSelect.value);
}


//음소거버튼클릭 
function handleMuteClick(){
    //스트림의 오디오의 enabled를 true->false , false->true로 바꿔줌 

    //예외발생
    myStream.getAudioTracks().forEach(track=>track.enabled = !track.enabled);

    //버튼 텍스트랑 오디오 상태 변수 바꾸기 
    if(!muted){
        muteBtn.innerText = "UnMute";
        muted = true;
    }
    else {
        muteBtn.innerText = "Mute";
        muted = false;
    }
}

//카메라버튼클릭 
function handleCameraClick(){
    //스트림의 비디오이 enabled를 true->false , false->true로 바꿔줌 
    myStream.getVideoTracks().forEach(track=>track.enabled = !track.enabled);

    //버튼 텍스트랑 카메라 상태 변수 바꾸기 
    if (cameraOff){
        cameraBtn.innerText = "Turn Camera Off";
        cameraOff = false;
    }
    else{
        cameraBtn.innerText = "Turn Camera On";
        cameraOff = true;
    }

}

//방 입력폼 welcome이랑 방을 표시할 call을 뷰페이져에서 가져옴 
const welcome = document.getElementById(`welcome`);
const call = document.getElementById(`call`);
//방 입력 폼 가져옴 
const welcomeForm = welcome.querySelector(`form`);
let roomName; //방 이름 
let myPeerConnection; //누군가 getMedia 함수를 불렀을 때와 똑같이 stream을 공유하기 위한 함수 


//방 이름을 입력했으면 입력 폼을 숨기고 방을 보여준다 
function startMedia(){
    welcome.hidden = true;
    call.hidden = false;
    getMedia();
    
    //RTC 연결해주는 함수 
    makeConnection();

}

//입력한 방 이름을 서버로 보내는 작업 
function handleWelcomeSubmit(event){
    
    //default 동작을 수행하는 것을 방지함 
    //예를들어 form의 버튼을 submit하면 페이지가 넘어가거나 새로고침되는데 그것을 막음 
    event.preventDefault();

    //입력 폼의 input 요소 가져옴 
    const input = welcomeForm.querySelector(`input`);

    //emit으로 이벤트 등록, join_room 이벤트, input.value랑 startMedia 함수를 같이보냄 
    //서버로 사용자가 입력한 방 이름을 보낸다, startMedia 함수를 같이 보내서 폼을 숨기고 방을 보여줌 
    socket.emit(`join_room`,input.value,startMedia);
    //방 이름을 받아옴 
    roomName = input.value;

    input.value=``;

}

//방 이름 입력 폼에 이벤트리스너 등록 
welcomeForm.addEventListener('submit',handleWelcomeSubmit);




//방에 접속하고 나서 보여야 하니까 주석처리해줌 
//getMedia();


//일단 방은 숨김 
call.hidden = true;


//누군가 접속하면 welcome 이벤트를 방 접속자에게 전달하도록 만든다 
socket.on(`welcome`,()=>{
    console.log(`someone joined`);
})

//RTC code 
function makeConnection(){
    //peerConnection을 각각의 브라우저에 생성함 
    myPeerConnection = new RTCPeerConnection();

    //myPeerConnection에 영상, 음성 트랙을 추가함 : P2P 연결 
    console.log(myStream);
    myStream.getTracks().forEach(track => myPeerConnection.addTrack(track, myStream)); 

}

socket.on(`welcome`,async()=>{
    const offer = await myPeerConnection.createOffer(); //다른 사용자를 초대하기 위한 초대장 (내가 누구인지를 알려주는 내용 포함)
    myPeerConnection.setLocalDescription(offer); //myPeerConnection에 내 초대장의 위치 정보를 연결해주는 과정 
    console.log(`sent the offer`);
    //offer 이벤트 등록 
    socket.emit(`offer`,offer,roomName);
})

//offer 이벤트 처리 
socket.on(`offer`,offer=>{
    console.log(offer);
})



//버튼에 이벤트 등록 
muteBtn.addEventListener("click",handleMuteClick);
cameraBtn.addEventListener("click",handleCameraClick);
//카메라 변경 적용 
camerasSelect.addEventListener("input",handleCameraChange);



