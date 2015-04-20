/**
 * 
 * @authors John Nong (overkazaf@gmail.com)
 * @date    2015-04-17 17:32:49
 * @version $Id$
 */

 /* Draggable plugin for widget dragging in TrueCMS2.0*/
 (function ($){
 	$.fn.johnDraggable = function (options){

 		if (options == 'destroy') {
 			this.each(function (){
 				$(this).off('mousedown');
 			});
			return;
 		}


 		var items = [];
 		var opts = $.extend({}, $.fn.johnDraggable.defaluts, options);
 		var ctx = opts.context;
 		var wrapper = $(ctx).find(opts.targetWrapperClass);
 		var targetClass = opts.targetClass;
 		var targetElements = wrapper.find(targetClass);

 		//Operate with placeholder
 		var placeholderController = {
 			_get : function (){
 				return $(wrapper).find(opts.placeholder);
 			},
 			_create : function (){
 				var temp = this._get();
	 			if (temp.size() == 0) {
	 				var className = opts.placeholder.substring(1);
	 				var placeholder = $('<div class="'+ className +'"></div>').attr({
	 					style : 'background-color:#FF4400;height:20px;width:100%;border:1px solid #000;'
	 				});
	 				return placeholder;
	 			} else {
	 				return temp;
	 			}
 			},
 			_hasPlaceHodler : function (){
 				return wrapper.find('.placeholder').length > 0;
 			},
 			_destroy : function (callback){
 				var temp = this._get();
 				if (temp.size() > 0) {
 					temp.fadeOut("slow");
 					setTimeout(function (){
 						temp.remove();
 						if (callback && $.isFunction(callback)) {
 							callback();
 						}
 					}, 1000);
 				}
 			}
 		}

 		var buildPosArray = function (){
 			var posArray = new Array();
 			(function (){
 				var targetElements = wrapper.find(targetClass);
		 		$.each(targetElements, function (i){
					var elemDesc = {
						elemIndex : 1 + i,
						left : this.offsetLeft,
						top : this.offsetTop,
						right : this.offsetLeft + $(this).outerWidth(),
						bottom : this.offsetTop + $(this).outerHeight()
					};
					posArray.push(elemDesc);
				});
 			})();
 			return posArray;
 		}

 		var widgetList = [];
 		this.each(function (i, cont){
 			var that = this;
 			var Drag = {
 				obj : null,
 				container : cont,
 				init : function (o){
 					var oDiv = $('<div>').attr('data-emptydiv', true);
 					oDiv.appendTo(wrapper);
 					var obj = Drag.obj = oDiv;
 					$(that).mousedown(Drag.start);
 				},
 				start : function (ev){
 					if (ev.which != 1)
 						return;
 					ev.preventDefault();

 					var o = Drag.obj;
 					var l = $(that).offset().left;
 					var t = $(that).offset().top;
 					$(o).css({
 						position : 'absolute',
 						left : l,
 						top : t,
 						width : $(that).outerWidth(),
 						height : $(that).outerHeight(),
 						'background-color' : '#FFF',
 						border : "1px dashed #000",
 						cursor : "move"
 					}).fadeIn().attr('data-mousemove', 'move');
 					$(o).data('disX', ev.pageX - $(o).offset().left);
 					$(o).data('disY', ev.pageY - $(o).offset().top);
 					$(document).on('mousemove',Drag.drag);
 					$(document).on('mouseup',Drag.end);
 					return false;
 				},
 				drag : function (ev){
 					var o = Drag.obj;
 					var nx = ev.pageX - $(o).data('disX');
 					var ny = ev.pageY - $(o).data('disY');
 					$(o).css({left : nx, top : ny});
 					return false;
 				},
 				end : function (ev){
 					var o = Drag.obj;
 					$(document).off('mousemove');
 					$(document).off('mouseup');
 					$(o).fadeOut('slow').removeAttr('data-mousemove');
 					var k = Drag._checkMouseOver(ev);
 					if (k > -1) {
 						var targetElem = wrapper.find(targetClass).eq(k);
 						if ($(that).attr("data-widget")) {
 							var url = './widget/' + $(that).attr("data-widget") + '.html';
 							$.ajax({
	 							url : url + "?t="+Math.random(),
	 							type : "GET",
	 							dataType : "text",
	 							success : function (html){
	 								var $dom = $(html);
	 								var widgetId = generatorId(null, null ,'Widget','Generated');
	 								$dom.attr('id', widgetId).attr('data-widget-id', widgetId);
	 								var oWrapper = $('.wrapper');
	 								// Check if the wrapper contains some styles/links/scripts
	 								
	 								// 1.Check styles
	 								var aStyle = $dom.find('style');
	 								aStyle.each(function (){
	 									var styleId = $(this).attr('data-styleid');
	 									log(styleId);
	 									if (!oWrapper.find('style[data-styleid='+styleId+']').length) {
	 										$(this).appendTo(oWrapper);
	 									}
	 									log(oWrapper.find('style[data-styleid='+styleId+']').length);
	 								});
	 								$dom.find('style').remove();


	 								// 2.Check links
	 								// 3.Check scripts


	 								$dom.smartMenu(menuData);
	 								targetElem.append($dom);
	 								$dom.johnDraggable();
	 							}
	 						}).done(function (){
	 							if (opts.fnDragEnd && $.isFunction(opts.fnDragEnd)){
			 						opts.fnDragEnd();
			 					}
	 						});
 						} else {
 							$clone = $(that).clone(true);
 							$clone.appendTo(targetElem);
 							$(that).remove();
 							//Destroy last event;
 							$clone.off('mousedown');

 							$clone.johnDraggable();
 							$clone.smartMenu(menuData);
 						}
 						
 						
 					}
 					return false;
 				},
 				_checkMouseOver : function (ev){
					var r = {
						x : ev.pageX, y : ev.pageY
					};
	 				var posArray = buildPosArray();
	 				var p = -1;
	 				for (var i=0,len=posArray.length; i<len; i++) {
	 					var elem = posArray[i];
	 					if (r.x > elem.left && r.x < elem.right && r.y > elem.top && r.y < elem.bottom) {
	 						p = i;break;
	 					}
	 				}
	 				return p;
		 			
 				}
 			};
 			Drag.init(this);
 			widgetList.push(Drag);
 		});

 		return this;
 	};

 	$.fn.johnDraggable.defaluts = {
 		context : 'body',
 		placeholder : '.placeholder',
 		targetWrapperClass : '.wrapper',
		targetClass : '.layout-template'
 	};


 	function throttle (obj, callback){
 		clearTimeout(obj.timeoutId);
 		obj.timeoutId = setInterval(function(){
 			if ($.isFunction(callback)) {
 				callback();
 			}
 		},50);
 	}
 })(jQuery);

