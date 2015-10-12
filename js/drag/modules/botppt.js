$('.bot_ppt').each(function(){
  var $pic = $(this).find('#tFocus-pic'),
      $aImages = $pic.find('img'),
      $footPic = $(this).find('#tFocus-btn'),
      $footImages = $footPic.find('img'),
      oW = $pic.width(),
      oH = $pic.height();
  
  // fix the bottom buttons' length
  if ($aImages.length < $footImages.length) {
    for (var i = $aImages.length; i < $footImages.length; i++) {
      $footImages.eq(i).closest('li').remove();
    }
  }

  // fix the bottom buttons' container position
  $footPic.find('ul').css({left : 50});

  $aImages.each(function (index){
    $(this).css({
      width : oW,
      height : oH
    });
    $footImages.eq(index).attr('src', $(this).attr('src'));
  });


  $(this).slide_bot();	
});