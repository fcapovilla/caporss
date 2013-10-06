// Dragbar
if($.cookie('dragbar_x')) {
	var x = parseInt($.cookie('dragbar_x'),10);

	$('.side-bar').css("width",x+2);
	$('.content').css("margin-left",x+2);
	$('.feed-list').css("width",x-3);
}

$('.dragbar').mousedown(function(e){
	e.preventDefault();
	$(document).mousemove(function(e){
		var x = e.pageX;
		var maxwidth = $(window).width()-400;

		if(x < 265) {
			x = 265;
		}
		if(x > maxwidth) {
			x = maxwidth;
		}

		$('.side-bar').css("width",x+2);
		$('.content').css("margin-left",x+2);
		$('.feed-list').css("width",x-3);

		$.cookie('dragbar_x', x, {expires: 10000});
	});
});

$(document).mouseup(function(e){
	$(document).unbind('mousemove');
});

