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