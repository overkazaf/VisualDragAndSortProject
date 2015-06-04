/**
 * 
 * @authors John Nong (overkazaf@gmail.com)
 * @date    2015-04-28 09:07:27
 * @version $Id$
 */

(function ($){
	function log(k, v){
		if (window.console && console.log) {
			v ? console.log(k, v) : console.log(k);
		}
	}

	$.fn.draggable = function (options){
		var opts = $.extend({}, $.fn.draggable.defaults, options);
		var dragList = [];
		var context = $(opts.context);
		var container = $(opts.targetContainer);
		var targetElems = $(opts.targetClass);

		this.each(function (i, cont){
			var that = this;
			var Drag = {
				draggedItem : null,
				init : function (){
					$(that).on('mousedown', Drag.start);
				}, 
				start : function (ev){
					
					Drag.draggedItem = $('<div>').css({
						position:'absolute',
						width : $(that).width() + 'px',
						height : $(that).height() + 'px',
						left : $(that).offset().left, top : $(that).offset().top,
						'background-color' : '#2b2b2b',
						opacity : 0.6
					}).appendTo(context);
					var obj = Drag.draggedItem;
					
					var mouseX = ev.pageX;
					var mouseY = ev.pageY;
					var disX = mouseX - Drag.draggedItem.get(0).offsetLeft;
					var disY = mouseY - Drag.draggedItem.get(0).offsetTop;
					

					$(obj).data('disX', disX);
					$(obj).data('disY', disY);

					$(document).on('mousemove',Drag.drag);
					$(document).on('mouseup', Drag.end);

					return false;
				},
				drag : function (ev){
					var obj = Drag.draggedItem;
					var mouseX = ev.pageX;
					var mouseY = ev.pageY;
					var disX = $(obj).data('disX');
					var disY = $(obj).data('disY');
					var nx = mouseX - disX;
					var ny = mouseY - disY;
					$(obj).css({
						left : nx + 'px',
						top : ny + 'px'
					});

					
				},
				end : function (ev){
					
					var pos = Drag.caclPosition();
					var p = -1;
					var x = ev.pageX, y = ev.pageY;
					var so = {//self container
						left : $(that).offset().left,
						top : $(that).offset().top,
						right : $(that).offset().left + $(that).width(),
						bottom : $(that).offset().top + $(that).height()
					};

					if (x > so.left && x < so.right && y > so.top && y < so.bottom) {
						$(document).off('mousemove');
						$(document).off('mouseup');
						Drag.draggedItem.remove();
						return;
					}
					var preLayoutZoneArray = [];
					for (var i=0,l=pos.length; i<l; i++) {
						var c = pos[i];
						if (x > c.left && x < c.right && y > c.top && y < c.bottom) {
							preLayoutZoneArray.push(i);
							p = i;
						}
					}
					if (p != -1 && p != pos.length) {
						if (preLayoutZoneArray.length) {
							var layer = -1;
							var tt = preLayoutZoneArray[0];
							for (var j=0,l=preLayoutZoneArray.length; j<l; j++) {
								var targetZone = $(opts.targetClass).eq(preLayoutZoneArray[j]);
								var targetParent = targetZone.closest('.layout-container');
								var t = targetParent.attr('data-layer');
								if (t > layer) {
									layer = t;
									tt = preLayoutZoneArray[j];
								}
							}
							
							var fixLayer = function (layoutElem, parentLayer){
								layoutElem.each(function (){
									var originLayer = $(this).attr('data-layer');
									$(this).attr('data-layer', +originLayer + +parentLayer + 1);
								});
								return layoutElem;
							};
							var target = $(opts.targetClass).eq(tt);

							if (target.closest('.layout-container') == $(that)) {
								alert('self');
								return;
							}
							var layout = $(that).clone();
							var pLayer = $(target).closest('.layout-container').data('layer');
							
							var le = fixLayer(layout, pLayer);
							if (le.hasClass('widget')) {
								target.append(le.draggable(opts));
							} else {
								target.append(le);
							}
							// fix dataLayout
							
							$(that).remove();
						}
					}
					Drag.draggedItem.remove();
					$(document).off('mousemove');
					$(document).off('mouseup');
					targetElems = $(opts.targetClass);
					
				},
				caclPosition : function (){
					var arr = [];
					(function (){
						$(opts.targetClass).each(function (){
							var os = $(this).offset();
							var w = $(this).width();
							var h = $(this).height();
							var offset = {
								left : os.left,
								top : os.top,
								right : os.left + w,
								bottom : os.top + h,
								height : h
							};
							arr.push(offset);
						});
					})();

					return arr;
				}
			};

			Drag.init();
			dragList.push(Drag);
		});

		return this;
	};

	$.fn.draggable.defaults = {
		context 		: document.body,
		targetContainer : ".containerClass",
			targetClass : ".layoutZoneClass"
	};
})(jQuery);