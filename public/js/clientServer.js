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
        vide : {facingMode : "user"}, //카메라가 전, 후면에 둘다 있을 경우 전면 카메라를 선택, 후면은 "environment"
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
getMedia();

//버튼에 이벤트 등록 
muteBtn.addEventListener("click",handleMuteClick);
cameraBtn.addEventListener("click",handleCameraClick);
//카메라 변경 적용 
camerasSelect.addEventListener("input",handleCameraChange);



