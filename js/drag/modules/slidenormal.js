$(function(){
    $('.slidenormal').each(function (){
    	$(this).find('#slider_page').remove();
    	$(this).imgSilder({
			s_width:'100%', //容器宽度
			s_height:$(this).height(), //容器高度
			is_showTit:true, // 是否显示图片标题 false :不显示，true :显示
			s_times:3000 //设置滚动时间
		});
    });
});