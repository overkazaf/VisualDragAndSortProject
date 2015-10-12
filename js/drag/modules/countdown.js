$(function(){
	$('.widget-countdown').each(function (){
		var $this = $(this);
		var time = $this.attr('data-enddate');
		countDown(time, $this, ".day",".hour",".minute",".second");
	});
});

function countDown(time, $obj, day_elem, hour_elem, minute_elem, second_elem){
	
	var end_time = new Date(time).getTime();//月份是实际月份-1
	var time_distance = end_time - new Date().getTime(); 
	var day = Math.floor(time_distance/86400000) 
	
	sys_second = (end_time-new Date().getTime())/1000;
	
	if (sys_second > 0) {
		day_elem && $obj.find(day_elem).text(day);//计算天
	}
}