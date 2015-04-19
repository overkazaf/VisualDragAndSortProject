/**
 * 
 * @authors John Nong (overkazaf@gmail.com)
 * @date    2015-04-17 09:18:50
 * @version $Id$
 */

/*
	===================================================
	This dragsort plugin is overwritten for TrueCMS2.0,
	to fix the iframe bugs when drag widget and items
	in both model and theme	management pages.
	===================================================
*/
(function ($){
	$.fn.dragsort = function (options){
		if (options == "destroy") {
			$(this.selector).trigger("dragsort-uninit");
			return;
		}
		var opts = $.extend({}, $.fn.dragsort.defaults, options);
		var lists = [];
		var list = null, lastPos = null;
		
		var newList = {
			// this.each(function (i, cont){

			// 	init : function (){

			// 	},
			// 	uninit : function (){

			// 	}
			// });
		};


		newList.init();
		lists.push(newList);
	};

	$.fn.dragsort.defaults = {
		itemSelector : "",
		dragSelector : "",
		dragSelectorExcluded : "input ,textarea",
		dragEnd : function(){},
		dragBetween : false,
		placeHolderTemplate : "",
		scrollContainer : window,
		scrollSpeed : 5
	};
})(jQuery);