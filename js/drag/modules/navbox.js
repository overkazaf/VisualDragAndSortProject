$('.navbox').each(function (){
	var that = this;
	$(this).on('mouseover', '.subNav', function (){
	  var index = $(this).index();
	  $(this).addClass('currentDd currentDt').siblings().removeClass('currentDd currentDt');
	  if ($(this).next().is(':visible') == 'true') {
      } else {
      	$(this).next().siblings().filter(function (){
      		return $(this).hasClass('navContent');
      	}).hide();
      	$(this).next().show('slow');
      }
	});
});