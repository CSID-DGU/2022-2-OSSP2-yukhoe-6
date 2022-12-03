$(function(){
	var	header = $("#menu"),
		mainMenu=$("#menu .category");

	header.mouseenter(function(){
		header.stop().animate({height:"250px"},100);
		/*header.style.backgroundColor="#ffffff";*/
		this.style.backgroundColor='#ffffff';
		
	}).mouseleave(function(){
		header.stop().animate({height:"50px"},100);
		
		/*this.style.height="50px";*/
		setTimeout(function() {
			this.style.backgroundColor="transparent";
		}, 5000);
	})
});

$(function(){
    // 스크롤 시 header fade-in
    $(document).on('scroll', function(){
        if($(window).scrollTop() > 100){
            $("#menu").removeClass("deactive");
            $("#menu").addClass("active");
        }else{
            $("#menu").removeClass("active");
            $("#menu").addClass("deactive");
        }
    })

});