// Default date output format
function formatDate(date) {
	var pad = function(n){return n<10 ? '0'+n : n;};
	return  pad(date.getDate())+'/'+
			pad(date.getMonth()+1)+'/'+
			pad(date.getFullYear())+' '+
			pad(date.getHours())+':'+
			pad(date.getMinutes())+':'+
			pad(date.getSeconds());
}
