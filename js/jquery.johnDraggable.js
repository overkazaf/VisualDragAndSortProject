/**
 * 
 * @authors John Nong (overkazaf@gmail.com)
 * @date    2015-04-17 17:32:49
 * @version $Id$
 */

 /* Draggable plugin for widget dragging in TrueCMS2.0*/
 (function ($){
 	$.fn.johnDraggable = function (options){
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
 				init : function (o){
 					var oDiv = $('<div></div>');
 					oDiv.appendTo(wrapper);
 					var obj = Drag.obj = oDiv;
 					$(that).mousedown(Drag.start);
 				},
 				start : function (ev){
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
 						border : "1px dashed #000"
 					}).fadeIn();
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
 					$(o).fadeOut('slow');
 					var k = Drag._checkMouseOver(ev);
 					if (k > -1) {
 						var targetElem = wrapper.find(targetClass).eq(k);
 						var url = './widget/' + $(that).attr("data-widget") + '.html';
 						$.ajax({
 							url : url,
 							type : "GET",
 							dataType : "html",
 							success : function (html){
 								var $dom = $(html);
 								$dom.smartMenu(menuData);
 								targetElem.append($dom);
 							}
 						}).done(function (){
 							if (opts.fnDragEnd && $.isFunction(opts.fnDragEnd)){
		 						opts.fnDragEnd();
		 					}
 						});
 						
 					}
 					
 				},
 				_checkMouseOver : function (ev){
					var r = {
						x : ev.pageX, y : ev.pageY
					};
					log(r);
	 				var posArray = buildPosArray();
	 				log(posArray);
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

