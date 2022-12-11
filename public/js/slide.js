//슬라이드 전체 크기 구하기
//doument(웹페이지 화면)의 hmtl에서 slide에 해당하는 부분을 slide라고 하자.
const slide = document.querySelector(".slide"); 
//위의 슬라이드에서 화면에 보여지는 너비 구하기
let slideWidth = slide.clientWidth;

// 버튼 객체화 하기
const prevButton = document.querySelector(".Previous_Button");
const NextButton = document.querySelector(".Next_Button");

//모든 슬라이드를 선택한 객체 -배열
let slideContent = document.querySelectorAll(".slide_content");

//현재 슬라이드 위치가 슬라이드 개수를 넘기지 않게 하기 위한 변수 
const maxSlide=slideContent.length;

//현재 보여지고 있는 슬라이드 위치
let currentSlide=1;

//슬라이드 네비게이션- 슬라이드와 비슷한 느낌으로 점이 이동하는 느낌
const SildeNaviation=document.querySelector(".slide_Current_Show");

for(let i =0;i<maxSlide;i++){
    //제일 첫번째 점이 슬라이드가 시작할 때 활성화되어 있으므로 0번째 슬라이드만 활성화
    if(i==0)SildeNaviation.innerHTML+='<li class="active">•</li>';
    else SildeNaviation.innerHTML+='<li>•</li>';
}

//슬라이드 네비게이션의 모든 요소 -배열
const SlideNavigationItems=document.querySelectorAll(".slide_Current_Show>li");

//무한 슬라이드를 위해 start, end 슬라이드 복사하기
//왜 무한 슬라이드를 사용하기 위해 복사하는가?
//마지막 슬라이드에서 복제한 첫번째 슬라이드로 넘어가는 과정을 보여주고 
//진짜 첫번째 슬라이드로 교체함으로써 무한 슬라이드를 만든다.  
const startSlide =slideContent[0];
const endSlide =slideContent[slideContent.length-1];

//엘리먼트 생성
const startElement = document.createElement(startSlide.tagName);
const endElement = document.createElement(endSlide.tagName);

//엘리먼트에 클래스 적용 동일하게 하기
//endslide의 여러 요소들을 end element에 추가
endSlide.classList.forEach((c)=> endElement.classList.add(c));
endElement.innerHTML=endSlide.innerHTML;
startSlide.classList.forEach((c)=> startElement.classList.add(c));
startElement.innerHTML=startSlide.innerHTML;

//각 복제한 엘리먼트를 각 위치에 추가하기
slideContent[0].before(endElement);
slideContent[slideContent.length-1].after(startElement);

//슬라이드 전체를 선택해 값을 변경해주기 위해 슬라이드 전체를 선택하기
slideContent=document.querySelectorAll(".slide_content");
let offset=slideWidth*currentSlide;
slideContent.forEach((i)=>{
    i.setAttribute("style", `left: ${-offset}px`);
});

//다음 화면으로 이동하는 슬라이드의 작동
function nextMove(){
//https://devinus.tistory.com/47?category=983141
    currentSlide++;

    //만약 현재 슬라이드의 위치가 마지막 슬라이드가 아니라면
    if(currentSlide<=maxSlide){
        //슬라이드를 이동시키기 위한 offset 계산
        let offset =slideWidth*currentSlide;
        //각 슬라이드 아이템의 left에 offset 적용
        slideContent.forEach((i) => {
            i.setAttribute("style", `transition: ${0.5}s;left: ${-offset}px`);
        });
        //슬라이드 이동시 slide navigation update
        SlideNavigationItems.forEach((i)=>i.classList.remove("active"));
        SlideNavigationItems[currentSlide-1].classList.add("active");
    }
    else {// 만약 마지막 슬라이드에 다다랐다면 무한 슬라이드 기능 on
        currentSlide=0;
        let offset =slideWidth*currentSlide;
        slideContent.forEach((i) => {
            i.setAttribute("style", `transition: ${0}s;left: ${-offset}px`);
        });
        currentSlide++;
        offset =slideWidth*currentSlide;
        //각 슬라이드 아이템의 left에 offset 적용
        //setTimeout을 사용하는 이유는 비동기 처리를 이용해 transition이 
        setTimeout(()=>{
            slideContent.forEach((i) => {
               i.setAttribute("style", `transition: ${0.5}s; left:${-offset}px`);
            });
        },0);
        //슬라이드 이동시 slide navigation update
        SlideNavigationItems.forEach((i)=>i.classList.remove("active"));
        SlideNavigationItems[currentSlide-1].classList.add("active");
    }
}

