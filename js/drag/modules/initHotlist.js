$('.widget-panel').each(function (){
	var hotList = new HotList('new',45);
	hotList.render($(this).find('ul'));
});