//이전 화면으로 이동하는 슬라이드의 작동
function prevMove(){
    currentSlide--;
    
    //만약 현재 슬라이드의 위치가 마지막 슬라이드가 아니라면
    if(currentSlide>0){
        //슬라이드를 이동시키기 위한 offset 계산
        let offset =slideWidth*currentSlide;
        //각 슬라이드 아이템의 left에 offset 적용
         slideContent.forEach((i) => {
            i.setAttribute("style", `transition: ${0.5}s;left: ${-offset}px`);
        });
        //슬라이드 이동시 slide navigation update
        SlideNavigationItems.forEach((i)=>i.classList.remove("active"));
        SlideNavigationItems[currentSlide-1].classList.add("active");
    }
    else {// 만약 마지막 슬라이드에 다다랐다면 무한 슬라이드 기능 on
        currentSlide=maxSlide+1;
        let offset =slideWidth*currentSlide;
    
            slideContent.forEach((i) => {
               i.setAttribute("style", `transition: ${0}s; left:${-offset}px`);
            });

        //각 슬라이드 아이템의 left에 offset 적용
        //setTimeout을 사용하는 이유는 비동기 처리를 이용해 transition이 
        //제대로 적용되게 하기 위함.
        currentSlide--;
        offset =slideWidth*currentSlide;

        setTimeout(()=>{
            slideContent.forEach((i) => {
               i.setAttribute("style", `transition: ${0.5}s; left:${-offset}px`);
            });
          },0);
        //슬라이드 이동시 slide navigation update
        SlideNavigationItems.forEach((i)=>i.classList.remove("active"));
        SlideNavigationItems[currentSlide-1].classList.add("active");
}
}

NextButton.addEventListener("click",()=>{
    nextMove();
});

prevButton.addEventListener("click",()=>{
    prevMove();
});


//브라우저 화면이 조정될 때 마다 slidwidth를 변경하기 위해
window.addEventListener("resize",()=>{
    slideWidth = slide.clientWidth;
    let offset =slideWidth*currentSlide;
        //각 슬라이드 아이템의 left에 offset 적용
    slideContent[currentSlide].setAttribute("style", `left: ${-offset}px`);
    
});

//각 슬라이드 네비게이션 클릭시 해당 슬라이드로 이동
for(let i=0; i<maxSlide; i++){
    SlideNavigationItems[i].addEventListener("click", ()=>{
        currentSlide=i+1;
        const offset=slideWidth*currentSlide;
        
        slideContent.forEach((i) => {
            i.setAttribute("style", `transition: ${0.5}s;left: ${-offset}px`);
        });
    //슬라이드 이동시 slide navigation update
    SlideNavigationItems.forEach((i)=>i.classList.remove("active"));
    SlideNavigationItems[currentSlide-1].classList.add("active");
    });
}

/*
//드래그 이벤트를 위한 변수 초기화
let startPoint =0;
let endPoint=0;

//pc 클릭 이벤트 (드래그)
slide.addEventListener("mousedown",(e)=>{
    startPoint=e.pageX; //마우스 드래그 시작 위치 저장
});
slide.addEventListener("mouseup",(e)=>{
    endPoint=e.pageX;  //마우스 드래그 끝 위치 저장
    if(startPoint < endPoint){
        prevMove();
    }
    else if(startPoint > endPoint){
        nextMove();
    }
});
*/

// 모바일 터치 이벤트 (스와이프)
slide.addEventListener("touchstart", (e) => {
    startPoint = e.touches[0].pageX; // 터치가 시작되는 위치 저장
  });

  slide.addEventListener("touchend", (e) => {
    endPoint = e.changedTouches[0].pageX; // 터치가 끝나는 위치 저장
    if (startPoint < endPoint) {
      // 오른쪽으로 스와이프 된 경우
      prevMove();
    } else if (startPoint > endPoint) {
      // 왼쪽으로 스와이프 된 경우
      nextMove();
    }
  });

  //무한 슬라이드
  let loopInterval=setInterval(()=>{
    nextMove();
  },3000);

  slide.addEventListener("mouseover", ()=>{
    clearInterval(loopInterval);
  });

  slide.addEventListener("mouseout", ()=>{
    loopInterval =setInterval(()=>{
    nextMove();
    },3000);
  });
  